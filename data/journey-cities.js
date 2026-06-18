/**
 * 启程指引 - 目的地城市数据（热门城市 + 湖北 Demo 城市）
 */
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');
const { cities: demoCities } = require('./cities.js');

const HOT_CITY_NAMES = [
  '北京', '苏州', '成都', '西安', '杭州', '广州', '泉州', '景德镇'
];

const HOT_CITY_META = {
  北京: {
    pinyin: 'beijing',
    initial: 'B',
    description: {
      'zh-CN': '千年古都，京剧、景泰蓝等传统艺术荟萃之地。',
      'en-US': 'Ancient capital home to Peking Opera, cloisonné, and countless heritage crafts.'
    }
  },
  苏州: {
    pinyin: 'suzhou',
    initial: 'S',
    description: {
      'zh-CN': '江南园林之城，苏绣、昆曲等非遗源远流长。',
      'en-US': 'City of classical gardens, famed for Su embroidery and Kunqu Opera.'
    }
  },
  成都: {
    pinyin: 'chengdu',
    initial: 'C',
    description: {
      'zh-CN': '天府之国，蜀绣、川剧变脸等巴蜀文化独具魅力。',
      'en-US': 'Land of abundance, celebrated for Shu embroidery and Sichuan opera.'
    }
  },
  西安: {
    pinyin: 'xian',
    initial: 'X',
    description: {
      'zh-CN': '十三朝古都，秦腔、凤翔泥塑等西北非遗底蕴深厚。',
      'en-US': 'Historic capital of thirteen dynasties, rich in Qinqiang opera and folk crafts.'
    }
  },
  杭州: {
    pinyin: 'hangzhou',
    initial: 'H',
    description: {
      'zh-CN': '西湖之滨，龙井茶制作、越剧等江南文化名片。',
      'en-US': 'Beside West Lake, known for Longjing tea craft and Yue opera.'
    }
  },
  广州: {
    pinyin: 'guangzhou',
    initial: 'G',
    description: {
      'zh-CN': '岭南文化中心，粤剧、广绣等南派非遗精彩纷呈。',
      'en-US': 'Heart of Lingnan culture, home to Cantonese opera and Guang embroidery.'
    }
  },
  泉州: {
    pinyin: 'quanzhou',
    initial: 'Q',
    description: {
      'zh-CN': '海上丝绸之路起点，南音、木偶戏等非遗活态传承。',
      'en-US': 'Maritime Silk Road gateway, preserving Nanyin music and puppet theatre.'
    }
  },
  景德镇: {
    pinyin: 'jingdezhen',
    initial: 'J',
    description: {
      'zh-CN': '千年瓷都，手工制瓷技艺享誉世界。',
      'en-US': 'The porcelain capital, where hand-crafted ceramics shine worldwide.'
    }
  }
};

const EN_NAMES = {
  北京: 'Beijing',
  苏州: 'Suzhou',
  成都: 'Chengdu',
  西安: "Xi'an",
  杭州: 'Hangzhou',
  广州: 'Guangzhou',
  泉州: 'Quanzhou',
  景德镇: 'Jingdezhen'
};

const PLACEHOLDER_COVER = '/images/city/city-1.png';

function buildHotCities() {
  return HOT_CITY_NAMES.map((zhName, index) => {
    const meta = HOT_CITY_META[zhName];
    return {
      id: 100 + index,
      name: { 'zh-CN': zhName, 'en-US': EN_NAMES[zhName] || zhName },
      pinyin: meta.pinyin,
      initial: meta.initial,
      description: meta.description,
      heritageCount: 0,
      cover: PLACEHOLDER_COVER,
      isHot: true
    };
  });
}

const hotCities = buildHotCities();

const allJourneyCities = [
  ...hotCities,
  ...demoCities.map(c => ({ ...c, isHot: false }))
];

function localizeJourneyCity(city, locale) {
  if (!city) return null;
  const loc = locale || getLocale();
  return {
    ...city,
    name: pickLocale(city.name, loc),
    description: pickLocale(city.description, loc)
  };
}

function getJourneyHotCities(locale) {
  return hotCities.map(c => localizeJourneyCity(c, locale));
}

function getAllJourneyCities(locale) {
  return allJourneyCities.map(c => localizeJourneyCity(c, locale));
}

function searchJourneyCities(keyword, locale) {
  const raw = (keyword || '').trim();
  if (!raw) return [];
  const kwLower = raw.toLowerCase();
  const loc = locale || getLocale();
  return allJourneyCities
    .filter(city => {
      const zh = pickLocale(city.name, 'zh-CN');
      const en = pickLocale(city.name, 'en-US');
      const pinyin = (city.pinyin || '').toLowerCase();
      return (
        zh.includes(raw) ||
        en.toLowerCase().includes(kwLower) ||
        pinyin.includes(kwLower) ||
        (city.initial || '').toLowerCase() === kwLower
      );
    })
    .slice(0, 8)
    .map(c => localizeJourneyCity(c, loc));
}

function findJourneyCityByName(name, locale) {
  const loc = locale || getLocale();
  const city = allJourneyCities.find(c => {
    const zh = pickLocale(c.name, 'zh-CN');
    const en = pickLocale(c.name, 'en-US');
    return name === zh || name === en || zh.includes(name) || name.includes(zh);
  });
  return localizeJourneyCity(city, loc);
}

module.exports = {
  hotCities,
  allJourneyCities,
  getJourneyHotCities,
  getAllJourneyCities,
  searchJourneyCities,
  findJourneyCityByName
};
