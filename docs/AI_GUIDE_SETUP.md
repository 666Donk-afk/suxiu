# AI 非遗助手模块 — 接入说明

## 架构（独立 Node.js 后端，不使用微信云开发）

```
微信小程序（前端）
    ↓ wx.request HTTPS
Node.js + Express 中转服务（server/）
    ↓ Axios + Bearer Token
SiliconFlow OpenAI 兼容 API（nex-agi/Nex-N2-Pro，支持多模态识别）
```

**API Key 仅保存在 `server/.env`，禁止写入小程序代码或仓库。**

---

## 目录结构

```
suxiu/
├── server/                          # Node.js 中转服务
│   ├── index.js                     # Express 入口
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   ├── chat.js                  # POST /api/chat
│   │   └── route.js                 # POST /api/route
│   ├── services/
│   │   └── siliconflow.js           # SiliconFlow 调用
│   ├── prompts/
│   │   └── system.js                # 系统 Prompt
│   └── utils/
│       └── json.js                  # 路线 JSON 解析
├── config/
│   └── api.js                       # 小程序后端 baseUrl（无密钥）
├── utils/
│   ├── ai-service.js                # HTTP 请求封装
│   ├── ai-context.js                # 开局引导上下文
│   └── ai-intent.js                 # 路线/问答意图识别
├── components/
│   ├── guide-mascot/                # 首页悬浮虚拟角色
│   ├── chat-message/                # 聊天气泡
│   └── route-card/                  # 路线规划卡片
├── pages/
│   └── ai-guide/                    # 聊天页
└── images/guide/mascot-sheet.png      # 角色立绘
```

---

## 一、启动后端

### 首次配置（仅第一次需要）

1. 进入 `server` 目录，安装依赖：

```powershell
cd server
npm install
```

2. 配置密钥（**二选一，不要重复执行覆盖**）：

- **若 `server/.env` 已存在且已填入密钥**：跳过复制，直接启动（见下方「日常启动」）。
- **若还没有 `.env`**：复制模板后编辑：

```powershell
# 仅当 .env 不存在时执行
Copy-Item .env.example .env
```

然后用编辑器打开 `server/.env`，填入：

```
SILICONFLOW_API_KEY=你的密钥
```

> ⚠️ **不要**在已有 `.env` 时再执行 `Copy-Item .env.example .env` 或 `cp .env.example .env`，否则会覆盖已保存的密钥。终端若询问「是否覆盖/删除文件」，选 **否**。

### 日常启动（每次开发 AI 功能前）

```powershell
cd server
npm run dev
```

看到以下输出表示成功，**保持该终端窗口不要关闭**：

```
[suxiu-ai-server] listening on http://127.0.0.1:3000
```

服务默认地址：`http://127.0.0.1:3000`

验证（PowerShell）：

```powershell
(Invoke-WebRequest -Uri http://127.0.0.1:3000/health -UseBasicParsing).Content
```

应返回 `{"ok":true,...}`。

---

## 二、配置小程序

### 方式 A：微信云函数（真机推荐，无需配置 SiliconFlow 域名）

微信小程序 **request 合法域名** 只能访问已白名单域名；真机无法直连 `api.siliconflow.cn` 时会报网络错误。

按微信云开发规范，通过 **云函数** 在服务端请求第三方 API，小程序只调用 `wx.cloud.callFunction`（无需添加 siliconflow 域名）。

1. 微信开发者工具 → **云开发** → 开通并创建环境，复制 **环境 ID**
2. 编辑 `config/cloud.js`：
   ```javascript
   module.exports = {
     envId: '你的环境ID',
     useCloud: true
   };
   ```
3. 云开发控制台 → **设置 → 环境变量**，添加：
   - `SILICONFLOW_API_KEY` = 你的 SiliconFlow 密钥
   - （可选）`SILICONFLOW_MODEL` = `nex-agi/Nex-N2-Pro`
4. 在开发者工具中右键 `cloudfunctions/aiProxy` → **上传并部署：云端安装依赖**
5. 重新编译，真机测试 AI 助手

### 方式 B：直连 SiliconFlow（需配置域名）

编辑 `config/ai-secret.js`（从 `ai-secret.example.js` 复制），填入 API Key。

微信公众平台 → 开发 → 开发管理 → 服务器域名 → **request 合法域名** 添加：

```
https://api.siliconflow.cn
```

`config/api.js` 中保持 `aiTransport: 'auto'` 或设为 `'direct'`。

### 方式 C：自建 Node 后端

编辑 `config/api.js`：

```javascript
module.exports = {
  baseUrl: 'https://你的域名.com',  // 生产环境必须 HTTPS
  aiTransport: 'auto',  // 或 'backend'
  // ...
};
```

微信公众平台 → **request 合法域名** 添加上述 HTTPS 域名（不是你的 SiliconFlow 域名）。

本地调试：`http://127.0.0.1:3000` + 开发者工具勾选「不校验合法域名」。

---

## 三、API 接口

### POST /api/chat — 非遗知识解答

**请求：**

```json
{
  "message": "介绍一下皮影戏",
  "userContext": { "journey": {}, "cityHeritages": [], "interestHeritages": [] },
  "locale": "zh-CN"
}
```

**响应：**

```json
{
  "success": true,
  "reply": "皮影戏是..."
}
```

### POST /api/route — 体验路线规划

**请求（自然语言）：**

