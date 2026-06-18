/**
 * 根据启程指引偏好生成个性化推荐
 */
const storage = require('./storage');
const { getHotCities, getCityByName } = require('../data/cities');
const { findJourneyCityByName } = require('../data/journey-cities');
const { getAllHeritages, getHeritagesByCity } = require('../data/heritages');
const { getHotExperiences } = require('../data/experience.js');
const { t, getLocale } = require('../i18n.js');

const CATEGORY_MAP_BY_NAME = {
  汉剧: 'opera',
  黄梅戏: 'opera',
  土家族摆手舞: 'folk',
  西兰卡普: 'craft',
  武当武术: 'sports'
};

const TRAVEL_BOOST_PLANS = ['within_week', 'within_month', 'within_three_months'];

function getHeritageCategoryKey(heritage) {
  const raw = require('../data/excel_demo.js');
  const item = raw[heritage.id - 1];
  if (!item) return 'folk';
  return CATEGORY_MAP_BY_NAME[item.name] || 'folk';
}

function scoreHeritage(heritage, prefs) {
  let score = 0;
  const city = prefs.selectedCity;
  const categories = prefs.interestedCategories || [];

  if (city) {
    const zhMatches = getHeritagesByCity(city, 'zh-CN');
    const enMatches = getHeritagesByCity(city, 'en-US');
    if (zhMatches.some(h => h.id === heritage.id) || enMatches.some(h => h.id === heritage.id)) {
      score += 100;
    }
  }
  if (categories.length) {
    const key = getHeritageCategoryKey(heritage);
    if (categories.includes(key)) score += 50;
  }
  return score;
}

function getPersonalizedCities(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const demoList = getHotCities(8, loc);
  const selectedName = prefs.selectedCity;

  if (!selectedName) return demoList;

  const journeyCity = findJourneyCityByName(selectedName, loc);
  const demoCity = getCityByName(selectedName, loc);

  if (demoCity) {
    const rest = demoList.filter(c => c.id !== demoCity.id);
    return [demoCity, ...rest].slice(0, limit);
  }

  if (journeyCity) {
    const virtual = {
      ...journeyCity,
      heritageCount: journeyCity.heritageCount || 0
    };
    return [virtual, ...demoList].slice(0, limit);
  }

  return demoList;
}

function getPersonalizedHeritages(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const all = getAllHeritages(loc);

  const sorted = [...all].sort((a, b) => scoreHeritage(b, prefs) - scoreHeritage(a, prefs));
  return sorted.slice(0, limit);
}

function getPersonalizedExperiences(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  let list = getHotExperiences(limit * 2, loc);

  const city = prefs.selectedCity;
  const boostExperience = prefs.preferExperience
    || TRAVEL_BOOST_PLANS.includes(prefs.travelPlan);

  if (city) {
    list = [...list].sort((a, b) => {
      const aZh = getHeritagesByCity(city, 'zh-CN').some(h => h.id === a.heritageId) ? 1 : 0;
      const bZh = getHeritagesByCity(city, 'zh-CN').some(h => h.id === b.heritageId) ? 1 : 0;
      const aEn = getHeritagesByCity(city, 'en-US').some(h => h.id === a.heritageId) ? 1 : 0;
      const bEn = getHeritagesByCity(city, 'en-US').some(h => h.id === b.heritageId) ? 1 : 0;
      const aMatch = a.city === city || aZh || aEn ? 1 : 0;
      const bMatch = b.city === city || bZh || bEn ? 1 : 0;
      return bMatch - aMatch;
    });
  }

  if (boostExperience) {
    list = [...list].sort((a, b) => {
      const aBookable = a.reservationType !== 'website' ? 1 : 0;
      const bBookable = b.reservationType !== 'website' ? 1 : 0;
      return bBookable - aBookable;
    });
  }

  return list.slice(0, limit);
}

function getTravelPlanLabel(plan, locale) {
  const loc = locale || getLocale();
  const map = {
    within_week: t('journeySetup.travelOptions.withinWeek', loc),
    within_month: t('journeySetup.travelOptions.withinMonth', loc),
    within_three_months: t('journeySetup.travelOptions.withinThreeMonths', loc),
    no_plan: t('journeySetup.travelOptions.noPlan', loc)
  };
  return map[plan] || map.no_plan;
}

module.exports = {
  getPersonalizedCities,
  getPersonalizedHeritages,
  getPersonalizedExperiences,
  getTravelPlanLabel
};
