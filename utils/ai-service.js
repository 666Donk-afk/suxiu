/**
 * AI 助手 HTTP 请求封装（对接 Node.js 中转服务）
 */
const apiConfig = require('../config/api.js');

function request(path, data) {
  const url = `${apiConfig.baseUrl.replace(/\/$/, '')}${path}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'POST',
      data,
      timeout: apiConfig.timeout,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        const body = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && body.success) {
          resolve(body);
          return;
        }
        const err = new Error(body.message || `请求失败 (${res.statusCode})`);
        err.code = body.error || 'HTTP_ERROR';
        err.statusCode = res.statusCode;
        reject(err);
      },
      fail(err) {
        const e = new Error('网络请求失败，请检查后端服务是否启动及合法域名配置');
        e.code = 'NETWORK_ERROR';
        e.detail = err;
        reject(e);
      }
    });
  });
}

/**
 * 非遗知识解答 / 关键词故事生成
 * @param {string} message
 * @param {object} userContext
 * @param {string} locale
 * @param {{ intent?: 'knowledge'|'story' }} options
 */
function chat(message, userContext, locale, options) {
  const payload = {
    message: message || '',
    userContext,
    locale: locale || 'zh-CN'
  };
  if (options && options.intent) {
    payload.intent = options.intent;
  }
  if (options && options.imageBase64) {
    payload.imageBase64 = options.imageBase64;
    payload.mimeType = options.mimeType || 'image/jpeg';
  }
  return request(apiConfig.endpoints.chat, payload);
}

/**
 * 非遗体验路线规划
 * @param {object} payload - { message } 或 { time, interest, type }
 * @param {object} userContext
 * @param {string} locale
 */
function planRoute(payload, userContext, locale) {
  return request(apiConfig.endpoints.route, {
    ...payload,
    userContext,
    locale: locale || 'zh-CN'
  });
}

/**
 * 拍照非遗识别
 * @param {string} imageBase64
 * @param {string} mimeType
 * @param {object} userContext
 * @param {string} locale
 */
function recognize(imageBase64, mimeType, userContext, locale) {
  return request(apiConfig.endpoints.recognize, {
    imageBase64,
    mimeType: mimeType || 'image/jpeg',
    userContext,
    locale: locale || 'zh-CN'
  });
}

module.exports = {
  chat,
  planRoute,
  recognize
};
