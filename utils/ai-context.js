/**
 * 组装 AI 上下文：开局引导 + 相关非遗摘要
 */
const storage = require('./storage');
const { getHeritagesByCity, getAllHeritages } = require('../data/heritages');
const { getJourneyCategories } = require('../data/journey-categories');
const { t, getLocale } = require('../i18n.js');

const TRAVEL_PLAN_KEYS = {
  within_week: 'journeySetup.travelOptions.withinWeek',
  within_month: 'journeySetup.travelOptions.withinMonth',
  within_three_months: 'journeySetup.travelOptions.withinThreeMonths',
  no_plan: 'journeySetup.travelOptions.noPlan'
};

function mapHeritageBrief(h) {
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    province: h.province,
    category: h.category,
    categoryKey: h.categoryKey,
    summary: (h.summary || '').slice(0, 120)
  };
}

function buildJourneyContext(locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const categoryMap = {};
  getJourneyCategories(loc).forEach(c => {
    categoryMap[c.key] = c.label;
  });

  const interestLabels = (prefs.interestedCategories || [])
    .map(key => categoryMap[key] || key)
    .filter(Boolean);

  const travelPlanLabel = prefs.travelPlan
    ? t(TRAVEL_PLAN_KEYS[prefs.travelPlan] || TRAVEL_PLAN_KEYS.no_plan, loc)
    : '';

  return {
    selectedProvince: prefs.selectedProvince || '',
    selectedCity: prefs.selectedCity || '',
    interestedCategories: prefs.interestedCategories || [],
    interestLabels,
    travelPlan: prefs.travelPlan || '',
    travelPlanLabel,
    preferExperience: !!prefs.preferExperience
  };
}

function buildHeritageContext(locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const city = prefs.selectedCity;
  const categories = prefs.interestedCategories || [];

  let cityHeritages = [];
  if (city) {
    cityHeritages = getHeritagesByCity(city, loc).slice(0, 15).map(mapHeritageBrief);
  }

  let interestHeritages = [];
  if (categories.length) {
    interestHeritages = getAllHeritages(loc)
      .filter(h => categories.includes(h.categoryKey))
      .slice(0, 12)
      .map(mapHeritageBrief);
  }

  return { cityHeritages, interestHeritages };
}

function buildUserContext(locale) {
  const loc = locale || getLocale();
  return {
    journey: buildJourneyContext(loc),
    cityHeritages: buildHeritageContext(loc).cityHeritages,
    interestHeritages: buildHeritageContext(loc).interestHeritages,
    locale: loc
  };
}

function getWelcomeMessage(locale) {
  const loc = locale || getLocale();
  const journey = buildJourneyContext(loc);
  if (journey.selectedCity) {
    return t('aiGuide.welcomeWithCity', loc).replace('{city}', journey.selectedCity);
  }
  return t('aiGuide.welcome', loc);
}

function getQuickPrompts(locale) {
  const loc = locale || getLocale();
  return [
    { key: 'recognize', text: t('aiGuide.promptRecognize', loc) },
    { key: 'route', text: t('aiGuide.promptRoute', loc) },
    { key: 'story', text: t('aiGuide.promptStory', loc) },
    { key: 'what', text: t('aiGuide.promptWhat', loc) },
    { key: 'kids', text: t('aiGuide.promptKids', loc) },
    { key: 'popular', text: t('aiGuide.promptPopular', loc) },
    { key: 'shadow', text: t('aiGuide.promptShadow', loc) }
  ];
}

module.exports = {
  buildUserContext,
  buildJourneyContext,
  getWelcomeMessage,
  getQuickPrompts
};
