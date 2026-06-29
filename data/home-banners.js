/**
 * 首页轮播图（5 张）— 主包资源，真机 Tab 页可立即加载
 */
const HOME_BANNERS = [
  {
    id: 1,
    image: '/images/home-banners/home-banner-cizhi.jpg',
    targetId: 78,
    name: '景德镇手工制瓷技艺'
  },
  {
    id: 2,
    image: '/images/home-banners/home-banner-xilan.jpg',
    targetId: 4,
    name: '西兰卡普'
  },
  {
    id: 3,
    image: '/images/home-banners/home-banner-shuxiu.jpg',
    targetId: 56,
    name: '蜀绣'
  },
  {
    id: 4,
    image: '/images/home-banners/home-banner-guyue.jpg',
    targetId: 32,
    name: '西安鼓乐'
  },
  {
    id: 5,
    image: '/images/home-banners/home-banner-tuerye.jpg',
    targetId: 8,
    name: '兔儿爷彩绘'
  }
];

function getHomeBanners() {
  return HOME_BANNERS;
}

module.exports = {
  HOME_BANNERS,
  getHomeBanners
};
