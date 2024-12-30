/* MagicMirror Module: MMM-DutchTraffic
 * By H. Tilburgs
 * MIT Licensed
 */

Module.register('MMM-DutchTraffic', {
  defaults: {
    showJams: true,
    showConstructions: true,
    showRadars: true,
    preferredRoads: ['ALL'], // Show all roads or specific roads like ['A1', 'A50']
    maxWidth: '500px',
    updateInterval: 60 * 1000, // 1 minute
    animationSpeed: 1000,
    apiUrl: 'https://api.rwsverkeersinfo.nl/api/traffic/',
  },

  data: null,
  jams: [],
  constructions: [],
  radars: [],

  getStyles() {
    return ['MMM-DutchTraffic.css'];
  },

  start() {
    Log.info(`Starting module: ${this.name}`);
    this.scheduleUpdate();
  },

  getDom() {
    const wrapper = document.createElement('div');
    wrapper.className = 'traffic-wrapper';
    wrapper.style.maxWidth = this.config.maxWidth;

    if (!this.data) {
      wrapper.innerHTML = 'Loading traffic data...';
      wrapper.classList.add('bright', 'light', 'small');
      return wrapper;
    }

    if (this.config.showJams && this.jams.length > 0) {
      wrapper.appendChild(this.createSection('Traffic Jams', this.jams, 'traffic-jam'));
    }

    if (this.config.showConstructions && this.constructions.length > 0) {
      wrapper.appendChild(this.createSection('Constructions', this.constructions, 'traffic-construction'));
    }

    if (this.config.showRadars && this.radars.length > 0) {
      wrapper.appendChild(this.createSection('Speed Radars', this.radars, 'traffic-radar'));
    }

    if (wrapper.children.length === 0) {
      wrapper.innerHTML = 'No traffic issues to display.';
      wrapper.classList.add('bright', 'light', 'small');
    }

    return wrapper;
  },

  createSection(title, data, iconClass) {
    const section = document.createElement('div');
    section.className = 'traffic-section';

    const header = document.createElement('div');
    header.className = 'traffic-header';
    header.innerHTML = `<strong>${title}</strong>`;
    section.appendChild(header);

    data.forEach(item => {
      const entry = document.createElement('div');
      entry.className = 'traffic-entry';

      const icon = document.createElement('span');
      icon.className = `traffic-icon ${iconClass}`;
      entry.appendChild(icon);

      const text = document.createElement('span');
      text.className = 'traffic-text';
      text.innerHTML = item.description || 'No additional details';
      entry.appendChild(text);

      section.appendChild(entry);
    });

    return section;
  },

  processData(data) {
    this.jams = [];
    this.constructions = [];
    this.radars = [];

    const preferredRoads = this.config.preferredRoads.map(road => road.toUpperCase());

    data.roadEntries.forEach(road => {
      if (preferredRoads.includes('ALL') || preferredRoads.includes(road.road.toUpperCase())) {
        road.events.trafficJams.forEach(jam => this.jams.push({ name: road.road, description: jam.description }));
        road.events.roadWorks.forEach(work => this.constructions.push({ name: road.road, description: work.description }));
        road.events.radars.forEach(radar => this.radars.push({ name: road.road, description: radar.description }));
      }
    });

    this.data = data;
    this.updateDom(this.config.animationSpeed);
  },

  scheduleUpdate() {
    this.getData();
    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);
  },

  getData() {
    this.sendSocketNotification('FETCH_TRAFFIC', this.config.apiUrl);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'TRAFFIC_DATA') {
      this.processData(payload);
    }
  },
});
