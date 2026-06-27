/**
 * 首页固定轮播图（5 张）
 * 顺序：兔儿爷 → 西安鼓乐 → 蜀绣 → 西兰卡普 → 制瓷技艺
 */
const HOME_BANNERS = [
  {
    id: 1,
    image: '/images/banner/banner-slide-1.png',
    targetId: 8
  },
  {
    id: 2,
    image: '/images/banner/banner-slide-2.png',
    targetId: 32
  },
  {
    id: 3,
    image: '/images/banner/banner-slide-3.png',
    targetId: 56
  },
  {
    id: 4,
    image: '/images/banner/banner-slide-4.png',
    targetId: 4
  },
  {
    id: 5,
    image: '/images/banner/banner-slide-5.png',
    targetId: 78
  }
];

function getHomeBanners() {
  return HOME_BANNERS;
}

module.exports = {
  HOME_BANNERS,
  getHomeBanners
};
