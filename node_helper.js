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
//		var result = JSON.parse(body).roadEntries;				// JSON data path - object.roadEntries.x 
	var result = JSON.parse(body).roadEntries.forEach(function(element) {console.log(element.result);
//		console.log(response.statusCode + result);				// uncomment to see in terminal
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

JSON.parse('[{"wark":"targ"},{"wark":"lot"}]').forEach(function(element) { console.log(element.wark); })  
VM466:1 targ
VM466:1 lot
