/**
 * SiliconFlow OpenAI 兼容接口封装
 * API Key 仅从 process.env 读取
 */
const axios = require('axios');

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const DEFAULT_MODEL = 'nex-agi/Nex-N2-Pro';

function getConfig() {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    const err = new Error('SILICONFLOW_API_KEY 未配置');
    err.code = 'CONFIG_ERROR';
    throw err;
  }
  return {
    apiKey,
    model: process.env.SILICONFLOW_MODEL || DEFAULT_MODEL
  };
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

async function postChatCompletion(body, options = {}) {
  const { apiKey } = getConfig();
  const model = options.model || getConfig().model;

  try {
    const res = await axios.post(
      API_URL,
      {
        model,
        messages: body.messages,
        temperature: body.temperature ?? options.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? options.max_tokens ?? 2048,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: options.timeout ?? 90000
      }
    );

    const content = extractAssistantContent(res.data?.choices?.[0]?.message);
    if (!content) {
      if (process.env.NODE_ENV !== 'production') {
        const choice = res.data?.choices?.[0];
        console.error('[siliconflow] 空回复, finish_reason:', choice?.finish_reason, 'message keys:', choice?.message ? Object.keys(choice.message) : []);
      }
      const err = new Error('AI 返回内容为空');
      err.code = 'EMPTY_REPLY';
      throw err;
    }

    return {
      content: content.trim(),
      usage: res.data.usage || null,
      model
    };
  } catch (err) {
    if (err.code === 'CONFIG_ERROR' || err.code === 'EMPTY_REPLY') {
      throw err;
    }
    throw normalizeAxiosError(err, model);
  }
}

/**
 * 文本聊天补全
 * @param {Array<{role:string, content:string}>} messages
 */
async function chatCompletion(messages, options = {}) {
  return postChatCompletion({ messages, ...options }, options);
}

/**
 * 视觉识别（多模态）
 * @param {{ imageBase64: string, mimeType?: string, text?: string, systemPrompt: string }} payload
 */
async function visionCompletion(payload, options = {}) {
  const { imageBase64, mimeType = 'image/jpeg', text, systemPrompt } = payload;
  const mime = mimeType || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${imageBase64}`;

  const messages = [
    { role: 'user', content: [
      {
        type: 'image_url',
        image_url: { url: dataUrl, detail: 'low' }
      },
      {
        type: 'text',
        text: `${systemPrompt}\n\n${text || '请识别这张图片中的中国非物质文化遗产项目，并按 JSON 格式输出。'}`
      }
    ]}
  ];

  return postChatCompletion({
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.max_tokens ?? 1500
  }, options);
}

function normalizeAxiosError(err, model) {
  if (err.response) {
    const data = err.response.data;
    const upstreamMessage =
      (typeof data === 'string' ? data : null) ||
      data?.message ||
      data?.error?.message ||
      err.message;

    const wrapped = new Error(upstreamMessage || `SiliconFlow 请求失败 (${err.response.status})`);
    wrapped.code = 'API_ERROR';
    wrapped.upstreamStatus = err.response.status;
    wrapped.upstreamMessage = upstreamMessage;
    wrapped.upstreamBody = typeof data === 'object' ? data : undefined;
    wrapped.model = model;
    return wrapped;
  }

  const wrapped = new Error(err.message || 'SiliconFlow 网络请求失败');
  wrapped.code = 'API_ERROR';
  return wrapped;
}

module.exports = {
  chatCompletion,
  visionCompletion,
  DEFAULT_MODEL
};
