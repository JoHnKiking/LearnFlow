## 项目结构
```
LearnFlow/
├── mobile/                    # React Native移动端应用
│   ├── src/
│   │   ├── components/        # 可复用组件
│   │   │   ├── ui/           # 基础UI组件
│   │   │   ├── skill-tree/   # 技能树相关组件
│   │   │   └── common/       # 通用组件
│   │   ├── screens/          # 页面组件
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── SkillTreeScreen.tsx
│   │   │   └── LinkDetailScreen.tsx
│   │   ├── services/         # API服务层
│   │   │   ├── api.ts
│   │   │   └── skillService.ts
│   │   ├── hooks/            # 自定义Hook
│   │   │   ├── useSkillTree.ts
│   │   │   └── useLLM.ts
│   │   ├── types/            # TypeScript类型定义
│   │   │   ├── skill.ts
│   │   │   └── api.ts
│   │   ├── utils/            # 工具函数
│   │   │   ├── navigation.ts
│   │   │   └── constants.ts
│   │   └── navigation/       # 导航配置
│   │       └── AppNavigator.tsx
│   ├── assets/               # 静态资源
│   ├── App.tsx
│   └── package.json
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