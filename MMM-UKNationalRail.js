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
		maxResults: 5, //Maximum number of results to display
    apiBase: 'https://transportapi.com/v3/uk/train/station/',
		stationCode: '', // CRS code for station
		app_key: '', // TransportAPI App Key
    app_id: '', // TransportAPI App ID
		apiEnd: '&darwin=true&train_status=passenger',
		showOrigin: false,

		titleReplace: {
			"Time Table ": ""
		},
	},

	// Define required scripts.
	getStyles: function() {
		return ["trains.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

    this.trains = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

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

		var table = document.createElement("table");
		table.className = "small";

		for (var t in this.trains) {
			var trains = this.trains[t];

			var row = document.createElement("tr");
			table.appendChild(row);

			var depCell = document.createElement("td");
			depCell.className = "departuretime";
			depCell.innerHTML = trains.departureTimestamp;
			row.appendChild(depCell);

      var statusCell = document.createElement("td");
			 statusCell.className = "trains";

      if(trains.status == "LATE") {
          statusCell.innerHTML = trains.delayedBy + " min ";
      } else if(trains.status == "EARLY"){
          statusCell.innerHTML = trains.delayedBy + " min ";
      } else {
          statusCell.innerHTML = "On time";
			}
			row.appendChild(statusCell);

			var trainDestCell = document.createElement("td");
			trainDestCell.innerHTML = trains.destination;
			trainDestCell.className = "align-right bright";
			row.appendChild(trainDestCell);

			if (showOrigin) {
				var trainOriginCell = document.createElement("td");
				trainOriginCell.innerHTML = trains.origin;
				trainOriginCell.className = "align-right trainto";
				row.appendChild(trainOriginCell);
			}

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

		return table;
	},

	/*
	 * Requests new data from transport API
	 * Calls processTrains on succesfull response.
	 */
	updateTimetable: function() {

		var url = this.config.apiBase + this.config.stationCode + '/live.json' + this.getParams();
		var self = this;
		var retry = true;

		var trainRequest = new XMLHttpRequest();
		trainRequest.open("GET", url, true);
		trainRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processTrains(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.config.id = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect waht so ever...");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load trains.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		trainRequest.send();
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
		params += this.config.apiEnd;

		return params;
	},

	/* processTrains(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processTrains: function(data) {

		this.trains = [];
		var counter = 0;
		if(this.config.maxResults > data.departures.all.length) {
				counter = data.departures.all.length;
		}
		else {
				counter = this.config.maxResults;
		}

		for (var i = 0; i < counter; i++) {

			var trains = data.departures.all[i];
			this.trains.push({

				departureTimestamp: trains.aimed_departure_time,
				status: trains.status,
				origin: trains.origin_name,
				destination: trains.destination_name,
				delayedBy: trains.best_arrival_estimate_mins

			});
		}

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
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
			self.updateTimetable();
		}, nextLoad);
	},

});
