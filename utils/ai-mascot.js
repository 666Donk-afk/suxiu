/**
 * AI 助手「小遗」形象资源与状态映射（仅智能体模块使用）
 */
const POSES = {
  idle: '/images/guide/mascot-idle.png',
  thinking: '/images/guide/mascot-thinking.png',
  happy: '/images/guide/mascot-happy.png',
  error: '/images/guide/mascot-error.png'
};

const DEFAULT = POSES.idle;

function getPoseSrc(status) {
  return POSES[status] || DEFAULT;
}

module.exports = {
  POSES,
  DEFAULT,
  getPoseSrc
};
