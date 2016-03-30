require(["dojo/dom", 
         "dojo/on", 
         "dojo/ready", 
         "dojo/_base/array", 
         "dojo/_base/unload", 
         "dojo/cookie", 
         "dojo/json", 
         "esri/tasks/query", 
         "esri/tasks/QueryTask", 
         "esri/layers/FeatureLayer", 
         "esri/IdentityManager",
         "dojo/date", 
         "dojo/domReady!"], 
         function(dom, 
                  on, 
                  ready, 
                  arrayUtil, 
                  baseUnload, 
                  cookie, 
                  JSON, 
                  Query, 
                  QueryTask, 
                  FeatureLayer, 
                  esriId,
                  date) {
    ready(function() {
        var stops;
        var closestPT;
        var routeID;
        var filteredStops;
        var cred = "esri_jsapi_id_manager_data"; // cookie/local storage name
        //var querystring;
        var multipleRoutes = true;
        var yearlyReport = true;
        var monthlyReport = false;
        var routeList = [1,2,3,4,5,6,7,9,10,11];
        var routes = [[],[],[],[],[],[],[],[],[],[],[],[]]; //setup a placeholder when we split out the routes
        var reportHtml;
        var queryWhere;

        loadCredentials();

        function loadCredentials() {
            //console.log("Loading Credentials...");
            var idJson, idObject;

            if (supports_local_storage()) {
              // read from local storage
              idJson = localStorage.getItem(cred);
            } else {
              // read from a cookie
              idJson = cookie(cred);
            }
            if (idJson && idJson != "null" && idJson.length > 4) {
              idObject = JSON.parse(idJson);
              esriId.initialize(idObject);
            } else {
              console.log("didn't find anything to load :(");
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
            if (supports_local_storage()) {
              // use local storage
              localStorage.setItem(cred, idString);
              // console.log("wrote to local storage");
            }else {
              // use a cookie
              cookie(cred, idString, {expires: 1});
              console.log("wrote a cookie :-/");
            }
        }

        function supports_local_storage() {
            try {
              return "localStorage" in window && window.localStorage !== null;
            } catch (e) {
              return false;
            }
        }

        function clearAllSettings() {
            localStorage.clear();
            esriId.destroyCredentials();
        }
        
        function formQuery(querystring){
          
          var query = '';
          
          //go through each selection option to setup query
          if(querystring.year != ''){
            $("#selectYear").val(querystring.year);
            var cleanYear = parseInt(querystring.year);
            query = "(LocalDateTime <= date '"+ cleanYear +"-12-31 23:59:59' AND LocalDateTime >= date '"+ cleanYear +"-01-01 00:00:00') ";
          }
          if(querystring.month != ''){
            $("#selectMonth").val(querystring.month);
            var cleanMonth = parseInt(querystring.month);
            //LAST DAY OF MONTH
            var monthForLast = cleanMonth-1; 
            var dateForLast = new Date(cleanYear, monthForLast + 1, 0);
            var lastDayOfMonth = dateForLast.getDate();
            query = "(LocalDateTime <= date '"+ cleanYear +"-"+ cleanMonth +"-"+lastDayOfMonth+" 23:59:59' AND LocalDateTime >= date '"+ cleanYear +"-"+ cleanMonth +"-01 00:00:00') ";
            yearlyReport = false;
            monthlyReport = true;
          }
          if(querystring.day != ''){
            $("#selectDate").val(querystring.day);
            var cleanDate = parseInt(querystring.day);
            query = "(LocalDateTime <= date '"+ cleanYear +"-"+ cleanMonth +"-"+ cleanDate +" 23:59:59' AND LocalDateTime >= date '"+ cleanYear +"-"+ cleanMonth +"-"+ cleanDate +" 00:00:00')";
            yearlyReport = false;
            monthlyReport = false;
          }

          if(querystring.route != ''){
            $("#selectRoute").val(querystring.route);
            var cleanRoute = parseInt(querystring.route)
            query += " AND RouteNumber = "+cleanRoute;
            multipleRoutes = false;
          }
          if((querystring.day != '' && querystring.month === '' && querystring.year === '') || (querystring.day != '' && querystring.month != '' && querystring.year === '') || (querystring.day != '' && querystring.month === '' && querystring.year != '')  ){
            $('#messages').html("<div class=\"alert alert-danger\"><h4>If you choose a day, you have to chose a month and a year!</h4></div>");
            return false;
          }
          if((querystring.month != '' && querystring.year === '') ){
            $('#messages').html("<div class=\"alert alert-danger\"><h4>If you choose a month, you have to chose a year!</h4></div>");
            return false;
          }
          return query;
        }
        
        function queryRouteInfo() {
            querystring = getArgs();

            if(!jQuery.isEmptyObject(querystring)){
              
              queryWhere = formQuery(querystring);
              //console.log(queryWhere);
              if(queryWhere){
                // $('#messages').html(queryWhere);
                // query all results
                var queryTask = new esri.tasks.QueryTask("YOUR RIDERSHIP URL");
                var query = new esri.tasks.Query();
    
                //build query filter
                query.returnGeometry = false;
                query.outFields = ["*"];
                query.where = queryWhere; 
                query.orderByFields = ["LocalDateTime"];
                //Execute task and call loadRouteInfo on completion
                queryTask.execute(query, loadRouteInfo);

              }
            }else{
              $('#messages').html('<div class="alert alert-warning"><h4>Please choose an option to create a report</h4></div>');
            }
        }

        function loadRouteInfo(results) {
          if(results.features.length > 0) {
            //showReport(results.features);
            $('#messages').html("<div class=\"alert alert-info\"><h4>"+ results.features.length +" records found.</h4></div>");
            var features = results.features;
            var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
          
            var html = '<div class="panel-heading">';
            if(multipleRoutes){
              if(yearlyReport) {
                html += "<h3 class=\"panel-title\">Statistics for "+ querystring.year +"</h3>"
              }else if(monthlyReport){
                cleanedMonth = querystring.month -1;
                html += "<h3 class=\"panel-title\">Statistics for "+ monthNames[cleanedMonth] +" "+ querystring.year +"</h3>"
              }else{
                cleanedMonth = querystring.month -1;
                html += "<h3 class=\"panel-title\">Statistics for "+ monthNames[cleanedMonth] +" "+ querystring.day +", "+ querystring.year +"</h3>"
              }
            }else{
              if(yearlyReport) {
                html += "<h3 class=\"panel-title\">Statistics for Route "+ features[0].attributes.RouteNumber +" for "+ querystring.year +"</h3>"
              }else if(monthlyReport){
                cleanedMonth = querystring.month -1;
                html += "<h3 class=\"panel-title\">Statistics for Route "+ features[0].attributes.RouteNumber +" during "+ monthNames[cleanedMonth] +" "+ querystring.year +"</h3>"
              }else{
                cleanedMonth = querystring.month -1;
                html += "<h3 class=\"panel-title\">Statistics for Route "+ features[0].attributes.RouteNumber +" on "+ monthNames[cleanedMonth] +" "+ querystring.day +", "+ querystring.year +"</h3>"
              }
            }
            html += "</div>\n<div class=\"panel-body\">";
            
            var miles = 0;
            var passengers = 0;
            for (var i = 0; i < features.length; i++) {
              var featureAttributes = features[i].attributes;
              miles = miles + featureAttributes.DistanceTraveled;
              thisCount = featureAttributes.CashAdultCount + featureAttributes.CashReducedCount + featureAttributes.CashYouthCount + featureAttributes.PassAdultCount + featureAttributes.PassReducedCount + featureAttributes.PassYouthCount + featureAttributes.TicketAdultCount + featureAttributes.TicketReducedCount + featureAttributes.TicketYouthCount + featureAttributes.TransferCount;
              passengers = passengers + thisCount;
              //push the routes into their own seperate arrays (defined as routes[routeNumber]
              routes[featureAttributes.RouteNumber].push(featureAttributes);
              
            }
            features = null; //dump that array to garbage collection, we don't need it hanging out 
            miles = miles.toFixed(2);
            
            //sort the new routes arrays
            for (var i = 0; i < routes.length; i++) {
              routes[i].sort(sortByLocalDateTime);
            }
            
            //some variables for storage
            var deadHeadMinutes = 0;
            var deadHeadMiles = 0;
            var serviceMinutes = 0
            
            //split into days
            for (var i = 0; i < routes.length; i++) {
              //console.log("Route " + i);
              if(routes[i].length === 0){
                routes[i] = null;
              }else{
                var routeInDays = splitToDays(routes[i]);
                
                //now that we're split into days, let's get the dead head and service times
                for (var j = 0; j < routeInDays.length; j++) {
                  if(routeInDays[j].length > 4 ){
                    //get last and second to last record pointers
                    var lastRecord = routeInDays[j].length-1;
                    var lastServiceRecord = routeInDays[j].length-2;
                    
                    //get values for hours
                    var startHours = new Date(routeInDays[j][0].LocalDateTime);
                    var startServiceHours = new Date(routeInDays[j][1].LocalDateTime);
                    var endServiceHours = new Date(routeInDays[j][lastServiceRecord].LocalDateTime);
                    var endHours = new Date(routeInDays[j][lastRecord].LocalDateTime);
                    
                    //calculate service hours
                    serviceMinutes += date.difference(startServiceHours, endServiceHours, "minute");
                    
                    //calculate dead head hours
                    var morningDeadHeadMinutes = date.difference(startHours, startServiceHours, "minute");
                    var nightDeadHeadMinutes = date.difference(endServiceHours, endHours, "minute");
                    deadHeadMinutes += morningDeadHeadMinutes + nightDeadHeadMinutes;
                    
                    //get miles for deadhead
                    var startDeadheadMiles = routeInDays[j][1].DistanceTraveled;
                    var endDeadheadMiles = routeInDays[j][lastRecord].DistanceTraveled;
                    
                    //calculate deadhead miles
                    deadHeadMiles += startDeadheadMiles + endDeadheadMiles;
                  }
                }
              }
            }
            
            //calculate sums to miles and hours
            var serviceMiles = miles - deadHeadMiles;
            var serviceHours = (serviceMinutes/60);
            var deadHeadHours = (deadHeadMinutes/60);
            
            html += "<h3>Service</h3>";
            html += "<table class=\"table table-responsive table-striped\">";
            html += "<tr><td class=\"col-sm-6\"><strong>Service Hours</strong>:</td><td>"+ serviceHours.toFixed(2); +"</td></tr>";
            html += "<tr><td><strong>Service Miles</strong>:</td><td>"+ serviceMiles.toFixed(2); +"</td></tr>";
            html += "</table>";
            
            html += "<h3>Dead Head</h3>";
            html += "<table class=\"table table-responsive table-striped\">";
            html += "<tr><td class=\"col-sm-6\"><strong>Dead Head Hours</strong>:</td><td>"+ deadHeadHours.toFixed(2); +"</td></tr>";
            html += "<tr><td><strong>Dead Head Miles</strong>:</td><td>"+ deadHeadMiles.toFixed(2); +"</td></tr>";
            html += "</table>";
            
            html += "<h3>Totals</h3>";
            html += "<table class=\"table table-responsive table-striped\">";
            html += "<tr><td class=\"col-sm-6\"><strong>Total Miles Traveled</strong>:</td><td>"+ miles +"</td></tr>";
            html += "<tr><td><strong>Total Passengers</strong>:</td><td>"+ passengers +"</td></tr>";
            html += "</table>";
            html += "</div>";
            $("#report").addClass("panel panel-primary");
            $("#report").append(html);
            
            //get vehicle query setup                
            var vehicleTask = new esri.tasks.QueryTask("YOUR RIDERSHIP URL");
            var vehicleQuery = new esri.tasks.Query();
            
            //build query filter
            vehicleQuery.returnGeometry = false;
            vehicleQuery.returnDistinctValues = true;
            vehicleQuery.outFields = ["BusID"];
            vehicleQuery.where = queryWhere; 
            
            //Execute task and call getVehicleCount on completion
            vehicleTask.execute(vehicleQuery, getVehicleCount);
            
          }else{
            $('#messages').html("<div class=\"alert alert-warning\"><h4>No results found. Please try another filter.</h4></div>");
          }
        }
        
        function getVehicleCount(results){
          var html = "<h3>Vehicles</h3>";
              html += "<table class=\"table table-responsive table-striped\">";
              html += "<tr><td class=\"col-sm-6\"><strong>In Operation</strong>:</td><td>"+ results.features.length +"</td></tr>";
              html += "</table>";

          $(".panel-body").append(html);
          //get execution time... eventually remove this?
          var end = new Date().getTime();
          var time = end - start;
          execution = "Query: " + queryWhere + "<br/>Time Elapsed: " + millisToMinutesAndSeconds(time);
          $("#execution-time small").append(execution);
        }

        function toTitleCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
        
        function millisToMinutesAndSeconds(millis) {
          var minutes = Math.floor(millis / 60000);
          var seconds = ((millis % 60000) / 1000).toFixed(2);
          return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        }


        function getArgs() {
            args = new Object();
            var query = location.search.substring(1);
            var pairs = query.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1) continue;
                var argname = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                args[argname] = decodeURIComponent(value);
            }
            return args;
        }
        
        function sortByLocalDateTime(a, b){
          return ((a["LocalDateTime"] < b["LocalDateTime"]) ? -1 : ((a["LocalDateTime"] > b["LocalDateTime"]) ? 1 : 0));
        }
        
        function splitToDays(data){
          var dayArray = new Array(32);
          for (var i = 0; i < dayArray.length; i++) {
            dayArray[i] = new Array();
          }
          if(data.length > 0){
            var day = 0;
            var beforeDay = 0;
            for (var i = 0; i < data.length; i++) {
              //console.log("Before: " + beforeDay);
              var date = new Date(data[i].LocalDateTime);
              day = date.getDate(date);
              dayArray[day].push(data[i]);
            }
          }
//          var date = new Date(data[1]);
          return dayArray;
        }

        function init() {
          queryRouteInfo();
        }

        init();
        var start = new Date().getTime();
        
        $('#clearSettings').on("click", function() {
            clearAllSettings();
            window.location.reload();
        });

        esriId.on('dialog-create', function() {
            $('#dijit_form_ValidationTextBox_0').val('yakima_city\\');
            $('.dijitDialogPaneContentArea div:first').html('');
        });

        esriId.on('credential-create', storeCredentials);
        
    });
});