const storage = require('../../../utils/storage');
const { t } = require('../../../i18n.js');

Page({
  data: {
    statusBarHeight: 20,
    showContent: false,
    showBack: false,
    agreed: false,
    i18n: {}
  },

  onLoad() {
    const app = getApp();
    const pages = getCurrentPages();
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 20,
      showBack: pages.length > 1
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
        welcomeTitle: t('login.welcomeTitle'),
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

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: t('login.agreeRequired'), icon: 'none' });
      return;
    }
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
    wx.navigateTo({ url: `/package-user/pages/agreement/agreement?type=${type}` });
  }
});
