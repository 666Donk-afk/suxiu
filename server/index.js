/**
 * 非遗寻迹 AI 助手 — Node.js 中转服务
 *
 * 小程序 → 本服务 → SiliconFlow API
 * API Key 仅保存在 .env，禁止下发到前端
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const chatRouter = require('./routes/chat');
const routeRouter = require('./routes/route');
const recognizeRouter = require('./routes/recognize');
const { DEFAULT_MODEL } = require('./services/siliconflow');

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json({ limit: '5mb' }));

// 跨域（小程序 request 合法域名需在微信后台配置 HTTPS 域名）
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'suxiu-ai-server',
    model: process.env.SILICONFLOW_MODEL || DEFAULT_MODEL
  });
});

app.use('/api/chat', chatRouter);
app.use('/api/route', routeRouter);
app.use('/api/recognize', recognizeRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`[suxiu-ai-server] listening on http://127.0.0.1:${PORT}`);
  console.log(`  POST /api/chat      — 非遗知识解答`);
  console.log(`  POST /api/route     — 体验路线规划`);
  console.log(`  POST /api/recognize — 拍照非遗识别`);
  if (!process.env.SILICONFLOW_API_KEY) {
    console.warn('  ⚠ SILICONFLOW_API_KEY 未设置，请复制 server/.env.example 为 .env');
  }
});
