# LearnFlow 项目架构文档

## 项目概述

**LearnFlow** 是一个游戏化技能学习应用。通过 AI 生成个性化技能树、数字怪兽陪伴、番茄钟计时和迷你游戏，让学习变得有趣。

| 维度 | 说明 |
|------|------|
| 名称 | LearnFlow |
| 移动端 | React Native + Expo (Expo Router) |
| 服务端 | Node.js + Express + TypeScript |
| 数据库 | MySQL 8+ (InnoDB) |
| 架构 | Monorepo（各子项目独立 package.json） |
| 部署 | Ubuntu 20.04 + PM2 + Nginx (119.91.133.45) |
| 设计 | 像素风格 + Kraken 主题 |

---

## 目录结构

```
LearnFlow/
├── mobile/                    # React Native 移动端应用
│   ├── app/                   # 页面路由（Expo Router 文件路由）
│   │   ├── _layout.tsx        # 根布局（Stack Navigator + ThemeProvider）
│   │   ├── index.tsx          # 入口 → 自动跳转 /login
│   │   ├── splash.tsx         # 启动动画
│   │   ├── story.tsx          # 故事引导（新用户）
│   │   ├── login.tsx          # 登录/注册
│   │   ├── register.tsx       # 注册
│   │   ├── verify-email.tsx   # 邮箱验证
│   │   ├── forgot-password.tsx # 忘记密码
│   │   ├── reset-password.tsx  # 重置密码
│   │   ├── onboarding.tsx     # 新手引导
│   │   ├── identity-selection.tsx # 身份选择（学生/职场）
│   │   ├── monster-selection.tsx  # 怪兽选择
│   │   ├── module-selection.tsx   # 学习模块选择
│   │   ├── skill-tree.tsx     # 技能树详情
│   │   ├── pomodoro.tsx       # 番茄钟计时
│   │   └── (tabs)/            # 底部Tab导航组
│   │       ├── _layout.tsx    # Tab 布局
│   │       ├── index.tsx      # 学习地图（首页）
│   │       ├── monster.tsx    # 怪兽页
│   │       └── profile.tsx    # 个人中心
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── ui/            # 基础 UI：Button, Input, Pixel/Cute 变体
│   │   │   ├── skill-tree/    # 技能树子组件
│   │   │   ├── FloatingInputBar.tsx  # 浮动输入栏
│   │   │   ├── MiniGames.tsx  # 推箱子小游戏
│   │   │   ├── MonsterIcon.tsx       # 怪兽 SVG
│   │   │   └── SubscriptionModal.tsx # 付费弹窗
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx      # 主题（深色/浅色）
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── services/
│   │   │   ├── api.ts         # 主 API 服务（axios）
│   │   │   └── gameService.ts # 游戏服务
│   │   ├── types/
│   │   │   └── skill.ts       # 全部 TypeScript 类型
│   │   ├── utils/
│   │   │   ├── constants.ts   # 全局常量（API_BASE_URL、颜色、怪兽配置）
│   │   │   ├── storage.ts     # AsyncStorage 封装
│   │   │   ├── auth.ts        # 认证数据管理（token/用户信息）
│   │   │   ├── helpers.ts     # 工具函数
│   │   │   ├── pricing.ts     # Pro 定价方案
│   │   │   └── useKeyboardAvoidScroll.ts # 键盘避让 Hook
│   │   ├── constants/
│   │   │   └── legal.tsx      # 隐私政策 + 服务条款
│   │   └── data/              # 静态数据
│   ├── app.json               # Expo 配置（API地址、EAS）
│   └── package.json
│
├── server/                    # Node.js 后端服务
│   ├── src/
│   │   ├── app.ts             # 入口（Express on 0.0.0.0:3001）
│   │   ├── config/
│   │   │   └── database.ts    # MySQL 连接池
│   │   ├── controllers/       # 控制器层（8个）
│   │   ├── services/          # 业务逻辑层（11个）
│   │   ├── routes/            # 路由定义（8个）
│   │   ├── models/            # 数据模型/DAO（14个）
│   │   └── types/             # TypeScript 类型
│   ├── schema.sql             # 完整数据库建表 SQL
│   ├── .env                   # 环境变量（含敏感信息）
│   └── package.json
│
├── monitor/                   # 运营监控后台（独立服务 :3002）
│   ├── dist/                  # 编译产物
│   │   ├── app.js             # Express 入口
│   │   ├── services/          # 快照采集 + 6 个数据服务
│   │   └── routes/            # 仪表盘/用户/内容/商业/运维/管理
│   └── ...
│
├── LearnFlow-Game/            # 独立游戏模块
│   └── game-recovery.html     # 游戏恢复页面（WebView使用）
│
├── docs/                      # 软著申请文档
├── image/                     # 图片资源
├── 软著申请/                  # 软著申请资料
│
├── README.md                  # 项目说明
├── PROJECT_SETUP.md           # 项目设置
├── DEPLOY.md                  # Ubuntu 部署指南
├── DEPLOY-WIN.md              # Windows 部署指南
├── WINDOWS_SETUP_GUIDE.md     # Windows 环境搭建
├── design.md                  # 设计规范（Kraken风格）
├── monsters.md                # 怪兽 AI Prompt 定义
└── swift.md                   # Ngrok/Tunnel 切换指南
```

