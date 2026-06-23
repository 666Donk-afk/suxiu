/**
 * POST /api/chat — 非遗知识解答
 */
const express = require('express');
const { chatCompletion } = require('../services/siliconflow');
const { KNOWLEDGE_SYSTEM, formatUserContext } = require('../prompts/system');
const { respondAiError } = require('../utils/ai-error');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, userContext, locale } = req.body || {};
    const text = (message || '').trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: locale === 'en-US' ? 'Message is required.' : '请输入问题内容。'
      });
    }

    const systemContent = KNOWLEDGE_SYSTEM + formatUserContext(userContext);

    const { content } = await chatCompletion([
      { role: 'system', content: systemContent },
      { role: 'user', content: text }
    ], { temperature: 0.7, max_tokens: 1200 });

    res.json({
      success: true,
      reply: content
    });
  } catch (err) {
    respondAiError(res, err, {
      tag: 'chat',
      configMessage: 'AI 服务未配置，请设置 SILICONFLOW_API_KEY',
      defaultMessage: 'AI 服务暂时不可用，请稍后重试'
    });
  }
});

module.exports = router;
