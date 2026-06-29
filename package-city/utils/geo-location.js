const mapConfig = require('../../config/map.js');
const { cities, getCityByName } = require('../../data/cities');
const { pickLocale } = require('../../i18n/locale-field.js');

const PLACE_COORDS = {
  北京: [39.9042, 116.4074],
  东城: [39.9289, 116.4164],
  西城: [39.9123, 116.3661],
  朝阳: [39.9219, 116.4435],
  天津: [39.0842, 117.2009],
  南开: [39.1382, 117.1507],
  杨柳青: [39.1397, 117.0064],
  上海: [31.2304, 121.4737],
  静安: [31.2288, 121.4482],
  嘉定: [31.3756, 121.2653],
  松江: [31.0322, 121.2277],
  苏州: [31.2989, 120.5853],
  昆山: [31.3856, 120.9807],
  南京: [32.0603, 118.7969],
  无锡: [31.4912, 120.3119],
  杭州: [30.2741, 120.1551],
  绍兴: [30.0303, 120.5802],
  金华: [29.0784, 119.6495],
  丽水: [28.4676, 119.9229],
  宁波: [29.8683, 121.544],
  温州: [28.0006, 120.6994],
  嘉兴: [30.7461, 120.7555],
  合肥: [31.8206, 117.2272],
  芜湖: [31.3529, 118.4329],
  黄山: [29.7147, 118.3375],
  宣城: [30.9407, 118.7588],
  滁州: [32.3018, 118.3171],
  福州: [26.0745, 119.2965],
  厦门: [24.4798, 118.0894],
  泉州: [24.8741, 118.6757],
  南平: [26.6418, 118.1777],
  宁德: [26.6656, 119.5479],
  南昌: [28.682, 115.8579],
  九江: [29.7051, 115.9928],
  赣州: [25.8311, 114.9348],
  抚州: [27.9492, 116.3582],
  景德镇: [29.2687, 117.1784],
  济南: [36.6512, 117.1201],
  青岛: [36.0671, 120.3826],
  济宁: [35.4149, 116.5872],
  淄博: [36.8135, 118.0549],
  威海: [37.5131, 122.1206],
  郑州: [34.7466, 113.6254],
  洛阳: [34.6197, 112.454],
  鹤壁: [35.7482, 114.2973],
  武汉: [30.5928, 114.3055],
  黄冈: [30.4539, 114.8724],
  恩施: [30.2722, 109.4882],
  十堰: [32.6294, 110.7879],
  长沙: [28.2282, 112.9388],
  浏阳: [28.1639, 113.6433],
  永州: [26.4204, 111.6134],
  广州: [23.1291, 113.2644],
  佛山: [23.0218, 113.1219],
  南海: [23.0288, 113.1434],
  深圳: [22.5431, 114.0579],
  南宁: [22.817, 108.3665],
  梧州: [23.4769, 111.2791],
  钦州: [21.9797, 108.6544],
  海口: [20.044, 110.1999],
  五指山: [18.7769, 109.5167],
  成都: [30.5728, 104.0668],
  重庆: [29.563, 106.5516],
  铜梁: [29.8399, 106.0564],
  梁平: [30.6542, 107.7698],
  石柱: [30.0005, 108.1124],
  昆明: [25.0389, 102.7183],
  大理: [25.6065, 100.2676],
  德宏: [24.4334, 98.5784],
  红河: [23.3631, 103.3748],
  普洱: [22.8251, 100.966],
  贵阳: [26.647, 106.6302],
  丹寨: [26.1995, 107.7922],
  黎平: [26.2304, 109.1365],
  雷山: [26.3819, 108.0775],
  西安: [34.3416, 108.9398],
  兰州: [36.0611, 103.8343],
  庆阳: [35.7091, 107.6434],
  环县: [36.5686, 107.3088],
  西宁: [36.6171, 101.7782],
  同仁: [35.5166, 102.0151],
  互助: [36.8399, 101.9567],
  海南州: [36.2804, 100.6196],
  海东: [36.502, 102.1043],
  乌鲁木齐: [43.8256, 87.6168],
  和田: [37.1142, 79.9225],
  喀什: [39.4704, 75.9898],
  阿勒泰: [47.8489, 88.1387],
  拉萨: [29.652, 91.1721],
  尼木: [29.4316, 90.1655],
  山南: [29.2371, 91.7731],
  日喀则: [29.267, 88.8806],
  拉孜: [29.0816, 87.6374],
  昌都: [31.1406, 97.1785],
  呼和浩特: [40.8426, 111.7492],
  锡林郭勒: [43.9333, 116.0476],
  兴安盟: [46.0763, 122.0703],
  哈尔滨: [45.8038, 126.535],
  佳木斯: [46.8096, 130.3188],
  黑河: [50.245, 127.5285],
  沈阳: [41.8057, 123.4315],
  鞍山: [41.1087, 122.9946],
  抚顺: [41.8809, 123.9572],
  四平: [43.1664, 124.3505],
  长春: [43.8171, 125.3235],
  太原: [37.8706, 112.5489],
  晋中: [37.687, 112.7528],
  运城: [35.0264, 111.0075],
  保定: [38.874, 115.4646],
  沧州: [38.3045, 116.8388],
  唐山: [39.6309, 118.1802],
  石家庄: [38.0428, 114.5149],
  邯郸: [36.6256, 114.5391],
  固原: [36.0159, 106.2425],
  银川: [38.4872, 106.2309],
  石嘴山: [39.0182, 106.3833],
  酒泉: [39.744, 98.5108],
  肃州: [39.7451, 98.5077],
  阿坝: [31.8994, 102.2247],
  茂县: [31.6818, 103.8537],
  安顺: [26.2537, 105.9462],
  西秀: [26.2456, 105.965],
  昌江: [19.2609, 109.0557],
  保突: [19.2609, 109.0557],
  嘎玛: [31.1406, 97.1785],
  淮阳: [33.7316, 114.886],
  太昊陵: [33.7316, 114.886],
  潮汕: [23.354, 116.682],
  延边: [42.9047, 129.5091],
  台湾: [25.033, 121.5654],
  台北: [25.033, 121.5654],
  香港: [22.3193, 114.1694],
  澳门: [22.1987, 113.5439]
};

