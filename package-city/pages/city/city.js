const { getHotCities, getCityIndexGroups, getCityById, getCityByName, DEFAULT_CITY_COVER } = require('../../../data/cities');
const { ensureAllMedia, isAllMediaReady } = require('../../../utils/media-packages');
const { getProvinceByCity } = require('../../../data/provinces.js');
const { getCityIndexLetter } = require('../../../utils/city-index-letter.js');
const { pickLocale } = require('../../../i18n/locale-field.js');
const { getCurrentLocatedCity } = require('../../utils/geo-location');
const storage = require('../../../utils/storage');
const { t, getLocale } = require('../../../i18n.js');

function buildHotCityColumns(cities) {
  const columns = [];
  for (let i = 0; i < cities.length; i += 2) {
    columns.push(cities.slice(i, i + 2));
  }
  return columns;
}

function letterSectionId(letter) {
  return letter === '#' ? 'letter-sharp' : `letter-${letter}`;
}

function getDisplayCity(locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const raw = prefs.selectedCity || (loc === 'en-US' ? 'Wuhan' : '武汉');
  if (loc === 'en-US') {
    const city = getCityByName(raw, loc);
    return city ? city.name : raw;
  }
  return raw;
}

Page({
  data: {
    pickMode: false,
    displayCity: '武汉',
    keyword: '',
    hotCities: [],
    hotCityColumns: [],
    indexGroups: [],
    indexLetters: [],
    activeIndexLetter: '',
    searchHistory: [],
    suggestions: [],
    showSuggestions: false,
    highlightCityId: null,
    i18n: {}
  },

  onLoad(options) {
    const pickMode = options.pick === '1';
    this.setData({ pickMode });
    if (pickMode) {
      wx.setNavigationBarTitle({ title: t('yunyouPage.cityIndex') });
    }
    this.refreshI18n();
    this.refreshContent();
  },

  onShow() {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#FFFFFF'
    });
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
        locateCurrentCity: t('city.locateCurrentCity'),
        locating: t('city.locating'),
        locationFailed: t('city.locationFailed'),
        locationDenied: t('city.locationDenied'),
        cityNotFound: t('city.cityNotFound'),
        cityType: t('search.cityTag').replace(/[【】\[\]]/g, ''),
        heritageType: t('search.heritageTag').replace(/[【】\[\]]/g, '')
      }
    });
  },

  refreshContent() {
    const locale = getLocale();
    const apply = () => {
      const groups = getCityIndexGroups(locale);
      const hotCities = getHotCities(12, locale).map(item => ({ ...item }));
      this.setData({
        displayCity: getDisplayCity(locale),
        hotCities,
        hotCityColumns: buildHotCityColumns(hotCities),
        indexGroups: groups,
        indexLetters: groups.map(g => g.letter),
        activeIndexLetter: groups.length ? groups[0].letter : ''
      }, () => {
        this.updateActiveIndexLetter();
      });
    };

    if (isAllMediaReady()) {
      apply();
    } else {
      ensureAllMedia().then(apply);
    }
  },

  onHotCoverError(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    const hotCities = this.data.hotCities.map(item =>
      item.id === id ? { ...item, cover: DEFAULT_CITY_COVER } : item
    );
    this.setData({
      hotCities,
      hotCityColumns: buildHotCityColumns(hotCities)
    });
  },

  updateActiveIndexLetter() {
    if (this._scrollLock) return;
    const { indexLetters } = this.data;
    if (!indexLetters.length) return;

    const { windowHeight } = wx.getWindowInfo();
    const viewportBottom = windowHeight;

    const query = wx.createSelectorQuery().in(this);
    indexLetters.forEach(letter => {
      query.select(`#${letterSectionId(letter)} .index-letter`).boundingClientRect();
    });

    query.exec(rects => {
      let activeLetter = indexLetters[0];
      let visibleTop = -Infinity;
      let passedTop = -Infinity;
      let passedLetter = indexLetters[0];

      indexLetters.forEach((letter, i) => {
        const rect = rects[i];
        if (!rect || !rect.height) return;

        if (rect.top < viewportBottom && rect.bottom > 0 && rect.top > visibleTop) {
          visibleTop = rect.top;
          activeLetter = letter;
        }

        if (rect.top < viewportBottom && rect.top > passedTop) {
          passedTop = rect.top;
          passedLetter = letter;
        }
      });

      if (visibleTop === -Infinity) {
        activeLetter = passedLetter;
      }

      if (this.data.activeIndexLetter !== activeLetter) {
        this.setData({ activeIndexLetter: activeLetter });
      }
    });
  },

  onPageScroll() {
    if (this._scrollTick) return;
    this._scrollTick = true;
    wx.nextTick(() => {
      this._scrollTick = false;
      this.updateActiveIndexLetter();
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
    wx.navigateTo({ url: `/package-detail/pages/search/search?keyword=${encodeURIComponent(keyword.trim())}` });
  },

  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/package-detail/pages/search/search?keyword=${encodeURIComponent(keyword)}` });
  },

  onSuggestionTap(e) {
    const { type, id, text } = e.currentTarget.dataset;
    if (type === 'city') {
      this.selectCityAndReturn(id);
      return;
    }
    storage.addSearchHistory(text);
    wx.navigateTo({ url: `/package-detail/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  selectCityAndReturn(id) {
    const city = getCityById(id, 'zh-CN');
    if (!city) return;
    const zhName = pickLocale(city.name, 'zh-CN') || city.name;
    const province = getProvinceByCity(zhName);
    storage.setJourneyPreferences({
      selectedCity: zhName,
      selectedProvince: province ? pickLocale(province.name, 'zh-CN') : pickLocale(city.province, 'zh-CN')
    });
    wx.navigateBack();
  },

  goCityDetail(e) {
    const { id } = e.currentTarget.dataset;
    this.selectCityAndReturn(id);
  },

  scrollToLetter(e) {
    const { letter } = e.currentTarget.dataset;
    this._scrollLock = true;
    this.setData({ activeIndexLetter: letter });
    wx.pageScrollTo({
      selector: `#${letterSectionId(letter)}`,
      duration: 300,
      complete: () => {
        setTimeout(() => {
          this._scrollLock = false;
          this.updateActiveIndexLetter();
        }, 50);
      }
    });
  },

  locateCurrentCity() {
    if (this._locating) return;
    const locale = getLocale();
    this._locating = true;
    wx.showLoading({ title: t('city.locating', locale), mask: true });

    getCurrentLocatedCity(locale)
      .then(city => {
        if (!city) {
          wx.showToast({ title: t('city.cityNotFound', locale), icon: 'none' });
          return;
        }
        this.applyLocatedCity(city, locale);
      })
      .catch(err => {
        const msg = (err && err.errMsg) || '';
        const denied = /auth deny|authorize|permission|privacy/i.test(msg);
        if (denied) {
          wx.showModal({
            title: t('city.locationDenied', locale),
            content: t('city.locationDeniedHint', locale),
            confirmText: t('city.openSettings', locale),
            success: res => {
              if (res.confirm) wx.openSetting({});
            }
          });
          return;
        }
        wx.showToast({ title: t('city.locationFailed', locale), icon: 'none' });
      })
      .finally(() => {
        this._locating = false;
        wx.hideLoading();
      });
  },

  applyLocatedCity(city, locale) {
    const loc = locale || getLocale();
    const zhName = pickLocale(city.name, 'zh-CN') || city.name;
    const province = getProvinceByCity(zhName);
    storage.setJourneyPreferences({
      selectedCity: zhName,
      selectedProvince: province ? pickLocale(province.name, 'zh-CN') : pickLocale(city.province, 'zh-CN')
    });

    this.setData({
      displayCity: pickLocale(city.name, loc),
      showSuggestions: false
    });
    wx.navigateBack();
  },

  onUnload() {
    if (this._highlightTimer) {
      clearTimeout(this._highlightTimer);
      this._highlightTimer = null;
    }
  }
});
