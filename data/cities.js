/**
 * Demo 城市数据 - 多语言
 */
const images = require('./images');
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');

const citiesRaw = [
  {
    id: 1,
    name: { 'zh-CN': '武汉', 'en-US': 'Wuhan' },
    pinyin: 'wuhan',
    initial: 'W',
    description: {
      'zh-CN': '九省通衢，楚文化重镇。汉剧在此发源流传，被誉为"京剧之母"。',
      'en-US': 'A major hub of Chu culture where Han Opera originated, often called the mother of Peking Opera.'
    },
    heritageCount: 1
  },
  {
    id: 2,
    name: { 'zh-CN': '恩施', 'en-US': 'Enshi' },
    pinyin: 'enshi',
    initial: 'E',
    description: {
      'zh-CN': '土家族聚居地，摆手舞、西兰卡普等非遗独具民族特色，被称为"东方迪斯科"与"土家无字史书"。',
      'en-US': 'Home to the Tujia people, famed for hand-waving dance and brocade — called the "Oriental Disco" and Tujia\'s wordless history book.'
    },
    heritageCount: 2
  },
  {
    id: 3,
    name: { 'zh-CN': '黄冈', 'en-US': 'Huanggang' },
    pinyin: 'huanggang',
    initial: 'H',
    description: {
      'zh-CN': '黄梅戏发源地，采茶调与民间歌谣在此融合，孕育出中国五大戏曲剧种之一。',
      'en-US': 'Birthplace of Huangmei Opera, where tea-picking songs and folk ballads merged into one of China\'s five great opera genres.'
    },
    heritageCount: 1
  },
  {
    id: 4,
    name: { 'zh-CN': '十堰', 'en-US': 'Shiyan' },
    pinyin: 'shiyan',
    initial: 'S',
    description: {
      'zh-CN': '武当山所在地，道家文化与内家武术在此千年传承，"北崇少林，南尊武当"。',
      'en-US': 'Gateway to Mount Wudang, where Daoist culture and internal martial arts have flourished for millennia.'
    },
    heritageCount: 1
  }
];

const coverMap = [
  images.cities.wuhan,
  images.cities.enshi,
  images.cities.huanggang,
  images.cities.shiyan
];

const cities = citiesRaw.map((c, i) => ({
  ...c,
  cover: coverMap[i]
}));

function localizeCity(city, locale) {
  if (!city) return null;
  const loc = locale || getLocale();
  return {
    ...city,
    name: pickLocale(city.name, loc),
    description: pickLocale(city.description, loc)
  };
}

function getCityIndexGroups(locale) {
  const loc = locale || getLocale();
  const groups = {};
  cities.forEach(city => {
    const letter = city.initial;
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(localizeCity(city, loc));
  });
  return Object.keys(groups).sort().map(letter => ({
    letter,
    cities: groups[letter]
  }));
}

function getCityById(id, locale) {
  const city = cities.find(c => c.id === id);
  return localizeCity(city, locale);
}

function getCityByName(name, locale) {
  const loc = locale || getLocale();
  const city = cities.find(c => {
    const zh = pickLocale(c.name, 'zh-CN');
    const en = pickLocale(c.name, 'en-US');
    return name === zh || name === en || name.includes(zh) || name.includes(en);
  });
  return localizeCity(city, loc);
}

function getHotCities(limit = 8, locale) {
  return cities.slice(0, limit).map(c => localizeCity(c, locale));
}

module.exports = {
  cities,
  localizeCity,
  getCityIndexGroups,
  getCityById,
  getCityByName,
  getHotCities
};
