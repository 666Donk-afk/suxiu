const { t, getLocale, getLangLabel } = require('../i18n.js');

function refreshTabBar() {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  if (!page || typeof page.getTabBar !== 'function') return;
  const tabBar = page.getTabBar();
  if (tabBar && tabBar.refreshLocale) tabBar.refreshLocale();
}

function applyPageLocale(page, extra) {
  const locale = getLocale();
  const i18n = {
    appName: t('common.appName'),
    ...(extra || {})
  };
  page.setData({
    locale,
    langLabel: getLangLabel(locale),
    i18n
  });
  refreshTabBar();
}

module.exports = { applyPageLocale, refreshTabBar };
