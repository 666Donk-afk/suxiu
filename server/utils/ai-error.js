/**
 * 统一处理 SiliconFlow / AI 调用错误（开发环境输出详情）
 */
const IS_DEV = process.env.NODE_ENV !== 'production';

function logAiError(tag, err) {
  console.error(`[${tag}]`, err.message);

  if (err.upstreamStatus) {
    console.error(
      `[${tag}] SiliconFlow HTTP ${err.upstreamStatus}:`,
      err.upstreamMessage || '(无 message)'
    );
  }

  if (IS_DEV && err.upstreamBody) {
    console.error(`[${tag}] SiliconFlow 响应体:`, JSON.stringify(err.upstreamBody));
  }
}

function respondAiError(res, err, { tag = 'ai', configMessage, defaultMessage }) {
  if (err.code === 'CONFIG_ERROR') {
    logAiError(tag, err);
    return res.status(503).json({ success: false, message: configMessage });
  }

  logAiError(tag, err);

  const body = { success: false, message: defaultMessage };
  if (IS_DEV) {
    if (err.code === 'EMPTY_REPLY') {
      body.detail = '模型返回空内容，可能是提示词过长或该模型暂不支持当前图片格式';
    } else if (err.upstreamMessage) {
      body.detail = `[SiliconFlow ${err.upstreamStatus || '?'}] ${err.upstreamMessage}`;
    }
  }

  return res.status(500).json(body);
}

module.exports = {
  IS_DEV,
  logAiError,
  respondAiError
};
