/**
 * 判断用户输入是否属于「路线规划」意图
 */

const ROUTE_PROMPT_KEYS = new Set(['route']);

const ROUTE_KEYWORDS = [
  '路线', '规划', '行程', '一日游', '半日', '半天',
  '小时', '怎么玩', '体验路线', '推荐路线', '安排',
  '带孩子', '亲子', '互动体验', '适合年轻人'
];

const STORY_PROMPT_KEYS = new Set(['story']);

const STORY_KEYWORDS = [
  '故事', '传说', '典故', '讲讲', '民间故事', '非遗故事',
  'story', 'legend', 'folktale', 'tale about'
];

function isRouteIntent(text, promptKey) {
  if (promptKey && ROUTE_PROMPT_KEYS.has(promptKey)) return true;
  const t = (text || '').trim();
  if (!t) return false;
  return ROUTE_KEYWORDS.some(kw => t.includes(kw));
}

function isStoryIntent(text, promptKey) {
  if (isRouteIntent(text, promptKey)) return false;
  if (promptKey && STORY_PROMPT_KEYS.has(promptKey)) return true;
  const t = (text || '').trim().toLowerCase();
  if (!t) return false;
  return STORY_KEYWORDS.some(kw => t.includes(kw.toLowerCase()));
}

module.exports = {
  isRouteIntent,
  isStoryIntent,
  ROUTE_PROMPT_KEYS,
  STORY_PROMPT_KEYS
};
