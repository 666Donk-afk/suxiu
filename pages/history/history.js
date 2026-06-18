const storage = require('../../utils/storage');
const { t } = require('../../i18n.js');

Page({
  data: {
    list: [],
    isGuest: true,
    i18n: {}
  },

  onShow() {
    this.refreshI18n();
    const isGuest = !storage.isLoggedIn();
    this.setData({
      isGuest,
      list: isGuest ? [] : storage.getHistory()
    });
  },

  refreshI18n() {
    this.setData({
      i18n: {
        clear: t('history.clear'),
        empty: t('history.empty'),
        guestTitle: t('history.guestTitle'),
        goLogin: t('history.goLogin')
      }
    });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  onRemove(e) {
    const { id } = e.currentTarget.dataset;
    storage.removeHistoryItem(id);
    this.setData({ list: storage.getHistory() });
    wx.showToast({ title: t('history.deleted'), icon: 'none' });
  },

  onClear() {
    wx.showModal({
      title: t('history.clearTitle'),
      content: t('history.clearContent'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      success: res => {
        if (res.confirm) {
          storage.clearHistory();
          this.setData({ list: [] });
        }
      }
    });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
