# LearnFlow Windows环境快速启动指南

## 1. 环境准备

### 1.1 安装Node.js和npm

**下载地址**：https://nodejs.org/

**推荐版本**：
- Node.js LTS版本（当前推荐：20.10.0）
- npm版本：10.2.3+

**安装步骤**：
1. 访问Node.js官网下载Windows安装包
2. 运行安装程序，选择默认设置
3. 安装完成后验证版本：
```bash
node --version  # 应显示 v20.10.0 或更高
npm --version   # 应显示 10.2.3 或更高
```

### 1.2 安装MySQL

**下载地址**：https://dev.mysql.com/downloads/mysql/

**推荐版本**：MySQL Community Server 8.0+

**安装步骤**：
1. 下载MySQL Community Server安装包
2. 运行安装程序，选择"Developer Default"配置
3. 设置root用户密码（建议使用强密码）
4. 完成安装并启动MySQL服务
5. 验证安装：
```bash
mysql --version  # 应显示 MySQL 8.0.x
```

### 1.3 安装ngrok

**下载地址**：https://ngrok.com/download

**安装步骤**：
1. 下载Windows版本的ngrok
2. 解压到 `C:\ngrok` 目录
3. 添加环境变量：将 `C:\ngrok` 添加到系统PATH
4. 注册ngrok账号获取authtoken：
```bash
ngrok authtoken YOUR_AUTH_TOKEN
```
5. 验证安装：
```bash
ngrok version  # 应显示版本号
```

## 2. 项目设置

### 2.1 克隆项目

```bash
git clone https://github.com/johnkiwu/LearnFlow.git
cd LearnFlow
```

### 2.2 安装项目依赖

**移动端依赖**：
```bash
cd mobile
npm install
```

**服务端依赖**：
```bash
cd ../server
npm install
```

## 3. 数据库配置

### 3.1 创建数据库

```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE learnflow;
```

### 3.2 使用项目初始化脚本

**项目提供的初始化文件**：`server/sql/init_database.sql`

**初始化命令**：
```bash
# 在项目根目录执行
cd server/sql
mysql -u root -p learnflow < init_database.sql
```

**初始化脚本内容**：
- 创建所有必要的表结构
- 设置默认数据
- 配置索引和外键约束

### 3.3 配置环境变量

编辑 `server/.env` 文件：
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=learnflow
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## 4. 启动服务

### 4.1 启动后端服务

```bash
cd server
npm run dev
```

**服务信息**：
- 运行端口：3001
- 访问地址：http://localhost:3001
- API文档：http://localhost:3001/api

### 4.2 启动ngrok隧道

```bash
# 新开命令行窗口
ngrok http 3001
```

**获取隧道地址**：
- 复制生成的https地址（如：https://abc123.ngrok.io）
- 此地址用于移动端连接后端服务

### 4.3 配置移动端API地址

编辑 `mobile/src/utils/constants.ts`：
```typescript
export const API_BASE_URL = '你的ngrok地址/api';
// 例如：export const API_BASE_URL = 'https://abc123.ngrok.io/api';
```

### 4.4 启动移动端

```bash
cd mobile
npm start
```

**启动选项**：
- 按 `a`：启动Android模拟器
- 按 `i`：启动iOS模拟器（需macOS环境）
- 按 `w`：启动Web版本

## 5. 开发命令汇总

### 后端命令
```bash
# 开发模式
cd server && npm run dev

# 生产模式
cd server && npm start

# 构建项目
cd server && npm run build
```

### 移动端命令
```bash
# 开发模式
cd mobile && npm start

# 构建Android
cd mobile && npm run android

# 构建iOS
cd mobile && npm run ios

# 构建Web
cd mobile && npm run web
```

## 6. 故障排除

### 常见问题及解决方案

**端口占用错误**：
```bash
# 修改server/app.ts中的端口号
const PORT = process.env.PORT || 3001;  # 修改为其他端口
```

**数据库连接失败**：
1. 检查MySQL服务是否启动
2. 验证.env文件中的数据库配置
3. 确认数据库learnflow已创建

**ngrok连接失败**：
```bash
# 重新配置authtoken
ngrok authtoken YOUR_NEW_AUTH_TOKEN
```

**依赖安装失败**：
```bash
# 删除node_modules重新安装
rm -rf node_modules
npm install
```

### 环境验证清单

- [ ] Node.js版本 >= 16.0.0
- [ ] npm版本 >= 7.0.0
- [ ] MySQL服务运行正常
- [ ] 数据库learnflow创建成功
- [ ] 数据库初始化脚本执行成功
- [ ] ngrok隧道建立成功
- [ ] API地址配置正确
- [ ] 所有依赖安装完成

## 7. 技术支持

**项目文档**：
- README.md - 项目概述
- PROJECT_SETUP.md - 项目设置说明

**问题反馈**：
- GitHub Issues：项目问题跟踪
- 开发团队：技术支持和咨询

按照此指南即可在Windows环境成功运行LearnFlow全栈项目。