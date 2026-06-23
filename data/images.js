/** 本地图片路径（轻量列表 + 分包资源） */
const listData = require('./heritage-list.js');

const covers = listData.map(item => item.cover).filter(Boolean);
const uniqueCovers = [...new Set(covers)];

module.exports = {
  logo: '/images/brand/logo.png',
  banners: [
    '/package-media-a/images/banners/banner-1.jpg',
    '/package-media-a/images/banners/banner-2.jpg',
    '/package-media-a/images/banners/banner-3.jpg'
  ],
  cities: Object.fromEntries(
    listData.slice(0, 20).map(item => [item.slug, item.cover])
  ),
  heritages: Object.fromEntries(
    listData.map(item => [item.slug, item.cover])
  ),
  defaultHeritage: covers[0] || '/package-media-a/images/heritage/hanju.jpg',
  avatar: covers[0] || '/package-media-a/images/heritage/hanju.jpg'
};
