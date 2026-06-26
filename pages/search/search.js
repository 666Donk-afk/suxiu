const { searchAll, searchByCategoryKey } = require('../../utils/search');

const storage = require('../../utils/storage');

const { toHeritageListItem } = require('../../utils/util');

const { t, getLocale } = require('../../i18n.js');



Page({

  data: {

    keyword: '',

    categoryKey: '',

    categoryLabel: '',

    cities: [],

    heritages: [],

    empty: false,

    searchHistory: [],

    i18n: {}

  },



  onLoad(options) {

    const keyword = options.keyword ? decodeURIComponent(options.keyword) : '';

    const categoryKey = options.category || '';

    this.setData({ keyword, categoryKey, searchHistory: storage.getSearchHistory() });

    this.refreshI18n();

    if (categoryKey) {

      this.doCategorySearch(categoryKey);

    } else if (keyword) {

      this.doSearch(keyword);

    }

  },



  onShow() {

    this.refreshI18n();

    const { categoryKey, keyword } = this.data;

    if (categoryKey) {

      this.doCategorySearch(categoryKey);

    } else if (keyword) {

      this.doSearch(keyword);

    }

  },



  refreshI18n() {

    const { categoryKey } = this.data;

    const locale = getLocale();

    const categoryLabel = categoryKey

      ? t(`journeySetup.categories.${categoryKey}`, locale)

      : '';

    this.setData({

      categoryLabel,

      i18n: {

        placeholder: t('search.placeholder'),

        search: t('search.search'),

        history: t('search.history'),

        clear: t('search.clear'),

        empty: t('search.empty'),

        noResult: t('search.noResult'),

        categoryResult: categoryLabel

          ? t('search.categoryResult').replace('{name}', categoryLabel)

          : '',

        cityTag: t('search.cityTag'),

        heritageTag: t('search.heritageTag'),

        heritageUnit: t('common.heritageUnit')

      }

    });

  },



  onInput(e) {

    this.setData({

      keyword: e.detail.value,

      categoryKey: '',

      categoryLabel: ''

    });

  },



  onSearch() {

    const keyword = this.data.keyword.trim();

    if (!keyword) return;

    this.setData({ categoryKey: '', categoryLabel: '' });

    storage.addSearchHistory(keyword);

    this.doSearch(keyword);

    this.setData({ searchHistory: storage.getSearchHistory() });

    this.refreshI18n();

  },



  doSearch(keyword) {

    const result = searchAll(keyword, getLocale());

    this.setData({

      cities: result.cities,

      heritages: result.heritages.map(h => toHeritageListItem(h)),

      empty: result.empty

    });

  },



  doCategorySearch(categoryKey) {

    const locale = getLocale();

    const categoryLabel = t(`journeySetup.categories.${categoryKey}`, locale);

    const result = searchByCategoryKey(categoryKey, locale);

    this.setData({

      categoryKey,

      categoryLabel,

      keyword: categoryLabel,

      cities: result.cities,

      heritages: result.heritages.map(h => toHeritageListItem(h)),

      empty: result.empty

    });

    this.refreshI18n();

  },



  onHistoryTap(e) {

    const { keyword } = e.currentTarget.dataset;

    this.setData({ keyword, categoryKey: '', categoryLabel: '' });

    storage.addSearchHistory(keyword);

    this.doSearch(keyword);

    this.refreshI18n();

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

