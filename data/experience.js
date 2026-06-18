/**
 * 线下体验场馆数据（官方预约跳转）
 */
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');

const RAW = [
  {
    id: 1,
    heritageId: 1,
    title: { 'zh-CN': '武汉汉剧院', 'en-US': 'Wuhan Han Opera Theatre' },
    city: { 'zh-CN': '武汉', 'en-US': 'Wuhan' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/hanju.jpg',
    description: {
      'zh-CN': '沉浸式观赏汉剧经典剧目，感受楚韵戏曲魅力。',
      'en-US': 'Watch classic Han Opera performances and feel the charm of Chu culture.'
    },
    openTime: '09:00-17:00',
    reservationType: 'qr',
    qrCode: '/images/experience/qr-1.png',
    qrTargetUrl: 'https://mp.weixin.qq.com/s/Vi866lupZTrWBF2izZr_pw',
    officialMiniProgram: '武汉汉剧院',
    officialWebsite: '',
    notice: {
      'zh-CN': '请提前预约，演出场次以官方公告为准。',
      'en-US': 'Please book in advance. Show times are subject to official announcements.'
    },
    hot: true
  },
  {
    id: 2,
    heritageId: 1,
    title: { 'zh-CN': '武昌紫阳湖公园非遗工坊', 'en-US': 'Ziyang Lake Heritage Workshop' },
    city: { 'zh-CN': '武汉', 'en-US': 'Wuhan' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/hanju.jpg',
    description: {
      'zh-CN': '周末汉剧体验课，适合亲子与文化爱好者参与。',
      'en-US': 'Weekend Han Opera workshops for families and culture enthusiasts.'
    },
    openTime: '10:00-16:00',
    reservationType: 'mini',
    qrCode: '',
    officialMiniProgram: '武汉文旅通',
    officialWebsite: '',
    notice: {
      'zh-CN': '体验名额有限，请通过官方小程序预约。',
      'en-US': 'Limited spots available. Book via the official mini program.'
    },
    hot: false
  },
  {
    id: 3,
    heritageId: 2,
    title: { 'zh-CN': '恩施土家摆手舞文化中心', 'en-US': 'Enshi Tujia Dance Culture Center' },
    city: { 'zh-CN': '恩施', 'en-US': 'Enshi' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/baishou.jpg',
    description: {
      'zh-CN': '跟随传承人学跳摆手舞，体验土家族节庆氛围。',
      'en-US': 'Learn hand-waving dance from inheritors in a festive Tujia atmosphere.'
    },
    openTime: '09:00-17:30',
    reservationType: 'qr',
    qrCode: '/images/experience/qr-3.png',
    qrTargetUrl: 'https://www.dahepiao.com/jingqulvyou1/20220722286307.html',
    officialMiniProgram: '',
    officialWebsite: '恩施土司城官方票务',
    notice: {
      'zh-CN': '节庆期间人流较大，建议提前预约。',
      'en-US': 'Crowds are larger during festivals. Early booking is recommended.'
    },
    hot: true
  },
  {
    id: 4,
    heritageId: 3,
    title: { 'zh-CN': '黄梅戏大剧院', 'en-US': 'Huangmei Opera Grand Theatre' },
    city: { 'zh-CN': '黄冈', 'en-US': 'Huanggang' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/huangmei.jpg',
    description: {
      'zh-CN': '沉浸式感受黄梅戏艺术，可观赏经典剧目演出。',
      'en-US': 'Experience Huangmei Opera with performances of beloved classics.'
    },
    openTime: '09:00-17:00',
    reservationType: 'qr',
    qrCode: '/images/experience/qr-4.png',
    qrTargetUrl: 'https://m.dahepiao.com/venue/venue_90438.html',
    officialMiniProgram: '',
    officialWebsite: '大河票务·黄梅戏大剧院',
    notice: {
      'zh-CN': '请遵守场馆规定，演出期间请勿拍照录像。',
      'en-US': 'Please follow venue rules. No photos or videos during performances.'
    },
    hot: true
  },
  {
    id: 5,
    heritageId: 4,
    title: { 'zh-CN': '恩施西兰卡普织锦工坊', 'en-US': 'Enshi Brocade Weaving Workshop' },
    city: { 'zh-CN': '恩施', 'en-US': 'Enshi' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/xilan.jpg',
    description: {
      'zh-CN': '亲手体验土家织锦技艺，了解西兰卡普纹样故事。',
      'en-US': 'Try Tujia brocade weaving and discover Xilan Kapu pattern stories.'
    },
    openTime: '09:30-17:00',
    reservationType: 'website',
    qrCode: '',
    officialMiniProgram: '',
    officialWebsite: 'https://www.enshi.gov.cn/',
    notice: {
      'zh-CN': '织锦体验需提前预约，请遵守工坊规定。',
      'en-US': 'Weaving workshops require advance booking. Please follow workshop rules.'
    },
    hot: true
  },
  {
    id: 6,
    heritageId: 5,
    title: { 'zh-CN': '武当山非遗传习馆', 'en-US': 'Wudang Heritage Training Hall' },
    city: { 'zh-CN': '十堰', 'en-US': 'Shiyan' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/wudang.jpg',
    description: {
      'zh-CN': '跟随道长体验武当武术与养生功法，感受道家文化。',
      'en-US': 'Practice Wudang martial arts and wellness routines with local masters.'
    },
    openTime: '08:00-17:30',
    reservationType: 'mini',
    qrCode: '',
    officialMiniProgram: '武当山智慧旅游',
    officialWebsite: '',
    notice: {
      'zh-CN': '山上气温较低，请穿着舒适运动服装。',
      'en-US': 'Mountain temperatures are cooler. Wear comfortable athletic clothing.'
    },
    hot: true
  },
  {
    id: 7,
    heritageId: 5,
    title: { 'zh-CN': '武当山游客中心文化体验区', 'en-US': 'Wudang Visitor Center Experience Zone' },
    city: { 'zh-CN': '十堰', 'en-US': 'Shiyan' },
    province: { 'zh-CN': '湖北', 'en-US': 'Hubei' },
    cover: '/images/heritage/wudang.jpg',
    description: {
      'zh-CN': '短期太极体验课程，适合初次接触武当武术的游客。',
      'en-US': 'Short Tai Chi sessions ideal for first-time visitors to Wudang arts.'
    },
    openTime: '09:00-16:00',
    reservationType: 'qr',
    qrCode: '/images/experience/qr-7.png',
    qrTargetUrl: 'http://syiptv.com/article/show/258974',
    officialMiniProgram: '武当山智慧旅游',
    officialWebsite: '',
    notice: {
      'zh-CN': '体验课每日名额有限，建议提前预约。',
      'en-US': 'Daily class spots are limited. Early booking is recommended.'
    },
    hot: false
  }
];

function localizeExperience(item, locale) {
  if (!item) return null;
  const loc = locale || getLocale();
  return {
    id: item.id,
    heritageId: item.heritageId,
    title: pickLocale(item.title, loc),
    city: pickLocale(item.city, loc),
    province: pickLocale(item.province, loc),
    location: `${pickLocale(item.city, loc)} · ${pickLocale(item.province, loc)}`,
    cover: item.cover,
    description: pickLocale(item.description, loc),
    openTime: item.openTime,
    reservationType: item.reservationType,
    qrCode: item.qrCode,
    qrTargetUrl: item.qrTargetUrl || '',
    officialMiniProgram: item.officialMiniProgram,
    officialWebsite: item.officialWebsite,
    notice: pickLocale(item.notice, loc),
    hot: !!item.hot
  };
}

function getExperienceById(id, locale) {
  const item = RAW.find(e => e.id === id);
  return localizeExperience(item, locale);
}

function getExperiencesByHeritageId(heritageId, locale) {
  return RAW
    .filter(e => e.heritageId === heritageId)
    .map(e => localizeExperience(e, locale));
}

function getHotExperiences(limit = 5, locale) {
  const hot = RAW.filter(e => e.hot);
  const list = hot.length >= limit ? hot : RAW;
  return list.slice(0, limit).map(e => localizeExperience(e, locale));
}

module.exports = {
  getExperienceById,
  getExperiencesByHeritageId,
  getHotExperiences,
  localizeExperience
};
