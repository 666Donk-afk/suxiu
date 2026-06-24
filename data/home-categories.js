/**
 * 首页非遗分类网格（4 列 × 2 行）
 */
const { t, getLocale } = require('../i18n.js');

const HOME_CATEGORY_KEYS = [
  'craft',
  'opera',
  'folk',
  'quyi',
  'art',
  'medicine',
  'sports',
  'music'
];

const CATEGORY_ICONS = {
  craft: '◆',
  opera: '◈',
  folk: '◎',
  quyi: '♪',
  art: '✦',
  medicine: '✚',
  sports: '⚑',
  music: '♫',
  food: '◉',
  festival: '✿',
  literature: '文',
  dance: '舞'
};

function getHomeCategories(locale) {
  const loc = locale || getLocale();
  return HOME_CATEGORY_KEYS.map(key => ({
    key,
    label: t(`journeySetup.categories.${key}`, loc),
    icon: CATEGORY_ICONS[key] || '◆'
  }));
}

module.exports = {
  HOME_CATEGORY_KEYS,
  getHomeCategories
};
