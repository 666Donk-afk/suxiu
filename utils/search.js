/**
 * 模糊搜索：城市 + 非遗（多语言）
 */
const { cities, localizeCity } = require('../data/cities');
const { getAllHeritages } = require('../data/heritages');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');

function fuzzyMatch(text, keyword) {
  if (!text || !keyword) return false;
  return String(text).toLowerCase().includes(keyword.toLowerCase());
}

function searchAll(keyword, locale) {
  const loc = locale || getLocale();
  const kw = (keyword || '').trim();
  if (!kw) {
    return { cities: [], heritages: [], empty: true };
  }

  const matchedCities = cities
    .filter(c => {
      const name = pickLocale(c.name, loc);
      const desc = pickLocale(c.description, loc);
      return fuzzyMatch(name, kw) || fuzzyMatch(c.pinyin, kw) || fuzzyMatch(desc, kw);
    })
    .map(c => localizeCity(c, loc));

  const matchedHeritages = getAllHeritages(loc).filter(
    h =>
      fuzzyMatch(h.name, kw) ||
      fuzzyMatch(h.city, kw) ||
      fuzzyMatch(h.summary, kw) ||
      fuzzyMatch(h.category, kw)
  );

  return {
    cities: matchedCities,
    heritages: matchedHeritages,
    empty: matchedCities.length === 0 && matchedHeritages.length === 0
  };
}

function getSuggestions(keyword, limit = 8, locale) {
  const kw = (keyword || '').trim();
  if (!kw) return [];

  const result = searchAll(kw, locale);
  const suggestions = [];

  result.cities.forEach(c => {
    suggestions.push({ type: 'city', text: c.name, id: c.id });
  });
  result.heritages.forEach(h => {
    suggestions.push({ type: 'heritage', text: h.name, id: h.id, city: h.city });
  });

  return suggestions.slice(0, limit);
}

module.exports = {
  searchAll,
  getSuggestions,
  fuzzyMatch
};
