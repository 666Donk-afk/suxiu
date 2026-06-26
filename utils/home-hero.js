/**
 * 首页 Hero - 根据所选城市展示对应非遗
 */
const storage = require('./storage');
const images = require('../data/images');
const { getProvinceByCity } = require('../data/provinces.js');
const { getHeritagesByCity, getHeritagesByProvince } = require('../data/heritages');
const { getPersonalizedHeritages } = require('./recommendation');
const { t, getLocale } = require('../i18n.js');

function dailySeed(extra) {
  const d = new Date();
  let seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const key = extra || '';
  for (let i = 0; i < key.length; i += 1) {
    seed = ((seed * 31) + key.charCodeAt(i)) >>> 0;
  }
  return seed;
}

function excerptText(text, maxLen) {
  if (!text) return '';
  const body = text.replace(/\s+/g, ' ').trim();
  if (body.length <= maxLen) return body;
  return `${body.slice(0, maxLen)}…`;
}

function pickHeroHeritage(pool, cityName) {
  if (!pool.length) return null;
  const seed = dailySeed(`${cityName || ''}:hero`);
  return pool[seed % pool.length];
}

function getHeroHeritagePool(cityName, locale) {
  const loc = locale || getLocale();
  let list = getHeritagesByCity(cityName, loc);
  if (list.length) return list;

  const province = getProvinceByCity(cityName);
  if (province && province.name) {
    list = getHeritagesByProvince(province.name, loc);
    if (list.length) return list;
    if (province.shortName) {
      list = getHeritagesByProvince(province.shortName, loc);
      if (list.length) return list;
    }
  }

  return getPersonalizedHeritages(16, loc);
}

/** 城市优先，不足时补充同省非遗（用于首页列表展示） */
function getCityRelatedHeritagePool(cityName, locale) {
  const loc = locale || getLocale();
  const cityList = getHeritagesByCity(cityName, loc);
  const seen = new Set(cityList.map(item => item.id));
  const combined = [...cityList];

  const province = getProvinceByCity(cityName);
  if (province) {
    let provList = getHeritagesByProvince(province.name, loc);
    if (!provList.length && province.shortName) {
      provList = getHeritagesByProvince(province.shortName, loc);
    }
    provList.forEach(item => {
      if (!seen.has(item.id)) {
        combined.push(item);
        seen.add(item.id);
      }
    });
  }

  if (combined.length) return combined;
  return getPersonalizedHeritages(16, loc);
}

function getCityHeroContent(cityName, locale) {
  const loc = locale || getLocale();
  const city = (cityName || '').trim() || (loc === 'en-US' ? 'Wuhan' : '武汉');
  const pool = getHeroHeritagePool(city, loc);
  const heritage = pickHeroHeritage(pool, city);

  if (!heritage) {
    return {
      cover: images.banners[0],
      title: t('home.heroTitleFallback', loc).replace('{city}', city),
      tagline: t('home.heroTaglineFallback', loc),
      targetId: null
    };
  }

  return {
    cover: heritage.cover || images.banners[0],
    title: heritage.name,
    tagline: excerptText(heritage.summary, 28) || t('home.heroTaglineFallback', loc),
    targetId: heritage.id
  };
}

function getCityHeroFromPrefs(locale) {
  const prefs = storage.getJourneyPreferences();
  const city = prefs.selectedCity || (locale === 'en-US' ? 'Wuhan' : '武汉');
  return getCityHeroContent(city, locale);
}

module.exports = {
  getCityHeroContent,
  getCityHeroFromPrefs,
  getHeroHeritagePool,
  getCityRelatedHeritagePool
};
