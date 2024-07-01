/*
//-------------------------------------------
MMM-MyDutchTraffic
Copyright (C) 2024 - H. Tilburgs
MIT License

v1.0	: Initial release

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

});
