const { getCityById } = require('../../../data/cities');
const { getHeritagesByCity } = require('../../../data/heritages');
const { paginate, toHeritageListItem } = require('../../../utils/util');
const { t, getLocale } = require('../../../i18n.js');

Page({
  data: {
    cityId: null,
    city: null,
    list: [],
    displayList: [],
    page: 1,
    pageSize: 6,
    hasMore: true,
    loading: false,
    i18n: {}
  },

  onLoad(options) {
    const id = parseInt(options.id, 10);
    this.setData({ cityId: id });
    this.refreshI18n();
    this.loadCity(id);
  },

  onShow() {
    this.refreshI18n();
    if (this.data.cityId) this.loadCity(this.data.cityId);
  },

  refreshI18n() {
    const { city, list } = this.data;
    const count = list ? list.length : 0;
    this.setData({
      i18n: {
        allHeritages: t('cityDetail.allHeritages'),
        cityIntro: t('cityDetail.cityIntro'),
        heritageList: t('cityDetail.heritageList'),
        loadMore: t('cityDetail.loadMore'),
        pullMore: t('cityDetail.pullMore'),
        loading: t('cityDetail.loading'),
        allLoaded: t('cityDetail.allLoaded'),
        noMore: t('cityDetail.noMore'),
        itemUnit: t('common.itemUnit')
      },
      heritageTotal: t('cityDetail.heritageTotal').replace('{count}', count)
    });
    if (city) wx.setNavigationBarTitle({ title: city.name });
  },

  loadCity(id) {
    const locale = getLocale();
    const city = getCityById(id, locale);
    if (!city) {
      wx.showToast({ title: t('cityDetail.notFound'), icon: 'none' });
      return;
    }
    const list = getHeritagesByCity(city.name, locale).map(h => toHeritageListItem(h));
    const { list: displayList, hasMore } = paginate(list, 1, 6);
    this.setData({ city, list, displayList, hasMore, page: 1 });
    this.refreshI18n();
  },

  onPullDownRefresh() {
    const { list } = this.data;
    const { list: displayList, hasMore } = paginate(list, 1, 6);
    this.setData({ page: 1, displayList, hasMore });
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ loading: true });
    const nextPage = this.data.page + 1;
    const { list: more, hasMore } = paginate(this.data.list, nextPage, this.data.pageSize);
    this.setData({
      page: nextPage,
      displayList: [...this.data.displayList, ...more],
      hasMore,
      loading: false
    });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/package-detail/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  onShareAppMessage() {
    const { city } = this.data;
    return {
      title: t('cityDetail.shareTitle').replace('{name}', city.name),
      path: `/package-detail/pages/city-detail/city-detail?id=${city.id}`,
      imageUrl: city.cover
    };
  }
});
