/**
 * 我的预约 — 按城市筛选热门体验（轻量，避免引入完整 experience-items）
 */
const RAW = require('../../data/experience-hot.js');
const { pickLocale } = require('../../i18n/locale-field.js');
const { getLocale } = require('../../i18n.js');
const { getProvinceByCity } = require('../../data/provinces.js');

function localizeExperience(item, locale) {
  if (!item) return null;
  const loc = locale || getLocale();
  return {
    id: item.id,
    heritageId: item.heritageId,
    title: pickLocale(item.title, loc),
    city: pickLocale(item.city, loc),
    province: pickLocale(item.province, loc),
    location: `${pickLocale(item.city, loc)} · ${pickLocale(item.province, loc)}`,
    cover: item.cover,
    reservationType: item.reservationType,
    hot: !!item.hot
  };
}

function matchCityName(cityField, needle) {
  if (!needle) return true;
  if (!cityField) return false;
  return cityField === needle || cityField.includes(needle) || needle.includes(cityField);
}

function getExperiencesByCity(cityName, locale, limit) {
  const loc = locale || getLocale();
  const needle = (cityName || '').trim();
  let matched = RAW.filter(item => matchCityName(pickLocale(item.city, loc), needle));

  if (!matched.length && needle) {
    const province = getProvinceByCity(needle);
    if (province) {
      const keys = [province.name, province.shortName].filter(Boolean);
      matched = RAW.filter(item => {
        const prov = pickLocale(item.province, loc);
        return keys.some(key => prov.includes(key) || key.includes(prov));
      });
    }
  }

  const max = limit || 20;
  return matched.slice(0, max).map(item => localizeExperience(item, loc));
}

module.exports = {
  getExperiencesByCity
};
