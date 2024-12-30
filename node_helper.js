/*
//-------------------------------------------
MMM-MyDutchTraffic
Copyright (C) 2024 - H. Tilburgs
MIT License

v1.0: Initial release
v2.0: Optimize code
//-------------------------------------------
*/

const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
  start() {
    console.log(`Starting node_helper for: ${this.name}`);
  },

  async getMDT(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('MMM-MyDutchTraffic: Network response was not ok', response.status);
        return;
      }

      const result = await response.json();
      if (result) {
        this.sendSocketNotification('MDT_RESULT', result);
      } else {
        console.error('MMM-MyDutchTraffic: Invalid or empty response data');
      }
    } catch (error) {
      console.error('MMM-MyDutchTraffic: Error fetching data', error);
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'GET_MDT') {
      this.getMDT(payload);
    }
  },
});
