/*
//-------------------------------------------
MMM-MyTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/

const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

  start: function() {
          console.log("Starting node_helper for: " + this.name);
  },

  getMTR: function(url) {
	request({
	url: url,
	method: 'GET'
	}, 
	(error, response, body) => {
		if (!error && response.statusCode == 200) {
		var result = JSON.parse(body).roadEntries;				// JSON data path - object.roadEntries.x 
		console.log(response.statusCode + result);				// uncomment to see in terminal
			
		var jams = []
		var construction_zones= []
		var radars = []

		for(var road of result){
  			for (var jam of road.events.trafficjams){
     			jams.push({name: road.road, jam})
  			}
  			for (var construction of road.events.roadWorks){
     			construction_zones.push({name: road.road,construction})
  			}
  			for (var radar of road.events.radars){
     			radars.push({name: road.road,radar})
  			}
		}
		// now u have lists of jams, construction-zones and radar positions, with their road name	
		this.sendSocketNotification('MYTRAFFIC_RESULT', result);
		}
        });
    },

  socketNotificationReceived: function(notification, payload) {
            if (notification === 'GET_MYTRAFFIC') {
            this.getMTR(payload);
            }
  }
});
