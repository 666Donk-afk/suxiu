const { getHomeFeatures } = require('../../data/home-features');
const storage = require('../../utils/storage');
const { getTodayRecommendCards } = require('../../utils/today-recommend');
const { getCityHeroFromPrefs } = require('../../utils/home-hero');
const { getCityHomeSections } = require('../../utils/city-home-sections');
const { t, getLocale } = require('../../i18n.js');

function getDisplayCity(locale) {
  const prefs = storage.getJourneyPreferences();
  return prefs.selectedCity || (locale === 'en-US' ? 'Wuhan' : '武汉');
}

function getHeaderPaddingRight() {
  try {
    const menuButton = wx.getMenuButtonBoundingClientRect();
    const windowInfo = wx.getWindowInfo();
    return Math.max(16, windowInfo.windowWidth - menuButton.left + 8);
  } catch (e) {
    return 96;
  }
}

Page({
  data: {
    navPaddingTop: 20,
    headerPaddingRight: 96,
    displayCity: '武汉',
    heroImage: '',
    heroTitle: '',
    heroTagline: '',
    heroTargetId: null,
    features: [],
    todayTab: 'legend',
    recommendCards: [],
    representativeHeritages: [],
    cityInheritors: [],
    representativeSubtitle: '',
    i18n: {}
  },

  onLoad() {
    const app = getApp();
    this.setData({
      navPaddingTop: app.globalData.statusBarHeight || 20,
      headerPaddingRight: getHeaderPaddingRight()
    });
    this.refreshI18n();
    this.refreshContent();
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 0 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }
    const locale = getLocale();
    if (locale !== this._lastLocale) {
      this._lastLocale = locale;
      this.refreshI18n();
    }
    this.refreshContent();
  },

  refreshI18n() {
    const locale = getLocale();
    this.setData({
      i18n: {
        searchPlaceholder: t('home.searchPlaceholder', locale),
        todayTitle: t('home.todayTitle', locale),
        todaySubtitle: t('home.todaySubtitle', locale),
        todayLegend: t('home.todayLegend', locale),
        todayHeritage: t('home.todayHeritage', locale),
        featureComingSoon: t('home.featureComingSoon', locale),
        mascotLabel: t('home.mascotLabel', locale),
        representativeTitle: t('home.representativeTitle', locale),
        inheritorsTitle: t('home.inheritorsTitle', locale),
        viewMoreHeritage: t('home.viewMoreHeritage', locale)
      },
      features: getHomeFeatures(locale)
    });
  },

  refreshContent() {
    try {
      const locale = getLocale();
      const { todayTab } = this.data;
      const hero = getCityHeroFromPrefs(locale);
      const sections = getCityHomeSections(locale);
      this.setData({
        displayCity: getDisplayCity(locale),
        heroImage: hero.cover,
        heroTitle: hero.title,
        heroTagline: hero.tagline,
        heroTargetId: hero.targetId,
        representativeHeritages: sections.representativeHeritages,
        cityInheritors: sections.cityInheritors,
        representativeSubtitle: sections.representativeSubtitle,
        recommendCards: getTodayRecommendCards(todayTab, 4, locale)
      });
    } catch (err) {
      console.error('[index] refreshContent failed', err);
    }
  },

  onTodayTab(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ todayTab: tab });
    this.refreshContent();
  },

  onFeatureTap(e) {
    const { key } = e.currentTarget.dataset;
    const map = {
      reservation: () => wx.navigateTo({ url: '/pages/my-reservation/my-reservation' }),
      museum: () => wx.switchTab({ url: '/pages/heritage/heritage' }),
      guide: () => wx.navigateTo({ url: '/pages/ai-guide/ai-guide' }),
      tour: () => wx.switchTab({ url: '/pages/yunyou/yunyou' })
    };
    const fn = map[key];
    if (fn) fn();
    else wx.showToast({ title: this.data.i18n.featureComingSoon, icon: 'none' });
  },

  goRecommend(e) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
    }
  },

  goHeritageDetail(e) {
    this.goRecommend(e);
  },

  goHeritageTab() {
    wx.switchTab({ url: '/pages/heritage/heritage' });
  },

  goHero() {
    const { heroTargetId } = this.data;
    if (heroTargetId) {
      wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${heroTargetId}` });
      return;
    }
    this.goSearch();
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  goAiGuide() {
    wx.navigateTo({ url: '/pages/ai-guide/ai-guide' });
  },

  onShareAppMessage() {
    return {
      title: t('home.shareTitle'),
      path: '/pages/index/index',
      imageUrl: this.data.heroImage
    };
  }
});
