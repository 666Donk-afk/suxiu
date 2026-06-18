const storage = require('../../utils/storage');
const { t } = require('../../i18n.js');

Page({
  data: {
    fading: false,
    showLogo: false,
    showName: false,
    showSlogan: false,
    i18n: {}
  },

  onLoad() {
    this.refreshI18n();
    setTimeout(() => this.setData({ showLogo: true }), 100);
    setTimeout(() => this.setData({ showName: true }), 400);
    setTimeout(() => this.setData({ showSlogan: true }), 700);

    setTimeout(() => {
      this.setData({ fading: true });
      setTimeout(() => this.navigateNext(), 400);
    }, 1500);
  },

  refreshI18n() {
    this.setData({
      i18n: {
        appName: t('common.appName'),
        slogan: t('splash.slogan')
      }
    });
  },

  navigateNext() {
    if (!storage.hasCompletedLaunch()) {
      wx.redirectTo({ url: '/pages/journey-setup/journey-setup' });
      return;
    }
    wx.switchTab({ url: '/pages/index/index' });
  }
});
