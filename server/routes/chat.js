/**
 * POST /api/chat — 非遗知识解答 / 关键词故事生成
 */
const express = require('express');
const { chatCompletion, visionCompletion } = require('../services/siliconflow');
const { KNOWLEDGE_SYSTEM, getStorySystem, formatUserContext } = require('../prompts/system');
const { respondAiError } = require('../utils/ai-error');

const router = express.Router();
const MAX_BASE64_LEN = 4 * 1024 * 1024;

const STORY_KEYWORDS = [
  '故事', '传说', '典故', '讲讲', '民间故事', '非遗故事',
  'story', 'legend', 'folktale', 'tale about'
];

function isStoryRequest(message, intent) {
  if (intent === 'story') return true;
  const text = (message || '').trim().toLowerCase();
  if (!text) return false;
  return STORY_KEYWORDS.some(kw => text.includes(kw.toLowerCase()));
}

router.post('/', async (req, res) => {
  try {
    const { message, imageBase64, mimeType, userContext, locale, intent } = req.body || {};
    const text = (message || '').trim();
    const base64 = (imageBase64 || '').trim();

    if (!text && !base64) {
      return res.status(400).json({
        success: false,
        message: locale === 'en-US' ? 'Message or image is required.' : '请输入问题或上传图片。'
      });
    }

    if (base64.length > MAX_BASE64_LEN) {
      return res.status(400).json({
        success: false,
        message: locale === 'en-US' ? 'Image is too large.' : '图片过大，请压缩后重试。'
      });
    }

    const useStory = !base64 && isStoryRequest(text, intent);
    const systemContent = (useStory ? getStorySystem(locale) : KNOWLEDGE_SYSTEM)
      + formatUserContext(userContext);

    if (base64) {
      const defaultQuestion = locale === 'en-US'
        ? 'Please describe this image and answer my intangible cultural heritage question.'
        : '请结合图片内容，解答我与非遗相关的问题。';
      const { content } = await visionCompletion({
        imageBase64: base64,
        mimeType: mimeType || 'image/jpeg',
        systemPrompt: systemContent,
        text: text || defaultQuestion
      }, { temperature: 0.6, max_tokens: 1400 });

      return res.json({
        success: true,
        reply: content,
        mode: 'vision'
      });
    }

    const { content } = await chatCompletion([
      { role: 'system', content: systemContent },
      { role: 'user', content: text }
    ], {
      temperature: useStory ? 0.85 : 0.7,
      max_tokens: useStory ? 1400 : 1200
    });

    res.json({
      success: true,
      reply: content,
      mode: useStory ? 'story' : 'knowledge'
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
