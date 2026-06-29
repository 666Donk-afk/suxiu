/**
 * 非遗详情数据（分包专用，含 heritage-details）
 */
const listData = require('../../data/heritage-list.js');
const videoMap = require('../../data/heritage-videos.js');
const enData = require('../../data/heritage-i18n-en.js');
const { getLocale, t } = require('../../i18n.js');

const LIST_CACHE = {};
const CITY_INDEX = {};
let detailMapCache = null;

function getDetailsMap() {
  if (!detailMapCache) {
    detailMapCache = require('./heritage-details.js');
  }
  return detailMapCache;
}

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

function buildHistoryZh(item, origin) {
  const text = origin || '';
  const yearMatch = text.match(/(\d{4}|\d{2,4}世纪|唐代|宋代|元代|明代|清代|民国|当代|2006)/);
  const firstLine = text.split('\n')[0].slice(0, 60);
  return [
    ...(yearMatch ? [{ year: yearMatch[1], event: firstLine || '文化起源' }] : []),
    { year: '2006年', event: '列入国家级非遗名录' },
    { year: '当代', event: '活态传承与文旅融合' }
  ].slice(0, 3);
}

function buildInheritanceZh(item) {
  return {
    masters: ['传承人'],
    methods: '口传身授、师徒相传',
    development: `${item.name}在${item.cityShort || item.location || '当地'}持续传承`,
    challenges: '传承人培养与活态保护'
  };
}

function buildSummary(item) {
  if (item.summary) return item.summary;
  return item.name;
}

function getCategoryLabel(key, locale) {
  return t(`heritage.categories.${key}`, locale);
}

function computeRecommendations(index) {
  const item = listData[index];
  const id = index + 1;
  const allIds = listData.map((_, i) => i + 1).filter(i => i !== id);
  const sameCity = allIds.filter(i => listData[i - 1].cityShort === item.cityShort);
  const sameProv = allIds.filter(i => listData[i - 1].provinceShort === item.provinceShort);
  const pool = sameCity.length ? sameCity : sameProv.length ? sameProv : allIds;
  return pool.slice(0, 3);
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

function buildDetailItem(item, index, locale) {
  const list = buildListItem(item, index, locale);
  const slug = item.slug;
  const en = enData[slug] || {};
  const loc = locale || getLocale();
  const detail = getDetailsMap()[slug] || {};

  const origin = loc === 'en-US' && en.origin ? en.origin : (detail.origin || '');
  const history = loc === 'en-US' && en.history ? en.history : buildHistoryZh(item, origin);
  const inheritance = loc === 'en-US' && en.inheritance ? en.inheritance : buildInheritanceZh(item);

  return {
    ...list,
    origin,
    history,
    story: loc === 'en-US' && en.story ? en.story : (detail.story || ''),
    meaning: loc === 'en-US' && en.meaning !== undefined ? en.meaning : (detail.meaning || ''),
    materials: loc === 'en-US' && en.materials !== undefined ? en.materials : (detail.materials || ''),
    inheritance,
    gallery: [item.cover],
    recommendations: computeRecommendations(index),
    video: videoMap[slug] || null
  };
}

function getAllList(locale) {
  const loc = locale || getLocale();
  if (LIST_CACHE[loc]) return LIST_CACHE[loc];
  LIST_CACHE[loc] = listData.map((item, index) => buildListItem(item, index, loc));
  buildCityIndex();
  return LIST_CACHE[loc];
}

function getHeritageById(id, locale) {
  const index = id - 1;
  const item = listData[index];
  if (!item) return null;
  return buildDetailItem(item, index, locale || getLocale());
}

function getRecommendations(ids, locale) {
  return ids.map(id => getHeritageById(id, locale)).filter(Boolean);
}

module.exports = {
  getHeritageById,
  getRecommendations
};
