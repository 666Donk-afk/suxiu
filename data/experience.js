/**
 * 线下体验场馆数据（官方预约跳转）
 */
const RAW = require('./experience-items.js');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');

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

module.exports = {
  getExperienceById,
  getExperiencesByHeritageId,
  getHotExperiences,
  getAllExperiences,
  localizeExperience
};
