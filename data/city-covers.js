/**
 * 城市封面图（用于图片卡片选择）
 */
const DEMO_COVERS = {
  武汉: '/images/heritage/hanju.jpg',
  恩施: '/images/heritage/baishou.jpg',
  黄冈: '/images/heritage/huangmei.jpg',
  十堰: '/images/heritage/wudang.jpg',
  北京: '/images/city/city-1.png',
  苏州: '/images/city/city-2.png',
  成都: '/images/city/city-3.png',
  西安: '/images/city/city-4.png',
  杭州: '/images/city/city-5.png',
  广州: '/images/city/city-1.png',
  泉州: '/images/city/city-2.png',
  景德镇: '/images/city/city-3.png',
  南京: '/images/city/city-2.png',
  扬州: '/images/city/city-2.png',
  上海: '/images/city/city-5.png'
};

const DEFAULT_COVER = '/images/city/city-1.png';

function getCityCover(cityName) {
  return DEMO_COVERS[cityName] || DEFAULT_COVER;
}

function buildCityCards(cityNames) {
  return (cityNames || []).map(name => ({
    name,
    cover: getCityCover(name)
  }));
}

module.exports = {
  getCityCover,
  buildCityCards,
  DEMO_COVERS
};
