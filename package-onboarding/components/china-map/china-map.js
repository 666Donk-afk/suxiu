const { getProvinces, findProvinceAtPoint } = require('../../../data/provinces.js');

Component({
  properties: {
    selectedCode: {
      type: String,
      value: ''
    },
    activeCode: {
      type: String,
      value: ''
    }
  },

  data: {
    provinces: [],
    pinProvince: null,
    mapWidth: 0,
    mapHeight: 0
  },

  observers: {
    'activeCode, selectedCode, provinces': function(active, selected) {
      this.updatePin(active, selected);
    }
  },

  lifetimes: {
    attached() {
      const provinces = getProvinces();
      this.setData({ provinces }, () => {
        this.updatePin(this.properties.activeCode, this.properties.selectedCode);
      });
      wx.nextTick(() => this.measureMap());
    }
  },

  methods: {
    updatePin(active, selected) {
      const code = active || selected;
      if (!code) {
        this.setData({ pinProvince: null });
        return;
      }
      const province = this.data.provinces.find(p => p.code === code);
      this.setData({ pinProvince: province || null });
    },

    measureMap() {
      const query = this.createSelectorQuery();
      query.select('#mapImage').boundingClientRect(rect => {
        if (rect && rect.width) {
          this.setData({
            mapWidth: rect.width,
            mapHeight: rect.height
          });
        }
      }).exec();
    },

    onMapImageLoad() {
      wx.nextTick(() => this.measureMap());
    },

    onMapTap(e) {
      const query = this.createSelectorQuery();
      query.select('#mapImage').boundingClientRect(rect => {
        if (!rect || !rect.width) return;
        const x = e.detail.x - rect.left;
        const y = e.detail.y - rect.top;
        this.handleTapAt(x, y, rect.width, rect.height);
      }).exec();
    },

    handleTapAt(x, y, mapWidth, mapHeight) {
      const xPct = (x / mapWidth) * 100;
      const yPct = (y / mapHeight) * 100;
      const code = findProvinceAtPoint(xPct, yPct);
      if (!code) return;

      const province = this.data.provinces.find(p => p.code === code);
      this.setData({ pinProvince: province || null });
      this.triggerEvent('provincechange', { code });
    }
  }
});
