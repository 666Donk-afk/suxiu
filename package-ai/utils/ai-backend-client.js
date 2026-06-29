/**
 * 通过自建 Node 后端调用 AI（需在小程序后台配置后端 HTTPS 域名）
 */
const apiConfig = require('../../config/api.js');

function postJson(path, body) {
  const baseUrl = (apiConfig.baseUrl || '').replace(/\/$/, '');
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${path}`,
      method: 'POST',
      timeout: apiConfig.timeout || 60000,
      header: { 'Content-Type': 'application/json' },
      data: body,
      success(res) {
        const data = res.data || {};
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success !== false) {
          resolve(data);
          return;
        }
        const err = new Error(data.message || `AI 请求失败 (${res.statusCode})`);
        err.code = 'API_ERROR';
        err.statusCode = res.statusCode;
        reject(err);
      },
      fail(detail) {
        const err = new Error('无法连接 AI 后端，请检查网络并在小程序后台配置后端 request 合法域名');
        err.code = 'NETWORK_ERROR';
        err.detail = detail;
        reject(err);
      }
    });
  });
}

function chat(payload) {
  return postJson(apiConfig.endpoints.chat, payload);
}

function planRoute(payload) {
  return postJson(apiConfig.endpoints.route, payload);
}

function recognize(payload) {
  return postJson(apiConfig.endpoints.recognize, payload);
}

module.exports = {
  chat,
  planRoute,
  recognize
};
