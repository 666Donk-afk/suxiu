/**
 * 省份数据（地图标记点 + 非遗 Mock）
 * marker.x / marker.y：地图图片上的百分比坐标（针尖落点）
 * marker.radius：可点击半径（百分比）
 */
const { pickLocale } = require('../i18n/locale-field.js');
const { getLocale } = require('../i18n.js');

const RAW = [
  { code: 'xinjiang', name: { 'zh-CN': '新疆', 'en-US': 'Xinjiang' }, heritageCount: 94, hotCities: ['乌鲁木齐', '喀什', '伊犁'], heritageDirections: ['木卡姆', '艾德莱斯绸', '玛纳斯'], marker: { x: 34, y: 26, radius: 14 } },
  { code: 'xizang', name: { 'zh-CN': '西藏', 'en-US': 'Tibet' }, heritageCount: 89, hotCities: ['拉萨', '日喀则', '林芝'], heritageDirections: ['藏戏', '唐卡', '热巴舞'], marker: { x: 31, y: 50, radius: 12 } },
  { code: 'neimenggu', name: { 'zh-CN': '内蒙古', 'en-US': 'Inner Mongolia' }, heritageCount: 78, hotCities: ['呼和浩特', '包头', '鄂尔多斯'], heritageDirections: ['蒙古族长调', '马头琴', '那达慕'], marker: { x: 54, y: 18, radius: 16 } },
  { code: 'heilongjiang', name: { 'zh-CN': '黑龙江', 'en-US': 'Heilongjiang' }, heritageCount: 42, hotCities: ['哈尔滨', '齐齐哈尔', '牡丹江'], heritageDirections: ['二人转', '赫哲鱼皮画', '满族刺绣'], marker: { x: 83, y: 15, radius: 9 } },
  { code: 'jilin', name: { 'zh-CN': '吉林', 'en-US': 'Jilin' }, heritageCount: 38, hotCities: ['长春', '吉林', '延边'], heritageDirections: ['朝鲜族农乐舞', '二人转', '满族剪纸'], marker: { x: 80, y: 26, radius: 8 } },
  { code: 'liaoning', name: { 'zh-CN': '辽宁', 'en-US': 'Liaoning' }, heritageCount: 56, hotCities: ['沈阳', '大连', '鞍山'], heritageDirections: ['皮影戏', '满族刺绣', '东北大鼓'], marker: { x: 77, y: 32, radius: 8 } },
  { code: 'beijing', name: { 'zh-CN': '北京', 'en-US': 'Beijing' }, heritageCount: 126, hotCities: ['北京'], heritageDirections: ['京剧', '景泰蓝', '雕漆'], marker: { x: 71, y: 34, radius: 5 } },
  { code: 'tianjin', name: { 'zh-CN': '天津', 'en-US': 'Tianjin' }, heritageCount: 47, hotCities: ['天津'], heritageDirections: ['杨柳青木版年画', '相声', '泥人张'], marker: { x: 73, y: 36, radius: 4 } },
  { code: 'hebei', name: { 'zh-CN': '河北', 'en-US': 'Hebei' }, heritageCount: 167, hotCities: ['石家庄', '保定', '承德'], heritageDirections: ['河北梆子', '武强年画', '皮影戏'], marker: { x: 70, y: 38, radius: 9 } },
  { code: 'shanxi', name: { 'zh-CN': '山西', 'en-US': 'Shanxi' }, heritageCount: 182, hotCities: ['太原', '大同', '平遥'], heritageDirections: ['晋剧', '剪纸', '推光漆器'], marker: { x: 65, y: 39, radius: 8 } },
  { code: 'shandong', name: { 'zh-CN': '山东', 'en-US': 'Shandong' }, heritageCount: 186, hotCities: ['济南', '青岛', '曲阜'], heritageDirections: ['京剧', '潍坊风筝', '鲁绣'], marker: { x: 76, y: 42, radius: 9 } },
  { code: 'henan', name: { 'zh-CN': '河南', 'en-US': 'Henan' }, heritageCount: 125, hotCities: ['郑州', '洛阳', '开封'], heritageDirections: ['豫剧', '朱仙镇年画', '钧瓷'], marker: { x: 67, y: 45, radius: 8 } },
  { code: 'shaanxi', name: { 'zh-CN': '陕西', 'en-US': 'Shaanxi' }, heritageCount: 87, hotCities: ['西安', '延安', '宝鸡'], heritageDirections: ['秦腔', '凤翔泥塑', '陕北民歌'], marker: { x: 61, y: 45, radius: 8 } },
  { code: 'gansu', name: { 'zh-CN': '甘肃', 'en-US': 'Gansu' }, heritageCount: 83, hotCities: ['兰州', '敦煌', '天水'], heritageDirections: ['花儿', '敦煌壁画', '洮砚'], marker: { x: 49, y: 41, radius: 10 } },
  { code: 'qinghai', name: { 'zh-CN': '青海', 'en-US': 'Qinghai' }, heritageCount: 97, hotCities: ['西宁', '玉树', '格尔木'], heritageDirections: ['花儿', '热贡艺术', '藏戏'], marker: { x: 42, y: 45, radius: 10 } },
  { code: 'ningxia', name: { 'zh-CN': '宁夏', 'en-US': 'Ningxia' }, heritageCount: 28, hotCities: ['银川', '中卫', '固原'], heritageDirections: ['花儿', '剪纸', '回族器乐'], marker: { x: 57, y: 43, radius: 5 } },
  { code: 'hubei', name: { 'zh-CN': '湖北', 'en-US': 'Hubei' }, heritageCount: 83, hotCities: ['武汉', '恩施', '黄冈'], heritageDirections: ['汉剧', '黄梅戏', '武当武术'], marker: { x: 66, y: 53, radius: 8 } },
  { code: 'hunan', name: { 'zh-CN': '湖南', 'en-US': 'Hunan' }, heritageCount: 70, hotCities: ['长沙', '张家界', '凤凰'], heritageDirections: ['湘绣', '花鼓戏', '土家族摆手舞'], marker: { x: 64, y: 59, radius: 8 } },
  { code: 'jiangxi', name: { 'zh-CN': '江西', 'en-US': 'Jiangxi' }, heritageCount: 68, hotCities: ['南昌', '景德镇', '婺源'], heritageDirections: ['景德镇陶瓷', '采茶戏', '婺源三雕'], marker: { x: 69, y: 57, radius: 8 } },
  { code: 'anhui', name: { 'zh-CN': '安徽', 'en-US': 'Anhui' }, heritageCount: 72, hotCities: ['合肥', '黄山', '安庆'], heritageDirections: ['黄梅戏', '徽墨', '宣纸'], marker: { x: 71, y: 52, radius: 7 } },
  { code: 'jiangsu', name: { 'zh-CN': '江苏', 'en-US': 'Jiangsu' }, heritageCount: 162, hotCities: ['苏州', '南京', '扬州'], heritageDirections: ['苏绣', '昆曲', '缂丝'], marker: { x: 74, y: 50, radius: 7 } },
  { code: 'shanghai', name: { 'zh-CN': '上海', 'en-US': 'Shanghai' }, heritageCount: 55, hotCities: ['上海'], heritageDirections: ['沪剧', '顾绣', '江南丝竹'], marker: { x: 76, y: 52, radius: 4 } },
  { code: 'zhejiang', name: { 'zh-CN': '浙江', 'en-US': 'Zhejiang' }, heritageCount: 241, hotCities: ['杭州', '宁波', '绍兴'], heritageDirections: ['越剧', '龙泉青瓷', '西湖绸伞'], marker: { x: 75, y: 56, radius: 7 } },
  { code: 'fujian', name: { 'zh-CN': '福建', 'en-US': 'Fujian' }, heritageCount: 145, hotCities: ['福州', '泉州', '厦门'], heritageDirections: ['南音', '木偶戏', '脱胎漆器'], marker: { x: 73, y: 60, radius: 7 } },
  { code: 'guangdong', name: { 'zh-CN': '广东', 'en-US': 'Guangdong' }, heritageCount: 131, hotCities: ['广州', '佛山', '潮州'], heritageDirections: ['粤剧', '广绣', '潮州木雕'], marker: { x: 67, y: 65, radius: 9 } },
  { code: 'guangxi', name: { 'zh-CN': '广西', 'en-US': 'Guangxi' }, heritageCount: 70, hotCities: ['南宁', '桂林', '柳州'], heritageDirections: ['壮族山歌', '刘三姐', '铜鼓'], marker: { x: 61, y: 66, radius: 8 } },
  { code: 'hainan', name: { 'zh-CN': '海南', 'en-US': 'Hainan' }, heritageCount: 32, hotCities: ['海口', '三亚'], heritageDirections: ['黎族织锦', '琼剧', '椰雕'], marker: { x: 64, y: 76, radius: 6 } },
  { code: 'chongqing', name: { 'zh-CN': '重庆', 'en-US': 'Chongqing' }, heritageCount: 53, hotCities: ['重庆'], heritageDirections: ['川剧', '蜀绣', '荣昌陶'], marker: { x: 58, y: 57, radius: 5 } },
  { code: 'sichuan', name: { 'zh-CN': '四川', 'en-US': 'Sichuan' }, heritageCount: 153, hotCities: ['成都', '乐山', '都江堰'], heritageDirections: ['蜀绣', '川剧变脸', '自贡灯会'], marker: { x: 50, y: 54, radius: 10 } },
  { code: 'guizhou', name: { 'zh-CN': '贵州', 'en-US': 'Guizhou' }, heritageCount: 140, hotCities: ['贵阳', '黔东南', '遵义'], heritageDirections: ['苗族银饰', '侗族大歌', '蜡染'], marker: { x: 56, y: 62, radius: 7 } },
  { code: 'yunnan', name: { 'zh-CN': '云南', 'en-US': 'Yunnan' }, heritageCount: 127, hotCities: ['昆明', '大理', '丽江'], heritageDirections: ['普洱茶制作', '纳西古乐', '傣族泼水节'], marker: { x: 47, y: 63, radius: 9 } },
  { code: 'taiwan', name: { 'zh-CN': '台湾', 'en-US': 'Taiwan' }, heritageCount: 48, hotCities: ['台北', '高雄', '台南'], heritageDirections: ['歌仔戏', '布袋戏', '漆艺'], marker: { x: 84, y: 62, radius: 5 } },
  { code: 'hongkong', name: { 'zh-CN': '香港', 'en-US': 'Hong Kong' }, heritageCount: 12, hotCities: ['香港'], heritageDirections: ['粤剧', '舞火龙', '长洲太平清醮'], marker: { x: 70, y: 67, radius: 3 } },
  { code: 'macau', name: { 'zh-CN': '澳门', 'en-US': 'Macau' }, heritageCount: 11, hotCities: ['澳门'], heritageDirections: ['粤剧', '道教音乐', '土生葡人舞'], marker: { x: 69, y: 68, radius: 3 } }
];

