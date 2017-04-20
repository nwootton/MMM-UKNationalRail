/* Timetable for Trains Module */

/* Magic Mirror
 * Module: UK National Rail
 *
 * By Nick Wootton
 * based on SwissTransport module by Benjamin Angst http://www.beny.ch
 * MIT Licensed.
 */

Module.register("MMM-UKNationalRail",{

	// Define module defaults
	defaults: {
		updateInterval: 5 * 60 * 1000, // Update every 5 minutes.
		animationSpeed: 2000,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
    initialLoadDelay: 0, // start delay seconds.

    apiBase: 'https://transportapi.com/v3/uk/train/station/',

		stationCode: '', // CRS code for station
		app_key: '', // TransportAPI App Key
    app_id: '', // TransportAPI App ID

		called_at: 		'',
		calling_at:		'',
		darwin:				'',
		destination:	'',
		from_offset:	'',
		operator:			'',
		origin:				'',
		service:			'',
		to_offset:		'',
		train_status:	'',
		type:					'',

		maxResults: 5, //Maximum number of results to display
		showOrigin: false,
		showPlatform: true,
		showActualDeparture: true,
		header:	'Departures'
	},

	// Define required scripts.
	getStyles: function() {
		return ["trains.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js", this.file('titleCase.js')];
	},

	//Define header for module.
	getHeader: function() {
		return this.config.header;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

    this.trains = {};
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

		this.url = encodeURI(this.config.apiBase + this.config.stationCode + '/live.json' + this.getParams());

		this.updateTrainInfo(this);
	},

	// updateTrainInfo
	updateTrainInfo: function(self) {
		self.sendSocketNotification('GET_TRAININFO', {'url':this.url});
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.stationCode === "") {
			wrapper.innerHTML = "Please set the Station Code: " + this.stationCode + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.app_id === "") {
			wrapper.innerHTML = "Please set the application ID: " + this.app_id + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.app_key === "") {
			wrapper.innerHTML = "Please set the application key: " + this.app_key + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = "Loading trains ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.trains.stationName !== null) {
			this.config.header = this.trains.stationName;
		};

		var table = document.createElement("table");
		table.className = "small";

		//With data returned
		if(this.trains.data.length > 0) {
			for (var t in this.trains.data) {
				var myTrain = this.trains.data[t];

				//Create row for data item
				var row = document.createElement("tr");
				table.appendChild(row);

				//If platform is required, create first table cell
				if (this.config.showPlatform) {
					if (myTrain.platform) {
						platform = myTrain.platform;
					}
					else {
						platform = '-';
					}

					var trainPlatformCell = document.createElement("td");
					trainPlatformCell.innerHTML = " " + platform + " ";
					trainPlatformCell.className = "platform";
					row.appendChild(trainPlatformCell);
				}

				//Train destination cell
				var trainDestCell = document.createElement("td");
				trainDestCell.innerHTML = myTrain.destination;
				trainDestCell.className = "bright dest";
				row.appendChild(trainDestCell);

				//If required train origin cell
				if (this.config.showOrigin) {
					var trainOriginCell = document.createElement("td");
					trainOriginCell.innerHTML = myTrain.origin;
					trainOriginCell.className = "trainOrigin";
					row.appendChild(trainOriginCell);
				}

				//Timetabled departure time
				var plannedDepCell = document.createElement("td");
				plannedDepCell.innerHTML = myTrain.plannedDeparture;
				plannedDepCell.className = "timeTabled";
				row.appendChild(plannedDepCell);

				//If required, live departure time
				if (this.config.showActualDeparture) {
					var actualDepCell = document.createElement("td");
					actualDepCell.innerHTML = "(" + myTrain.actualDeparture + ")";
					actualDepCell.className = "actualTime";
					row.appendChild(actualDepCell);
				}

				//Train status cell
				var statusCell = document.createElement("td");
				statusCell.innerHTML = " " + titleCase(myTrain.status) + " ";
				
				if(myTrain.status == "ON TIME") {
					statusCell.className = "bright nonews status";
				}
				else if(myTrain.status == "LATE") {
					statusCell.className = "bright late status";
				}
				else if(myTrain.status == "EARLY") {
					statusCell.className = "bright early status";
				}
				else if(myTrain.status == "CANCELLED") {
					statusCell.className = "late status";
				}
				else if(myTrain.status == "ARRIVED") {
					statusCell.className = "early status";
				}
				else if(myTrain.status == "REINSTATEMENT" || myTrain.status == "STARTS HERE") {
					statusCell.className = "goodnews status";
				}
				else if(myTrain.status == "NO REPORT" || myTrain.status == "OFF ROUTE" ) {
					statusCell.className = "nonews status";
				}
				else {
					statusCell.className = "nonews status";
				}
				
				row.appendChild(statusCell);

				if (this.config.fade && this.config.fadePoint < 1) {
					if (this.config.fadePoint < 0) {
						this.config.fadePoint = 0;
					}
					var startingPoint = this.trains.length * this.config.fadePoint;
					var steps = this.trains.length - startingPoint;
					if (t >= startingPoint) {
						var currentStep = t - startingPoint;
						row.style.opacity = 1 - (1 / steps * currentStep);
					}
				}
			}
		}
		else {
			var row = document.createElement("tr");
			table.appendChild(row);

			var messageCell = document.createElement("td");
			messageCell.innerHTML = " " + this.trains.messages + " ";
			messageCell.className = "bright";
			row.appendChild(messageCell);			
		}

		wrapper.appendChild(table);

		return wrapper;
	},

	/* processTrains(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processTrains: function(data) {
		//define object to hold train info
		this.trains = {};

		//Define array of departure data
		this.trains.data = [];

		//Define message holder
		this.trains.messages = null;

		//Populate station Name
		this.trains.stationName = data.station_name;

		if(data.departures.all.length > 0) {
			//Figure out how long the results are
			var counter = 0;
			if(this.config.maxResults > data.departures.all.length) {
					counter = data.departures.all.length;
			}
			else {
					counter = this.config.maxResults;
			}

			for (var i = 0; i < counter; i++) {

				var thisTrain = data.departures.all[i];

				this.trains.data.push({
					plannedDeparture: thisTrain.aimed_departure_time,
					actualDeparture: thisTrain.expected_departure_time,
					status: thisTrain.status,
					origin: thisTrain.origin_name,
					destination: thisTrain.destination_name,
					leavesIn: thisTrain.best_arrival_estimate_mins,
					platform: thisTrain.platform
				});
			}
		}
		else {
			this.trains.messages = "No departures returned for " + this.config.stationCode;
		}

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},


	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function() {
		var params = "?";
		params += "app_id=" + this.config.app_id;
		params += "&app_key=" + this.config.app_key;

		if(this.config.called_at.length > 0) {
			params += "&called_at=" + this.config.called_at;
		}

		if(this.config.calling_at.length > 0) {
			params += "&calling_at=" + this.config.calling_at;
		}

		if(this.config.darwin) {
			params += "&darwin=" + this.config.darwin;
		}

		if(this.config.destination.length > 0) {
			params += "&destination=" + this.config.destination;
		}

		if(this.config.from_offset.length > 0) {
			params += "&from_offset=" + this.config.from_offset;
		}

		if(this.config.operator.length > 0) {
			params += "&operator=" + this.config.operator;
		}

		if(this.config.origin.length > 0) {
			params += "&origin=" + this.config.origin;
		}

		if(this.config.service.length > 0) {
			params += "&service=" + this.config.service;
		}

		if(this.config.to_offset.length > 0) {
			params += "&to_offset=" + this.config.to_offset;
		}

		if(this.config.train_status.length > 0) {
			params += "&train_status=" + this.config.train_status;
		}

		if(this.config.type.length > 0) {
			params += "&type=" + this.config.type;
		}
		return params;
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateTrainInfo(self);
		}, nextLoad);
	},


	// Process data returned
	socketNotificationReceived: function(notification, payload) {

    if (notification === 'TRAIN_DATA' && payload.url === this.url) {
				this.processTrains(payload.data);
				this.scheduleUpdate(this.config.updateInterval);
    }
  }

});
