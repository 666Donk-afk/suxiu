/**
 * 非遗数据 - 主包轻量列表（详情见 package-detail/data/heritages-full.js）
 */
const listData = require('./heritage-list.js');
const enData = require('./heritage-i18n-en.js');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale, t } = require('../i18n.js');

const LIST_CACHE = {};
const CITY_INDEX = {};

function buildCityIndex() {
  if (Object.keys(CITY_INDEX).length) return;
  listData.forEach((item, index) => {
    const id = index + 1;
    const keys = new Set([item.cityShort, item.location].filter(Boolean));
    keys.forEach(key => {
      if (!CITY_INDEX[key]) CITY_INDEX[key] = [];
      CITY_INDEX[key].push(id);
    });
  });
}

function buildSummary(item) {
  if (item.summary) return item.summary;
  return item.name;
}

function getCategoryLabel(key, locale) {
  return t(`heritage.categories.${key}`, locale);
}

function buildListItem(item, index, locale) {
  const id = index + 1;
  const slug = item.slug;
  const en = enData[slug] || {};
  const loc = locale || getLocale();
  const categoryKey = item.categoryKey || 'folk';

  return {
    id,
    slug,
    name: loc === 'en-US' && en.name ? en.name : item.name,
    city: loc === 'en-US' && en.city ? en.city : (item.cityShort || item.location),
    province: item.provinceShort || item.province || '',
    location: loc === 'en-US' && en.location ? en.location : item.location,
    level: loc === 'en-US' ? (en.level || t('heritage.national', loc)) : '国家级',
    category: getCategoryLabel(categoryKey, loc),
    categoryKey,
    cover: item.cover,
    declareYear: loc === 'en-US' ? (en.declareYear || '2006') : '2006年',
    summary: loc === 'en-US' && en.summary ? en.summary : buildSummary(item)
  };
}

function getAllList(locale) {
  const loc = locale || getLocale();
  if (LIST_CACHE[loc]) return LIST_CACHE[loc];
  LIST_CACHE[loc] = listData.map((item, index) => buildListItem(item, index, loc));
  buildCityIndex();
  return LIST_CACHE[loc];
}

function matchCityName(heritage, needle) {
  if (heritage.city === needle || heritage.location === needle) return true;
  if (heritage.city && (heritage.city.includes(needle) || needle.includes(heritage.city))) return true;
  if (heritage.location && heritage.location.includes(needle)) return true;
  return false;
}

function getHeritageById(id, locale) {
  const index = id - 1;
  const item = listData[index];
  if (!item) return null;
  return buildListItem(item, index, locale || getLocale());
}

function getHeritagesByCity(cityName, locale) {
  const loc = locale || getLocale();
  const needle = (cityName || '').trim();
  if (!needle) return [];
  return getAllList(loc).filter(h => matchCityName(h, needle));
}

function getCityHeritageIds(cityName) {
  buildCityIndex();
  const needle = (cityName || '').trim();
  if (!needle) return new Set();
  const ids = new Set();
  Object.keys(CITY_INDEX).forEach(key => {
    if (key === needle || key.includes(needle) || needle.includes(key)) {
      CITY_INDEX[key].forEach(id => ids.add(id));
    }
  });
  return ids;
}

function getHeritagesByCityId(cityId, cityList, locale) {
  const city = cityList.find(c => c.id === cityId);
  if (!city) return [];
  return getHeritagesByCity(city.name, locale);
}

function getHeritagesByProvince(provinceName, locale) {
  const loc = locale || getLocale();
  const needle = (provinceName || '').trim();
  return getAllList(loc).filter(h => {
    const p = h.province || '';
    return p.includes(needle) || needle.includes(p);
  });
}

function getHotHeritages(limit = 6, locale) {
  return getAllList(locale).slice(0, limit);
}

function getRecommendations(ids, locale) {
  return ids.map(id => getHeritageById(id, locale)).filter(Boolean);
}

function getAllHeritages(locale) {
  return getAllList(locale);
}

function getCategories(locale) {
  const loc = locale || getLocale();
  return ['craft', 'folk', 'opera', 'quyi', 'medicine', 'art', 'sports'].map(
    key => getCategoryLabel(key, loc)
  );
}

function getLevels(locale) {
  return [t('heritage.national', locale)];
}

module.exports = {
  getHeritageById,
  getHeritagesByCity,
  getHeritagesByCityId,
  getHeritagesByProvince,
  getCityHeritageIds,
  getHotHeritages,
  getRecommendations,
  getAllHeritages,
  getCategories,
  getLevels,
  CATEGORIES: getCategories(),
  LEVELS: getLevels()
};
