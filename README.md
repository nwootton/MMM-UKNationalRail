# MMM-UKNationalRail
Additional Module for MagicMirror²  https://github.com/MichMich/MagicMirror/tree/v2-beta

# Module: UKNationalRail
This module displays train arrivals & departures from a specified station.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
    {
		module: 'MMM-UKNationalRail',
		position: 'bottom_left',
		header: 'My Station Name',
		config: {
      stationCode: 'WAT', // Can be CRS or TIPLOC code for station
			app_id: '123445678', // TransportAPI App ID
			app_key: 'qwertyuiop[asdfghjkl]', // TransportAPI App Key
		}
	},
]
````
To find the CRS Station code go here: http://www.railwaycodes.org.uk/crs/CRS0.shtm

## Transport API

To setup an account for the App_id & app_key sign up for an account here: http://www.transportapi.com/
