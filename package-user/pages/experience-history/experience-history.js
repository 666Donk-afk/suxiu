const storage = require('../../../utils/storage');
const { t } = require('../../../i18n.js');

function formatTime(ts) {
  const d = new Date(ts);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

Page({
  data: {
    list: [],
    i18n: {}
  },

  onShow() {
    this.refreshI18n();
    const list = storage.getExperienceHistory().map(item => ({
      ...item,
      viewedAtText: formatTime(item.viewedAt)
    }));
    this.setData({ list });
    wx.setNavigationBarTitle({ title: t('experienceHistory.title') });
  },

  refreshI18n() {
    this.setData({
      i18n: {
        empty: t('experienceHistory.empty'),
        heritage: t('experienceHistory.heritage'),
        remove: t('common.delete')
      }
    });
  },

  goGuide(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/package-detail/pages/experience-guide/experience-guide?id=${id}` });
  },

  goHeritage(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/package-detail/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  onRemove(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: t('experienceHistory.confirmTitle'),
      content: t('experienceHistory.confirmContent'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      success: res => {
        if (res.confirm) {
          storage.removeExperienceHistory(id);
          const list = storage.getExperienceHistory().map(item => ({
            ...item,
            viewedAtText: formatTime(item.viewedAt)
          }));
          this.setData({ list });
          wx.showToast({ title: t('experienceHistory.deleted'), icon: 'none' });
        }
      }
    });
  }
});
