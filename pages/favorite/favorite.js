const { getHeritageById } = require('../../data/heritages');
const storage = require('../../utils/storage');
const { ensureLoggedIn } = require('../../utils/auth');
const { fakeLikeCount, toHeritageListItem } = require('../../utils/util');
const { t, getLocale } = require('../../i18n.js');

Page({
  data: {
    list: [],
    keyword: '',
    filteredList: [],
    isGuest: true,
    i18n: {}
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 2 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }
    this.refreshI18n();
    const isGuest = !storage.isLoggedIn();
    this.setData({ isGuest });
    if (isGuest) return;
    this.loadFavorites();
  },

  refreshI18n() {
    this.setData({
      i18n: {
        searchPlaceholder: t('favorite.searchPlaceholder'),
        remove: t('favorite.remove'),
        empty: t('favorite.empty'),
        guestTitle: t('favorite.guestTitle'),
        goLogin: t('favorite.goLogin')
      }
    });
  },

  loadFavorites() {
    const locale = getLocale();
    const list = storage.getFavoriteHeritages(id => getHeritageById(id, locale)).map(h =>
      toHeritageListItem(h, { likeCount: fakeLikeCount(h.id) })
    );
    const { keyword } = this.data;
    const filteredList = keyword
      ? list.filter(h => h.name.includes(keyword) || h.city.includes(keyword))
      : list;
    this.setData({ list, filteredList });
  },

  onInput(e) {
    const keyword = e.detail.value.trim();
    const filteredList = keyword
      ? this.data.list.filter(
          h => h.name.includes(keyword) || h.city.includes(keyword)
        )
      : this.data.list;
    this.setData({ keyword, filteredList });
  },

  onRemove(e) {
    if (!ensureLoggedIn()) return;
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: t('favorite.confirmTitle'),
      content: t('favorite.confirmContent'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      success: res => {
        if (res.confirm) {
          storage.removeFavorite(id);
          this.loadFavorites();
          wx.showToast({ title: t('favorite.removed'), icon: 'none' });
        }
      }
    });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  }
});
