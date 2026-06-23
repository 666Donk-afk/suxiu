/**
 * SiliconFlow OpenAI 兼容接口封装
 * API Key 仅从 process.env 读取
 */
const axios = require('axios');

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

function getConfig() {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    const err = new Error('SILICONFLOW_API_KEY 未配置');
    err.code = 'CONFIG_ERROR';
    throw err;
  }
  return {
    apiKey,
    model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'
  };
}

/**
 * 调用聊天补全
 * @param {Array<{role:string, content:string}>} messages
 * @param {{ temperature?: number, max_tokens?: number }} options
 */
async function chatCompletion(messages, options = {}) {
  const { apiKey, model } = getConfig();

  try {
    const res = await axios.post(
      API_URL,
      {
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2048,
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 55000
      }
    );

    const content = res.data?.choices?.[0]?.message?.content;
    if (!content) {
      const err = new Error('AI 返回内容为空');
      err.code = 'EMPTY_REPLY';
      throw err;
    }

    return {
      content: content.trim(),
      usage: res.data.usage || null
    };
  } catch (err) {
    if (err.code === 'CONFIG_ERROR' || err.code === 'EMPTY_REPLY') {
      throw err;
    }
    throw normalizeAxiosError(err, model);
  }
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
  chatCompletion
};
