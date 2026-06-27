/**
 * 城市数据 - 由 Excel 非遗地点聚合生成
 */
const citiesRaw = require('./cities-data.js');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');
const { getCityIndexLetter, compareIndexLetters } = require('../utils/city-index-letter.js');

const cities = citiesRaw.map(c => ({
  ...c,
  cover: c.cover || '/images/heritage/hanju.jpg'
}));

function localizeCity(city, locale) {
  if (!city) return null;
  const loc = locale || getLocale();
  return {
    ...city,
    name: pickLocale(city.name, loc),
    province: city.province ? pickLocale(city.province, loc) : '',
    description: pickLocale(city.description, loc)
  };
}

function getCityIndexGroups(locale) {
  const loc = locale || getLocale();
  const groups = {};
  const sorted = [...cities].sort((a, b) => (
    pickLocale(a.name, 'zh-CN').localeCompare(pickLocale(b.name, 'zh-CN'), 'zh-CN')
  ));

  sorted.forEach(city => {
    const letter = getCityIndexLetter(pickLocale(city.name, 'zh-CN'));
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(localizeCity(city, loc));
  });

  return Object.keys(groups)
    .sort(compareIndexLetters)
    .map(letter => ({
      letter,
      cities: groups[letter]
    }));
}

function getCityById(id, locale) {
  const city = cities.find(c => c.id === id);
  return localizeCity(city, locale);
}

function getCityByName(name, locale) {
  const loc = locale || getLocale();
  const city = cities.find(c => {
    const zh = pickLocale(c.name, 'zh-CN');
    const en = pickLocale(c.name, 'en-US');
    return name === zh || name === en || name.includes(zh) || zh.includes(name);
  });
  return localizeCity(city, loc);
}

function getHotCities(limit = 8, locale) {
  const sorted = [...cities].sort((a, b) => b.heritageCount - a.heritageCount);
  return sorted.slice(0, limit).map(c => localizeCity(c, locale));
}

module.exports = {
  cities,
  localizeCity,
  getCityIndexGroups,
  getCityById,
  getCityByName,
  getHotCities
};
