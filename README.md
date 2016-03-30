# Transit Ridership Counter
This project is to create a form (no map) to be used on to record ridership numbers for a transit system. It writes a point to a Feature Service with the entered attributes. Originally designed for the City of Yakima, it can be used anywhere after some minor setup. 

![Transit Ridership Screenshot](https://raw.githubusercontent.com/randybondsjr/transit-ridership/master/screenshot.png)

##Requirements
1. ArcGIS Server (you will need to host 5 REST services)
2. Web Server (to host the application)
3. Web Browser that supports the HTML5 `<audio>` tag

## Installation
### Create the Services
1. Create a Feature Class (Point) called **Ridership Statistics** with the following fields
	* StopName ( type: esriFieldTypeString , alias: StopName , length: 50 )
	* RouteNumber ( type: esriFieldTypeString , alias: Route Number , length: 50 , Coded Values: [1: 1 - Summitview / Lincoln] , [2: 2 - Tieton / Nob Hill] , [3: 3 - Mead / Fruitvale] , ...7 more... )
	* BusID ( type: esriFieldTypeString , alias: BusID , length: 10 )
	* DriverID ( type: esriFieldTypeSmallInteger , alias: DriverID )
	* LocalDateTime ( type: esriFieldTypeDate , alias: LocalDateTime , length: 36 )
	* CashAdultCount ( type: esriFieldTypeSmallInteger , alias: Cash Adult Count )
	* CashYouthCount ( type: esriFieldTypeSmallInteger , alias: Cash Youth Count )
	* CashReducedCount ( type: esriFieldTypeSmallInteger , alias: Cash Reduced Count )
	* TicketAdultCount ( type: esriFieldTypeSmallInteger , alias: Ticket Adult Count )
	* TicketYouthCount ( type: esriFieldTypeSmallInteger , alias: Ticket Youth Count )
	* TicketReducedCount ( type: esriFieldTypeSmallInteger , alias: Ticket Reduced Count )
	* PassAdultCount ( type: esriFieldTypeSmallInteger , alias: Pass Adult Count )
	* PassYouthCount ( type: esriFieldTypeSmallInteger , alias: Pass Youth Count )
	* PassReducedCount ( type: esriFieldTypeSmallInteger , alias: Pass Reduced Count )
	* ChildCount ( type: esriFieldTypeSmallInteger , alias: Child Count )
	* TransferCount ( type: esriFieldTypeSmallInteger , alias: Transfer Count )
	* BikeCount ( type: esriFieldTypeSmallInteger , alias: Bike Count )
	* WheelchairCount ( type: esriFieldTypeSmallInteger , alias: Wheelchair Count )
	* StrollerCount ( type: esriFieldTypeSmallInteger , alias: Stroller Count )
	* WalkerCount ( type: esriFieldTypeSmallInteger , alias: Walker Count )
	* ServiceAnimalCount ( type: esriFieldTypeSmallInteger , alias: Service Animal Count )
	* PassengersExitedCount ( type: esriFieldTypeSmallInteger , alias: Passengers Exited Count )
	* Latitude ( type: esriFieldTypeString , alias: Latitude , length: 50 )
	* Longitude ( type: esriFieldTypeString , alias: Longitude , length: 50 )
	* DistanceTraveled ( type: esriFieldTypeDouble , alias: DistanceTraveled )
2. Create a Table called **Drivers** with the following columns:
	* DriverFirstName ( type: esriFieldTypeString , alias: First Name , length: 50 )
	* DriverLastName ( type: esriFieldTypeString , alias: Last Name , length: 50 )
	* EmployeeID ( type: esriFieldTypeString , alias: EmployeeID , length: 10 )
3. Create a Table called **Bus Status** with the following field: [Example Service](https://gis.yakimawa.gov/arcgis101/rest/services/Transit/BusStatus/MapServer/0) 
	* UnitID ( type: esriFieldTypeString , alias: UnitID , length: 10 )
4. Create a Feature Class (Point) called **All Stops** with the following fields: [Example Service](https://gis.yakimawa.gov/arcgis101/rest/services/Transit/TransitRoutes/MapServer/18)
	* DIR ( type: esriFieldTypeString , alias: DIR , length: 2 )
	* POLETYPE ( type: esriFieldTypeString , alias: POLETYPE , length: 4 )
	* LOCATION ( type: esriFieldTypeString , alias: LOCATION , length: 25 )
	* BENCH ( type: esriFieldTypeString , alias: BENCH , length: 2 )
	* SHELTER ( type: esriFieldTypeString , alias: SHELTER , length: 2 )
	* MISC ( type: esriFieldTypeString , alias: MISC , length: 10 )
	* RATE ( type: esriFieldTypeSmallInteger , alias: RATE )
	* BTEXT ( type: esriFieldTypeString , alias: BTEXT , length: 5 )
	* STEXT ( type: esriFieldTypeString , alias: STEXT , length: 5 )
	* KIOSK ( type: esriFieldTypeString , alias: KIOSK , length: 5 )
	* ROUTES ( type: esriFieldTypeString , alias: ROUTES , length: 30 )
5. Create a Table called **RouteDesc** with the following fields: [Example Service](https://gis.yakimawa.gov/arcgis101/rest/services/Transit/RoutesStopsData/MapServer/6/)
	* route_id ( type: esriFieldTypeString , alias: route_id , length: 12 )
	* agency_id ( type: esriFieldTypeString , alias: agency_id , length: 12 )
	* route_short_name ( type: esriFieldTypeString , alias: route_short_name , length: 50 )
	* route_long_name ( type: esriFieldTypeString , alias: route_long_name , length: 50 )
	* route_desc ( type: esriFieldTypeString , alias: route_desc , length: 50 )
	* route_type ( type: esriFieldTypeString , alias: route_type , length: 50 )
	* route_url ( type: esriFieldTypeString , alias: route_url , length: 50 )
	* route_color ( type: esriFieldTypeString , alias: route_ , length: 10 )
	* route_text_color ( type: esriFieldTypeString , alias: route_text_color , length: 10 )
6. For the sake of data integrity, you may want to secure your service. It's recommended to seperate the Ridership Statistics and Driver Feature Layers into their own secured service. Once secured, the app will present a login dialogue. 
7. Share the Classes and Tables as Services, making sure that you have Feature Access chosen for the editable Service.

###Place the files 
1. Download all the files in this repository to the folder on your webserver where you wish to host the app. It is recommended that you have a SSL service if you are securing your Feature Service so that your login is encrypted.


### Update the Code
1. Edit /js/main.js 
	* Line 78 `var driverQuery = new QueryTask("YOUR DRIVER SERVICE URL");` with the URL of your service
	* Line 100 `var busQuery = new QueryTask("YOUR BUS SERVICE URL");` wth the URL of your service
	* Line 122 `var stopsQuery = new QueryTask("YOUR STOPS URL");` with the URL of your service
	* Line 183 `var routesQuery = new QueryTask("YOUR ROUTE URL");` with the URL of your service
	* Line 360 `var featureLayer = new FeatureLayer("YOUR RIDERSHIP URL", {` with the URL of your service
	* (optional) Line 426 `$('#dijit_form_ValidationTextBox_0').val('DOMAIN\\');` with your domain. This just pre-populates the domain for the login dialogue. 
	* (optional) find all $("#debug") instances, and comment out. This writes some debug info to the screen
2. Edit /js/reports.js
	* Line 154 `var queryTask = new esri.tasks.QueryTask("YOUR RIDERSHIP URL");`  
	* Line 293 `var vehicleTask = new esri.tasks.QueryTask("YOUR RIDERSHIP URL");`
3. Edit /js/training.js
	* Line 78 `var driverQuery = new QueryTask("YOUR DRIVER SERVICE URL");` with the URL of your service
	* Line 100 `var busQuery = new QueryTask("YOUR BUS SERVICE URL");` wth the URL of your service
	* Line 122 `var stopsQuery = new QueryTask("YOUR STOPS URL");` with the URL of your service
	* Line 183 `var routesQuery = new QueryTask("YOUR ROUTE URL");` with the URL of your service
	* Line 363 `var featureLayer = new FeatureLayer("YOUR RIDERSHIP URL", {` with the URL of your service
	* (optional) Line 423 `$('#dijit_form_ValidationTextBox_0').val('DOMAIN\\');` with your domain. This just pre-populates the domain for the login dialogue. 
	
##Extras
1. **Training** - There is a /training URL that is a copy of the main application. It will act like the normal app, but *will not write* to the Feature Service. It's useful to train on the app. 
2. **Web App** If you save the app to the home screen of an iOS device, it will give you a nice icon for the app.
3. **Reporting** Some rudimentary reporting is available at the /reports URL

##Contributing
Contributions are welcome, create an [issue](https://github.com/randybondsjr/transit-ridership/issues) or pull request to contribute to the project.

##License
[GNU GENERAL PUBLIC LICENSE](https://github.com/randybondsjr/transit-ridership/blob/master/LICENSE.md)

##Attribution
* [Fontello](https://github.com/fontello/fontello) (Icon Fonts)
* [Bootstrap Touchspin](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin)
* [Tom Sellsted](https://github.com/orgs/CityofYakima/people/tsellste) Co-Author