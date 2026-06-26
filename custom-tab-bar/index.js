Component({
  data: {
    selected: 0,
    list: []
  },

  attached() {
    this.refreshLocale();
  },

  methods: {
    refreshLocale() {
      const { t } = require('../i18n.js');
      this.setData({
        list: [
          { pagePath: 'pages/index/index', text: t('tabBar.home'), iconImage: '/images/tab/tab-home.png' },
          { pagePath: 'pages/heritage/heritage', text: t('tabBar.heritage'), iconImage: '/images/tab/tab-heritage.png' },
          { pagePath: 'pages/yunyou/yunyou', text: t('tabBar.city'), iconImage: '/images/tab/tab-city.png' },
          { pagePath: 'pages/profile/profile', text: t('tabBar.profile'), iconImage: '/images/tab/tab-profile.png' }
        ]
      });
    },

    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      wx.switchTab({ url: '/' + path });
      this.setData({ selected: index });
    }
  }
});
