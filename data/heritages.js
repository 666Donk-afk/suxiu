/**
 * Demo 非遗数据 - 多语言
 */
const demoData = require('./excel_demo.js');
const enData = require('./heritage-i18n-en.js');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale, t } = require('../i18n.js');

const SLUG = {
  汉剧: 'hanju',
  土家族摆手舞: 'baishou',
  黄梅戏: 'huangmei',
  西兰卡普: 'xilan',
  武当武术: 'wudang'
};

const CATEGORY_MAP = {
  汉剧: 'opera',
  黄梅戏: 'opera',
  土家族摆手舞: 'folk',
  西兰卡普: 'craft',
  武当武术: 'sports'
};

const CITY_MAP = {
  武汉: { 'zh-CN': '武汉', 'en-US': 'Wuhan' },
  恩施土家族苗族自治州来凤县: { 'zh-CN': '恩施', 'en-US': 'Enshi' },
  恩施土家族苗族自治州: { 'zh-CN': '恩施', 'en-US': 'Enshi' },
  黄冈黄梅县: { 'zh-CN': '黄冈', 'en-US': 'Huanggang' },
  十堰市: { 'zh-CN': '十堰', 'en-US': 'Shiyan' }
};

function buildHistoryZh(name, origin) {
  const presets = {
    汉剧: [
      { year: '唐代', event: '汉剧声腔源头可追溯' },
      { year: '清代中叶', event: '于湖北境内形成成熟剧种' },
      { year: '2006年', event: '列入第一批国家级非遗名录' }
    ],
    土家族摆手舞: [
      { year: '明清', event: '摆手舞发展黄金期' },
      { year: '2006年', event: '入选国家级非遗名录' },
      { year: '当代', event: '融入文旅与全民健身推广' }
    ],
    黄梅戏: [
      { year: '明末清初', event: '黄梅采茶调萌芽' },
      { year: '清代中后期', event: '传入安徽形成独立剧种' },
      { year: '2006年', event: '列入国家级非遗名录' }
    ],
    西兰卡普: [
      { year: '新石器—先秦', event: '巴人织麻工艺雏形' },
      { year: '唐宋', event: '溪布、峒布列为贡品' },
      { year: '2006年', event: '入选国家级非遗名录' }
    ],
    武当武术: [
      { year: '先秦—宋', event: '道家文脉与早期功法' },
      { year: '元末明初', event: '张三丰创立内家武术体系' },
      { year: '2006年', event: '列入国家级非遗名录' }
    ]
  };
  return presets[name] || [{ year: '2006年', event: '列入国家级非遗名录' }];
}

function buildInheritanceZh(item) {
  const defaults = {
    汉剧: { masters: ['陈伯华'], methods: '汉剧院团传承', development: '武汉汉剧院整理经典剧目', challenges: '年轻观众培养' },
    土家族摆手舞: { masters: ['民间传承人'], methods: '口传身授、节庆活动', development: '摆手舞文化节与校园推广', challenges: '传承人与活态保护' },
    黄梅戏: { masters: ['严凤英', '韩再芬'], methods: '黄梅戏剧团传承', development: '全国性大剧种传播', challenges: '方言与受众结构' },
    西兰卡普: { masters: ['母女世代传承人'], methods: '口传心授', development: '文创与服饰设计融合', challenges: '技艺门槛高' },
    武当武术: { masters: ['赵剑英', '覃献平'], methods: '宫观与传习馆', development: '海内外学员习武问道', challenges: '正宗传承辨识' }
  };
  return defaults[item.name] || { masters: ['传承人'], methods: '口传身授', development: '活态传承', challenges: '传承人培养' };
}

function buildSummary(item) {
  if (item.summary) return item.summary;
  if (item.origin) return item.origin.slice(0, 120) + '...';
  return item.name;
}

function getCategoryLabel(key, locale) {
  return t(`heritage.categories.${key}`, locale);
}

function buildRawItem(item, index, locale) {
  const id = index + 1;
  const slug = item.slug || SLUG[item.name];
  const en = enData[slug] || {};
  const loc = locale || getLocale();

  const nameZh = item.name;
  const name = loc === 'en-US' && en.name ? en.name : nameZh;

  const cityKey = CITY_MAP[item.location];
  const city = cityKey ? pickLocale(cityKey, loc) : item.location;

  const categoryKey = CATEGORY_MAP[item.name] || 'folk';
  const category = getCategoryLabel(categoryKey, loc);

  const level = loc === 'en-US' ? (en.level || t('heritage.national', loc)) : '国家级';
  const declareYear = loc === 'en-US' ? (en.declareYear || '2006') : '2006年';

  const history = loc === 'en-US' && en.history ? en.history : buildHistoryZh(item.name, item.origin);
  const inheritance = loc === 'en-US' && en.inheritance ? en.inheritance : buildInheritanceZh(item);

  const localized = {
    id,
    slug,
    name,
    city,
    location: loc === 'en-US' && en.location ? en.location : item.location,
    level,
    category,
    cover: item.cover,
    declareYear,
    summary: loc === 'en-US' && en.summary ? en.summary : buildSummary(item),
    origin: loc === 'en-US' && en.origin ? en.origin : (item.origin || ''),
    history,
    story: loc === 'en-US' && en.story ? en.story : (item.story || ''),
    meaning: loc === 'en-US' && en.meaning !== undefined ? en.meaning : (item.meaning || ''),
    materials: loc === 'en-US' && en.materials !== undefined ? en.materials : (item.materials || ''),
    inheritance,
    gallery: [item.cover],
    recommendations: []
  };

  const allIds = demoData.map((_, i) => i + 1).filter(i => i !== id);
  localized.recommendations = allIds.slice(0, 3);
  return localized;
}

function getAllRaw(locale) {
  return demoData.map((item, index) => buildRawItem(item, index, locale));
}

function getHeritageById(id, locale) {
  return getAllRaw(locale).find(h => h.id === id) || null;
}

function getHeritagesByCity(cityName, locale) {
  const loc = locale || getLocale();
  return getAllRaw(loc).filter(
    h => h.city === cityName || (h.location && h.location.includes(cityName))
  );
}

function getHeritagesByCityId(cityId, cityList, locale) {
  const city = cityList.find(c => c.id === cityId);
  if (!city) return [];
  return getHeritagesByCity(city.name, locale);
}

function getHotHeritages(limit = 6, locale) {
  return getAllRaw(locale).slice(0, limit);
}

function getRecommendations(ids, locale) {
  return ids.map(id => getHeritageById(id, locale)).filter(Boolean);
}

function getAllHeritages(locale) {
  return getAllRaw(locale);
}

function getCategories(locale) {
  const loc = locale || getLocale();
  return ['craft', 'folk', 'opera', 'quyi', 'medicine', 'art', 'sports'].map(
    key => getCategoryLabel(key, loc)
  );
}

function getLevels(locale) {
  return [t('heritage.national', locale)];
}

module.exports = {
  getHeritageById,
  getHeritagesByCity,
  getHeritagesByCityId,
  getHotHeritages,
  getRecommendations,
  getAllHeritages,
  getCategories,
  getLevels,
  CATEGORIES: getCategories(),
  LEVELS: getLevels()
};
