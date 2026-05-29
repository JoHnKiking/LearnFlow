# LearnFlow 技能树应用 - 项目设置指南

## 项目结构
```
LearnFlow/
├── server/          # Node.js后端服务
├── mobile/          # React Native移动端应用
└── PROJECT_SETUP.md # 项目说明
```

## 快速开始

### 1. 启动后端服务
```bash
cd server
npm install
npm run dev
```
后端服务将在 http://localhost:3001 启动

### 2. 启动移动端应用
```bash
cd mobile
npm install
npm start
```
然后使用Expo Go应用扫描二维码或在模拟器中运行

## 功能说明

### 后端API接口
- `POST /api/skills/generate` - 生成技能树
  - 请求体: `{"domain": "领域名称"}`
  - 响应: 技能树JSON结构

### 移动端功能
1. **首页**: 输入领域名称（如"前端开发"）
2. **技能树页面**: 展示树状技能结构，可展开/收起节点
3. **链接跳转**: 点击学习资源链接，在浏览器中打开

## 预置技能树
- 前端开发
- 后端开发
- 其他领域会生成基础技能树结构

## 技术栈
- **后端**: Node.js + Express + TypeScript
- **移动端**: React Native + Expo + TypeScript
- **API通信**: Axios
- **导航**: Expo Router