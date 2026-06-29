/**
 * 登录与游客模式校验
 */
const { isLoggedIn } = require('../../utils/storage');
const { t } = require('../../i18n.js');

function isLoggedInUser() {
  return isLoggedIn();
}

function ensureLoggedIn(options = {}) {
  if (isLoggedInUser()) return true;

  const {
    title = t('auth.loginRequired'),
    content = t('home.loginForFavorite')
  } = options;

  wx.showModal({
    title,
    content,
    confirmText: t('auth.goLogin'),
    success: res => {
      if (res.confirm) {
        wx.navigateTo({ url: '/package-user/pages/login/login' });
      }
    }
  });
  return false;
}

module.exports = {
  isLoggedIn,
  ensureLoggedIn
};
