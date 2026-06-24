/**
 * 服务端非遗名录（供识别 Prompt 与结果匹配）
 */
const listData = require('../../data/heritage-list.js');

const CATEGORY_LABELS = {
  craft: '传统技艺',
  folk: '民俗',
  opera: '传统戏剧',
  quyi: '曲艺',
  medicine: '传统医药',
  art: '传统美术',
  sports: '体育游艺'
};

function getCatalogLines(limit = 142) {
  return listData.slice(0, limit).map((item, index) => {
    const cat = CATEGORY_LABELS[item.categoryKey] || item.categoryKey || '民俗';
    return `${index + 1}. ${item.name} | slug:${item.slug} | ${cat} | ${item.cityShort || item.location || ''}`;
  });
}

function getCatalogPromptBlock() {
  return getCatalogLines().join('\n');
}

function findHeritageMatch(slug, name) {
  const slugText = (slug || '').trim();
  if (slugText) {
    const idx = listData.findIndex(h => h.slug === slugText);
    if (idx >= 0) return { index: idx, item: listData[idx] };
  }

  const nameText = (name || '').trim();
  if (!nameText) return null;

  let idx = listData.findIndex(h => h.name === nameText);
  if (idx >= 0) return { index: idx, item: listData[idx] };

  idx = listData.findIndex(h => nameText.includes(h.name) || h.name.includes(nameText));
  if (idx >= 0) return { index: idx, item: listData[idx] };

  return null;
}

function toRecognizePayload(match, parsed, locale) {
  if (!match) {
    return {
      id: null,
      slug: null,
      name: parsed.heritageName || parsed.name || '',
      category: parsed.categoryLabel || '',
      categoryKey: parsed.categoryKey || '',
      location: '',
      summary: '',
      confidence: parsed.confidence || 'low'
    };
  }

  const { index, item } = match;
  return {
    id: index + 1,
    slug: item.slug,
    name: item.name,
    category: CATEGORY_LABELS[item.categoryKey] || item.categoryKey,
    categoryKey: item.categoryKey,
    location: item.cityShort || item.location || '',
    summary: (item.summary || '').slice(0, 160),
    confidence: parsed.confidence || 'medium'
  };
}

module.exports = {
  getCatalogPromptBlock,
  findHeritageMatch,
  toRecognizePayload,
  CATEGORY_LABELS
};
