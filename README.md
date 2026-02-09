# LearnFlow - 智能学习钟应用

一个基于 React Native + Expo 开发的智能学习钟应用，帮助用户高效管理学习时间，采用番茄工作法提高学习效率。

## 🚀 功能特性

### ⏱️ 智能计时器
- **番茄工作法**：25分钟专注 + 5分钟休息
- **自动切换**：工作/休息模式自动轮换
- **触觉反馈**：操作时有震动效果
- **一键控制**：开始、暂停、重置功能

### 📝 任务管理
- **任务列表**：添加、编辑、删除学习任务
- **进度跟踪**：标记任务完成状态
- **当前任务**：设置正在进行的学习任务
- **数据持久化**：本地存储，无需网络

### 📊 学习统计
- **今日统计**：显示当天学习时长和会话次数
- **会话记录**：自动记录每次学习会话
- **可视化数据**：清晰展示学习进度

## 🛠️ 技术栈

- **前端框架**：React Native + Expo
- **开发语言**：TypeScript
- **状态管理**：React Hooks
- **本地存储**：AsyncStorage
- **触觉反馈**：Expo Haptics
- **路由管理**：Expo Router

## 📦 项目结构

```
LearnFlow/
├── .trae/                          # Trae AI 技能配置
│   └── skills/
│       └── app-store-publishing/   # 应用商店上架技能
└── timer-app/                      # 学习钟应用
    ├── app/                        # 应用页面
    │   ├── (tabs)/                 # 标签页路由
    │   └── _layout.tsx             # 根布局
    ├── components/                 # 可复用组件
    ├── constants/                  # 常量配置
    ├── hooks/                      # 自定义 Hooks
    ├── assets/                     # 静态资源
    ├── package.json               # 依赖配置
    └── app.json                   # 应用配置
```

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn
- Expo CLI

### 安装依赖
```bash
cd timer-app
npm install
```

### 启动开发服务器
```bash
npx expo start
```

### 测试方式
- **手机测试**：安装 Expo Go 应用，扫描二维码
- **模拟器**：启动 iOS/Android 模拟器
- **浏览器**：直接在浏览器中预览

## 📱 应用截图

（待添加应用截图）

## 🎯 开发计划

### 近期功能
- [ ] 通知提醒功能
- [ ] 自定义计时设置
- [ ] 深色模式支持
- [ ] 学习目标设定

### 中期规划
- [ ] 云端数据同步
- [ ] 成就系统
- [ ] 详细统计报表
- [ ] 多语言支持

### 上架准备
- [ ] 应用图标设计
- [ ] 商店截图制作
- [ ] 隐私政策页面
- [ ] 应用商店提交

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/新功能`
3. 提交更改：`git commit -am '添加新功能'`
4. 推送分支：`git push origin feature/新功能`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---
