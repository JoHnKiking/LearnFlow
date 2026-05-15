# LearnFlow - 沉浸式技能学习伴侣

## 项目简介

LearnFlow 是一款基于 React Native + Expo 的技能学习应用，通过像素风格界面与游戏化机制让学习更有趣。用户可选择 AI 生成的技能树学习路径，在数字宠物的陪伴下完成学习节点，通过迷你游戏恢复体力，配合番茄钟专注学习。

## 核心功能

### 用户系统
- **手机号/邮箱注册登录**：JWT 令牌认证，支持设备会话管理
- **新手引导流程**：启动页 → 故事介绍 → 怪物选择 → 模块选择 → 进入学习
- **个人中心**：查看学习统计、笔记管理、设置

### 技能树学习
- **AI 生成技能树**：输入领域名称，由 LLM 自动生成树形学习路径
- **三阶段递进**：初级 → 中级 → 高级，覆盖认知-能力-实战
- **学习资源链接**：每个节点包含 B站/小红书/MOOC 等平台链接
- **进度跟踪**：实时记录节点完成状态，支持知识导图跳转

### 数字宠物陪伴
- **三种性格类型**：

  | 类型 | 特殊能力 | 适用场景 |
  |------|---------|---------|
  | 活力型 (lively) | AI 对话能量消耗减半 | 经常使用 AI 对话 |
  | 沉稳型 (calm) | 体力上限 +20 | 长时间连续学习 |
  | 叛逆型 (rebel) | 游戏奖励翻倍 | 喜欢玩小游戏 |

- **体力系统**：学习消耗体力，游戏恢复体力，每日凌晨 5 点自动恢复
- **能量系统**：AI 对话消耗能量，游戏恢复能量
- **等级成长**：通过学习获得经验值升级
- **AI 对话**：支持与怪物实时聊天

### 迷你游戏
- **数独游戏**：经典 9×9 数独挑战
- **推箱子游戏**：完成 3 关获得奖励
- **每日限制**：每天可玩 4 次

### 学习工具
- **番茄钟**：25/45/60/90/120/180 分钟专注计时，支持任务管理
- **学习笔记**：随时记录学习心得
- **帮助与反馈**：使用指南、常见问题、联系支持

## 技术栈

### 移动端
| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.81 + Expo 54 |
| 路由 | Expo Router 6.0（文件系统路由） |
| 语言 | TypeScript 5.9 |
| 状态管理 | React Hooks + Context API |
| 本地存储 | AsyncStorage 2.2 |
| UI | 像素风格自定义组件库 |
| 网络请求 | Axios 1.6 |
| WebView | react-native-webview 13.15 |

### 服务端
| 类别 | 技术 |
|------|------|
| 框架 | Node.js + Express 4 |
| 语言 | TypeScript 5 |
| 数据库 | MySQL 8.0 |
| 认证 | JWT + bcryptjs |
| AI 集成 | OpenAI SDK（LLM 生成技能树） |
| CORS | 支持 ngrok 隧道 + 自定义域名 |

## 项目结构

