# LearnFlow - 技能学习路径管理系统

## 🏗️ 项目架构概览

LearnFlow采用现代化的前后端分离架构，移动端基于React Native + Expo，服务端基于Node.js + Express + MySQL，为技能学习提供智能化的路径规划和管理。

### **整体架构**
```
LearnFlow/
├── 📱 mobile/                    # React Native移动端应用
│   ├── 🗂️ app/                   # Expo Router页面架构
│   │   ├── _layout.tsx           # 根路由配置
│   │   ├── index.tsx             # 应用入口（认证检查）
│   │   ├── login.tsx             # 用户登录页面
│   │   ├── register.tsx          # 用户注册页面
│   │   ├── skill-tree.tsx        # 技能树详情页面
│   │   └── (tabs)/               # 底部标签页导航
│   │       ├── _layout.tsx       # 标签页布局
│   │       ├── index.tsx         # 首页 - 应用概览
│   │       ├── generate.tsx      # 技能树生成
│   │       ├── search.tsx        # 技能树搜索
│   │       └── profile.tsx       # 个人中心
│   ├── 🔧 src/                   # 源代码架构
│   │   ├── 🧩 components/        # 组件层
│   │   │   ├── ui/               # 基础UI组件库
│   │   │   │   ├── Button.tsx    # 按钮组件
│   │   │   │   ├── Input.tsx     # 输入框组件
│   │   │   │   ├── Loading.tsx   # 加载状态组件
│   │   │   │   └── index.ts      # 组件统一导出
│   │   │   ├── skill-tree/       # 技能树专用组件
│   │   │   │   ├── SkillTreeNode.tsx # 技能树节点
│   │   │   │   └── index.ts      # 组件导出
│   │   │   └── index.ts          # 组件入口
│   │   ├── ⚡ hooks/             # 业务逻辑Hook
│   │   │   ├── useSkillTree.ts   # 技能树逻辑
│   │   │   ├── useSearch.ts      # 搜索逻辑
│   │   │   ├── useStatistics.ts  # 统计逻辑
│   │   │   └── index.ts          # 统一导出
│   │   ├── 🌐 services/          # API服务层
│   │   │   └── api.ts            # 网络请求封装
│   │   ├── 📋 types/             # 类型定义
│   │   │   └── skill.ts          # 技能树相关类型
│   │   └── 🛠️ utils/             # 工具函数
│   │       ├── constants.ts      # 应用常量
│   │       ├── helpers.ts        # 通用工具
│   │       ├── auth.ts           # 认证工具
│   │       └── index.ts          # 工具导出
│   ├── 📦 package.json           # 依赖配置
│   ├── 📦 package-lock.json      # 依赖锁定文件
│   ├── ⚙️ app.json               # Expo配置
│   ├── 🏗️ eas.json               # EAS构建配置
│   └── 📄 tsconfig.json          # TypeScript配置
│
├── 🖥️ server/                    # Node.js后端服务
│   ├── 🔧 src/                   # 服务端架构
│   │   ├── ⚙️ config/            # 配置管理
│   │   │   └── database.ts       # 数据库配置
│   │   ├── 🎮 controllers/       # 控制器层
│   │   │   ├── authController.ts # 认证控制器
│   │   │   ├── skillController.ts # 技能树控制器
│   │   │   └── index.ts          # 控制器导出
│   │   ├── 📊 models/            # 数据模型
│   │   │   ├── User.ts           # 用户模型
│   │   │   ├── SkillTree.ts      # 技能树模型
│   │   │   ├── LearningRecord.ts # 学习记录
│   │   │   ├── PopularDomain.ts  # 热门领域
│   │   │   ├── DeviceSession.ts  # 设备会话
│   │   │   └── index.ts          # 模型导出
│   │   ├── 🛣️ routes/            # 路由层
│   │   │   ├── authRoutes.ts     # 认证路由
│   │   │   ├── skillRoutes.ts    # 技能树路由
│   │   │   └── index.ts          # 路由入口
│   │   ├── 🔌 services/          # 服务层
│   │   │   ├── authService.ts    # 认证服务
│   │   │   ├── skillService.ts   # 技能树服务
│   │   │   ├── databaseService.ts # 数据库服务
│   │   │   └── index.ts          # 服务导出
│   │   ├── 📋 types/             # 类型定义
│   │   │   ├── skill.ts          # 技能树类型
│   │   │   └── index.ts          # 类型导出
│   │   └── app.ts                # 应用入口
│   ├── 📊 sql/                   # 数据库脚本
│   │   └── init_database.sql     # 初始化脚本
│   ├── 🔧 scripts/               # 工具脚本
│   │   └── init-database.js      # 数据库初始化
│   ├── 📦 package.json           # 依赖配置
│   ├── 📦 package-lock.json      # 依赖锁定文件
│   ├── 📄 .env                   # 环境变量配置
│   ├── 📄 schema.sql             # 数据库架构定义
│   └── 📄 tsconfig.json          # TypeScript配置
│
├── 🛠️ .trae/                     # Trae IDE配置
│   └── skills/                   # 技能配置
│       └── app-store-publishing/ # 应用商店发布技能
│           └── SKILL.md          # 技能文档
├── � package-lock.json          # 根目录依赖锁定文件
├── �📋 .gitignore                 # Git忽略配置
├── 📖 PROJECT_SETUP.md           # 项目设置文档
└── 📖 README.md                  # 项目说明文档
```

