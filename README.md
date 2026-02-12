## 项目结构
```
LearnFlow/
├── mobile/                    # React Native移动端应用（基于Expo）
│   ├── app/                  # Expo Router页面目录
│   │   ├── _layout.tsx       # 应用根布局和路由配置
│   │   ├── index.tsx         # 首页 - 技能树生成和搜索功能
│   │   └── skill-tree.tsx    # 技能树展示页面
│   ├── src/                  # 源代码目录
│   │   ├── components/       # 可复用组件层
│   │   │   ├── ui/           # 基础UI组件
│   │   │   │   ├── Button.tsx    # 多功能按钮组件
│   │   │   │   ├── Input.tsx     # 输入框组件
│   │   │   │   ├── Loading.tsx   # 加载状态组件
│   │   │   │   └── index.ts      # UI组件统一导出
│   │   │   ├── skill-tree/   # 技能树相关组件
│   │   │   │   ├── SkillTreeNode.tsx # 技能树节点组件
│   │   │   │   └── index.ts       # 技能树组件统一导出
│   │   │   └── index.ts      # 组件统一入口
│   │   ├── hooks/            # 自定义Hook（业务逻辑层）
│   │   │   ├── useSkillTree.ts  # 技能树相关逻辑
│   │   │   ├── useSearch.ts     # 搜索相关逻辑
│   │   │   ├── useStatistics.ts # 统计相关逻辑
│   │   │   └── index.ts         # Hook统一导出
│   │   ├── services/         # API服务层
│   │   │   └── api.ts        # 网络请求封装
│   │   ├── types/            # TypeScript类型定义
│   │   │   └── skill.ts      # 技能树相关类型
│   │   └── utils/            # 工具函数层
│   │       ├── constants.ts  # 应用常量配置
│   │       ├── helpers.ts    # 通用工具函数
│   │       └── index.ts      # 工具函数统一导出
│   ├── assets/               # 静态资源目录
│   │   ├── icons/           # 图标资源
│   │   ├── images/          # 图片资源
│   │   └── fonts/           # 字体资源
│   ├── package.json          # 项目依赖配置
│   ├── package-lock.json     # 依赖版本锁定
│   ├── tsconfig.json         # TypeScript编译配置
│   └── app.json              # Expo应用配置
│  
├── server/                   # Node.js后端服务
│   ├── src/
│   │   ├── controllers/      # 控制器层
│   │   │   ├── skillController.ts  # 技能树相关控制器
│   │   │   └── llmController.ts    # LLM相关控制器
│   │   ├── services/         # 业务逻辑层
│   │   │   ├── skillService.ts  # 技能树相关业务逻辑
│   │   │   └── llmService.ts    # LLM相关业务逻辑
│   │   ├── models/           # 数据模型
│   │   │   ├── SkillTree.ts  # 技能树数据模型
│   │   │   └── User.ts       # 用户数据模型
│   │   ├── routes/           # 路由定义
│   │   │   ├── skillRoutes.ts  # 技能树相关路由
│   │   │   └── index.ts        # 路由统一入口
│   │   ├── middleware/       # 中间件
│   │   │   ├── auth.ts       # 认证中间件
│   │   │   └── validation.ts # 请求验证中间件
│   │   ├── utils/            # 工具函数
│   │   │   ├── openai.ts     # OpenAI API封装
│   │   │   └── cache.ts      # 缓存工具函数
│   │   └── app.ts            # 应用入口和配置
│   ├── package.json
│   └── tsconfig.json
├── shared/                   # 共享代码（可选）
│   └── types/                # 前后端共享的类型定义
└── README.md
```

## 🚀 技术栈总结

### **移动端 (Mobile)**

#### **核心技术**
- **框架**: React Native + Expo
- **路由**: Expo Router (基于文件系统的路由)
- **语言**: TypeScript (类型安全)
- **状态管理**: React Hooks (useState, useEffect等)

