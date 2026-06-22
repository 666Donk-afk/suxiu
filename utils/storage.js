/**
 * 本地存储：收藏、浏览历史、搜索历史
 */
const KEYS = {
  FAVORITES: 'heritage_favorites',
  HISTORY: 'heritage_history',
  SEARCH_HISTORY: 'heritage_search_history',
  FIRST_LAUNCH: 'isFirstLaunch',
  USER_INFO: 'user_info',
  IS_GUEST: 'is_guest',
  EXPERIENCE_HISTORY: 'experience_history',
  SELECTED_CITY: 'selectedCity',
  SELECTED_PROVINCE: 'selectedProvince',
  INTERESTED_CATEGORIES: 'interestedCategories',
  TRAVEL_PLAN: 'travelPlan',
  PREFER_EXPERIENCE: 'preferExperience'
};

const MAX_HISTORY = 50;
const MAX_SEARCH = 10;
const MAX_EXPERIENCE_HISTORY = 30;

function safeGet(key, fallback) {
  try {
    const val = wx.getStorageSync(key);
    return val !== undefined && val !== '' ? val : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, data) {
  try {
    wx.setStorageSync(key, data);
  } catch (e) {
    console.warn('storage write failed:', key, e);
  }
}

function getFavorites() {
  return safeGet(KEYS.FAVORITES, []);
}

function setFavorites(list) {
  safeSet(KEYS.FAVORITES, list);
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function addFavorite(id) {
  const list = getFavorites();
  if (!list.includes(id)) {
    list.unshift(id);
    setFavorites(list);
  }
  return true;
}

function removeFavorite(id) {
  const list = getFavorites().filter(item => item !== id);
  setFavorites(list);
  return true;
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  }
  addFavorite(id);
  return true;
}

function getFavoriteHeritages(getHeritageById) {
  return getFavorites()
    .map(id => getHeritageById(id))
    .filter(Boolean);
}

function getHistory() {
  return safeGet(KEYS.HISTORY, []);
}

function addHistory(heritage) {
  if (!heritage || !heritage.id) return;
  let list = getHistory().filter(item => item.id !== heritage.id);
  list.unshift({
    id: heritage.id,
    name: heritage.name,
    city: heritage.city,
    cover: heritage.cover,
    level: heritage.level,
    viewedAt: Date.now()
  });
  if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
  safeSet(KEYS.HISTORY, list);
}

function removeHistoryItem(id) {
  const list = getHistory().filter(item => item.id !== id);
  safeSet(KEYS.HISTORY, list);
}

function clearHistory() {
  safeSet(KEYS.HISTORY, []);
}

function getSearchHistory() {
  return safeGet(KEYS.SEARCH_HISTORY, []);
}

function addSearchHistory(keyword) {
  const kw = (keyword || '').trim();
  if (!kw) return;
  let list = getSearchHistory().filter(item => item !== kw);
  list.unshift(kw);
  if (list.length > MAX_SEARCH) list = list.slice(0, MAX_SEARCH);
  safeSet(KEYS.SEARCH_HISTORY, list);
}

function clearSearchHistory() {
  safeSet(KEYS.SEARCH_HISTORY, []);
}

function hasCompletedLaunch() {
  return !!safeGet(KEYS.FIRST_LAUNCH, false);
}

function setLaunchComplete() {
  safeSet(KEYS.FIRST_LAUNCH, true);
}

function getUserInfo() {
  return safeGet(KEYS.USER_INFO, null);
}

function setUserInfo(info) {
  safeSet(KEYS.USER_INFO, info || null);
  if (info) safeSet(KEYS.IS_GUEST, false);
}

function isGuest() {
  return !!safeGet(KEYS.IS_GUEST, false);
}

function setGuestMode(guest) {
  safeSet(KEYS.IS_GUEST, !!guest);
  if (guest) safeSet(KEYS.USER_INFO, null);
}

function isLoggedIn() {
  return !isGuest() && !!getUserInfo();
}

function getFavoriteCount() {
  return getFavorites().length;
}

function getHistoryCount() {
  return getHistory().length;
}

function getExperienceHistory() {
  return safeGet(KEYS.EXPERIENCE_HISTORY, []);
}

function addExperienceHistory(experience, heritageName) {
  if (!experience || !experience.id) return;
  let list = getExperienceHistory().filter(item => item.experienceId !== experience.id);
  list.unshift({
    experienceId: experience.id,
    title: experience.title,
    city: experience.city,
    cover: experience.cover,
    heritageId: experience.heritageId,
    heritageName: heritageName || '',
    viewedAt: Date.now()
  });
  if (list.length > MAX_EXPERIENCE_HISTORY) {
    list = list.slice(0, MAX_EXPERIENCE_HISTORY);
  }
  safeSet(KEYS.EXPERIENCE_HISTORY, list);
}

function removeExperienceHistory(experienceId) {
  const list = getExperienceHistory().filter(item => item.experienceId !== experienceId);
  safeSet(KEYS.EXPERIENCE_HISTORY, list);
}

function clearExperienceHistory() {
  safeSet(KEYS.EXPERIENCE_HISTORY, []);
}

function getExperienceHistoryCount() {
  return getExperienceHistory().length;
}

function getJourneyPreferences() {
  return {
    selectedProvince: safeGet(KEYS.SELECTED_PROVINCE, ''),
    selectedCity: safeGet(KEYS.SELECTED_CITY, ''),
    interestedCategories: safeGet(KEYS.INTERESTED_CATEGORIES, []),
    travelPlan: safeGet(KEYS.TRAVEL_PLAN, ''),
    preferExperience: !!safeGet(KEYS.PREFER_EXPERIENCE, false)
  };
}

function setJourneyPreferences(prefs) {
  if (!prefs) return;
  if (prefs.selectedProvince !== undefined) {
    safeSet(KEYS.SELECTED_PROVINCE, prefs.selectedProvince || '');
  }
  if (prefs.selectedCity !== undefined) {
    safeSet(KEYS.SELECTED_CITY, prefs.selectedCity || '');
  }
  if (prefs.interestedCategories !== undefined) {
    safeSet(KEYS.INTERESTED_CATEGORIES, prefs.interestedCategories || []);
  }
  if (prefs.travelPlan !== undefined) {
    safeSet(KEYS.TRAVEL_PLAN, prefs.travelPlan || '');
  }
  if (prefs.preferExperience !== undefined) {
    safeSet(KEYS.PREFER_EXPERIENCE, !!prefs.preferExperience);
  }
}

function clearJourneyPreferences() {
  safeSet(KEYS.SELECTED_PROVINCE, '');
  safeSet(KEYS.SELECTED_CITY, '');
  safeSet(KEYS.INTERESTED_CATEGORIES, []);
  safeSet(KEYS.TRAVEL_PLAN, '');
  safeSet(KEYS.PREFER_EXPERIENCE, false);
}

module.exports = {
  getFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getFavoriteHeritages,
  getHistory,
  addHistory,
  removeHistoryItem,
  clearHistory,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  hasCompletedLaunch,
  setLaunchComplete,
  getUserInfo,
  setUserInfo,
  isGuest,
  setGuestMode,
  isLoggedIn,
  getFavoriteCount,
  getHistoryCount,
  getExperienceHistory,
  addExperienceHistory,
  removeExperienceHistory,
  clearExperienceHistory,
  getExperienceHistoryCount,
  getJourneyPreferences,
  setJourneyPreferences,
  clearJourneyPreferences
};
