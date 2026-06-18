const { getHotCities, getCityIndexGroups } = require('../../data/cities');
const storage = require('../../utils/storage');
const { t, getLocale } = require('../../i18n.js');

Page({
  data: {
    keyword: '',
    hotCities: [],
    indexGroups: [],
    indexLetters: [],
    searchHistory: [],
    suggestions: [],
    showSuggestions: false,
    i18n: {}
  },

  onLoad() {
    this.refreshI18n();
    this.refreshContent();
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 1 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }
    this.refreshI18n();
    this.refreshContent();
    this.setData({ searchHistory: storage.getSearchHistory() });
  },

  refreshI18n() {
    this.setData({
      i18n: {
        searchPlaceholder: t('city.searchPlaceholder'),
        search: t('city.search'),
        searchHistory: t('city.searchHistory'),
        hotCities: t('city.hotCities'),
        cityIndex: t('city.cityIndex'),
        cityType: t('search.cityTag').replace(/[【】\[\]]/g, ''),
        heritageType: t('search.heritageTag').replace(/[【】\[\]]/g, ''),
        heritageCount: t('city.heritageCount')
      }
    });
  },

  refreshContent() {
    const locale = getLocale();
    const groups = getCityIndexGroups(locale);
    this.setData({
      hotCities: getHotCities(12, locale),
      indexGroups: groups,
      indexLetters: groups.map(g => g.letter)
    });
  },

  onInput(e) {
    const keyword = e.detail.value;
    const { getSuggestions } = require('../../utils/search');
    this.setData({
      keyword,
      suggestions: keyword.trim() ? getSuggestions(keyword, 6, getLocale()) : [],
      showSuggestions: !!keyword.trim()
    });
  },

  onSearch() {
    const { keyword } = this.data;
    if (!keyword.trim()) return;
    storage.addSearchHistory(keyword.trim());
    wx.navigateTo({ url: `/pages/search/search?keyword=${encodeURIComponent(keyword.trim())}` });
  },

  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}` });
  },

  onSuggestionTap(e) {
    const { type, id, text } = e.currentTarget.dataset;
    storage.addSearchHistory(text);
    if (type === 'city') {
      wx.navigateTo({ url: `/pages/city-detail/city-detail?id=${id}` });
    } else {
      wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
    }
  },

  goCityDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/city-detail/city-detail?id=${id}` });
  },

  scrollToLetter(e) {
    const { letter } = e.currentTarget.dataset;
    wx.pageScrollTo({ selector: `#letter-${letter}`, duration: 300 });
  }
});
