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
		showJams: true,				// Show Traffic jams
		showConstructions: false,		// Show Constructions
		showRadars: true,			// Show Radar controles
		sortBy: null,				// Way of sorting the information - FUTURE OPTION
		preferredRoads: null,			// Display only preferred roads - FUTURE OPTION
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
//		var table = document.createElement("table");
//		table.style.maxWidth = this.config.maxWidth;
		
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
		var ROADS = this.prefferedRoads;
		
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
		
/*		// Display Traffic Jam information
		if (this.config.showJams != false) {
		   for (var i = 0; i < jams.length; i++) {		
			var jamsNameRow = document.createElement("tr");
			jamsNameRow.className = "xsmall";
			if (typeof jams[i].jam.startDate !== 'undefined' && jams[i].jam.distance !== 'NaN') {
				jamsNameRow.innerHTML = '<i class="tr-traffic-jam"></i> ' + jams[i].name + " - " + jams[i].jam.startDate + " - " + (jams[i].jam.distance/1000) + "KM";
			} else {
				jamsNameRow.innerHTML = '<i class="tr-traffic-jam"></i> ' + jams[i].name;
			}
			table.appendChild(jamsNameRow);		   			
					
			var jamsReasonRow = document.createElement("tr");
			jamsReasonRow.className = "xsmall";
			jamsReasonRow.innerHTML = jams[i].jam.description;
			table.appendChild(jamsReasonRow);
		   }
		}
*/
		
		//Display Traffic Jam information
		if (this.config.showJams != false) {
//		   for (var i = 0; i < jams.length; i++) {	
		   for (var i = 0; i < 5; i++) {
			 
			var warnWrapper = document.createElement("div");
			var icon = document.createElement("div");
			icon.classList.add('tr-traffic-jam');
			var description = document.createElement("div");
			description.className = 'description';
			var headline = document.createElement("div");
			headline.innerHTML = jams[i].name;
			var duration = document.createElement("div");
			duration.className = 'duration';
			duration.innerHTML = jams[i].jam.startDate + " - " + (jams[i].jam.distance/1000) + "KM";
			var newLine = document.createElement("br");
			description.appendChild(headline);
			description.appendChild(duration);
			warnWrapper.appendChild(icon);
			warnWrapper.appendChild(description);
			wrapper.appendChild(warnWrapper);
			wrapper.appendChild(newLine);
			   
		   }
		}
			   
/*			   
		//Display Traffic Camera (Radar) information
		if (this.config.showRadars != false) {		
		   for (var i = 0; i < radars.length; i++) {	
			var radarsRow = document.createElement("tr");
			radarsRow.className = "xsmall";
			radarsRow.innerHTML = '<i class="tr-traffic-camera"></i> ' + radars[i].name + " - " + radars[i].radar.description;
			table.appendChild(radarsRow);
		   }
		}
				
		//Display Traffic Constructions information
		if (this.config.showConstructions != false) {		
		   for (var i = 0; i < radars.length; i++) {			
			var constructionsRow = document.createElement("tr");
			constructionsRow.className = "xsmall";
			constructionsRow.innerHTML = '<i class="tr-traffic-cone"></i> ' + constructions[i].name + " - " + constructions[i].construction.startDate + " t/m " + constructions[i].construction.stopDate;
			table.appendChild(constructionsRow);
			
			var constructionsRow = document.createElement("tr");
			constructionsRow.className = "xsmall";
			constructionsRow.innerHTML = constructions[i].construction.description;
			table.appendChild(constructionsRow);
		   }
		}
		
		return table;
*/
		return wrapper;
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
