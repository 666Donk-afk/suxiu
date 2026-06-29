/**
 * 云函数代理 SiliconFlow — 小程序端无需配置 api.siliconflow.cn 合法域名
 * 环境变量：SILICONFLOW_API_KEY（必填）、SILICONFLOW_MODEL（可选）
 */
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const DEFAULT_MODEL = 'nex-agi/Nex-N2-Pro';

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

async function chatCompletion(event) {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      code: 'CONFIG_ERROR',
      message: '请在云开发环境变量中配置 SILICONFLOW_API_KEY'
    };
  }

  const model = event.model || process.env.SILICONFLOW_MODEL || DEFAULT_MODEL;
  const response = await axios.post(
    API_URL,
    {
      model,
      messages: event.messages,
      temperature: event.temperature ?? 0.7,
      max_tokens: event.max_tokens ?? 2048,
      stream: false
    },
    {
      timeout: event.timeout || 90000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = response.data || {};
  const content = extractAssistantContent(data.choices && data.choices[0] && data.choices[0].message);
  if (!content) {
    return {
      success: false,
      code: 'EMPTY_REPLY',
      message: 'AI 返回内容为空'
    };
  }

  return {
    success: true,
    content,
    usage: data.usage || null
  };
}

exports.main = async event => {
  try {
    const type = event && event.type;
    if (type === 'chatCompletion') {
      return await chatCompletion(event);
    }
    return {
      success: false,
      code: 'BAD_REQUEST',
      message: `未知请求类型: ${type || '(empty)'}`
    };
  } catch (err) {
    const status = err.response && err.response.status;
    const remote = err.response && err.response.data;
    const message = (remote && (remote.message || (remote.error && remote.error.message)))
      || err.message
      || 'AI 服务暂时不可用';
    return {
      success: false,
      code: status ? 'API_ERROR' : 'NETWORK_ERROR',
      statusCode: status,
      message
    };
  }
};