const PROVINCE_COORDS = {
  北京: [39.9042, 116.4074],
  天津: [39.0842, 117.2009],
  上海: [31.2304, 121.4737],
  重庆: [29.563, 106.5516],
  河北: [38.0428, 114.5149],
  山西: [37.8706, 112.5489],
  辽宁: [41.8057, 123.4315],
  吉林: [43.8171, 125.3235],
  黑龙江: [45.8038, 126.535],
  江苏: [32.0603, 118.7969],
  浙江: [30.2741, 120.1551],
  安徽: [31.8206, 117.2272],
  福建: [26.0745, 119.2965],
  江西: [28.682, 115.8579],
  山东: [36.6512, 117.1201],
  河南: [34.7466, 113.6254],
  湖北: [30.5928, 114.3055],
  湖南: [28.2282, 112.9388],
  广东: [23.1291, 113.2644],
  广西: [22.817, 108.3665],
  海南: [20.044, 110.1999],
  四川: [30.5728, 104.0668],
  贵州: [26.647, 106.6302],
  云南: [25.0389, 102.7183],
  西藏: [29.652, 91.1721],
  陕西: [34.3416, 108.9398],
  甘肃: [36.0611, 103.8343],
  青海: [36.6171, 101.7782],
  宁夏: [38.4872, 106.2309],
  新疆: [43.8256, 87.6168],
  内蒙古: [40.8426, 111.7492],
  台湾: [25.033, 121.5654],
  香港: [22.3193, 114.1694],
  澳门: [22.1987, 113.5439]
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function resolvePlaceCoords(zhName, province) {
  if (PLACE_COORDS[zhName]) return PLACE_COORDS[zhName];

  let best = null;
  let bestLen = 0;
  Object.keys(PLACE_COORDS).forEach(key => {
    if (zhName.includes(key) && key.length > bestLen) {
      bestLen = key.length;
      best = PLACE_COORDS[key];
    }
  });
  if (best) return best;

  if (province && PROVINCE_COORDS[province]) return PROVINCE_COORDS[province];
  return null;
}

function findNearestAppCity(latitude, longitude) {
  let nearest = null;
  let minDist = Infinity;

  cities.forEach(city => {
    const zhName = pickLocale(city.name, 'zh-CN');
    const province = pickLocale(city.province, 'zh-CN');
    const coords = resolvePlaceCoords(zhName, province);
    if (!coords) return;
    const dist = haversineKm(latitude, longitude, coords[0], coords[1]);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  });

  return nearest;
}

function normalizeGeocodeCityName(name) {
  if (!name) return '';
  return String(name)
    .replace(/(特别行政区|自治州|自治县|地区|市|区|县|盟)$/g, '')
    .trim();
}

function matchAppCityByName(rawName, locale) {
  if (!rawName) return null;
  const loc = locale || 'zh-CN';
  const candidates = [
    rawName,
    normalizeGeocodeCityName(rawName),
    rawName.replace(/市$/, ''),
    normalizeGeocodeCityName(rawName) + '市'
  ].filter(Boolean);

  for (let i = 0; i < candidates.length; i += 1) {
    const city = getCityByName(candidates[i], loc);
    if (city) return city;
  }
  return null;
}

function requestLocation() {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      highAccuracyExpireTime: 4000,
      success: resolve,
      fail: reject
    });
  });
}

function reverseGeocodeByTencent(latitude, longitude) {
  const key = mapConfig.tencentMapKey;
  if (!key) return Promise.resolve(null);

  return new Promise(resolve => {
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key,
        get_poi: 0
      },
      success(res) {
        const comp = res.data && res.data.result && res.data.result.address_component;
        if (!comp) {
          resolve(null);
          return;
        }
        resolve(comp.city || comp.district || comp.province || '');
      },
      fail() {
        resolve(null);
      }
    });
  });
}

function resolveLocatedCity(latitude, longitude, locale) {
  return reverseGeocodeByTencent(latitude, longitude).then(geoName => {
    if (geoName) {
      const matched = matchAppCityByName(geoName, locale);
      if (matched) return matched;
    }
    return findNearestAppCity(latitude, longitude);
  });
}

function getCurrentLocatedCity(locale) {
  return requestLocation().then(({ latitude, longitude }) =>
    resolveLocatedCity(latitude, longitude, locale)
  );
}

module.exports = {
  getCurrentLocatedCity,
  findNearestAppCity,
  matchAppCityByName
};
