/**
 * 城市卡片封面：优先匹配当地非遗照片
 */
const heritageList = require('./heritage-list.js');
const citiesData = require('./cities-data.js');
const images = require('./images.js');

/** 引导页城市卡片封面：放在 onboarding 分包内，避免跨分包加载失败 */
const ONBOARDING_COVER_DIR = '/package-onboarding/images/city-covers/';
const DEFAULT_ONBOARDING_COVER = ONBOARDING_COVER_DIR + 'default.jpg';

function remapCoverForOnboarding(cover) {
  if (!cover) return DEFAULT_ONBOARDING_COVER;
  if (cover.startsWith(ONBOARDING_COVER_DIR)) return cover;
  const filename = (cover.split('/').pop() || '').trim();
  if (!filename) return DEFAULT_ONBOARDING_COVER;
  return ONBOARDING_COVER_DIR + filename;
}

function normalizeName(name) {
  return (name || '').replace(/(市|县|区|州|盟|地区|自治州|特别行政区)$/g, '').trim();
}

function cityMatchesItem(item, cityName) {
  const needle = (cityName || '').trim();
  if (!needle) return false;
  const nNeedle = normalizeName(needle);
  const fields = [item.cityShort, item.location].filter(Boolean);
  return fields.some(field => {
    if (field === needle || field.includes(needle) || needle.includes(field)) return true;
    const normalized = normalizeName(field);
    if (!nNeedle || !normalized) return false;
    return normalized === nNeedle || normalized.includes(nNeedle) || nNeedle.includes(normalized);
  });
}

function getHeritagesForProvince(provinceShort) {
  if (!provinceShort) return [];
  return heritageList.filter(
    h => h.provinceShort === provinceShort || (h.province && h.province.includes(provinceShort))
  );
}

function findHeritageForCity(cityName, provinceShort) {
  const scoped = provinceShort ? getHeritagesForProvince(provinceShort) : heritageList;
  return scoped.find(item => cityMatchesItem(item, cityName)) || null;
}

function findCoverFromCitiesData(cityName) {
  const needle = (cityName || '').trim();
  const city = citiesData.find(c => {
    const zh = c.name['zh-CN'];
    return zh === needle || zh.includes(needle) || needle.includes(zh);
  });
  return city && city.cover;
}

function getCityCover(cityName, provinceShort) {
  const heritage = findHeritageForCity(cityName, provinceShort);
  if (heritage && heritage.cover) return remapCoverForOnboarding(heritage.cover);

  const fromCityData = findCoverFromCitiesData(cityName);
  if (fromCityData) return remapCoverForOnboarding(fromCityData);

  const pool = getHeritagesForProvince(provinceShort);
  if (pool.length && pool[0].cover) return remapCoverForOnboarding(pool[0].cover);

  return remapCoverForOnboarding(images.defaultHeritage);
}

function buildCityCards(cityNames, provinceShort) {
  const pool = getHeritagesForProvince(provinceShort);
  const usedSlugs = new Set();
  let poolIndex = 0;

  return (cityNames || []).map(name => {
    let heritage = findHeritageForCity(name, provinceShort);

    if (!heritage || usedSlugs.has(heritage.slug)) {
      while (poolIndex < pool.length && usedSlugs.has(pool[poolIndex].slug)) {
        poolIndex += 1;
      }
      if (poolIndex < pool.length) {
        heritage = pool[poolIndex];
        poolIndex += 1;
      }
    }

    if (heritage) usedSlugs.add(heritage.slug);

    const cover = heritage && heritage.cover
      ? heritage.cover
      : findCoverFromCitiesData(name) || getCityCover(name, provinceShort);

    return { name, cover: remapCoverForOnboarding(cover) };
  });
}

module.exports = {
  getCityCover,
  buildCityCards,
  remapCoverForOnboarding,
  DEFAULT_ONBOARDING_COVER
};
