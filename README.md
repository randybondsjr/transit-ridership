# Transit Ridership Counter
This project is to create a form (no map) to be used on to record ridership numbers for a transit system. It writes a point to a Feature Service with the entered attributes. Originally designed for the City of Yakima, it can be used anywhere after some minor setup. 

##Requirements
1. ArcGIS Server (you will need to host 3 REST services)
2. Web Server (to host the application)

## Installation
1. Create a Feature Layer called **Ridership Statistics** with the following fields
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

##Attribution
* [Fontello](https://github.com/fontello/fontello) (Icon Fonts)
* [Bootstrap Touchspin](https://github.com/istvan-ujjmeszaros/bootstrap-touchspin)