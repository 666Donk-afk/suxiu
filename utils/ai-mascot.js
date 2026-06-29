/**
 * AI 助手「小遗」形象资源
 */
const POSES = {
  idle: '/package-ai/images/guide/mascot-idle.png',
  thinking: '/package-ai/images/guide/mascot-thinking.png',
  happy: '/package-ai/images/guide/mascot-happy.png',
  error: '/package-ai/images/guide/mascot-error.png'
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
