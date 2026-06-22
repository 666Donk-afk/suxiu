/**
 * 各省城市列表
 */
const PROVINCE_CITIES = {
  beijing: ['北京'],
  tianjin: ['天津'],
  hebei: ['石家庄', '保定', '承德', '唐山', '邯郸', '秦皇岛', '张家口', '廊坊'],
  shanxi: ['太原', '大同', '平遥', '运城', '临汾', '忻州', '晋中'],
  neimenggu: ['呼和浩特', '包头', '鄂尔多斯', '赤峰', '呼伦贝尔', '通辽'],
  liaoning: ['沈阳', '大连', '鞍山', '抚顺', '锦州', '丹东'],
  jilin: ['长春', '吉林', '延边', '四平', '通化', '白山'],
  heilongjiang: ['哈尔滨', '齐齐哈尔', '牡丹江', '大庆', '佳木斯', '伊春'],
  shanghai: ['上海'],
  jiangsu: ['苏州', '南京', '无锡', '常州', '扬州', '徐州', '南通', '镇江', '淮安', '盐城'],
  zhejiang: ['杭州', '宁波', '绍兴', '温州', '嘉兴', '湖州', '金华', '台州', '丽水'],
  anhui: ['合肥', '黄山', '安庆', '芜湖', '蚌埠', '马鞍山', '宣城', '六安'],
  fujian: ['福州', '泉州', '厦门', '漳州', '莆田', '龙岩', '三明', '南平'],
  jiangxi: ['南昌', '景德镇', '婺源', '九江', '赣州', '上饶', '吉安', '宜春'],
  shandong: ['济南', '青岛', '曲阜', '烟台', '潍坊', '泰安', '威海', '临沂'],
  henan: ['郑州', '洛阳', '开封', '安阳', '南阳', '许昌', '商丘', '焦作'],
  hubei: ['武汉', '恩施', '黄冈', '十堰', '宜昌', '襄阳', '荆州', '黄石'],
  hunan: ['长沙', '张家界', '凤凰', '岳阳', '衡阳', '株洲', '湘潭', '常德'],
  guangdong: ['广州', '佛山', '潮州', '深圳', '东莞', '珠海', '汕头', '惠州'],
  guangxi: ['南宁', '桂林', '柳州', '北海', '梧州', '玉林', '百色'],
  hainan: ['海口', '三亚', '儋州', '琼海', '文昌'],
  chongqing: ['重庆'],
  sichuan: ['成都', '乐山', '都江堰', '绵阳', '德阳', '宜宾', '泸州', '南充'],
  guizhou: ['贵阳', '黔东南', '遵义', '安顺', '毕节', '铜仁', '六盘水'],
  yunnan: ['昆明', '大理', '丽江', '西双版纳', '香格里拉', '曲靖', '玉溪'],
  xizang: ['拉萨', '日喀则', '林芝', '山南', '昌都', '那曲'],
  shaanxi: ['西安', '延安', '宝鸡', '咸阳', '渭南', '汉中', '榆林'],
  gansu: ['兰州', '敦煌', '天水', '嘉峪关', '张掖', '武威', '酒泉'],
  qinghai: ['西宁', '玉树', '格尔木', '海东', '海西'],
  ningxia: ['银川', '中卫', '固原', '石嘴山', '吴忠'],
  xinjiang: ['乌鲁木齐', '喀什', '伊犁', '吐鲁番', '哈密', '克拉玛依'],
  hongkong: ['香港'],
  macau: ['澳门'],
  taiwan: ['台北', '高雄', '台南', '台中', '花莲']
};

function getCitiesByProvinceCode(code) {
  return PROVINCE_CITIES[code] || [];
}

function searchCitiesInProvince(code, keyword) {
  const kw = (keyword || '').trim().toLowerCase();
  if (!kw) return getCitiesByProvinceCode(code);
  return getCitiesByProvinceCode(code).filter(city =>
    city.includes(keyword.trim()) || city.toLowerCase().includes(kw)
  );
}

module.exports = {
  PROVINCE_CITIES,
  getCitiesByProvinceCode,
  searchCitiesInProvince
};