---

## 三层架构

```
移动端                             服务端                             数据库
┌────────────────┐     HTTP      ┌───────────────────┐     SQL      ┌─────────┐
│ React Native   │ ────axios───→ │ Routes (路由层)    │ ──mysql2──→ │  MySQL  │
│ + Expo Router  │               │   ↓               │             │         │
│                │               │ Controllers (控制器)│             │ 12张表  │
│ api.ts         │               │   ↓               │             │         │
│ (7个服务模块)   │               │ Services (业务层)  │             └─────────┘
│                │               │   ↓               │
│ AsyncStorage   │               │ Models (数据模型)  │
│ (本地缓存)      │               └───────────────────┘
└────────────────┘
```

### 路由映射

| 前缀 | 路由文件 | 功能 |
|------|---------|------|
| `/api/auth` | authRoutes.ts | 注册/登录/邮箱验证/JWT/忘记密码 |
| `/api/skills` | skillRoutes.ts | AI 技能树生成/进度/推荐 |
| `/api/monster` | monsterRoutes.ts | 怪兽创建/体力/能量/对话 |
| `/api/domains` | domainRoutes.ts | 学习领域/节点进度/学习记录 |
| `/api/notes` | noteRoutes.ts | 学习笔记 CRUD |
| `/api/rewards` | rewardRoutes.ts | 奖励系统 |
| `/api/ai` | aiRoutes.ts | AI 模块填充 |
| `/api/pro` | proRoutes.ts | Pro 会员激活码 |

---

## 移动端 API 服务

`mobile/src/services/api.ts` 创建 axios 实例（baseURL 来自 app.json 配置），导出以下模块：

