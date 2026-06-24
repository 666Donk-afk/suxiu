/**
 * 从模型回复中提取 JSON 对象
 */
function extractJson(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // 直接解析
  try {
    return JSON.parse(trimmed);
  } catch (e) { /* continue */ }

  // markdown 代码块
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch (e) { /* continue */ }
  }

  // 第一个 { ... } 块
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch (e) { /* continue */ }
  }

  return null;
}

/** 校验并规范化路线结构 */
function normalizeRoute(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const steps = Array.isArray(raw.steps)
    ? raw.steps
      .filter(s => s && (s.name || s.description))
      .map(s => ({
        name: String(s.name || '体验站点').trim(),
        description: String(s.description || '').trim()
      }))
    : [];

  if (!steps.length) return null;

  return {
    title: String(raw.title || '非遗体验路线').trim(),
    duration: String(raw.duration || '半天').trim(),
    reason: String(raw.reason || raw.recommendReason || '').trim(),
    steps
  };
}

/** 校验并规范化非遗识别结构 */
function normalizeRecognize(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    heritageName: String(raw.heritageName || raw.name || '').trim(),
    slug: String(raw.slug || '').trim() || null,
    categoryKey: String(raw.categoryKey || '').trim(),
    categoryLabel: String(raw.categoryLabel || raw.category || '').trim(),
    confidence: String(raw.confidence || 'medium').trim(),
    description: String(raw.description || raw.reply || '').trim(),
    tips: String(raw.tips || '').trim()
  };
}

module.exports = {
  extractJson,
  normalizeRoute,
  normalizeRecognize
};
