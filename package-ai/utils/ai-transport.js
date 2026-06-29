/**
 * AI 请求通道：云函数（推荐真机）> 自建后端 > 直连 SiliconFlow
 */
const cloudConfig = require('../../config/cloud.js');
const apiConfig = require('../../config/api.js');

function isLocalHost(url) {
  return !url || /127\.0\.0\.1|localhost/i.test(url);
}

function resolveTransportMode() {
  const forced = apiConfig.aiTransport;
  if (forced === 'cloud' || forced === 'backend' || forced === 'direct') {
    return forced;
  }

  if (cloudConfig.useCloud && cloudConfig.envId && wx.cloud) {
    return 'cloud';
  }

  if (apiConfig.baseUrl && !isLocalHost(apiConfig.baseUrl)) {
    return 'backend';
  }

  return 'direct';
}

module.exports = {
  resolveTransportMode,
  isCloudEnabled() {
    return !!(cloudConfig.useCloud && cloudConfig.envId && wx.cloud);
  }
};
