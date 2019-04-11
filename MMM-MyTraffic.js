/*
//-------------------------------------------
MMM-MyTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/

Module.register('MMM-MyTraffic', {

	// Default values
	defaults: {
		showJams: true,				// Show Trafficjams
		showConstructions: true,		// Show Constructions
		showRadars: true,			// Show Radar controles
		sortBy: null,				// Way of sorting the information
		maxWidth: "500px",			// Max width wrapper
		animationSpeed: 1000, 			// fade in and out speed
		initialLoadDelay: 1000,
		retryDelay: 2500,
		updateInterval: 10 * 60 * 1000		// every 10 minutes
	},
		
	// Define stylesheet
	getStyles: function () {
		return ["MMM-MyTraffic.css"];
	},  

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define required translations.
	getTranslations: function () {
		// The translations for the default modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionary.
		// If you're trying to build your own module including translations, check out the documentation.
		return false;
	},
	
	start: function () {
		Log.info("Starting module: " + this.name);
		requiresVersion: "2.1.0",	
			
		// Set locales
		this.url = "https://www.anwb.nl/feeds/gethf"
		this.MTR = [];			// <-- Create empty MTR array
		this.scheduleUpdate();       	// <-- When the module updates (see below)
	},

	getDom: function () {
		
		// creating the table
		var table = document.createElement("table");
		table.style.maxWidth = this.config.maxWidth;
		
		// creating the wrapper
		var wrapper = document.createElement("div");
		wrapper.className = "wrapper";
		wrapper.style.maxWidth = this.config.maxWidth;
	
		// The loading sequence
        	if (!this.loaded) {
            	    wrapper.innerHTML = "Loading....";
            	    wrapper.classList.add("bright", "light", "small");
            	    return wrapper;
        	}	
		
		var MTR = this.MTR;
		
		// Create lists of jams, construction-zones and radar positions, with their road name	
		var jams = []
		var constructions = []
		var radars = []

		for (var road of MTR.roadEntries){
  			for (var jam of road.events.trafficJams){
			jams.push({name: road.road, jam})
			}
  			for (var construction of road.events.roadWorks){
    			constructions.push({name: road.road,construction})
  			}
  			for (var radar of road.events.radars){
    			radars.push({name: road.road,radar})
  			}
		}	

		// For development reason
		for (var i = 0; i < jams.length; i++) {
   		 console.log(jams[i]);
		}
		for (var i = 0; i < constructions.length; i++) {
   		 console.log(constructions[i]);
		}
		for (var i = 0; i < radars.length; i++) {
   		 console.log(radars[i]);
		}
		
		for (var i = 0; i < jams.length; i++) {		
			var jamsNameRow = document.createElement("tr");
			jamsNameRow.className = "xsmall";
			jamsNameRow.innerHTML = '<i class="fas fa-car"></i> ' + jams[i].name + " - " + jams[i].jam.startDate + " - " + (jams[i].jam.distance/1000) + "KM";
			table.appendChild(jamsNameRow);
			
			var jamsReasonRow = document.createElement("tr");
			jamsReasonRow.className = "xsmall";
			jamsReasonRow.innerHTML = jams[i].jam.description;
			table.appendChild(jamsReasonRow);
			
/*			var jamsFromRow = document.createElement("tr");
			jamsFromRow.className = "xsmall";
			jamsFromRow.innerHTML = jams[i].jam.from;
			table.appendChild(jamsFromRow);
*/		}
		
		var spacer = document.createElement("tr");
		spacer.innerHTML = "&nbsp;";
		table.appendChild(spacer);
		
		for (var i = 0; i < radars.length; i++) {			
			var radarsRow = document.createElement("tr");
			radarsRow.className = "xsmall";
			radarsRow.innerHTML = '<i class="fas fa-camera"></i> ' + radars[i].name + " - " + radars[i].radar.description;
			table.appendChild(radarsRow);
		}
		
		var spacer = document.createElement("tr");
		spacer.innerHTML = "&nbsp;";
		table.appendChild(spacer);
		
		return table;

	}, // <-- closes the getDom function from above
		
	
	// this processes your data
	processTRAFFIC: function (data) { 
		this.MTR = data; 
		console.log(this.MTR); // uncomment to see if you're getting data (in dev console)
		this.loaded = true;
	},
	
	// this tells module when to update
	scheduleUpdate: function () { 
		setInterval(() => {
		    this.getTRAFFIC();
		}, this.config.updateInterval);
		this.getTRAFFIC();
		var self = this;
	},
	  
	// this asks node_helper for data
	getTRAFFIC: function() { 
		this.sendSocketNotification('GET_MYTRAFFIC', this.url);
	},
	
	// this gets data from node_helper
	socketNotificationReceived: function(notification, payload) { 
		if (notification === "MYTRAFFIC_RESULT") {
		    this.processTRAFFIC(payload);
		}
		this.updateDom(this.config.initialLoadDelay);
	},
});
