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
├── server/                   # Node.js后端服务
│   ├── src/
│   │   ├── controllers/      # 控制器层
│   │   │   ├── skillController.ts
│   │   │   └── llmController.ts
│   │   ├── services/         # 业务逻辑层
│   │   │   ├── skillService.ts
│   │   │   └── llmService.ts
│   │   ├── models/           # 数据模型
│   │   │   ├── SkillTree.ts
│   │   │   └── User.ts
│   │   ├── routes/           # 路由定义
│   │   │   ├── skillRoutes.ts
│   │   │   └── index.ts
│   │   ├── middleware/       # 中间件
│   │   │   ├── auth.ts
│   │   │   └── validation.ts
│   │   ├── utils/            # 工具函数
│   │   │   ├── openai.ts
│   │   │   └── cache.ts
│   │   └── app.ts            # Express应用配置
│   ├── package.json
│   └── tsconfig.json
├── shared/                   # 共享代码（可选）
│   └── types/                # 前后端共享的类型定义
└── README.md
```