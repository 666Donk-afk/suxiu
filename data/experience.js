/**
 * 线下体验场馆数据（官方预约跳转）
 */
const RAW = require('./experience-items.js');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');
const { getProvinceByCity } = require('./provinces.js');

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
    description: pickLocale(item.description, loc),
    openTime: item.openTime,
    reservationType: item.reservationType,
    qrCode: item.qrCode,
    qrTargetUrl: item.qrTargetUrl || '',
    officialMiniProgram: item.officialMiniProgram,
    officialWebsite: item.officialWebsite,
    notice: pickLocale(item.notice, loc),
    hot: !!item.hot
  };
}

function getExperienceById(id, locale) {
  const item = RAW.find(e => e.id === id);
  return localizeExperience(item, locale);
}

function getExperiencesByHeritageId(heritageId, locale) {
  return RAW
    .filter(e => e.heritageId === heritageId)
    .map(e => localizeExperience(e, locale));
}

function getHotExperiences(limit = 5, locale) {
  const hot = RAW.filter(e => e.hot);
  const list = hot.length >= limit ? hot : RAW;
  return list.slice(0, limit).map(e => localizeExperience(e, locale));
}

function getAllExperiences(locale) {
  return RAW.map(e => localizeExperience(e, locale));
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
  getExperienceById,
  getExperiencesByHeritageId,
  getHotExperiences,
  getAllExperiences,
  getExperiencesByCity,
  localizeExperience
};
