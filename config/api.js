/**
 * 后端 API 配置（可选，AI 助手已改为小程序直连 SiliconFlow）
 */
module.exports = {
  baseUrl: 'http://127.0.0.1:3000',
  endpoints: {
    chat: '/api/chat',
    route: '/api/route',
    recognize: '/api/recognize',
    health: '/health'
  },
  timeout: 60000
};
