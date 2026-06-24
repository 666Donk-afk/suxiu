const { getPersonalizedCities, getPersonalizedHeritages, getPersonalizedExperiences } = require('../../utils/recommendation');
const { getHeritageById } = require('../../data/heritages');
const { getHomeCategories } = require('../../data/home-categories');
const images = require('../../data/images');
const storage = require('../../utils/storage');
const { ensureLoggedIn } = require('../../utils/auth');
const { fakeLikeCount, toHeritageListItem } = require('../../utils/util');
const { t, getLocale } = require('../../i18n.js');

function mapPersonalizedHeritages(favoriteIds, locale) {
  return getPersonalizedHeritages(6, locale).map(h =>
    toHeritageListItem(h, {
      likeCount: fakeLikeCount(h.id),
      favorited: favoriteIds.includes(h.id)
    })
  );
}

function mapTravelRoutes(experiences, locale) {
  return experiences.map(exp => {
    const heritage = getHeritageById(exp.heritageId, locale);
    const name = heritage ? heritage.name : exp.title;
    const routeTitle = t('home.travelRouteTitle', locale)
      .replace('{name}', name)
      .replace('{place}', exp.province || exp.city);
    const routeDesc = heritage
      ? `${heritage.city} · ${heritage.category}`
      : exp.location;
    return {
      id: exp.id,
      heritageId: exp.heritageId,
      cover: exp.cover,
      routeTitle,
      routeDesc
    };
  });
}

Page({
  data: {
    statusBarHeight: 20,
    navPaddingTop: 20,
    mainPaddingTop: 180,
    banners: [],
    hotCities: [],
    hotHeritages: [],
    travelRoutes: [],
    categories: [],
    favoriteIds: [],
    personalized: false,
    i18n: {}
  },

  onLoad() {
    this._firstShow = true;
    const app = getApp();
    const statusBarHeight = app.globalData.statusBarHeight || 20;
    const favoriteIds = storage.getFavorites();

    this.setData({
      statusBarHeight,
      navPaddingTop: statusBarHeight,
      favoriteIds
    });

    this.refreshI18n();
    this.refreshContent();
    wx.nextTick(() => this.updateHeaderLayout());
  },

  onReady() {
    this.updateHeaderLayout();
  },

  updateHeaderLayout() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.nav-header').boundingClientRect(rect => {
      if (rect && rect.height) {
        const gap = 12;
        this.setData({ mainPaddingTop: Math.ceil(rect.height) + gap });
        return;
      }
      this.setFallbackHeaderPadding();
    }).exec();
  },

  setFallbackHeaderPadding() {
    try {
      const { windowWidth } = wx.getWindowInfo();
      const rpx = windowWidth / 750;
      const bodyH = (16 + 48 + 20 + 36 + 28 + 24) * rpx;
      const mainPaddingTop = Math.ceil((this.data.navPaddingTop || 20) + bodyH + 16);
      this.setData({ mainPaddingTop });
    } catch (e) {
      this.setData({ mainPaddingTop: 200 });
    }
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 0 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }

    const locale = getLocale();
    const localeChanged = locale !== this._lastLocale;
    this._lastLocale = locale;

    if (this._firstShow) {
      this._firstShow = false;
      if (localeChanged) this.refreshI18n();
      return;
    }

    if (localeChanged) this.refreshI18n();
    this.refreshContent();
  },

  refreshI18n() {
    const locale = getLocale();
    this.setData({
      locale,
      i18n: {
        appName: t('common.appName'),
        searchPlaceholder: t('home.searchPlaceholder'),
        hotCities: t('home.hotCities'),
        hotHeritages: t('home.hotHeritages'),
        forYou: t('home.forYou'),
        travelTitle: t('home.travelTitle'),
        travelSubtitle: t('home.travelSubtitle'),
        exploreRoute: t('home.exploreRoute'),
        categoryTitle: t('home.categoryTitle'),
        bookNow: t('heritageDetail.bookNow'),
        swipeHint: t('common.swipeHint'),
        heritageUnit: t('common.heritageUnit'),
        itemUnit: t('common.itemUnit'),
        mascotLabel: t('home.mascotLabel'),
        mascotHint: t('home.mascotHint')
      },
      banners: [
        { id: 1, image: images.banners[0], title: t('home.banner1') },
        { id: 2, image: images.banners[1], title: t('home.banner2') },
        { id: 3, image: images.banners[2], title: t('home.banner3') }
      ],
      categories: getHomeCategories(locale)
    });
    wx.setNavigationBarTitle({ title: t('common.appName') });
  },

  refreshContent() {
    const favoriteIds = storage.getFavorites();
    const locale = getLocale();
    const prefs = storage.getJourneyPreferences();
    const hasPrefs = !!(prefs.selectedCity || (prefs.interestedCategories && prefs.interestedCategories.length));
    const experiences = getPersonalizedExperiences(4, locale);
    this.setData({
      favoriteIds,
      hotCities: getPersonalizedCities(8, locale),
      hotHeritages: mapPersonalizedHeritages(favoriteIds, locale),
      travelRoutes: mapTravelRoutes(experiences, locale),
      categories: getHomeCategories(locale),
      personalized: hasPrefs
    });
  },

  goTravelRoute(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  goCategory(e) {
    const { key } = e.currentTarget.dataset;
    if (!key) return;
    wx.navigateTo({ url: `/pages/search/search?category=${key}` });
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  goAiGuide() {
    wx.navigateTo({ url: '/pages/ai-guide/ai-guide' });
  },

  goCityDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/city-detail/city-detail?id=${id}` });
  },

  onFavorite(e) {
    if (!ensureLoggedIn({ content: t('home.loginForFavorite') })) return;
    const { id } = e.detail;
    const favorited = storage.toggleFavorite(id);
    wx.showToast({
      title: favorited ? t('home.favorited') : t('home.unfavorited'),
      icon: 'none',
      duration: 2000
    });
    this.refreshContent();
  },

  onShareAppMessage() {
    return {
      title: t('home.shareTitle'),
      path: '/pages/index/index',
      imageUrl: this.data.banners[0] && this.data.banners[0].image
    };
  }
});
