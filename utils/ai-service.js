/**
 * AI 助手 — 直连 SiliconFlow（手机端可用，无需启动 Node 后端）
 */
const { chatCompletion, visionCompletion } = require('./siliconflow-client.js');
const {
  KNOWLEDGE_SYSTEM,
  getStorySystem,
  ROUTE_SYSTEM,
  buildRecognizeSystem,
  formatUserContext
} = require('./ai-prompts.js');
const { extractJson, normalizeRoute, normalizeRecognize } = require('./ai-json.js');
const { findHeritageMatch, toRecognizePayload } = require('./heritage-match.js');
const { isStoryIntent } = require('./ai-intent.js');

function chat(message, userContext, locale, options) {
  const loc = locale || 'zh-CN';
  const text = (message || '').trim();
  const base64 = options && options.imageBase64;
  const ctxBlock = formatUserContext(userContext);

  if (base64) {
    const defaultQuestion = loc === 'en-US'
      ? 'Please describe this image and answer my intangible cultural heritage question.'
      : '请结合图片内容，解答我与非遗相关的问题。';

    return visionCompletion({
      imageBase64: base64,
      mimeType: (options && options.mimeType) || 'image/jpeg',
      systemPrompt: KNOWLEDGE_SYSTEM + ctxBlock,
      text: text || defaultQuestion
    }, { temperature: 0.6, max_tokens: 1400 }).then(({ content }) => ({
      success: true,
      reply: content,
      mode: 'vision'
    }));
  }

  const useStory = (options && options.intent === 'story') || isStoryIntent(text, options && options.intent);
  const systemContent = (useStory ? getStorySystem(loc) : KNOWLEDGE_SYSTEM) + ctxBlock;

  return chatCompletion([
    { role: 'system', content: systemContent },
    { role: 'user', content: text }
  ], {
    temperature: useStory ? 0.85 : 0.7,
    max_tokens: useStory ? 1400 : 1200
  }).then(({ content }) => ({
    success: true,
    reply: content,
    mode: useStory ? 'story' : 'knowledge'
  }));
}

function planRoute(payload, userContext, locale) {
  const message = (payload && payload.message) || '';
  const userText = message.trim() || [
    payload && payload.time ? `游玩时间：${payload.time}` : '',
    payload && payload.interest ? `兴趣偏好：${payload.interest}` : '',
    payload && payload.type ? `游客类型：${payload.type}` : '',
    '请为我规划一条非遗体验路线。'
  ].filter(Boolean).join('\n');

  const systemContent = ROUTE_SYSTEM + formatUserContext(userContext);

  return chatCompletion([
    { role: 'system', content: systemContent },
    { role: 'user', content: userText }
  ], { temperature: 0.6, max_tokens: 1800 }).then(({ content }) => {
    const parsed = extractJson(content);
    const route = normalizeRoute(parsed);
    if (!route) {
      return { success: true, route: null, reply: content, fallback: true };
    }
    return { success: true, route };
  });
}

function recognize(imageBase64, mimeType, userContext, locale) {
  const systemContent = buildRecognizeSystem(userContext);

  return visionCompletion({
    imageBase64,
    mimeType: mimeType || 'image/jpeg',
    systemPrompt: systemContent
  }, { temperature: 0.4, max_tokens: 1500 }).then(({ content }) => {
    const parsed = normalizeRecognize(extractJson(content));
    if (!parsed) {
      return { success: true, reply: content, heritage: null, fallback: true };
    }

    const match = findHeritageMatch(parsed.slug, parsed.heritageName);
    const heritage = toRecognizePayload(match, parsed);
    const replyParts = [parsed.description];
    if (parsed.tips) replyParts.push(parsed.tips);

    return {
      success: true,
      reply: replyParts.filter(Boolean).join('\n\n'),
      heritage,
      confidence: heritage.confidence || parsed.confidence
    };
  });
}

module.exports = {
  chat,
  planRoute,
  recognize
};
