/**
 * 根据启程指引偏好生成个性化推荐
 */
const storage = require('./storage');
const { getHotCities, getCityByName } = require('../data/cities');
const { findJourneyCityByName } = require('../data/journey-cities');
const { getAllHeritages, getCityHeritageIds } = require('../data/heritages');
const { getHotExperiences } = require('../data/experience.js');
const { t, getLocale } = require('../i18n.js');

const TRAVEL_BOOST_PLANS = ['within_week', 'within_month', 'within_three_months'];

function buildHeritageScores(prefs, locale) {
  const all = getAllHeritages(locale);
  const city = prefs.selectedCity;
  const categories = prefs.interestedCategories || [];
  const cityIds = city ? getCityHeritageIds(city) : null;

  return all.map(heritage => {
    let score = 0;
    if (cityIds && cityIds.has(heritage.id)) score += 100;
    if (categories.length && categories.includes(heritage.categoryKey)) score += 50;
    return { heritage, score };
  });
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
    return [{ ...journeyCity, heritageCount: journeyCity.heritageCount || 0 }, ...demoList].slice(0, limit);
  }

  return demoList;
}

function getPersonalizedHeritages(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const scored = buildHeritageScores(prefs, loc);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.heritage);
}

function getPersonalizedExperiences(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  let list = getHotExperiences(limit * 2, loc);

  const city = prefs.selectedCity;
  const cityIds = city ? getCityHeritageIds(city) : null;
  const boostExperience = prefs.preferExperience || TRAVEL_BOOST_PLANS.includes(prefs.travelPlan);

  if (cityIds) {
    list = [...list].sort((a, b) => {
      const aMatch = a.city === city || cityIds.has(a.heritageId) ? 1 : 0;
      const bMatch = b.city === city || cityIds.has(b.heritageId) ? 1 : 0;
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
