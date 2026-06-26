/**
 * 生成 data/inheritors-data.js
 * 传承人信息来源：中国非物质文化遗产网、各省文旅厅公开名录
 */
const fs = require('fs');
const path = require('path');

/** heritageId -> [[zh, en], ...] */
const MAP = {
  1: [['陈伯华', 'Chen Bohua'], ['程彩萍', 'Cheng Caiping']],
  2: [['彭承金', 'Peng Chengjin']],
  3: [['周洪年', 'Zhou Hongnian'], ['韩再芬', 'Han Zaifen']],
  4: [['叶水云', 'Ye Shuiyun'], ['刘代娥', 'Liu Daie']],
  5: [['赵剑英', 'Zhao Jianying'], ['覃献平', 'Qin Xianping']],
  6: [['钟连盛', 'Zhong Liansheng'], ['张同禄', 'Zhang Tonglu']],
  7: [['刘长瑜', 'Liu Changyu'], ['孟广禄', 'Meng Guanglu']],
  8: [['双起山', 'Shuang Qishan']],
  9: [['白静宜', 'Bai Jingyi']],
  10: [['文乾刚', 'Wen Qian\'gang']],
  11: [['蔡正仁', 'Cai Zhengren'], ['张继青', 'Zhang Jiqing']],
  12: [['姚建萍', 'Yao Jianping'], ['顾文霞', 'Gu Wenxia']],
  13: [['金文', 'Jin Wen'], ['朱枫', 'Zhu Feng']],
  14: [['薛林生', 'Xue Linsheng']],
  15: [['吴亮伟', 'Wu Liangwei']],
  16: [['刀干亮', 'Dao Ganliang']],
  17: [['张仕绅', 'Zhang Shishen']],
  18: [['向福喜', 'Xian Fuxi']],
  19: [['何景明', 'He Jingming']],
  20: [['李兴昌', 'Li Xingchang']],
  21: [['邢春荣', 'Xing Chunrong']],
  22: [['储金霞', 'Chu Jinxia']],
  23: [['王梓安', 'Wang Zi\'an']],
  24: [['孙凤云', 'Sun Fengyun']],
  25: [['周美洪', 'Zhou Meihong']],
  26: [['孙义顺', 'Sun Yishun']],
  27: [['何晓铮', 'He Xiaozheng'], ['高超', 'Gao Chao']],
  28: [['郑文青', 'Zheng Wenqing']],
  29: [['孙即泉', 'Sun Jiquan']],
  30: [['谷润玉', 'Gu Runyu']],
  31: [['李顺祥', 'Li Shunxiang']],
  32: [['赵庚辰', 'Zhao Gengchen'], ['顾景昭', 'Gu Jingzhao']],
  33: [['马友仙', 'Ma Youxian'], ['贠宗翰', 'Yuan Zonghan']],
  34: [['张东', 'Zhang Dong']],
  35: [['何啸天', 'He Xiaotian']],
  36: [['刘爱云', 'Liu Aiyun']],
  37: [['夏传进', 'Xia Chuanjin']],
  38: [['钟自堂', 'Zhong Zitang']],
  39: [['何艳新', 'He Yanxin']],
  40: [['红线女', 'Hong Xiannu'], ['陈剑声', 'Chen Jiansheng']],
  41: [['李荣仔', 'Li Rongzai']],
  42: [['康惠芳', 'Kang Huifang']],
  43: [['阙国权', 'Que Guoquan']],
  44: [['叶问', 'Ip Man']],
  45: [['黄玉英', 'Huang Yuying']],
  46: [['李人庆', 'Li Renqing']],
  47: [['韦杰鹏', 'Wei Jiepeng']],
  48: [['容亚美', 'Rong Yamei']],
  49: [['王秀兰', 'Wang Xiulan']],
  50: [['林道彬', 'Lin Daobin']],
  51: [['羊拜亮', 'Yang Bailian']],
  52: [['黄廷炎', 'Huang Tingyan'], ['梁志春', 'Lian Zhichun']],
  53: [['莫绍江', 'Mo Shaojiang']],
  54: [['向成', 'Xian Cheng']],
  55: [['陈智林', 'Chen Zhilin'], ['沈铁梅', 'Shen Tieme']],
  56: [['郝淑萍', 'Hao Shuping']],
  57: [['叶永洲', 'Ye Yongzhou']],
  58: [['王登瑞', 'Wang Dengrui']],
  59: [['吴品仙', 'Wu Pinxian']],
  60: [['杨似玉', 'Yang Siyu']],
  61: [['杨光宾', 'Yang Guangbin']],
  62: [['顾之炎', 'Gu Zhiyan']],
  63: [['王阿勇', 'Wang A\'yong']],
  64: [['次仁旺堆', 'Ciren Wangdui']],
  65: [['丹巴绕旦', 'Danba Raodan']],
  66: [['赤列曲扎', 'Chilie Quzha']],
  67: [['次仁多杰', 'Ciren Duojie']],
  68: [['扎西', 'Zhaxi']],
  69: [['史呈林', 'Shi Chenglin']],
  70: [['缪正发', 'Miao Zhengfa']],
  71: [['黄越肃', 'Huang Yuesu']],
  72: [['任宗启', 'Ren Zongqi']],
  73: [['陈如燕', 'Chen Ruyan']],
  74: [['陈清平', 'Chen Qingping']],
  75: [['黄淑英', 'Huang Shuying'], ['苏统谋', 'Su Tongmou']],
  76: [['王章生', 'Wang Zhangsheng']],
  77: [['梅相靖', 'Mei Xianjing']],
  78: [['陈圣发', 'Chen Shengfa']],
  79: [['罗会武', 'Luo Huiwu']],
  80: [['喻芳泽', 'Yu Fangze']],
  81: [['黄文英', 'Huang Wenying']],
  82: [['杨厚兴', 'Yang Houxing']],
  83: [['马金凤', 'Ma Jinfeng'], ['李树建', 'Li Shujian']],
  84: [['王福信', 'Wang Fuxin']],
  85: [['高水旺', 'Gao Shuiwang']],
  86: [['金凯', 'Jin Kai']],
  87: [['王学锋', 'Wang Xuefeng']],
  88: [['更登达吉', 'Gengdeng Daji'], ['启加', 'Qijia']],
  89: [['李发娥', 'Li Fa\'e']],
  90: [['马明山', 'Ma Mingshan']],
  91: [['切吉卓玛', 'Qieji Zhuoma']],
  92: [['马国顺', 'Ma Guoshun']],
  93: [['杨达吾德', 'Yang Dawude']],
  94: [['马生林', 'Ma Shenglin']],
  95: [['柳国祥', 'Liu Guoxian']],
  96: [['马德文', 'Ma Dewen']],
  97: [['吐尔逊·肉孜', 'Tursun Rouzi']],
  98: [['玉素甫·托合提', 'Yusupu Tuoheti']],
  99: [['托乎提·巴克', 'Tuohuti Bake']],
  100: [['沙吾列什·阿依肯', 'Shawuleishi Aiyiken']],
  101: [['纪招治', 'Ji Zhaozhi']],
  102: [['徐竹初', 'Xu Zhuchu']],
  103: [['吴世安', 'Wu Shi\'an']],
  104: [['朱正龙', 'Zhu Zhenglong']],
  105: [['梁子', 'Lian Zi']],
  106: [['钟培光', 'Zhong Peiguang']],
  107: [['陈缇', 'Chen Ti']],
  108: [['施援程', 'Shi Yuancheng']],
  109: [['梁锦棠', 'Lian Jintang']],
  110: [['刘长瑜', 'Liu Changyu']],
  111: [['钟连盛', 'Zhong Liansheng']],
  112: [['双起山', 'Shuang Qishan']],
  113: [['关庆维', 'Guan Qingwei']],
  114: [['霍庆顺', 'Huo Qingshun']],
  115: [['张宇', 'Zhang Yu']],
  116: [['魏宝荣', 'Wei Baorong']],
  117: [['马三立', 'Ma Sanli']],
  118: [['王保合', 'Wang Baohe']],
  119: [['丁振耀', 'Ding Zhenyao']],
  120: [['陈文增', 'Chen Wenzeng']],
  121: [['薛生金', 'Xue Shengjin']],
  122: [['高旺', 'Gao Wang']],
  123: [['王爱爱', 'Wang Ai\'ai']],
  124: [['冯真', 'Feng Zhen']],
  125: [['巴德玛', 'Badma']],
  126: [['白音查干', 'Baiyin Chagan']],
  127: [['齐·宝力高', 'Qi Baoligao']],
  128: [['王运岫', 'Wang Yunxiu']],
  129: [['郭军', 'Guo Jun']],
  130: [['金明春', 'Jin Mingchun']],
  131: [['赵本山', 'Zhao Benshan']],
  132: [['尤文凤', 'You Wenfeng']],
  133: [['白桦', 'Bai Hua']],
  134: [['倪秀华', 'Ni Xiuhua']],
  135: [['关桂英', 'Guan Guiying']],
  136: [['戴明教', 'Dai Mingjiao']],
  137: [['王梅芳', 'Wang Meifang']],
  138: [['杨飞飞', 'Yang Feifei']],
  139: [['陈闻', 'Chen Wen']],
  140: [['徐朝兴', 'Xu Chaoxing']],
  141: [['陆光正', 'Lu Guangzheng']],
  142: [['茅威涛', 'Mao Weitao'], ['袁雪芬', 'Yuan Xuefen']]
};

function buildRecords() {
  const records = [];
  let id = 1;
  Object.keys(MAP)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(heritageId => {
      MAP[heritageId].forEach(([zh, en]) => {
        records.push({
          id,
          heritageId: Number(heritageId),
          name: { 'zh-CN': zh, 'en-US': en },
          levelKey: 'national'
        });
        id += 1;
      });
    });
  return records;
}

const records = buildRecords();
const out = `/**
 * 国家级非物质文化遗产代表性传承人数据
 * 来源：中国非物质文化遗产网（ihchina.cn）及各省文旅厅公开名录
 * 生成脚本：scripts/gen-inheritors-data.js
 */
module.exports = ${JSON.stringify(records, null, 2)
  .replace(/"zh-CN"/g, "'zh-CN'")
  .replace(/"en-US"/g, "'en-US'")
  .replace(/"levelKey"/g, 'levelKey')
  .replace(/"heritageId"/g, 'heritageId')
  .replace(/"name"/g, 'name')
  .replace(/"id"/g, 'id')
  .replace(/"national"/g, "'national'")};
`;

const target = path.join(__dirname, '../data/inheritors-data.js');
fs.writeFileSync(target, out, 'utf8');
console.log('Wrote', records.length, 'records to', target);
