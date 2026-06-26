/**
 * 首页城市相关区块 - 代表性非遗、非遗代表人
 */
const storage = require('./storage');
const { getCityRelatedHeritagePool } = require('./home-hero');
const { getInheritorsByCity } = require('../data/inheritors');
const { t, getLocale } = require('../i18n.js');

function excerptText(text, maxLen) {
  if (!text) return '';
  const body = text.replace(/\s+/g, ' ').trim();
  if (body.length <= maxLen) return body;
  return `${body.slice(0, maxLen)}…`;
}

function getRepresentativeHeritages(cityName, locale, limit) {
  const loc = locale || getLocale();
  const max = limit || 8;
  const pool = getCityRelatedHeritagePool(cityName, loc);
  return pool.slice(0, max).map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    cover: item.cover,
    summary: excerptText(item.summary, 36)
  }));
}

function getCityHomeSections(locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const city = prefs.selectedCity || (loc === 'en-US' ? 'Wuhan' : '武汉');

  return {
    city,
    representativeHeritages: getRepresentativeHeritages(city, loc, 8),
    cityInheritors: getInheritorsByCity(city, loc, 4),
    representativeSubtitle: t('home.representativeSubtitle', loc).replace('{city}', city)
  };
}

module.exports = {
  getRepresentativeHeritages,
  getCityHomeSections
};
