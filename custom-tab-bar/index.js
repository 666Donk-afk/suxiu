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
          { pagePath: 'pages/index/index', text: t('tabBar.home'), icon: 'home' },
          { pagePath: 'pages/city/city', text: t('tabBar.city'), icon: 'city' },
          { pagePath: 'pages/favorite/favorite', text: t('tabBar.favorite'), icon: 'heart' },
          { pagePath: 'pages/profile/profile', text: t('tabBar.profile'), icon: 'user' }
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
