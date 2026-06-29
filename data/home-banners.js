/**
 * 首页轮播图（5 张）— 静态封面，不依赖 heritage-list
 */
const HOME_BANNERS = [
  { id: 1, image: '/package-media-a/images/heritage/h-c657b18e84.jpg', targetId: 8 },
  { id: 2, image: '/package-media-b/images/heritage/h-966c697510.jpg', targetId: 32 },
  { id: 3, image: '/package-media-a/images/heritage/h-2eae71a111.jpg', targetId: 56 },
  { id: 4, image: '/package-media-a/images/heritage/xilan.jpg', targetId: 4 },
  { id: 5, image: '/package-media-a/images/heritage/h-d839179aad.jpg', targetId: 78 }
];

function getHomeBanners() {
  return HOME_BANNERS;
}

module.exports = {
  HOME_BANNERS,
  getHomeBanners
};
