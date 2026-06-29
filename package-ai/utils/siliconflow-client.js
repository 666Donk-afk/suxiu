/**
 * 小程序直连 SiliconFlow API（手机端无需 Node 后端）
 */
let aiSecret;
try {
  aiSecret = require('../../config/ai-secret.js');
} catch (e) {
  aiSecret = { apiKey: '', model: 'nex-agi/Nex-N2-Pro' };
}

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const DEFAULT_TIMEOUT = 90000;

function ensureApiKey() {
  if (!aiSecret.apiKey || aiSecret.apiKey.includes('your-key')) {
    const err = new Error('未配置 AI 密钥，请在 config/ai-secret.js 填入 SiliconFlow API Key');
    err.code = 'CONFIG_ERROR';
    throw err;
  }
}

function extractAssistantContent(message) {
  if (!message) return '';

  const raw = message.content;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }

  if (Array.isArray(raw)) {
    const text = raw
      .filter(part => part && (part.type === 'text' || part.text))
      .map(part => part.text || '')
      .join('\n')
      .trim();
    if (text) return text;
  }

  const reasoning = message.reasoning_content || message.reasoning;
  if (typeof reasoning === 'string' && reasoning.trim()) {
    return reasoning.trim();
  }

  return '';
}

function postChatCompletion(body, options) {
  ensureApiKey();

  return new Promise((resolve, reject) => {
    wx.request({
      url: API_URL,
      method: 'POST',
      timeout: options.timeout || DEFAULT_TIMEOUT,
      header: {
        Authorization: `Bearer ${aiSecret.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: options.model || aiSecret.model,
        messages: body.messages,
        temperature: body.temperature ?? options.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? options.max_tokens ?? 2048,
        stream: false
      },
      success(res) {
        const data = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const content = extractAssistantContent(data.choices && data.choices[0] && data.choices[0].message);
          if (!content) {
            const err = new Error('AI 返回内容为空');
            err.code = 'EMPTY_REPLY';
            reject(err);
            return;
          }
          resolve({ content, usage: data.usage || null });
          return;
        }
        const msg = data.message || (data.error && data.error.message) || `AI 请求失败 (${res.statusCode})`;
        const err = new Error(msg);
        err.code = 'API_ERROR';
        err.statusCode = res.statusCode;
        reject(err);
      },
      fail(detail) {
        const err = new Error('无法连接 AI 服务，请检查网络并在小程序后台添加 request 合法域名 api.siliconflow.cn');
        err.code = 'NETWORK_ERROR';
        err.detail = detail;
        reject(err);
      }
    });
  });
}

function chatCompletion(messages, options) {
  return postChatCompletion({ messages, ...options }, options || {});
}

function visionCompletion(payload, options) {
  const { imageBase64, mimeType = 'image/jpeg', text, systemPrompt } = payload;
  const mime = mimeType || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${imageBase64}`;

  const messages = [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
      {
        type: 'text',
        text: `${systemPrompt}\n\n${text || '请识别这张图片中的中国非物质文化遗产项目，并按 JSON 格式输出。'}`
      }
    ]
  }];

  return postChatCompletion({
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.max_tokens ?? 1500
  }, options || {});
}

module.exports = {
  chatCompletion,
  visionCompletion
};
