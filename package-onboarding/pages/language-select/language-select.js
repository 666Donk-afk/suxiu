const { t, setLocale, getLocale, getSupportedLanguages } = require('../../../i18n.js');

Page({
  data: {
    languages: [],
    selected: 'zh-CN',
    showContent: false,
    i18n: {}
  },

  onLoad() {
    const selected = getLocale();
    this.setData({
      selected,
      languages: getSupportedLanguages(),
      showContent: true
    });
    this.refreshI18n();
  },

  refreshI18n() {
    this.setData({
      i18n: {
        appName: t('common.appName'),
        title: t('languageSelect.title'),
        subtitle: t('languageSelect.subtitle'),
        start: t('languageSelect.start')
      }
    });
  },

  onSelect(e) {
    const { code } = e.currentTarget.dataset;
    if (!code || code === this.data.selected) return;
    setLocale(code);
    this.setData({ selected: code });
    this.refreshI18n();
  },

  onStart() {
    wx.redirectTo({ url: '/package-onboarding/pages/onboarding/onboarding' });
  }
});
