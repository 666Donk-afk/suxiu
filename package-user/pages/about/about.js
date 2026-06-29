const { t } = require('../../../i18n.js');

Page({
  data: {
    i18n: {}
  },

  onShow() {
    this.refreshI18n();
    wx.setNavigationBarTitle({ title: t('profile.about') });
  },

  refreshI18n() {
    this.setData({
      i18n: {
        appName: t('common.appName'),
        subtitle: t('about.subtitle'),
        introTitle: t('about.introTitle'),
        intro: t('about.intro'),
        visionTitle: t('about.visionTitle'),
        vision: t('about.vision'),
        version: t('common.version')
      }
    });
  }
});
