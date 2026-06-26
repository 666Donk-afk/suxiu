/**
 * 代表性传承人 - 支持按城市筛选，优先使用传承人库，其次从非遗文本提取
 */
const RAW = require('./inheritors-data');
const BIOS = require('./inheritor-bios');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale, t } = require('../i18n.js');
const { getHeritageById } = require('./heritages');
const { getCityRelatedHeritagePool } = require('../utils/home-hero');

function localizeInheritor(item, locale, heritageName) {
  const loc = locale || getLocale();
  return {
    id: item.id,
    name: pickLocale(item.name, loc),
    level: t('heritagePage.nationalMaster', loc),
    cover: item.cover || '',
    heritageId: item.heritageId,
    heritageName: heritageName || ''
  };
}

function withHeritageCover(item, locale) {
  const heritage = getHeritageById(item.heritageId, locale);
  return localizeInheritor(
    {
      ...item,
      cover: item.cover || (heritage ? heritage.cover : '')
    },
    locale,
    heritage ? heritage.name : ''
  );
}

function extractMasterName(text, locale) {
  if (!text) return '';
  const blocked = ['人为', '现有', '世代', '当代', '民间', '依托', '代表', '坚守', '古法', '推动', '完整', '本土', '开发'];

  if (locale !== 'en-US') {
    const listMatch = text.match(/传承人(?:有|为)([^，。；\n\d\s等]{2,20})/);
    if (listMatch && listMatch[1]) {
      const first = listMatch[1].split(/[、，]/)[0].trim();
      if (first.length >= 2 && first.length <= 6 && !blocked.some(b => first.startsWith(b))) {
        return first;
      }
    }

    const patterns = [
      /国家级(?:代表性)?传承人([\u4e00-\u9fa5·]{2,8})/,
      /(?:传承人|传人)([\u4e00-\u9fa5·]{2,6})(?:深耕|出身|8岁|数十年|改良)/
    ];
    for (let i = 0; i < patterns.length; i += 1) {
      const match = text.match(patterns[i]);
      if (match && match[1]) {
        const name = match[1].replace(/[等有]/g, '').trim();
        if (name.length >= 2 && name.length <= 6 && !blocked.some(b => name.startsWith(b))) {
          return name;
        }
      }
    }
    return '';
  }

  const enPatterns = [
    /masters?[:\s]+([A-Za-z .'-]{3,40})/i,
    /inheritor[s]?\s+([A-Za-z .'-]{3,40})/i
  ];
  for (let i = 0; i < enPatterns.length; i += 1) {
    const match = text.match(enPatterns[i]);
    if (match && match[1]) return match[1].trim();
  }
  return '';
}

function isBadMasterName(name) {
  const blocked = ['人为', '现有', '世代', '当代', '民间', '依托', '代表', '坚守', '古法', '推动', '完整', '本土', '开发'];
  return !name || blocked.some(b => name.startsWith(b)) || name.includes('古法') || name.includes('扎染');
}

function buildInheritorFromHeritage(heritage, locale) {
  const loc = locale || getLocale();
  if (!heritage) return null;

  let name = extractMasterName(heritage.summary || '', loc);
  if (isBadMasterName(name)) {
    name = loc === 'en-US' ? 'Master Inheritor' : '代表性传承人';
  }

  return {
    id: `heritage-${heritage.id}`,
    name,
    level: t('heritagePage.nationalMaster', loc),
    cover: heritage.cover,
    heritageId: heritage.id,
    heritageName: heritage.name
  };
}

function getInheritors(locale) {
  const loc = locale || getLocale();
  return RAW.map(item => withHeritageCover(item, loc));
}

function getInheritorsByCity(cityName, locale, limit) {
  const loc = locale || getLocale();
  const max = limit || 6;
  const pool = getCityRelatedHeritagePool(cityName, loc);
  const idSet = new Set(pool.map(item => item.id));
  const results = [];
  const coveredHeritageIds = new Set();

  RAW.forEach(item => {
    if (!idSet.has(item.heritageId) || results.length >= max) return;
    results.push(withHeritageCover(item, loc));
    coveredHeritageIds.add(item.heritageId);
  });

  pool.some(heritage => {
    if (results.length >= max) return true;
    if (coveredHeritageIds.has(heritage.id)) return false;
    const generated = buildInheritorFromHeritage(heritage, loc);
    if (generated) {
      results.push(generated);
      coveredHeritageIds.add(heritage.id);
    }
    return false;
  });

  return results.slice(0, max);
}

function resolveIntro(item, heritage, locale) {
  const loc = locale || getLocale();
  const bio = BIOS[item.id];
  if (bio) {
    return pickLocale(bio, loc);
  }
  const name = typeof item.name === 'string' ? item.name : pickLocale(item.name, loc);
  const heritageName = heritage ? heritage.name : '';
  if (loc === 'en-US') {
    return `${name} is a nationally recognized inheritor of ${heritageName}, committed to safeguarding and passing on this heritage.`;
  }
  return `${name}是${heritageName}国家级代表性传承人，长期从事该项目的传承与推广工作。`;
}

function getInheritorProfilesByHeritageId(heritageId, locale) {
  const loc = locale || getLocale();
  const heritage = getHeritageById(heritageId, loc);
  return getInheritorsByHeritageId(heritageId, loc).map(item => ({
    ...item,
    intro: resolveIntro(item, heritage, loc)
  }));
}

function getInheritorsByHeritageId(heritageId, locale) {
  const loc = locale || getLocale();
  const fromDb = RAW.filter(item => item.heritageId === heritageId);
  if (fromDb.length) {
    return fromDb.map(item => withHeritageCover(item, loc));
  }
  const heritage = getHeritageById(heritageId, loc);
  const generated = buildInheritorFromHeritage(heritage, loc);
  return generated ? [generated] : [];
}

module.exports = {
  getInheritors,
  getInheritorsByCity,
  getInheritorsByHeritageId,
  getInheritorProfilesByHeritageId
};
