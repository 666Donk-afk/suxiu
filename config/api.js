/**
 * 后端 API 配置
 *
 * aiTransport 可选：auto | cloud | backend | direct
 * - auto（默认）：有云开发走云函数，有 HTTPS 后端走后端，否则直连
 * - cloud：走 cloudfunctions/aiProxy（真机推荐，无需配置 siliconflow 域名）
 * - backend：走 Node 中转 server/
 * - direct：小程序直连 SiliconFlow（需配置 request 合法域名）
 */
module.exports = {
  baseUrl: 'http://127.0.0.1:3000',
  aiTransport: 'auto',
  endpoints: {
    chat: '/api/chat',
    route: '/api/route',
    recognize: '/api/recognize',
    health: '/health'
  },
  timeout: 60000
};
