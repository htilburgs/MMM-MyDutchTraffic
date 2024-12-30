const NodeHelper = require('node_helper');
const fetch = require('node-fetch');

module.exports = NodeHelper.create({
  start() {
    console.log(`Starting node helper for: ${this.name}`);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'FETCH_TRAFFIC') {
      this.fetchTrafficData(payload);
    }
  },

  fetchTrafficData(apiUrl) {
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.sendSocketNotification('TRAFFIC_DATA', data);
      })
      .catch(error => {
        console.error(`Error fetching traffic data: ${error.message}`);
      });
  },
});