```json
{
  "message": "我有3小时，喜欢传统手工艺，希望多体验互动项目",
  "userContext": {}
}
```

**或结构化：**

```json
{
  "time": "3小时",
  "interest": "传统手工艺",
  "type": "家庭亲子"
}
```

**响应：**

```json
{
  "success": true,
  "route": {
    "title": "传统手工艺深度体验路线",
    "duration": "3小时",
    "reason": "该路线互动性强...",
    "steps": [
      { "name": "剪纸体验馆", "description": "..." },
      { "name": "皮影戏互动区", "description": "..." }
    ]
  }
}
```

---

## 四、功能说明

| 功能 | 接口 | 展示 |
|------|------|------|
| 非遗知识解答 | `/api/chat` | 文本气泡（200-500字） |
| 关键词非遗故事 | `/api/chat`（`intent: story` 或含「故事/传说」等词） | 文本气泡（300-800字） |
| 体验路线规划 | `/api/route` | `route-card` 卡片组件 |
| 拍照非遗识别 | `/api/recognize` | `recognize-card` 卡片 + 用户图片气泡 |
| 上传图片提问 | `/api/chat` + `imageBase64` | 用户图片气泡 + 文本回复 |
| 开局引导上下文 | 自动注入 userContext | 聊天页顶部提示条 |
| 快捷提问 | 5 条默认 chips | 需求文档指定文案 |

**意图识别**：含「路线、规划、小时、亲子」等关键词，或点击「推荐体验路线」，自动调用 `/api/route`；含「故事、传说、典故、讲讲」或点击「讲个非遗故事」，`/api/chat` 切换为故事生成模式。

---

## 五、环境变量（server/.env）

| 变量 | 说明 |
|------|------|
| `SILICONFLOW_API_KEY` | 硅基流动 API Key（必填） |
| `PORT` | 服务端口，默认 3000 |
| `SILICONFLOW_MODEL` | 默认 `nex-agi/Nex-N2-Pro` |
| `CORS_ORIGIN` | 跨域来源，开发可用 `*` |

---

## 六、生产部署建议

1. 使用 Nginx 反向代理 + HTTPS 证书
2. 使用 PM2 守护进程：`pm2 start server/index.js --name suxiu-ai`
3. `.env` 通过服务器环境变量注入，勿提交 Git
4. 接入微信 `msgSecCheck` 做内容安全审核
5. 按 openid 限流（可在 Express 中间件扩展）

---

## 七、本地联调步骤

1. 启动后端（见上文「日常启动」）：

```powershell
cd server
npm run dev
```

2. 确认 `config/api.js` 中本地地址：

```javascript
baseUrl: 'http://127.0.0.1:3000'   // 电脑模拟器
// 手机真机预览时改为电脑局域网 IP，如 http://192.168.1.100:3000
```

3. 微信开发者工具 → **详情 → 本地设置 → 勾选「不校验合法域名、web-view…」**

4. 重新编译小程序，完成启程指引后，点击首页 **AI非遗助手** 测试

---

## 八、常见报错

### `net::ERR_CONNECTION_REFUSED`

**原因**：后端未启动，或 3000 端口没有进程监听。

**处理**：

1. 在 `server` 目录执行 `npm run dev`，确认出现 `listening on http://127.0.0.1:3000`
2. 不要关闭运行后端的终端窗口
3. 真机调试时不能用 `127.0.0.1`，须改为电脑的局域网 IP（`ipconfig` 查看 IPv4）

### 终端询问「是否删除 / 覆盖两个文件」

**常见原因**：

| 操作 | 说明 | 建议 |
|------|------|------|
| `Copy-Item .env.example .env` | 试图覆盖已有 `.env` | 选 **否**，避免密钥被模板覆盖 |
| `npm install` | 更新 `node_modules` 依赖 | 一般可选 **是**，不影响业务源码 |

**日常开发只需**：`cd server` → `npm run dev`，无需再复制 `.env`。

### 「routeDone with a webviewId is not found」

**原因**：多为微信开发者工具 / 基础库（3.15+）的路由监控上报，或页面跳转过快（连点返回、返回时仍有异步请求）。

**处理**：

1. **若功能正常**：可忽略，或尝试降低调试基础库版本（如 3.5.x）
2. **若页面卡死**：重新编译；避免连点返回；从首页重新进入 AI 助手
3. 本项目已对 AI 助手页 `goBack` 做防抖，并避免 `navigateBack` 失败后再 `switchTab` 的重复跳转

---

**原因**：小程序已连上本地后端，但 **SiliconFlow 上游 API 调用失败**（不是网络断开）。

**排查**：

1. 看运行 `npm run dev` 的终端，会打印类似：
   ```
   [chat] SiliconFlow HTTP 403: Sorry, your account balance is insufficient
   ```
2. 或在开发者工具 **Network** 里查看 `/api/chat` 响应，开发环境下会附带 `detail` 字段（含 SiliconFlow 原始错误说明）。

**常见 SiliconFlow 错误**：

| HTTP | 含义 | 处理 |
|------|------|------|
| 403 | 权限不足 / **余额不足** / 需实名认证 | 登录 [SiliconFlow 控制台](https://cloud.siliconflow.cn/) 充值或完成实名认证 |
| 401 | API Key 无效 | 检查 `server/.env` 中的 `SILICONFLOW_API_KEY` |
| 429 | 请求过于频繁 | 稍后再试 |
