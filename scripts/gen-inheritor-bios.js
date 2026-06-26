/**
 * 生成 data/inheritor-bios.js
 */
const fs = require('fs');
const path = require('path');
const raw = require('../data/inheritors-data');
const details = require('../data/heritage-details.js');
const list = require('../data/heritage-list.js');

const OVERRIDES = {
  74: {
    'zh-CN':
      '吴品仙，侗族，1945年生，贵州黎平人，第二批国家级非物质文化遗产项目侗族大歌代表性传承人。4岁起随父母学唱侗歌，掌握二百多首传统侗族大歌，40余年来培养学生逾2000人，整理侗族大歌1700余首，被誉为侗族文化的忠实守护者。',
    'en-US':
      'Wu Pinxian (b. 1945), a Dong master singer from Liping, Guizhou, is a national-level inheritor of the Grand Song of the Dong. She began learning songs at age 4, has mastered over 200 traditional pieces, trained more than 2,000 students, and documented over 1,700 songs.'
  },
  1: {
    'zh-CN':
      '陈伯华，汉族，1919年生，湖北武汉人，第二批国家级非物质文化遗产项目汉剧代表性传承人。创立华丽委婉的“陈派”唱腔，代表作品有《宇宙锋》《二度梅》等，被誉为汉剧一代宗师。',
    'en-US':
      'Chen Bohua (1919–2018), from Wuhan, Hubei, was a national-level inheritor of Han Opera and founder of the elegant "Chen school" vocal style, famed for classics such as The Universe Conqueror.'
  },
  3: {
    'zh-CN':
      '周洪年，男，湖北省黄梅县人，第二批国家级非物质文化遗产项目黄梅戏代表性传承人，长期致力于黄梅戏表演与传承，是鄂东黄梅戏的重要代表艺术家。',
    'en-US':
      'Zhou Hongnian from Huangmei County, Hubei, is a national-level inheritor of Huangmei Opera, dedicated to performing and passing on this folk opera tradition in eastern Hubei.'
  },
  4: {
    'zh-CN':
      '韩再芬，汉族，1968年生，安徽潜山人，第二批国家级非物质文化遗产项目黄梅戏代表性传承人，再芬黄梅艺术剧院院长，被誉为新一代黄梅戏领军人物。',
    'en-US':
      'Han Zaifen (b. 1968) from Qianshan, Anhui, is a national-level inheritor of Huangmei Opera and director of the Zaifen Huangmei Art Theatre, a leading figure of the genre.'
  }
};

function extractBio(name, text) {
  if (!text || !name) return '';
  const sentences = text.split(/[。；\n]/).map(s => s.trim()).filter(Boolean);
  const hit = sentences.find(s => s.includes(name) && s.length >= 12);
  if (hit) return `${hit.replace(/^[，,\s]+/, '')}。`;
  return '';
}

function genericBio(name, heritageName, locale) {
  if (locale === 'en-US') {
    return `${name} is a nationally recognized inheritor of ${heritageName}, committed to safeguarding and passing on this heritage through teaching and public promotion.`;
  }
  return `${name}是${heritageName}国家级代表性传承人，长期从事该项目的抢救记录、传承教学与推广传播工作。`;
}

const bios = {};
raw.forEach(item => {
  if (OVERRIDES[item.id]) {
    bios[item.id] = OVERRIDES[item.id];
    return;
  }
  const heritage = list[item.heritageId - 1];
  const slug = heritage.slug;
  const detail = details[slug] || {};
  const corpus = [detail.story, detail.origin, detail.summary, heritage.summary].filter(Boolean).join('\n');
  const zhName = item.name['zh-CN'];
  const enName = item.name['en-US'];
  const zhExtract = extractBio(zhName, corpus);
  bios[item.id] = {
    'zh-CN': zhExtract || genericBio(zhName, heritage.name, 'zh-CN'),
    'en-US': genericBio(enName, heritage.name, 'en-US')
  };
});

const out = `/**
 * 非遗代表人简介（按 inheritors-data 的 id 索引）
 * 部分条目来自公开资料，其余为基于非遗文本提取或通用简介
 */
module.exports = ${JSON.stringify(bios, null, 2)
  .replace(/"zh-CN"/g, "'zh-CN'")
  .replace(/"en-US"/g, "'en-US'")};
`;

fs.writeFileSync(path.join(__dirname, '../data/inheritor-bios.js'), out, 'utf8');
console.log('Wrote', Object.keys(bios).length, 'bios');
