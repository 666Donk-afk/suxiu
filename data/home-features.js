/**
 * 首页功能入口（1×4 网格）
 */
const { t, getLocale } = require('../i18n.js');

const FEATURE_KEYS = [
  { key: 'reservation', icon: '约', iconImage: '/images/features/feature-reservation.png' },
  { key: 'museum', icon: '馆', iconImage: '/images/features/feature-museum.png' },
  { key: 'guide', icon: 'AI', iconImage: '/images/features/feature-guide.png' },
  { key: 'tour', icon: '游', iconImage: '/images/features/feature-tour.png' }
];

function getHomeFeatures(locale) {
  const loc = locale || getLocale();
  return FEATURE_KEYS.map(item => ({
    key: item.key,
    icon: item.icon,
    iconImage: item.iconImage,
    label: t(`home.features.${item.key}`, loc)
  }));
}

module.exports = {
  FEATURE_KEYS,
  getHomeFeatures
};
