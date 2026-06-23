/**
 * 判断用户输入是否属于「路线规划」意图
 */

const ROUTE_PROMPT_KEYS = new Set(['route']);

const ROUTE_KEYWORDS = [
  '路线', '规划', '行程', '一日游', '半日', '半天',
  '小时', '怎么玩', '体验路线', '推荐路线', '安排',
  '带孩子', '亲子', '互动体验', '适合年轻人'
];

function isRouteIntent(text, promptKey) {
  if (promptKey && ROUTE_PROMPT_KEYS.has(promptKey)) return true;
  const t = (text || '').trim();
  if (!t) return false;
  return ROUTE_KEYWORDS.some(kw => t.includes(kw));
}

module.exports = {
  isRouteIntent,
  ROUTE_PROMPT_KEYS
};
