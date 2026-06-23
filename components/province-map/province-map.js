const { getProvinceMap, findCityAtPoint } = require('../../data/province-maps.js');
const { getCityCover, buildCityCards } = require('../../data/city-covers.js');
const { getProvinceByCode } = require('../../data/provinces.js');
const { pickLocale } = require('../../i18n/locale-field.js');

Component({
  properties: {
    provinceCode: {
      type: String,
      value: ''
    },
    selectedCity: {
      type: String,
      value: ''
    }
  },

  data: {
    mapData: null,
    pinCity: null,
    mapWidth: 0,
    mapHeight: 0,
    provinceShort: ''
  },

  observers: {
    provinceCode(code) {
      this.loadMap(code);
    },
    selectedCity(city) {
      if (!city || !this.data.mapData) {
        this.setData({ pinCity: null });
        return;
      }
      const found = this.data.mapData.cities.find(c => c.name === city);
      if (found) {
        this.setData({
          pinCity: {
            name: city,
            marker: found.marker,
            cover: found.cover || getCityCover(city, this.data.provinceShort)
          }
        });
      }
    }
  },

  lifetimes: {
    attached() {
      this.loadMap(this.properties.provinceCode);
    }
  },

  methods: {
    loadMap(code) {
      const mapData = getProvinceMap(code);
      if (!mapData) {
        this.setData({ mapData: null, pinCity: null, provinceShort: '' });
        return;
      }

      const province = getProvinceByCode(code, 'zh-CN');
      const provinceShort = province ? pickLocale(province.name, 'zh-CN') : '';
      const cityNames = mapData.cities.map(c => c.name);
      const coverCards = buildCityCards(cityNames, provinceShort);
      const coverMap = Object.fromEntries(coverCards.map(c => [c.name, c.cover]));

      const cities = mapData.cities.map(c => ({
        ...c,
        cover: coverMap[c.name] || getCityCover(c.name, provinceShort)
      }));

      this.setData({
        mapData: { ...mapData, cities },
        pinCity: null,
        provinceShort
      });
      wx.nextTick(() => this.measureMap());
    },

    measureMap() {
      const query = this.createSelectorQuery();
      query.select('#provinceMapImage').boundingClientRect(rect => {
        if (rect && rect.width) {
          this.setData({ mapWidth: rect.width, mapHeight: rect.height });
        }
      }).exec();
    },

    onMapImageLoad() {
      wx.nextTick(() => this.measureMap());
    },

    onMapTap(e) {
      const query = this.createSelectorQuery();
      query.select('#provinceMapImage').boundingClientRect(rect => {
        if (!rect || !rect.width) return;
        const { mapData } = this.data;
        if (!mapData) return;

        const x = e.detail.x - rect.left;
        const y = e.detail.y - rect.top;
        const xPct = (x / rect.width) * 100;
        const yPct = (y / rect.height) * 100;
        const cityName = findCityAtPoint(this.properties.provinceCode, xPct, yPct);
        if (!cityName) return;

        const city = mapData.cities.find(c => c.name === cityName);
        this.setData({
          pinCity: city ? { name: cityName, marker: city.marker, cover: city.cover } : null
        });
        this.triggerEvent('citychange', { city: cityName });
      }).exec();
    }
  }
});
