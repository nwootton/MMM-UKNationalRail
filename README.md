# MMM-UKNationalRail
Additional Module for MagicMirror²  https://github.com/MichMich/MagicMirror

# Module: UKNationalRail
This module displays LIVE train arrivals & departures from a specified station.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:

```javascript
modules: [
    {
		module: 'MMM-UKNationalRail',
		position: 'bottom_left',
		config: {
			stationCode: 		'SUR', 		// CRS code for station
			app_id: 			'03bf8009', 	// TransportAPI App ID
			app_key: 			'd9307fd91b0247c607e098d5effedc97', // TransportAPI App Key
			maxResults: 		5,  //Optional - Maximum results to display.
			showOrigin: 		false   //Optional - Show the origin of the train in the table
		}
	},
]
```
There are 3 MANDATORY fields - `stationCode`, `app_id` and `app_key`. All the others are used to limit the amount of info you get back, especially useful for busy stations like Clapham Junction.

The following is taken from the TransportAPI documentation [here](https://developer.transportapi.com/docs?raml=https://transportapi.com/v3/raml/transportapi.raml##uk_train_station_station_code_live_json)

|Option|Required Settings Description|
|---|---|
|`stationCode`|String. The station you require information about.<br><br>This value is **REQUIRED** <br/>**Example**: SUR <br />|
|`api_id`|String. Your TransportAPI app_id [Get yours here](https://developer.transportapi.com/signup).<br><br>This value is **REQUIRED**  <br/>**Example**: 03bf8009 <br />|
|`app_key`|String. Your TransportAPI app_key [Get yours here](https://developer.transportapi.com/signup).<br><br>This value is **REQUIRED** <br/>**Example**: d9307fd91b0247c607e098d5effedc97 <br />|

|Option|Optional Settings Description|
|---|---|
|`called_at`|String. Only include services that call at the given station, before calling at the station of interest.<br><br>**Example:** 'VXH'|
|`calling_at`|String. Only include services that call at the given station, after calling at the station of interest.<br><br>**Example:** 'CLJ'|
|`darwin`|Boolean. Additionally use data from the National Rail Enquiries Darwin Data Feeds when determining the value of the status fields for all the departures, arrivals or passes.<br><br>**Default:** false|
|`destination`|String. Only include services terminating at the given station.<br><br>**Example:** 'SUR'|
|`from_offset`|String. Modifies the start of the time window for which services are retrieved. By default, this is one hour in the past relative to the date/time of interest..<br><br>**Default:** '-PT01:00:00'|
|`operator`|String. Only include services that are operated by the given operator, specified using its ATOC code<br><br>**Example:** 'SW'|
|`origin`|String. Only include services originating from the given station.<br><br>**Example:** 'WAT'|
|`service`|String. Only include services that have the given service code.<br><br>**Example:** '24673205'|
|`to_offset`|String. Modifies the end of the time window for which services are retrieved. By default, this is two hours in the future relative to the date/time of interest.<br><br>**Default:** 'PT02:00:00'|
|`train_status`|String. Only include services having the specified train status. Can be used to show either 'passenger' or 'freight' services.<br><br>**Default:** 'passenger'|
|`type`|String. Only include services of the given type. Allowed types are "arrival", "departure" or "pass". <br />These individual values can be combined using a comma separated list of the allowed types such as: <br />"arrival,departure,pass" or "pass,departure".<br><br>**Default:** 'departure'|

|Option|Other Settings|
|---|---|
|`maxResults `|Integer. Limits the number of rows returned by the module. This will be the highest number between this value or the number of rows returned if it is less.<br><br>**Default:** 5|
|`showOrigin `|Boolean. This shows the origin of the train in the results grid.<br><br>**Default:** false|

To find the CRS Station codes for the 'stations of interest' go here: http://www.railwaycodes.org.uk/crs/CRS0.shtm

## Transport API

To setup an account for the App_id & app_key sign up for an account here: http://www.transportapi.com/
