/**
 * 省级详图（支持图片点击选城）
 */
const PROVINCE_MAPS = {
  hubei: {
    image: '/package-onboarding/images/maps/hubei-map.png',
    cities: [
      { name: '武汉', marker: { x: 58, y: 42, radius: 9 } },
      { name: '黄冈', marker: { x: 72, y: 48, radius: 8 } },
      { name: '恩施', marker: { x: 32, y: 58, radius: 8 } },
      { name: '十堰', marker: { x: 38, y: 28, radius: 8 } },
      { name: '宜昌', marker: { x: 48, y: 52, radius: 7 } },
      { name: '襄阳', marker: { x: 52, y: 35, radius: 7 } }
    ]
  }
};

function getProvinceMap(code) {
  return PROVINCE_MAPS[code] || null;
}

function hasProvinceMap(code) {
  return !!PROVINCE_MAPS[code];
}

function findCityAtPoint(code, xPct, yPct) {
  const map = PROVINCE_MAPS[code];
  if (!map) return null;

  let matched = null;
  let matchedDist = Infinity;

  map.cities.forEach(city => {
    const dx = city.marker.x - xPct;
    const dy = city.marker.y - yPct;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = city.marker.radius || 8;
    if (dist <= radius && dist < matchedDist) {
      matchedDist = dist;
      matched = city.name;
    }
  });

  if (matched) return matched;

  let nearest = null;
  let nearestDist = Infinity;
  map.cities.forEach(city => {
    const dx = city.marker.x - xPct;
    const dy = city.marker.y - yPct;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = city.name;
    }
  });

  return nearest && nearestDist <= 16 ? nearest : null;
}

module.exports = {
  PROVINCE_MAPS,
  getProvinceMap,
  hasProvinceMap,
  findCityAtPoint
};
