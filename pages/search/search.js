const { searchAll } = require('../../utils/search');
const storage = require('../../utils/storage');
const { toHeritageListItem } = require('../../utils/util');
const { t, getLocale } = require('../../i18n.js');

Page({
  data: {
    keyword: '',
    cities: [],
    heritages: [],
    empty: false,
    searchHistory: [],
    i18n: {}
  },

  onLoad(options) {
    const keyword = options.keyword ? decodeURIComponent(options.keyword) : '';
    this.setData({ keyword, searchHistory: storage.getSearchHistory() });
    this.refreshI18n();
    if (keyword) this.doSearch(keyword);
  },

  onShow() {
    this.refreshI18n();
    if (this.data.keyword) this.doSearch(this.data.keyword);
  },

  refreshI18n() {
    this.setData({
      i18n: {
        placeholder: t('search.placeholder'),
        search: t('search.search'),
        history: t('search.history'),
        clear: t('search.clear'),
        empty: t('search.empty'),
        noResult: t('search.noResult'),
        cityTag: t('search.cityTag'),
        heritageTag: t('search.heritageTag'),
        heritageUnit: t('common.heritageUnit')
      }
    });
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;
    storage.addSearchHistory(keyword);
    this.doSearch(keyword);
    this.setData({ searchHistory: storage.getSearchHistory() });
  },

  doSearch(keyword) {
    const result = searchAll(keyword, getLocale());
    this.setData({
      cities: result.cities,
      heritages: result.heritages.map(h => toHeritageListItem(h)),
      empty: result.empty
    });
  },

  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ keyword });
    storage.addSearchHistory(keyword);
    this.doSearch(keyword);
  },

  clearHistory() {
    storage.clearSearchHistory();
    this.setData({ searchHistory: [] });
  },

  goCity(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/city-detail/city-detail?id=${id}` });
  },

  goHeritage(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  }
});
