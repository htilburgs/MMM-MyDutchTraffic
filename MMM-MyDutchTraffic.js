/*
//-------------------------------------------
MMM-MyDutchTraffic
Copyright (C) 2019 - H. Tilburgs
MIT License
//-------------------------------------------
*/

Module.register('MMM-MyDutchTraffic', {
  // Default values
  defaults: {
    showJams: true,
    showConstructions: false,
    showRadars: false,
    preferredRoads: ['ALL'],
    pref_Cons: ['ALL'],
    pref_Jams: ['ALL'],
    pref_Rad: ['ALL'],
    maxWidth: '500px',
    largeIcons: false,
    animationSpeed: 1000,
    initialLoadDelay: 1000,
    retryDelay: 2500,
    updateInterval: 60 * 1000,
  },

  MDT: null,
  jams: [],
  constructions: [],
  radars: [],

  getStyles() {
    return ['MMM-TT.css'];
  },

  getScripts() {
    return ['moment.js'];
  },

  getTranslations() {
    return false;
  },

  start() {
    Log.info(`Starting module: ${this.name}`);
    this.url = 'https://api.rwsverkeersinfo.nl/api/traffic/';
    this.MDT = [];
    this.scheduleUpdate();
  },

  getDom() {
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.style.maxWidth = this.config.maxWidth;

    if (!this.loaded) {
      wrapper.innerHTML = 'Loading...';
      wrapper.classList.add('bright', 'light', 'small');
      return wrapper;
    }

    const createTrafficElement = (iconClass, title, description) => {
      const warnWrapper = document.createElement('div');
      const icon = document.createElement('div');
      icon.classList.add(iconClass, 'small-icon');
      const event = document.createElement('div');
      event.className = 'event xsmall';
      const info = document.createElement('div');
      info.className = 'bold';
      info.innerHTML = title;
      const desc = document.createElement('div');
      desc.classList.add('description', 'xsmall');
      desc.innerHTML = description;
      const hr = document.createElement('hr');

      event.appendChild(info);
      event.appendChild(desc);
      warnWrapper.appendChild(icon);
      warnWrapper.appendChild(event);
      wrapper.appendChild(warnWrapper);
      wrapper.appendChild(hr);
    };

    if (this.config.largeIcons) {
      if (this.config.showJams) {
        this.jams.forEach(jam =>
          createTrafficElement(
            'trafficicon-jam',
            `${jam.name} - ${jam.jam.startDate || ''} - ${(jam.jam.distance / 1000).toFixed(2)} KM`,
            jam.jam.description || ''
          )
        );
      }

      if (this.config.showRadars) {
        this.radars.forEach(radar =>
          createTrafficElement(
            'trafficicon-camera',
            radar.name,
            radar.radar.description || ''
          )
        );
      }

      if (this.config.showConstructions) {
        this.constructions.forEach(construction =>
          createTrafficElement(
            'trafficicon-construction',
            `${construction.name} - ${construction.construction.startDate} t/m ${construction.construction.stopDate}`,
            construction.construction.description || ''
          )
        );
      }
    } else {
      const createSmallInfo = (icon, title, descClass, description) => {
        const info = document.createElement('div');
        info.className = `${descClass} xsmall bold`;
        info.innerHTML = `<i class="${icon}"></i> ${title}`;
        wrapper.appendChild(info);

        const desc = document.createElement('div');
        desc.className = `${descClass} xsmall`;
        desc.innerHTML = description;
        wrapper.appendChild(desc);
      };

      if (this.config.showJams) {
        this.jams.forEach(jam =>
          createSmallInfo(
            'tr-traffic-jam',
            `${jam.name} - ${jam.jam.startDate || ''} - ${(jam.jam.distance / 1000).toFixed(2)} KM`,
            'jamsDescription',
            jam.jam.description || ''
          )
        );
      }

      if (this.config.showRadars) {
        this.radars.forEach(radar =>
          createSmallInfo('tr-traffic-camera', radar.name, 'radarDescription', radar.radar.description || '')
        );
      }

      if (this.config.showConstructions) {
        this.constructions.forEach(construction =>
          createSmallInfo(
            'tr-traffic-cone',
            `${construction.name} - ${construction.construction.startDate} t/m ${construction.construction.stopDate}`,
            'consDescription',
            construction.construction.description || ''
          )
        );
      }
    }

    return wrapper;
  },

  processMDT(data) {
    this.MTR = data;
    this.jams = [];
    this.constructions = [];
    this.radars = [];

    const normalizeArray = arr => arr.map(x => x.toUpperCase());
    const { preferredRoads, pref_Jams, pref_Cons, pref_Rad } = this.config;

    this.pRoads = normalizeArray(preferredRoads);
    this.pJams = normalizeArray(pref_Jams);
    this.pCons = normalizeArray(pref_Cons);
    this.pRad = normalizeArray(pref_Rad);

    data.roadEntries.forEach(road => {
      if (this.pRoads.includes(road.road) || this.pRoads.includes('ALL')) {
        road.events.trafficJams.forEach(jam => this.jams.push({ name: road.road, jam }));
        road.events.roadWorks.forEach(work => this.constructions.push({ name: road.road, construction: work }));
        road.events.radars.forEach(radar => this.radars.push({ name: road.road, radar }));
      }
    });

    this.loaded = true;
  },

  scheduleUpdate() {
    setInterval(() => this.getMDT(), this.config.updateInterval);
    this.getMDT();
  },

  getMDT() {
    this.sendSocketNotification('GET_MDT', this.url);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'MDT_RESULT') {
      this.processMDT(payload);
      this.updateDom(this.config.animationSpeed);
    }
  },
});