const CITY_TO_PROVINCE = {
  北京: 'beijing', 苏州: 'jiangsu', 成都: 'sichuan', 西安: 'shaanxi',
  杭州: 'zhejiang', 广州: 'guangdong', 泉州: 'fujian', 景德镇: 'jiangxi',
  武汉: 'hubei', 恩施: 'hubei', 黄冈: 'hubei', 十堰: 'hubei',
  南京: 'jiangsu', 扬州: 'jiangsu', 上海: 'shanghai'
};

function localizeProvince(p, locale) {
  const loc = locale || getLocale();
  const name = pickLocale(p.name, loc);
  const shortName = name.replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔)/g, '');
  return {
    code: p.code,
    name,
    shortName,
    heritageCount: p.heritageCount,
    hotCities: p.hotCities,
    heritageDirections: p.heritageDirections,
    marker: p.marker
  };
}

function findProvinceAtPoint(xPct, yPct) {
  if (xPct < 20 || yPct > 86) return null;

  let matched = null;
  let matchedDist = Infinity;

  RAW.forEach(p => {
    const dx = p.marker.x - xPct;
    const dy = p.marker.y - yPct;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = p.marker.radius || 8;
    if (dist <= radius && dist < matchedDist) {
      matchedDist = dist;
      matched = p;
    }
  });

  if (matched) return matched.code;

  let nearest = null;
  let nearestDist = Infinity;
  RAW.forEach(p => {
    const dx = p.marker.x - xPct;
    const dy = p.marker.y - yPct;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = p;
    }
  });

  if (nearest && nearestDist <= 18) return nearest.code;
  return null;
}

