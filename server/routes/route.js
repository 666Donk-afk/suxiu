/**
 * POST /api/route — 非遗体验路线规划
 */
const express = require('express');
const { chatCompletion } = require('../services/siliconflow');
const { ROUTE_SYSTEM, formatUserContext } = require('../prompts/system');
const { extractJson, normalizeRoute } = require('../utils/json');
const { respondAiError } = require('../utils/ai-error');

const router = express.Router();

function buildUserMessage(body) {
  const { message, time, interest, type } = body || {};

  if (message && String(message).trim()) {
    return String(message).trim();
  }

  const parts = [];
  if (time) parts.push(`游玩时间：${time}`);
  if (interest) parts.push(`兴趣偏好：${interest}`);
  if (type) parts.push(`游客类型：${type}`);
  parts.push('请为我规划一条非遗体验路线。');
  return parts.join('\n');
}

router.post('/', async (req, res) => {
  try {
    const { message, time, interest, type, userContext, locale } = req.body || {};
    const userText = buildUserMessage({ message, time, interest, type });

    if (!userText) {
      return res.status(400).json({
        success: false,
        message: locale === 'en-US' ? 'Route request is required.' : '请描述您的路线需求。'
      });
    }

    const systemContent = ROUTE_SYSTEM + formatUserContext(userContext);

    const { content } = await chatCompletion([
      { role: 'system', content: systemContent },
      { role: 'user', content: userText }
    ], { temperature: 0.6, max_tokens: 1800 });

    const parsed = extractJson(content);
    const route = normalizeRoute(parsed);

    if (!route) {
      // 降级：仍返回文本，前端按普通消息展示
      return res.json({
        success: true,
        route: null,
        reply: content,
        fallback: true
      });
    }

    res.json({
      success: true,
      route
    });
  } catch (err) {
    respondAiError(res, err, {
      tag: 'route',
      configMessage: 'AI 服务未配置，请设置 SILICONFLOW_API_KEY',
      defaultMessage: '路线规划服务暂时不可用，请稍后重试'
    });
  }
});

module.exports = router;
