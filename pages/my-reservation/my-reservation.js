const storage = require('../../utils/storage');
const { getExperiencesByCity } = require('../../data/experience.js');
const { t, getLocale } = require('../../i18n.js');

function formatTime(ts) {
  const d = new Date(ts);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDisplayCity(locale) {
  const prefs = storage.getJourneyPreferences();
  return prefs.selectedCity || (locale === 'en-US' ? 'Wuhan' : '武汉');
}

function matchCityName(cityField, needle) {
  if (!needle) return true;
  if (!cityField) return false;
  return cityField === needle || cityField.includes(needle) || needle.includes(cityField);
}

function filterRecordsByCity(list, cityName) {
  const needle = (cityName || '').trim();
  const cityMatched = list.filter(item => matchCityName(item.city, needle));
  return cityMatched.length ? cityMatched : list;
}

Page({
  data: {
    displayCity: '',
    records: [],
    availableList: [],
    i18n: {}
  },

  onShow() {
    this.refreshPage();
  },

  refreshI18n() {
    const locale = getLocale();
    this.setData({
      i18n: {
        subtitle: t('myReservation.subtitle', locale),
        myRecords: t('myReservation.myRecords', locale),
        recordsEmpty: t('myReservation.recordsEmpty', locale),
        availableTitle: t('myReservation.availableTitle', locale),
        availableEmpty: t('myReservation.availableEmpty', locale),
        bookNow: t('myReservation.bookNow', locale),
        viewedAt: t('myReservation.viewedAt', locale),
        heritage: t('myReservation.heritage', locale),
        remove: t('myReservation.remove', locale)
      }
    });
    wx.setNavigationBarTitle({ title: t('myReservation.title', locale) });
  },

  refreshPage() {
    const locale = getLocale();
    const city = getDisplayCity(locale);
    const history = storage.getExperienceHistory().map(item => ({
      ...item,
      viewedAtText: formatTime(item.viewedAt)
    }));
    const records = filterRecordsByCity(history, city);
    const availableList = getExperiencesByCity(city, locale, 12);

    this.refreshI18n();
    this.setData({
      displayCity: city,
      records,
      availableList,
      pageSubtitle: t('myReservation.subtitle', locale).replace('{city}', city)
    });
  },

  goGuide(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/experience-guide/experience-guide?id=${id}` });
  },

  goHeritage(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  onRemove(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: t('myReservation.confirmTitle'),
      content: t('myReservation.confirmContent'),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      success: res => {
        if (res.confirm) {
          storage.removeExperienceHistory(id);
          this.refreshPage();
          wx.showToast({ title: t('myReservation.deleted'), icon: 'none' });
        }
      }
    });
  }
});
