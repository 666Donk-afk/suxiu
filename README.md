# 非遗寻迹（Intangible Heritage Explorer）

基于微信原生小程序的中国非物质文化遗产城市探索应用。

## 技术栈

- JavaScript (ES6+)
- WXML / WXSS
- 微信小程序原生 API

## 快速开始

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，选择「导入项目」
3. 目录选择本项目根目录 `suxiu`
4. AppID 可使用测试号或 `touristappid`
5. 在「详情 → 本地设置」中勾选 **不校验合法域名**（若使用网络图片时需要）
6. 点击编译即可运行
7. 如若需要使用ai助手，需要将https://api.siliconflow.cn添加至request合法域名内（未使用云开发）

> 项目已内置本地占位图（`images/` 目录），Banner、城市封面、非遗封面均可离线显示。如需真实照片，可将图片放入对应目录后修改 `data/images.js`，或重新运行 `node scripts/generate-images.js`。

## 项目结构

```
suxiu/
├── app.js / app.json / app.wxss    # 小程序入口与全局样式
├── custom-tab-bar/                 # 自定义底部 TabBar
├── components/heritage-card/       # 非遗列表卡片组件
├── data/
│   ├── cities.js                   # 20 个城市 Mock 数据
│   └── heritages.js                # 100+ 非遗项目 Mock 数据
├── utils/
│   ├── storage.js                  # 收藏 / 历史 / 搜索历史
│   ├── search.js                   # 模糊搜索
│   └── util.js                     # 通用工具
└── pages/
    ├── index/          # 首页
    ├── city/           # 城市
    ├── favorite/       # 收藏
    ├── profile/        # 我的
    ├── city-detail/    # 城市详情
    ├── heritage-detail/# 非遗详情
    ├── search/         # 搜索
    ├── history/        # 浏览历史
    ├── about/          # 关于我们
    └── feedback/       # 意见反馈
```

## Demo 数据说明

当前为 **湖北非遗 Demo**，数据来自 Excel 表格，共 **36 个省份、300余项非遗**：



图片已从 Excel 嵌入资源提取至 `images/heritage/`（`hanju.jpg`、`baishou.jpg` 等），无需联网即可显示。

重新从 Excel 同步图文（推荐）：

```bash
python scripts/sync-excel-demo.py
```

- 文字读取：`湖北省(副本) (2)(1).xlsx`（新文档）
- 图片提取：按**非遗名称**匹配旧版嵌入图，保存为 `images/heritage/*.jpg`

| 模块 | 功能 |
|------|------|
| 首页 | Banner 轮播、热门城市横滑、热门非遗推荐 |
| 城市 | 搜索联想、热门网格、A-Z 索引、城市详情分页 |
| 非遗详情 | 沉浸式头图、时间轴、传承现状、图文轮播、分享 |
| 收藏 | 本地缓存、搜索、删除 |
| 搜索 | 城市/非遗分类结果、搜索历史 |
| 我的 | 收藏/浏览统计、历史、反馈、关于 |

## 视觉规范

继承参考图的「现代国风」设计语言：

- **主色** `#A0301F` 朱砂红
- **背景** `#FFF9F0` / `#F9F3E7` 宣纸米白
- **强调** `#E67E22` 暖橙（点赞数据）
- **标题** 宋体/衬线，**正文** 苹方/黑体
- **圆角** 卡片 16–40rpx，按钮胶囊形

## 许可证

见 [LICENSE](LICENSE)