```
LearnFlow/
├── mobile/                        # React Native 移动端
│   ├── app/                       # Expo Router 页面
│   │   ├── _layout.tsx            # 根路由配置
│   │   ├── index.tsx              # 入口（登录状态检查 + 路由分发）
│   │   ├── splash.tsx             # 启动页
│   │   ├── login.tsx              # 登录
│   │   ├── register.tsx           # 注册
│   │   ├── story.tsx              # 故事介绍
│   │   ├── onboarding.tsx         # 新手引导
│   │   ├── monster-selection.tsx  # 怪物选择
│   │   ├── module-selection.tsx   # 模块选择
│   │   ├── skill-tree.tsx         # 技能树详情
│   │   └── (tabs)/                # 底部标签页
│   │       ├── _layout.tsx        # 标签页布局
│   │       ├── index.tsx          # 首页（地图）
│   │       ├── monster.tsx        # 怪物陪伴
│   │       └── profile.tsx        # 个人中心
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # PixelButton, PixelCard, PixelInput, CuteButton 等
│   │   │   ├── skill-tree/        # SkillTreeNode, SkillTreeView
│   │   │   ├── GameModal.tsx      # 游戏弹窗（数独 + 推箱子）
│   │   │   ├── MiniGames.tsx      # 迷你游戏组件
│   │   │   ├── MonsterIcon.tsx    # 怪物像素图标
│   │   │   ├── HelpModal.tsx      # 帮助弹窗
│   │   │   ├── GameHelpModal.tsx  # 游戏帮助弹窗
│   │   │   ├── AnimatedCheckbox.tsx
│   │   │   └── index.ts           # 组件统一导出
│   │   ├── data/
│   │   │   ├── mockData.ts        # 模拟数据
│   │   │   ├── skillTrees.ts      # 预置技能树数据
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── api.ts             # API 服务层
│   │   │   └── gameService.ts     # 游戏服务
│   │   ├── hooks/
│   │   │   ├── useSkillTree.ts
│   │   │   ├── useSearch.ts
│   │   │   ├── useStatistics.ts
│   │   │   ├── useKeyboardPositioning.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── auth.ts            # 认证工具
│   │   │   ├── storage.ts         # 本地存储
│   │   │   ├── constants.ts       # 常量配置
│   │   │   ├── helpers.ts         # 辅助函数
│   │   │   └── index.ts
│   │   └── types/                 # TypeScript 类型定义
│   │       └── skill.ts
│   ├── assets/                    # 图片、字体等静态资源
│   ├── app.json
│   └── package.json
│
├── server/                        # Node.js 后端
│   ├── src/
│   │   ├── app.ts                 # Express 应用入口
│   │   ├── config/                # 数据库等配置
│   │   │   └── database.ts
│   │   ├── controllers/           # 控制器层
│   │   │   ├── authController.ts
│   │   │   ├── skillController.ts
│   │   │   ├── monsterController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── rewardController.ts
│   │   │   ├── domainController.ts
│   │   │   └── index.ts
│   │   ├── models/                # 数据模型（12 个模型）
│   │   │   ├── User.ts
│   │   │   ├── DeviceSession.ts
│   │   │   ├── SkillTree.ts
│   │   │   ├── LearningRecord.ts
│   │   │   ├── NodeProgress.ts
│   │   │   ├── StudyRecord.ts
│   │   │   ├── PopularDomain.ts
│   │   │   ├── Domain.ts
│   │   │   ├── Monster.ts
│   │   │   ├── MonsterMessage.ts
│   │   │   ├── Note.ts
│   │   │   ├── Reward.ts
│   │   │   └── index.ts
│   │   ├── routes/                # 路由层
│   │   │   ├── authRoutes.ts
│   │   │   ├── skillRoutes.ts
│   │   │   ├── monsterRoutes.ts
│   │   │   ├── noteRoutes.ts
│   │   │   ├── rewardRoutes.ts
│   │   │   ├── domainRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/              # 业务逻辑层
│   │   │   ├── authService.ts
│   │   │   ├── databaseService.ts
│   │   │   ├── skillService.ts
│   │   │   ├── llmService.ts      # LLM 集成服务
│   │   │   ├── monsterService.ts
│   │   │   ├── noteService.ts
│   │   │   ├── rewardService.ts
│   │   │   ├── domainService.ts
│   │   │   └── index.ts
│   │   └── types/                 # TypeScript 类型定义
│   │       ├── skill.ts
│   │       └── index.ts
│   ├── sql/                       # 数据库初始化脚本
│   ├── schema.sql                 # 数据库表结构
│   ├── scripts/                   # 辅助脚本
│   └── package.json
│
├── LearnFlow-Game/                # 游戏独立部署
│   ├── game-recovery.html         # 游戏恢复页面
│   └── timer-app/                 # 番茄钟 Web 版
│
├── PROJECT_SETUP.md               # 项目设置指南
└── WINDOWS_SETUP_GUIDE.md         # Windows 环境搭建指南
```

## 数据库设计

核心表结构（详见 [schema.sql](server/schema.sql)）：

| 表名 | 说明 |
|------|------|
| `users` | 用户表（手机号/邮箱注册，微信登录支持） |
| `device_sessions` | 设备会话表（多设备登录管理） |
| `skill_trees` | 技能树表（JSON 存储树结构） |
| `learning_records` | 学习记录表（节点完成状态、学习时长） |
| `node_progress` | 节点进度表（单个节点学习进度） |
| `study_records` | 学习记录表（番茄钟学习记录） |
| `popular_domains` | 热门领域表（搜索统计） |
| `domains` | 领域表（领域分类管理） |
| `monsters` | 怪物表（性格类型、体力/能量、等级经验） |
| `monster_messages` | 怪物消息表（AI 对话记录） |
| `notes` | 笔记表（学习笔记） |
| `rewards` | 奖励表（游戏奖励记录） |

