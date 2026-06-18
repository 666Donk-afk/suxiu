const { t } = require('../../i18n.js');

Page({
  data: {
    content: '',
    i18n: {}
  },

  onShow() {
    this.refreshI18n();
  },

  refreshI18n() {
    this.setData({
      i18n: {
        title: t('feedback.title'),
        label: t('feedback.label'),
        placeholder: t('feedback.placeholder'),
        contact: t('feedback.contact'),
        submit: t('feedback.submit')
      }
    });
    wx.setNavigationBarTitle({ title: t('feedback.title') });
  },

  onInput(e) {
    this.setData({ content: e.detail.value });
  },

  onSubmit() {
    const { content } = this.data;
    if (!content.trim()) {
      wx.showToast({ title: t('feedback.empty'), icon: 'none' });
      return;
    }
    wx.showToast({ title: t('feedback.success'), icon: 'success' });
    this.setData({ content: '' });
  }
});
