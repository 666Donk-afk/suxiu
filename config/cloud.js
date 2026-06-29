/**
 * 微信云开发配置（用于 AI 请求走云函数，无需配置 api.siliconflow.cn 合法域名）
 *
 * 启用步骤：
 * 1. 微信开发者工具 → 云开发 → 开通并创建环境，复制环境 ID
 * 2. 将 envId 填入下方，useCloud 改为 true
 * 3. 云开发控制台 → 设置 → 环境变量，添加 SILICONFLOW_API_KEY
 * 4. 右键 cloudfunctions/aiProxy → 上传并部署（云端安装依赖）
 */
module.exports = {
  envId: '',
  useCloud: false
};