## 🚀 技术架构特点

### **移动端架构优势**
- **现代化路由**: Expo Router基于文件系统的路由管理，零配置路由
- **组件化设计**: 可复用的UI组件库，支持主题定制和样式统一
- **状态管理**: React Hooks + Context API的轻量级状态管理方案
- **类型安全**: 完整的TypeScript类型定义，前后端类型一致性
- **离线支持**: AsyncStorage本地数据持久化，支持离线使用

### **服务端架构特点**
- **RESTful API**: 标准的REST API设计规范，前后端分离
- **分层架构**: 清晰的Controller-Service-Model分层，职责分离
- **数据库集成**: MySQL关系型数据库，支持事务处理和复杂查询
- **认证安全**: JWT令牌认证 + bcrypt密码加密存储
- **错误处理**: 统一的错误处理中间件，友好的错误信息返回

### **数据流架构**
```
移动端 → API请求 → 服务端控制器 → 业务服务 → 数据模型 → MySQL数据库
    ↓
响应数据 ← 控制器返回 ← 业务处理 ← 数据库查询 ← 数据操作
```

## 🎯 核心功能模块

### **用户认证模块** ✅ 已实现
- **手机号注册/登录**: 完整的用户注册和登录流程
- **JWT令牌管理**: 自动令牌刷新和会话保持
- **设备会话**: 多设备登录支持
- **安全验证**: 密码加密存储和输入验证

### **技能树模块** ✅ 已实现
- **智能生成**: 根据领域自动生成技能学习路径
- **可视化展示**: 树形结构展示技能节点关系
- **进度跟踪**: 学习进度实时更新和保存
- **资源链接**: 每个技能节点关联学习资源

### **搜索发现模块** ✅ 已实现
- **热门领域**: 展示热门技能学习领域
- **关键词搜索**: 快速查找相关技能树
- **个性化推荐**: 基于用户兴趣的智能推荐

### **数据统计模块** ✅ 已实现
- **学习统计**: 用户学习时长和进度统计
- **热门分析**: 领域热度分析和趋势
- **进度报告**: 个性化学习报告生成

## 🔧 开发环境要求

### **系统要求**
- Node.js 16.0+
- MySQL 8.0+
- npm 或 yarn
- Expo CLI (移动端开发)

### **快速开始**

#### **1. 数据库初始化**
```bash
cd server
node scripts/init-database.js
```

#### **2. 启动服务端**
```bash
cd server
npm install
npm run dev
```

#### **3. 启动移动端**
```bash
cd mobile  
npm install
npm start
```

#### **4. 测试应用**
- **Expo Go**: 手机安装Expo Go应用，扫描二维码
- **APK构建**: 使用EAS构建Android APK进行真实测试

## 📱 用户体验流程

### **新用户流程**
```
应用启动 → 认证检查 → 登录页面 → 选择注册 → 填写信息 → 注册成功
    ↓
进入首页 → 查看统计 → 生成技能树 → 开始学习 → 进度跟踪
```

### **老用户流程**
```
应用启动 → 自动登录 → 进入首页 → 继续学习 → 查看进度 → 探索新技能
```

## 🎨 设计理念

### **技术选型原则**
- **开发效率**: 选择成熟稳定的技术栈，降低开发成本
- **性能优化**: 前后端分离，API接口优化，图片懒加载
- **用户体验**: 响应式设计，流畅的交互动画，直观的界面
- **可维护性**: 清晰的代码结构，完善的文档，自动化测试

### **架构设计原则**
- **单一职责**: 每个模块只负责一个特定功能
- **开闭原则**: 对扩展开放，对修改关闭
- **依赖倒置**: 高层模块不依赖低层模块的具体实现
- **接口隔离**: 使用多个专门的接口而不是单一的总接口

## 🔮 未来发展规划

### **短期目标 (1-3个月)**
- [ ] **AI集成**: OpenAI API集成，智能生成技能树
- [ ] **离线优化**: 完善的离线缓存和同步机制
- [ ] **性能提升**: 图片压缩，代码分割，懒加载优化
- [ ] **UI/UX升级**: 更精美的界面设计和交互动画

### **中期目标 (3-6个月)**
- [ ] **社交功能**: 用户间技能树分享和评论系统
- [ ] **学习社区**: 建立技能学习交流社区
- [ ] **多端支持**: Web端和桌面端应用开发
- [ ] **企业版**: 团队协作和学习管理功能

### **长期愿景 (6-12个月)**
- [ ] **国际化**: 多语言支持和全球化部署
- [ ] **AI助教**: 个性化学习路径优化和智能提醒
- [ ] **AR/VR体验**: 沉浸式学习体验探索
- [ ] **开放平台**: API开放，第三方应用集成

## 🤝 贡献指南

欢迎开发者参与项目贡献！请遵循以下流程：

1. **Fork项目**并创建特性分支
2. **遵循代码规范**进行开发
3. **添加测试用例**确保功能正确性
4. **提交Pull Request**并描述变更内容

### **开发规范**
- **代码风格**: 使用Prettier和ESLint统一代码格式
- **提交规范**: Conventional Commits提交信息规范
- **分支管理**: Git Flow分支管理策略
- **测试覆盖**: 单元测试和集成测试

## 📞 技术支持

- **项目主页**: [GitHub Repository]
- **问题反馈**: [Issues页面]
- **技术讨论**: [Discussions页面]
- **文档中心**: [Wiki页面]

---
