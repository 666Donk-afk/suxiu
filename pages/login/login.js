const storage = require('../../utils/storage');
const images = require('../../data/images');
const { t } = require('../../i18n.js');

Page({
  data: {
    statusBarHeight: 20,
    showContent: false,
    heritageCovers: [
      images.heritages.hanju,
      images.heritages.huangmei,
      images.heritages.xilan,
      images.heritages.wudang
    ],
    i18n: {}
  },

  onLoad() {
    const app = getApp();
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20
    });
    this.refreshI18n();
    setTimeout(() => this.setData({ showContent: true }), 150);
  },

  onShow() {
    this.refreshI18n();
  },

  refreshI18n() {
    this.setData({
      i18n: {
        appName: t('common.appName'),
        tagline: t('login.tagline'),
        loginBtn: t('login.loginBtn'),
        guestBtn: t('login.guestBtn'),
        agreePrefix: t('login.agreePrefix'),
        userAgreement: t('login.userAgreement'),
        privacyPolicy: t('login.privacyPolicy'),
        agreeAnd: t('login.agreeAnd')
      }
    });
  },

  onLogin() {
    wx.getUserProfile({
      desc: t('login.authDesc'),
      success: res => {
        storage.setUserInfo(res.userInfo);
        storage.setGuestMode(false);
        this.finishAndGoHome();
      },
      fail: () => {
        wx.showToast({ title: t('login.authFail'), icon: 'none' });
      }
    });
  },

  onGuest() {
    storage.setGuestMode(true);
    this.finishAndGoHome();
  },

  finishAndGoHome() {
    storage.setLaunchComplete();
    const app = getApp();
    if (app.refreshUserState) app.refreshUserState();

    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.switchTab({ url: '/pages/index/index' });
  },

  goAgreement(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/agreement/agreement?type=${type}` });
  }
});
