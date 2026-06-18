/**
 * 启程指引 - 非遗兴趣分类
 */
const { t, getLocale } = require('../i18n.js');

const CATEGORY_KEYS = [
  'craft',
  'opera',
  'folk',
  'quyi',
  'art',
  'medicine',
  'sports',
  'food',
  'festival'
];

function getJourneyCategories(locale) {
  const loc = locale || getLocale();
  return CATEGORY_KEYS.map(key => ({
    key,
    label: t(`journeySetup.categories.${key}`, loc)
  }));
}

function getCategoryKeyFromLabel(label, locale) {
  const loc = locale || getLocale();
  const found = CATEGORY_KEYS.find(
    key => t(`journeySetup.categories.${key}`, loc) === label
  );
  return found || null;
}

module.exports = {
  CATEGORY_KEYS,
  getJourneyCategories,
  getCategoryKeyFromLabel
};
