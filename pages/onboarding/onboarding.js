const { t } = require('../../i18n.js');

Page({
  data: {
    current: 0,
    slides: [],
    i18n: {}
  },

  onLoad() {
    this.refreshI18n();
  },

  onShow() {
    this.refreshI18n();
  },

  refreshI18n() {
    this.setData({
      i18n: {
        skip: t('onboarding.skip'),
        swipeHint: t('onboarding.swipeHint'),
        start: t('onboarding.start'),
        decoOrigin: t('onboarding.decoOrigin'),
        decoInherit: t('onboarding.decoInherit')
      },
      slides: [
        { title: t('onboarding.slide1Title'), subtitle: t('onboarding.slide1Subtitle'), theme: 'city' },
        { title: t('onboarding.slide2Title'), subtitle: t('onboarding.slide2Subtitle'), theme: 'story' },
        { title: t('onboarding.slide3Title'), subtitle: t('onboarding.slide3Subtitle'), theme: 'share' }
      ]
    });
  },

  onSwiperChange(e) {
    this.setData({ current: e.detail.current });
  },

  onSkip() {
    wx.redirectTo({ url: '/pages/login/login' });
  },

  onStart() {
    wx.redirectTo({ url: '/pages/login/login' });
  }
});
