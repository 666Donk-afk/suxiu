const { getHotCities } = require('../../data/cities');
const { getPersonalizedExperiences } = require('../../utils/recommendation');
const { getHeritageById } = require('../../data/heritages');
const storage = require('../../utils/storage');
const { t, getLocale } = require('../../i18n.js');

function getDisplayCity(locale) {
  const prefs = storage.getJourneyPreferences();
  return prefs.selectedCity || (locale === 'en-US' ? 'Wuhan' : '武汉');
}

function mapRoutes(experiences, locale) {
  return experiences.map(exp => {
    const heritage = getHeritageById(exp.heritageId, locale);
    const name = heritage ? heritage.name : exp.title;
    return {
      id: exp.id,
      heritageId: exp.heritageId,
      cover: exp.cover,
      title: t('home.travelRouteTitle', locale)
        .replace('{name}', name)
        .replace('{place}', exp.province || exp.city),
      desc: heritage ? `${heritage.city} · ${heritage.category}` : exp.location
    };
  });
}

Page({
  data: {
    navPaddingTop: 20,
    displayCity: '武汉',
    hotCities: [],
    travelRoutes: [],
    i18n: {}
  },

  onLoad() {
    const app = getApp();
    this.setData({ navPaddingTop: app.globalData.statusBarHeight || 20 });
    this.refreshI18n();
    this.refreshContent();
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 2 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }
    this.refreshI18n();
    this.refreshContent();
  },

  refreshI18n() {
    const locale = getLocale();
    this.setData({
      i18n: {
        hotCities: t('yunyouPage.hotCities', locale),
        travelRoutes: t('yunyouPage.travelRoutes', locale),
        aiGuide: t('yunyouPage.aiGuide', locale),
        cityIndex: t('yunyouPage.cityIndex', locale),
        exploreRoute: t('home.exploreRoute', locale)
      }
    });
  },

  refreshContent() {
    const locale = getLocale();
    this.setData({
      displayCity: getDisplayCity(locale),
      hotCities: getHotCities(8, locale),
      travelRoutes: mapRoutes(getPersonalizedExperiences(5, locale), locale)
    });
  },

  goCity(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/city-detail/city-detail?id=${id}` });
  },

  goCityIndex() {
    wx.navigateTo({ url: '/pages/city/city' });
  },

  goRoute(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  goAiGuide() {
    wx.navigateTo({ url: '/pages/ai-guide/ai-guide' });
  }
});
