/**
 * 今日推荐 - 从非遗库动态抽取「一个传说 / 一个非遗」
 */
const listData = require('../data/heritage-list.js');
const detailMap = require('../data/heritage-details.js');
const enData = require('../data/heritage-i18n-en.js');
const storage = require('./storage');
const { getAllHeritages, getCityHeritageIds } = require('../data/heritages');
const { t, getLocale } = require('../i18n.js');

const DEFAULT_LIMIT = 4;

function getStoryForSlug(slug, locale) {
  if (locale === 'en-US' && enData[slug] && enData[slug].story) {
    return enData[slug].story;
  }
  return (detailMap[slug] && detailMap[slug].story) || '';
}

function getIdsWithStory(locale) {
  return listData
    .map((item, index) => ({ id: index + 1, slug: item.slug }))
    .filter(({ slug }) => getStoryForSlug(slug, locale).trim().length > 30)
    .map(item => item.id);
}

function dailySeed(extra) {
  const d = new Date();
  let seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const key = extra || '';
  for (let i = 0; i < key.length; i += 1) {
    seed = ((seed * 31) + key.charCodeAt(i)) >>> 0;
  }
  return seed;
}

function seededShuffle(arr, seed) {
  const list = arr.slice();
  let s = seed;
  for (let i = list.length - 1; i > 0; i -= 1) {
    s = ((s * 1103515245) + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function scoreHeritage(heritage, prefs, cityIds) {
  let score = 0;
  if (cityIds && cityIds.has(heritage.id)) score += 100;
  const categories = prefs.interestedCategories || [];
  if (categories.length && categories.includes(heritage.categoryKey)) score += 50;
  return score;
}

function pickFromPool(scoredItems, seed, limit) {
  const poolSize = Math.max(limit * 4, 16);
  const sorted = scoredItems.slice().sort((a, b) => b.score - a.score);
  const topScore = sorted[0] ? sorted[0].score : 0;
  const pool = sorted.filter((item, index) => (
    index < poolSize || item.score >= topScore - 50
  ));
  return seededShuffle(pool, seed).slice(0, limit);
}

function excerptText(text, maxLen) {
  if (!text) return '';
  const lines = text.replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).filter(Boolean);
  let body = lines.find(line => {
    if (line.length < 18) return false;
    if (/^[（(][一二三四五六七八九十\d]+[）)]/.test(line)) return false;
    if (/^\d+[.、]/.test(line) && line.length < 40) return false;
    return true;
  });
  if (!body) body = lines[0] || '';
  body = body.replace(/^[\d.、\s]+/, '').trim();
  if (body.length <= maxLen) {
    return body + (text.length > body.length ? '…' : '');
  }
  return `${body.slice(0, maxLen)}…`;
}

function buildLegendCards(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const cityIds = prefs.selectedCity ? getCityHeritageIds(prefs.selectedCity) : null;
  const storyIds = new Set(getIdsWithStory(loc));
  const byId = new Map(getAllHeritages(loc).map(item => [item.id, item]));

  const scored = [...storyIds]
    .map(id => {
      const heritage = byId.get(id);
      if (!heritage) return null;
      return {
        heritage,
        story: getStoryForSlug(heritage.slug, loc),
        score: scoreHeritage(heritage, prefs, cityIds)
      };
    })
    .filter(Boolean);

  const seed = dailySeed(`${prefs.selectedCity || ''}:legend`);
  const picked = pickFromPool(scored, seed, limit);

  return picked.map(({ heritage, story }) => ({
    id: `legend-${heritage.id}-${seed}`,
    type: 'legend',
    tag: t('home.todayLegend', loc),
    title: heritage.name,
    excerpt: excerptText(story, 80),
    cover: heritage.cover,
    targetId: heritage.id
  }));
}

function buildHeritageCards(limit, locale) {
  const loc = locale || getLocale();
  const prefs = storage.getJourneyPreferences();
  const cityIds = prefs.selectedCity ? getCityHeritageIds(prefs.selectedCity) : null;

  const scored = getAllHeritages(loc).map(heritage => ({
    heritage,
    score: scoreHeritage(heritage, prefs, cityIds)
  }));

  const seed = dailySeed(`${prefs.selectedCity || ''}:heritage`);
  const picked = pickFromPool(scored, seed, limit);

  return picked.map(({ heritage }) => ({
    id: `heritage-${heritage.id}-${seed}`,
    type: 'heritage',
    tag: heritage.category,
    title: heritage.name,
    excerpt: excerptText(heritage.summary, 72),
    cover: heritage.cover,
    targetId: heritage.id
  }));
}

function getTodayRecommendCards(tab, limit, locale) {
  const count = limit || DEFAULT_LIMIT;
  if (tab === 'legend') return buildLegendCards(count, locale);
  return buildHeritageCards(count, locale);
}

module.exports = {
  getTodayRecommendCards
};
