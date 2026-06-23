/**
 * 后端 API 配置（不含密钥）
 * baseUrl 需为 HTTPS 域名，并在微信小程序后台配置 request 合法域名
 */
module.exports = {
  // 开发：本地调试可在开发者工具勾选「不校验合法域名」，使用局域网 IP
  // 生产：填写已备案 HTTPS 域名，如 https://api.yourdomain.com
  baseUrl: 'http://127.0.0.1:3000',

  endpoints: {
    chat: '/api/chat',
    route: '/api/route',
    health: '/health'
  },

  timeout: 60000
};
