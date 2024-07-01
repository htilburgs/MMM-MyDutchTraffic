/*
//-------------------------------------------
MMM-MyTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/

const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({

  start: function() {
          console.log("Starting node_helper for: " + this.name);
  },

getMDT: function(url) {
        // Make a GET request using the Fetch API
        fetch(url)
          .then(response => {
            if (!response.ok) {
              console.error('MMM-MyDutchTraffic: Network response was not ok');
            }
            return response.json();
          })

          .then(result => {
            // Process the retrieved user data
            // console.log(result.data.timings); // Remove trailing slashes to display data in Console for testing
            this.sendSocketNotification('MDT_RESULT', result);
          })

          .catch(error => {
            console.error('Error:', error);
          });
  },

 socketNotificationReceived: function(notification, payload) {
            if (notification === 'GET_MDT') {
            this.getMDT(payload);
            }
  },

/*	
  getTRAFFIC: function(url) {
	request({
	url: url,
	method: 'GET'
	}, (error, response, body) => {
	if (!error && response.statusCode == 200) {
	var result = JSON.parse(body);							// JSON data path	
	//console.log(response.statusCode + result);			// Uncomment to see in terminal for test purposes
	this.sendSocketNotification('MYTRAFFIC_RESULT', result);
	}
        });
    },

  socketNotificationReceived: function(notification, payload) {
            if (notification === 'GET_MYTRAFFIC') {
            this.getTRAFFIC(payload);
            }
  }
*/
});
