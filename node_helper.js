const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    socketNotificationReceived: async function (notification, payload) {
        if (notification === "GET_TRAFFIC_DATA") {
            const { apiKey, endpoint } = payload;
            try {
                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                });
                this.sendSocketNotification("TRAFFIC_DATA", response.data);
            } catch (error) {
                console.error("Error fetching traffic data:", error);
            }
        }
    },
});
