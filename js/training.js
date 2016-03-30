require(["dojo/dom", "dojo/on", "dojo/ready", "dojo/_base/array", "dojo/_base/unload", "dojo/cookie", "dojo/json", "esri/tasks/query", "esri/tasks/QueryTask", "esri/geometry/Point", "esri/geometry/webMercatorUtils", "esri/geometry/Polyline", "esri/geometry/geometryEngine", "esri/SpatialReference", "esri/layers/FeatureLayer", "esri/IdentityManager", "dojo/domReady!"], function(dom, on, ready, arrayUtil, baseUnload, cookie, JSON, Query, QueryTask, Point, webMercatorUtils, Polyline, geometryEngine, SpatialReference, FeatureLayer, esriId) {
    ready(function() {
        var stops;
        var closestPT;
        var routeID;
        var filteredStops;
        var cred = "esri_jsapi_id_manager_data"; // cookie/local storage name
        var positions = new Array();

        findBuses();
        findRoutes();
        findDrivers();
        findStops();

        //wait for the previous functions to finish, 
        //you can't update options if they don't exist yet
        setTimeout(function() {
            checkSettings();
        }, 500);

        // store credentials/serverInfos before the page unloads
        //baseUnload.addOnUnload(storeCredentials);
        // look for credentials in local storage
        loadCredentials();

        function loadCredentials() {
            console.log("Loading Credentials...");
            var idJson, idObject;

            //      if (supports_local_storage()) {
            // read from local storage
            idJson = localStorage.getItem(cred);
            //    }
            //  else {
            // read from a cookie
            //  idJson = cookie(cred);
            //}
            if (idJson && idJson != "null" && idJson.length > 4) {
                idObject = JSON.parse(idJson);
                esriId.initialize(idObject);
            } else {
                // console.log("didn't find anything to load :(");
            }
        }

        function storeCredentials() {
            // make sure there are some credentials to persist
            console.log("Storing Credentials...");
            //console.log(esriId);
            if (esriId.credentials.length === 0) {
                return;
            }

            // serialize the ID manager state to a string
            var idString = JSON.stringify(esriId.toJson());
            // store it client side
            //if (supports_local_storage()) {
            // use local storage
            localStorage.setItem(cred, idString);
            // console.log("wrote to local storage");
            //}else {
            // use a cookie
            //cookie(cred, idString, {expires: 1});
            // console.log("wrote a cookie :-/");
            //}
        }

        function supports_local_storage() {
            try {
                return "localStorage" in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        }

        function findDrivers() {
            //ADD DRIVERS 
            var driverQuery = new QueryTask("YOUR DRIVER SERVICE");
            var query = new Query();
            query.returnGeometry = false;
            query.outFields = ["*"];
            query.where = "1=1";
            query.orderByFields = ["DriverLastName"];
            driverQuery.execute(query, showDrivers);
        }

        function showDrivers(results) {
            var resultItems = ["<option value=\"\">-- Choose a Driver --</option>"];
            var resultCount = results.features.length;
            for (var i = 0; i < resultCount; i++) {
                var featureAttributes = results.features[i].attributes;
                resultItems.push("<option value=\"" + featureAttributes.EmployeeID + "\">" + featureAttributes.DriverLastName + ", " + featureAttributes.DriverFirstName + "</option>");
            }

            dom.byId("settingDriverID").innerHTML = resultItems.join("");
        }

        function findBuses() {
            //ADD BUSES 
            var busQuery = new QueryTask("YOUR BUS SERVICE URL");
            var query = new Query();
            query.returnGeometry = false;
            query.outFields = ["UnitID"];
            query.where = "1=1";
            query.orderByFields = ["UnitID"];
            busQuery.execute(query, showBuses);
        }

        function showBuses(results) {
            var resultItems = ["<option value=\"\">-- Choose a Bus --</option>"];
            var resultCount = results.features.length;
            for (var i = 0; i < resultCount; i++) {
                var featureAttributes = results.features[i].attributes;
                resultItems.push("<option value=\"" + featureAttributes.UnitID + "\">" + featureAttributes.UnitID + "</option>");
            }

            dom.byId("settingBusID").innerHTML = resultItems.join("");
        }

        function findStops() {
            //ADD STOPS 
            var stopsQuery = new QueryTask("YOUR STOPS URL");
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["LOCATION", "ROUTES"];
            query.outSpatialReference = new SpatialReference(102100);
            query.where = "1=1";
            query.orderByFields = ["LOCATION"];
            stopsQuery.execute(query, showStops);
        }

        function showStops(results) {
            stops = results.features;

            // now that we have stops to compare, let's turn on GPS to see which stop is closest.
            if (!navigator.geolocation) {
                alert("Geolocation is not supported by your browser");
            } else {

                // we want to constantly check for proximity to bus stop locations          
                var geo_options = {
                    enableHighAccuracy: true,
                    timeout: 27000,
                    maximumAge: 3000
                };
                navigator.geolocation.watchPosition(gpsSuccess, gpsError, geo_options);

            }
        }

        function filterStops(routeID) {
            if (routeID != undefined) {
                var cleanedStops = new Array;

                arrayUtil.forEach(stops, function(stopPT, i) {
                    var routesInStop = stopPT.attributes.ROUTES.split(" ");
                    var idx = routesInStop.indexOf(routeID);
                    while (idx != -1) {
                        cleanedStops.push(stopPT);
                        idx = routesInStop.indexOf(routeID, idx + 1);
                    }
                });

                return cleanedStops;
            }
            return false;
        }

        function updateLocationDisplay(stopList) {
            var seloption = "";
            $.each(stopList, function(i) {
                seloption += '<option value="' + stopList[i].attributes.LOCATION + '">' + stopList[i].attributes.LOCATION + '</option>';
            });
            $("#location option").remove();
            $('#location').append(seloption);
            if (closestPT != undefined) {
                $("#location option[value='" + closestPT.attributes.LOCATION + "']").prop("selected", true);
            }
        }

        function findRoutes() {
            //ADD ROUTES
            var routesQuery = new QueryTask("YOUR ROUTE URL");
            var query = new Query();
            query.returnGeometry = false;
            query.outFields = ["route_id", "route_long_name"];
            query.where = "agency_id ='YT'";
            routesQuery.execute(query, showRoutes);
        }

        function showRoutes(results) {
            var resultItems = ["<option value=\"\">-- Choose a Route --</option>"];
            var resultCount = results.features.length;
            for (var i = 0; i < resultCount; i++) {
                var featureAttributes = results.features[i].attributes;
                resultItems.push("<option value=\"" + featureAttributes.route_id + "\">" + featureAttributes.route_id + " - " + featureAttributes.route_long_name + "</option>");
            }

            dom.byId("settingRouteID").innerHTML = resultItems.join("");
        }

        function checkSettings() {
            var driverID = localStorage.getItem('driverID');
            var busID = localStorage.getItem('busID');
            routeID = localStorage.getItem('routeID');
            if (driverID) {
                $("#driverIDdisplay strong").html(driverID);
                $("#settingDriverID").val(driverID);
                $("#driverID").val(driverID);
            }
            if (busID) {
                $("#busIDdisplay strong").html(busID);
                $("#settingBusID").val(busID);
                $("#busID").val(busID);
            }
            if (routeID) {
                $("#routeIDdisplay strong").html(routeID);
                $("#settingRouteID").val(routeID);
                $("#routeID").val(routeID);
                $("#mapLink").attr("href", "map.html?route=" + routeID);
                $("#schedLink").attr("href", "schedule.html?route=" + routeID);
            }
            filteredStops = filterStops(routeID);
        }

        function gpsSuccess(position) {
            $("#latitude").val(position.coords.latitude);
            $("#longitude").val(position.coords.longitude);
            if (position.coords.accuracy < 2000) {
                positions.push([position.coords.longitude, position.coords.latitude]);
            }
            var gpsPT = Point(position.coords.longitude, position.coords.latitude, new SpatialReference(4326));
            var pt = webMercatorUtils.geographicToWebMercator(gpsPT);
            // measure distance to each stop
            var distance = 999999;

            arrayUtil.forEach(filteredStops, function(stopPT, i) {
                var d = geometryEngine.distance(stopPT.geometry, pt);
                if (d < distance) {
                    closestPT = stopPT;
                    distance = d;
                }
            });

            var distanceTraveled = 0;
            if (positions.length > 0) {
                var singlePathPolyline = new Polyline(positions);
                distanceTraveled = geometryEngine.geodesicLength(singlePathPolyline, "miles");
            }

            $("#debug").html(position.coords.latitude + ", " + position.coords.longitude + " - distance: " + distance + " - accuracy: " + position.coords.accuracy + "<br/> Traveled: " + distanceTraveled);

            if (closestPT != undefined) {
                $("#location option[value='" + closestPT.attributes.LOCATION + "']").prop("selected", true);
                updateLocationDisplay(filteredStops);
                $("#stopID").val(closestPT.attributes.LOCATION);
            }
        }

        function gpsError() {
            $("#debug").append("<br/> GPS ERROR Unable to retrieve your location");
        }

        function clearAllSettings() {
            localStorage.clear();
            esriId.destroyCredentials();
            $("#driverIDdisplay strong").html("Not Selected");
            $("#busIDdisplay strong").html("Not Selected");
            $("#routeIDdisplay strong").html("Not Selected");

            $("#settingDriverID").val("");
            $("#settingBusID").val("");
            $("#settingRouteID").val("");

            $("#messages").html("<div class=\"alert alert-success\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><h4>Success!</h4> All Settings Cleared!</div>");
            $('#settingsModal').modal('hide');
        }

        //grab settings form on submit
        $("#settings").submit(function(e) {
            e.preventDefault();

            var fields = $("#settings").serializeArray();
            var driverID = fields[0].value;
            var busID = fields[1].value;
            routeID = fields[2].value;
            var errors = '';
            if (driverID === '') errors += 'Please specify a driver.\n';
            if (busID === '') errors += 'Please specify a bus.\n';
            if (routeID === '') errors += 'Please specify a route.\n';

            if (errors !== '') {
                alert(errors);
            } else {
                if (fields[0].value !== "") {
                    $("#driverIDdisplay strong").html(fields[0].value);
                    $("#driverID").val(fields[0].value);
                    localStorage.setItem('driverID', fields[0].value);
                }
                if (fields[1].value !== "") {
                    $("#busIDdisplay strong").html(fields[1].value);
                    $("#busID").val(fields[1].value);
                    localStorage.setItem('busID', fields[1].value);
                }
                if (fields[2].value !== "") {
                    $("#routeIDdisplay strong").html(fields[2].value);
                    $("#routeID").val(fields[2].value);
                    localStorage.setItem('routeID', fields[2].value);
                    $("#mapLink").attr("href", "map.html?route=" + fields[2].value);
                    $("#schedLink").attr("href", "schedule.html?route=" + fields[2].value);
                }
                filteredStops = filterStops(routeID);
                $('#settingsModal').modal('hide');
            }
        });

        $('#location').change(function() {
            console.log($(this).val());
            $("#stopID").val($(this).val());
            $("#debug").append("<br/>" + $(this).val());
        });

        $("#transitRidership").submit(function(e) {
            e.preventDefault();

            var fields = $("#transitRidership").serializeArray();
            if (!positions.length > 0) {
                var error = document.getElementById("errorSound");
                error.play();
            }

            var singlePathPolyline = new Polyline(positions);
            var distanceTraveled = geometryEngine.geodesicLength(singlePathPolyline, "miles");

            //FIELDS just to improve readability
            driverID = fields[0].value;
            routeID = fields[1].value;
            busID = fields[2].value;
            stopID = fields[3].value;
            latitude = fields[4].value;
            longitude = fields[5].value;
            cashAdult = fields[6].value;
            cashYouth = fields[7].value;
            cashReduced = fields[8].value;
            child = fields[9].value;
            ticketAdult = fields[10].value;
            ticketYouth = fields[11].value;
            ticketReduced = fields[12].value;
            transfer = fields[13].value;
            passAdult = fields[14].value;
            passYouth = fields[15].value;
            passReduced = fields[16].value;
            totalRiders = fields[17].value;
            bike = fields[18].value;
            wheelchair = fields[19].value;
            stroller = fields[20].value;
            walker = fields[21].value;
            serviceAnimal = fields[22].value;
            passengerExited = fields[23].value;
            localDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            //add a layer to the dom
            var featureLayer = new FeatureLayer("YOUR RIDERSHIP URL", {
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: ["*"]
            });

            if (closestPT !== undefined) {
                var bell = document.getElementById("bellSound");
                bell.play();
                var attributes = {
                    "StopName": stopID,
                    "RouteNumber": routeID,
                    "BusID": busID,
                    "DriverID": driverID,
                    "LocalDateTime": localDateTime,
                    "CashAdultCount": cashAdult,
                    "CashYouthCount": cashYouth,
                    "CashReducedCount": cashReduced,
                    "TicketAdultCount": ticketAdult,
                    "TicketYouthCount": ticketYouth,
                    "TicketReducedCount": ticketReduced,
                    "PassAdultCount": passAdult,
                    "PassYouthCount": passYouth,
                    "PassReducedCount": passReduced,
                    "ChildCount": child,
                    "TransferCount": transfer,
                    "BikeCount": bike,
                    "WheelchairCount": wheelchair,
                    "StrollerCount": stroller,
                    "WalkerCount": walker,
                    "ServiceAnimalCount": serviceAnimal,
                    "PassengersExitedCount": passengerExited,
                    "Latitude": latitude,
                    "Longitude": longitude,
                    "DistanceTraveled": distanceTraveled
                };
                var addGraphic = new esri.Graphic(closestPT.geometry, null, attributes, null);
                $("#messages").html("<div class=\"alert alert-success\"><h4>Success!</h4> TEST RAN. NO RECORDS RECORDED!</div>");

                //apply the edits to the feature layer
                setTimeout(function() {
                    //window.location.reload();
                    $("#messages").html("");
                    $('#cashAdult,#cashYouth,#cashReduced,#child,#ticketAdult,#ticketYouth,#ticketReduced,#transfer,#passAdult,#passYouth,#passReduced,#totalRidersView,#bike,#wheelchair,#stroller,#walker,#serviceAnimal,#child,#passengerExited').val(0);
                    $('#bicycle,#btn-wheelchair,#btn-stroller,#btn-walker,#btn-serviceAnimal,#btn-child').removeClass("btn-danger").addClass("btn-default");
                }, 3000);


            } else {
                var error = document.getElementById("errorSound");
                error.play();
            }

        });

        $('#clearSettings').on("click", function() {
            clearAllSettings();
            window.location.reload();
        });

        esriId.on('dialog-create', function() {
            $('#dijit_form_ValidationTextBox_0').val('DOMAIN\\');
            $('.dijitDialogPaneContentArea div:first').html('');
        });

        esriId.on('credential-create', storeCredentials);

        $('#refreshPage').on("click", function() {
            window.location.reload(true);
        });
    });
});

//shows the current day and date on the top of the app (only called in the HTML)		

function formatAMPM() {
    var d = new Date(),
        minutes = d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes(),
        hours = d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours(),
        ampm = d.getHours() >= 12 ? 'pm' : 'am',
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec'],
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
}