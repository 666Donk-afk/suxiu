/**
 * POST /api/recognize — 拍照非遗识别
 */
const express = require('express');
const { visionCompletion } = require('../services/siliconflow');
const { buildRecognizeSystem, formatUserContext } = require('../prompts/system');
const { extractJson, normalizeRecognize } = require('../utils/json');
const { findHeritageMatch, toRecognizePayload } = require('../utils/heritage-catalog');
const { respondAiError } = require('../utils/ai-error');

const router = express.Router();
const MAX_BASE64_LEN = 4 * 1024 * 1024;

router.post('/', async (req, res) => {
  try {
    const { imageBase64, mimeType, userContext, locale } = req.body || {};
    const base64 = (imageBase64 || '').trim();

    if (!base64) {
      return res.status(400).json({
        success: false,
        message: locale === 'en-US' ? 'Image is required.' : '请上传或拍摄图片。'
      });
    }

    if (base64.length > MAX_BASE64_LEN) {
      return res.status(400).json({
        success: false,
        message: locale === 'en-US'
          ? 'Image is too large. Please compress and retry.'
          : '图片过大，请压缩后重试。'
      });
    }

    const systemContent = buildRecognizeSystem(userContext);
    const { content } = await visionCompletion({
      imageBase64: base64,
      mimeType: mimeType || 'image/jpeg',
      systemPrompt: systemContent
    }, { temperature: 0.4, max_tokens: 1500 });

    const parsed = normalizeRecognize(extractJson(content));
    if (!parsed) {
      return res.json({
        success: true,
        reply: content,
        heritage: null,
        fallback: true
      });
    }

    const match = findHeritageMatch(parsed.slug, parsed.heritageName);
    const heritage = toRecognizePayload(match, parsed, locale);
    const replyParts = [parsed.description];
    if (parsed.tips) replyParts.push(parsed.tips);
    const reply = replyParts.filter(Boolean).join('\n\n');

    res.json({
      success: true,
      reply,
      heritage,
      confidence: heritage.confidence || parsed.confidence
    });
  } catch (err) {
    respondAiError(res, err, {
      tag: 'recognize',
      configMessage: 'AI 服务未配置，请设置 SILICONFLOW_API_KEY',
      defaultMessage: '非遗识别服务暂时不可用，请稍后重试'
    });
  }
});

module.exports = router;