function getProvinces(locale) {
  return RAW.map(p => localizeProvince(p, locale));
}

function getProvinceByCode(code, locale) {
  const p = RAW.find(item => item.code === code);
  return p ? localizeProvince(p, locale) : null;
}

function getProvinceByName(name, locale) {
  const p = RAW.find(item => {
    const zh = pickLocale(item.name, 'zh-CN');
    const en = pickLocale(item.name, 'en-US');
    return name === zh || name === en || name.includes(zh) || zh.includes(name);
  });
  return p ? localizeProvince(p, locale) : null;
}

function getProvinceByCity(cityName) {
  const code = CITY_TO_PROVINCE[cityName];
  if (code) return getProvinceByCode(code, 'zh-CN');
  const { getCitiesByProvinceCode } = require('./province-cities.js');
  for (const p of RAW) {
    const cities = getCitiesByProvinceCode(p.code);
    if (cities.includes(cityName)) return localizeProvince(p, 'zh-CN');
  }
  return null;
}

function getQuickDestinations(locale) {
  const loc = locale || getLocale();
  const names = ['北京', '苏州', '成都', '西安', '杭州', '广州', '泉州', '景德镇'];
  return names.map(zh => {
    const code = CITY_TO_PROVINCE[zh];
    const province = getProvinceByCode(code, loc);
    return { city: zh, provinceCode: code, provinceName: province ? province.name : '' };
  });
}

module.exports = {
  RAW,
  getProvinces,
  getProvinceByCode,
  getProvinceByName,
  getProvinceByCity,
  getQuickDestinations,
  findProvinceAtPoint,
  CITY_TO_PROVINCE
};