| 服务 | 方法数 | 覆盖的后端端点 |
|------|--------|--------------|
| authService | 9 | /auth/* 全部 |
| proService | 2 | /pro/activate, /pro/status |
| skillService | 10 | /skills/* 全部 |
| monsterService | 5 | /monster/* 常用 |
| noteService | 4 | /notes/* 全部 |
| rewardService | 3 | /rewards/* 全部 |
| domainService | 8 | /domains/* 全部 |

**请求路径示例**：axios baseURL = `https://xxx.ngrok-free.dev/api` → `api.post('/auth/login')` → 实际请求 `https://xxx.ngrok-free.dev/api/auth/login`

---

## 用户流程路由

```
启动 → /splash → /story → /identity-selection → /module-selection
                                                    ↓
              /login ←→ /register ←→ /verify-email → /onboarding
                 ↓                                          ↓
         /forgot-password                          /monster-selection
                 ↓                                          ↓
         /reset-password                            /(tabs)/index (学习地图)
                                                    /(tabs)/monster (怪兽)
              登录成功 ─────────────────→             /(tabs)/profile (个人)
                                                            ↓
                                                    /skill-tree (技能树)
                                                            ↓
                                                    /pomodoro (番茄钟)
```

---

## 数据库设计

### ER 关系
```
                    ┌─────────────────────┐
                    │       users         │ (14 列)
                    │  id (PK)            │
                    │  username, email    │ (UNIQUE ×2)
                    │  password_hash      │
                    │  is_pro             │ (TINYINT)
                    │  pro_expires_at     │ (NULL=永久)
                    │  onboarding_completed│
                    └──┬───┬───┬───┬─────┘
           ┌──────────┘   │   │   └──────────────┐
           ▼              ▼   ▼                  ▼
    device_sessions   monsters  domains      skill_trees
    (多设备登录)       (1:1)    (1:N)        (1:N,JSON树)
           │              │       │              │
           │              ▼       ▼              ▼
           │        monster_   node_progress   learning_records
           │        messages  (2 FK + status) (关联skill_trees)
           │              │       │
           │              │       ▼
           │              │   study_records
           │              │   (番茄钟记录+奖励JSON)
           │              │
           ▼              ▼
     activation_codes   notes
     (LF-前缀,套餐)     (按日期+怪兽评论)
           │
           ▼
     email_verification_tokens
     (6位验证码,10分钟)
```

### 核心表说明

| 表 | 行数预期 | 关键索引 |
|------|---------|---------|
| users | N (用户数) | username UNIQUE, email UNIQUE, is_pro |
| monsters | = users | user_id UNIQUE |
| domains | = users × 模块数 | user_id + is_active |
| node_progress | = domains × 节点数 | UNIQUE(user_id, domain_id, node_id) |
| study_records | 每次番茄钟 1 行 | user_id + domain_id |
| monster_messages | 每次对话 2 行 | user_id + created_at |

---

## 开发流程

### 本地开发（手机流量 + Ngrok 隧道）
```bash
# 终端 1：启动服务端
cd server && npm run dev

# 终端 2：启动 ngrok 隧道
ngrok http 3001

# 终端 3：更新 mobile/app.json 的 apiBaseUrl 为 ngrok https 地址
# 然后启动移动端
cd mobile && npx expo start --tunnel
```

### 本地开发（同一 WiFi）
```bash
# 终端 1
cd server && npm run dev

# 终端 2：更新 mobile/app.json 的 apiBaseUrl 为局域网 IP:3001/api
cd mobile && npx expo start
```

> **注意**：修改 `app.json` 后必须重启 Metro（Ctrl+C 再重跑）。

### NPM Scripts

| 项目 | 命令 | 说明 |
|------|------|------|
| server | `npm run dev` | 开发模式（ts-node） |
| server | `npm run build` | 编译 TS → JS |
| server | `npm start` | 生产模式 |
| mobile | `npx expo start` | 启动 Metro |
| mobile | `npx expo start --tunnel` | 启动 Metro + 隧道 |
| mobile | `npx expo build:android` | 构建 APK |

---

## 已知技术债

1. **无认证中间件**：除 auth 路由外所有 API 端点都无 JWT 保护
2. **JWT Secret 硬编码兜底值**：`'learnflow-secret-key'`
3. **登出不撤销 token**：无黑名单机制
4. **移动端认证数据存内存**：应用重启后丢失
5. **设备 ID 硬编码**：所有设备用 `'mobile-device'`
6. **邮件服务依赖 QQ SMTP**：johnkiking@foxmail.com

---

## 关键依赖一览

### 服务端（server/package.json）
- express 4.x — Web 框架
- mysql2 — MySQL 驱动
- bcryptjs — 密码哈希（12轮）
- jsonwebtoken — JWT（access 7d + refresh 30d）
- nodemailer — 邮件发送（QQ SMTP）
- openai — LLM SDK（火山引擎/DeepSeek）
- dotenv — 环境变量

### 移动端（mobile/package.json）
- expo 54.x — 框架
- expo-router 6.x — 文件路由
- expo-constants 18.x — 读取 app.json
- axios 1.6 — HTTP 客户端
- react-native-svg — 怪兽 SVG 图标
- @react-native-async-storage/async-storage — 本地存储

---

> 生成时间：2026-07-05 | 维护：随项目变更更新
