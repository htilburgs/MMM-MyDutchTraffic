Module.register("MMM-TrafficInfo", {
    defaults: {
        apiKey: "", // Replace with your API key
        endpoint: "https://api.rwsverkeersinfo.nl/api/traffic/",
        updateInterval: 600000, // 10 minutes
        maxItems: 5,
    },

    start: function () {
        this.trafficData = [];
        this.sendSocketNotification("GET_TRAFFIC_DATA", {
            apiKey: this.config.apiKey,
            endpoint: this.config.endpoint,
        });
        setInterval(() => {
            this.sendSocketNotification("GET_TRAFFIC_DATA", {
                apiKey: this.config.apiKey,
                endpoint: this.config.endpoint,
            });
        }, this.config.updateInterval);
    },

    getStyles: function () {
        return ["MMM-TrafficInfo.css"];
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        if (this.trafficData.length === 0) {
            wrapper.innerHTML = "Loading traffic data...";
            return wrapper;
        }

        const list = document.createElement("ul");
        this.trafficData.slice(0, this.config.maxItems).forEach((item) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `${item.location} - ${item.description}`;
            list.appendChild(listItem);
        });
        wrapper.appendChild(list);

        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "TRAFFIC_DATA") {
            this.trafficData = payload;
            this.updateDom();
        }
    },
});
