const storage = require('../../utils/storage');
const images = require('../../data/images');
const { t, getLocale, getLangLabel, showLanguageSheet } = require('../../i18n.js');

Page({
  data: {
    userInfo: {
      avatarUrl: images.avatar,
      nickName: '非遗探索者'
    },
    isGuest: true,
    favoriteCount: 0,
    historyCount: 0,
    langLabel: '中文',
    i18n: {}
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 3 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }
    this.refreshI18n();

    const isGuest = !storage.isLoggedIn();
    const saved = storage.getUserInfo();
    const userInfo = saved || {
      avatarUrl: images.avatar,
      nickName: isGuest ? t('profile.guest') : t('profile.enthusiast')
    };

    this.setData({
      isGuest,
      userInfo,
      favoriteCount: isGuest ? 0 : storage.getFavoriteCount(),
      historyCount: isGuest ? 0 : storage.getHistoryCount()
    });
  },

  refreshI18n() {
    this.setData({
      langLabel: getLangLabel(getLocale()),
      i18n: {
        enthusiast: t('profile.enthusiast'),
        guestHint: t('profile.guestHint'),
        favorites: t('profile.favorites'),
        history: t('profile.history'),
        cities: t('profile.cities'),
        heritages: t('profile.heritages'),
        myFavorites: t('profile.myFavorites'),
        myHistory: t('profile.myHistory'),
        myExperience: t('profile.myExperience'),
        feedback: t('profile.feedback'),
        language: t('profile.language'),
        about: t('profile.about')
      }
    });
  },

  onLangTap() {
    showLanguageSheet(() => {
      this.refreshI18n();
      const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
      if (tabBar && tabBar.refreshLocale) tabBar.refreshLocale();
    });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goFavorite() {
    wx.navigateTo({ url: '/pages/favorite/favorite' });
  },

  goHistory() {
    if (!storage.isLoggedIn()) {
      wx.showModal({
        title: t('profile.loginTitle'),
        content: t('profile.loginForHistory'),
        confirmText: t('profile.goLogin'),
        cancelText: t('common.cancel'),
        success: res => {
          if (res.confirm) this.goLogin();
        }
      });
      return;
    }
    wx.navigateTo({ url: '/pages/history/history' });
  },

  goMyExperience() {
    wx.navigateTo({ url: '/pages/my-reservation/my-reservation' });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  }
});