## API 端点

### 认证 (`/api/auth`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/register` | 用户注册 |
| POST | `/login` | 用户登录 |
| POST | `/refresh-token` | 刷新令牌 |
| POST | `/verify-token` | 验证令牌 |
| POST | `/logout` | 用户登出 |

### 技能树 (`/api/skills`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/generate` | AI 生成技能树 |
| GET | `/list` | 获取技能树列表 |
| GET | `/:id` | 获取单个技能树 |
| POST | `/save` | 保存用户技能树 |
| GET | `/progress/:userId` | 获取用户进度 |
| PUT | `/progress/:userId` | 更新用户进度 |
| GET | `/search/domains` | 搜索热门领域 |
| GET | `/recommendations/path` | 获取推荐学习路径 |
| GET | `/stats/overview` | 获取统计概览 |
| GET | `/report/:userId` | 获取学习报告 |

### 怪物 (`/api/monster`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/create` | 创建怪物 |
| GET | `/status/:userId` | 获取怪物状态 |
| POST | `/stamina/consume` | 消耗体力 |
| POST | `/stamina/recover` | 恢复体力 |
| POST | `/energy/consume` | 消耗能量 |
| POST | `/energy/consume-amount` | 消耗指定能量 |
| POST | `/energy/recover` | 恢复能量 |
| POST | `/exp/add` | 增加经验值 |
| POST | `/chat` | AI 对话 |
| GET | `/messages/:userId` | 获取对话记录 |

### 笔记 (`/api/notes`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/` | 创建笔记 |
| GET | `/user/:userId` | 获取用户笔记列表 |
| GET | `/:id` | 获取单个笔记 |
| PUT | `/:id` | 更新笔记 |
| DELETE | `/:id` | 删除笔记 |

### 奖励 (`/api/rewards`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/` | 创建奖励记录 |
| GET | `/user/:userId` | 获取用户奖励记录 |

### 领域 (`/api/domains`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 获取领域列表 |
| POST | `/` | 创建领域 |

## 快速开始

### 环境要求
- Node.js 16.0+
- MySQL 8.0+
- Expo CLI（移动端）

### 1. 启动后端

```bash
cd server
cp .env.example .env   # 编辑 .env 配置数据库和 API Key
npm install
npm run dev             # 启动在 http://localhost:3001
```

### 2. 配置环境变量

编辑 `server/.env`：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=learnflow
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### 3. 初始化数据库

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS learnflow;"
mysql -u root -p learnflow < server/schema.sql
```

### 4. 启动移动端

```bash
cd mobile
npm install
npm start               # 使用 Expo Go 扫码运行
```

详细设置请参考 [PROJECT_SETUP.md](PROJECT_SETUP.md) 和 [WINDOWS_SETUP_GUIDE.md](WINDOWS_SETUP_GUIDE.md)。

## 用户引导流程

```
应用启动 → 启动页动画 → 登录/注册 → 故事介绍 → 选择怪物伙伴 → 选择学习模块 → 进入主页
```

登录后，应用会检查用户是否已完成新手教程，未完成则自动进入引导流程。

## 核心机制

### 体力系统
- **上限**：100（沉稳型 +20）
- **恢复**：每日凌晨 5 点自动回满
- **消耗**：每次学习消耗 10 点
- **获取**：完成迷你游戏获得体力奖励

### 能量系统
- **上限**：50
- **消耗**：AI 对话按 token 消耗（活力型减半）
- **获取**：完成迷你游戏获得能量奖励

### 游戏系统
- **每日限制**：4 次/天
- **数独**：完成一局获得奖励
- **推箱子**：完成 3 关获得奖励
- **奖励**：体力值 + 能量值（叛逆型翻倍）

## 设计风格

像素复古风格，蓝紫渐变背景，主色调蓝色 (#5D9BFA)，强调色橙色 (#FF7D00)，辅助色金色 (#FFD700)，深色背景 (#1A1A2E) 营造沉浸感。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 发起 Pull Request

## 许可证

MIT License