const { getAllHeritages } = require('../../data/heritages');
const { getInheritors } = require('../../data/inheritors');
const { ensureAllMedia, isAllMediaReady } = require('../../utils/media-packages');
const { t, getLocale } = require('../../i18n.js');
const { toHeritageListItem } = require('../../utils/util');

const FILTER_KEYS = ['all', 'art', 'craft', 'folk', 'quyi'];

Page({
  data: {
    navPaddingTop: 20,
    activeFilter: 'all',
    filters: [],
    featured: null,
    inheritors: [],
    list: [],
    i18n: {}
  },

  onLoad() {
    const app = getApp();
    this.setData({ navPaddingTop: app.globalData.statusBarHeight || 20 });
    this.refreshI18n();
    this.refreshList();
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) {
      tabBar.setData({ selected: 1 });
      if (tabBar.refreshLocale) tabBar.refreshLocale();
    }
    this.refreshI18n();
    this.refreshList();
  },

  refreshI18n() {
    const locale = getLocale();
    this.setData({
      i18n: {
        title: t('heritagePage.title', locale),
        subtitle: t('heritagePage.subtitle', locale),
        featuredTitle: t('heritagePage.featuredTitle', locale),
        inheritorsTitle: t('heritagePage.inheritorsTitle', locale),
        viewMore: t('heritagePage.viewMore', locale),
        encyclopediaTitle: t('heritagePage.encyclopediaTitle', locale),
        playHint: t('heritagePage.playHint', locale),
        duration: t('heritagePage.duration', locale),
        all: t('heritagePage.all', locale)
      },
      filters: FILTER_KEYS.map(key => ({
        key,
        label: key === 'all' ? t('heritagePage.all', locale) : t(`journeySetup.categories.${key}`, locale)
      }))
    });
  },

  refreshList() {
    const locale = getLocale();
    const { activeFilter } = this.data;
    const apply = () => {
      let all = getAllHeritages(locale);
      if (activeFilter !== 'all') {
        all = all.filter(h => h.categoryKey === activeFilter);
      }
      const items = all.map(h => toHeritageListItem(h));
      const featured = items.length ? { ...items[0] } : null;
      const list = items.slice(1, 8).map(item => ({ ...item }));
      this.setData({
        featured,
        list,
        inheritors: getInheritors(locale).map(item => ({ ...item }))
      });
    };

    if (isAllMediaReady()) {
      wx.nextTick(apply);
    } else {
      ensureAllMedia().then(() => wx.nextTick(apply));
    }
  },

  onFilterTap(e) {
    const { key } = e.currentTarget.dataset;
    this.setData({ activeFilter: key });
    this.refreshList();
  },

  goFeatured() {
    const { featured } = this.data;
    if (featured) this.goDetail({ currentTarget: { dataset: { id: featured.id } } });
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/package-detail/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  goSearch() {
    const { activeFilter } = this.data;
    if (activeFilter === 'all') {
      wx.navigateTo({ url: '/package-detail/pages/search/search' });
      return;
    }
    wx.navigateTo({ url: `/package-detail/pages/search/search?category=${activeFilter}` });
  }
});
