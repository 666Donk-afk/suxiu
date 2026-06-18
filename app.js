// 非遗寻迹 - 小程序入口
const storage = require('./utils/storage');

App({
  globalData: {
    statusBarHeight: 0,
    navBarHeight: 44,
    safeAreaBottom: 0,
    userInfo: null,
    isLoggedIn: false,
    locale: 'zh-CN'
  },

  onLaunch() {
    try {
      const systemInfo = wx.getWindowInfo();
      const menuButton = wx.getMenuButtonBoundingClientRect();

      this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20;
      this.globalData.navBarHeight =
        (menuButton.top - this.globalData.statusBarHeight) * 2 + menuButton.height;
      this.globalData.safeAreaBottom = systemInfo.safeArea
        ? systemInfo.screenHeight - systemInfo.safeArea.bottom
        : 0;
    } catch (e) {
      this.globalData.statusBarHeight = 20;
      this.globalData.navBarHeight = 44;
      this.globalData.safeAreaBottom = 0;
    }

    const userInfo = storage.getUserInfo();
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = storage.isLoggedIn();

    const { getLocale } = require('./i18n.js');
    this.globalData.locale = getLocale();
  },

  refreshUserState() {
    this.globalData.userInfo = storage.getUserInfo();
    this.globalData.isLoggedIn = storage.isLoggedIn();
  }
});