#### **架构特点**
- **组件化架构**: 可复用的UI组件库
- **分层设计**: UI层 → 组件层 → Hook层 → 服务层
- **类型安全**: 完整的TypeScript类型定义
- **模块化**: 统一的index.ts导出模式

#### **当前状态**
- ✅ 基础UI组件库 (Button, Input, Loading等)
- ✅ 技能树展示组件
- ✅ API服务层封装
- ✅ 工具函数和常量管理

### **服务端 (Server)**

#### **核心技术**
- **框架**: Node.js + Express
- **语言**: TypeScript
- **数据库**: MySQL (关系型数据库)
- **API**: RESTful API设计

#### **架构特点**
- **MVC架构**: 路由层 → 控制器层 → 服务层 → 数据层
- **数据持久化**: 完整的MySQL数据库支持
- **错误处理**: 统一的错误处理中间件
- **类型安全**: 前后端类型一致性

#### **数据库设计**
```sql
-- 核心数据表
- users (用户表)
- skill_trees (技能树表) 
- learning_records (学习记录表)
- popular_domains (热门领域表)
```

#### **当前状态**
- ✅ Express框架搭建
- ✅ MySQL数据库集成
- ✅ 技能树CRUD操作
- ✅ 用户进度跟踪
- ✅ 热门领域统计

## 🎯 未来发展方向

### **短期目标 (1-3个月)**

#### **移动端优化**
- [ ] **用户认证系统**: 实现用户注册/登录功能
- [ ] **离线支持**: 添加离线缓存和同步机制
- [ ] **性能优化**: 图片懒加载、列表虚拟化
- [ ] **UI/UX改进**: 更美观的界面设计和交互动画

#### **服务端增强**
- [ ] **用户系统**: 完整的用户管理API
- [ ] **数据验证**: 请求参数验证和错误处理
- [ ] **API文档**: Swagger/OpenAPI文档生成
- [ ] **缓存优化**: Redis集成提升性能

### **中期目标 (3-6个月)**

#### **核心功能扩展**
- [ ] **AI集成**: OpenAI API集成，智能生成技能树
- [ ] **学习路径推荐**: 基于用户进度的个性化推荐
- [ ] **社交功能**: 用户间技能树分享和评论
- [ ] **进度可视化**: 学习进度的图表展示

#### **技术架构升级**
- [ ] **微服务架构**: 将功能模块拆分为独立服务
- [ ] **消息队列**: 异步任务处理（如邮件通知）
- [ ] **监控系统**: 应用性能监控和日志分析
- [ ] **容器化**: Docker容器化部署

### **长期愿景 (6-12个月)**

#### **平台化发展**
- [ ] **多端支持**: Web端、桌面端应用开发
- [ ] **国际化**: 多语言支持
- [ ] **企业版**: 团队协作功能
- [ ] **API开放平台**: 第三方应用集成

#### **技术创新**
- [ ] **机器学习**: 个性化学习路径优化
- [ ] **区块链**: 学习成就的不可篡改记录
- [ ] **AR/VR**: 沉浸式学习体验
- [ ] **语音交互**: 语音控制学习进度

## 🔧 开发指南

### **环境要求**
- Node.js 16+ 
- MySQL 8.0+
- npm 或 yarn

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

### **开发规范**
- **代码风格**: 使用Prettier和ESLint统一代码格式
- **提交规范**: Conventional Commits提交信息规范
- **分支管理**: Git Flow分支管理策略
- **测试覆盖**: 单元测试和集成测试

## 🤝 贡献指南

欢迎开发者参与项目贡献！请遵循以下流程：

1. **Fork项目**并创建特性分支
2. **遵循代码规范**进行开发
3. **添加测试用例**确保功能正确性
4. **提交Pull Request**并描述变更内容

## 📞 联系方式

- **项目主页**: [GitHub Repository]
- **问题反馈**: [Issues页面]
- **技术讨论**: [Discussions页面]

---

*LearnFlow - 让技能学习更有条理，让成长路径更清晰*
```