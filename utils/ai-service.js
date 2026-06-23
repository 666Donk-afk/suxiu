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
 * 非遗知识解答
 * @param {string} message
 * @param {object} userContext
 * @param {string} locale
 */
function chat(message, userContext, locale) {
  return request(apiConfig.endpoints.chat, {
    message,
    userContext,
    locale: locale || 'zh-CN'
  });
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

module.exports = {
  chat,
  planRoute
};
