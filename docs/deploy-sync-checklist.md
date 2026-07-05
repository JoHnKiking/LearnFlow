# LearnFlow 部署同步清单

> **适用版本**: Phase 1 + Phase 1b 之后  
> **⚠️ 重要**: 服务端和移动端必须同步更新，否则 API 调用全部失败

---

## 🖥️ 服务端部署

### 1. 代码更新

```bash
# 拉取最新代码
cd /path/to/LearnFlow/server
git pull

# 安装依赖（Phase 1 新增了 vitest/supertest 等 devDeps）
npm install
```

### 2. 环境变量检查（.env）

```env
# ⚠️ 必须设置强随机密钥，禁止使用默认值
JWT_SECRET=你的强随机密钥（至少32位）

# 生产环境
NODE_ENV=production

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=你的数据库用户
DB_PASSWORD=你的数据库密码
DB_NAME=learnflow

# CORS 白名单（移动端可能用 ngrok，需要加进去）
CORS_ORIGINS=https://your-app.com

# 其他配置按需设置...
```

### 3. 数据库

**无需 Schema 变更** — Phase 1/1b 没有修改表结构。

### 4. 重启服务

```bash
# 编译 TypeScript
npm run build

# 重启进程（pm2 示例）
pm2 restart learnflow-server

# 或直接启动
npm start
```

### 5. 验证部署

```bash
# 健康检查
curl http://localhost:3001/

# 认证中间件生效（应返回 401）
curl http://localhost:3001/api/monster/status
# → {"error":"未提供认证令牌"}

# 路由变更验证（旧 URL 应 404）
curl http://localhost:3001/api/monster/status/1
# → {"error":"Endpoint not found"}
```

---

## 📱 移动端必须同步修改

> **关键**: 以下所有改动必须完成，否则 App 的所有 API 调用都会失败。

### 改动 1: API 拦截器 — 自动携带 JWT Token

**文件**: `mobile/src/services/api.ts`

在所有非 auth 请求中自动添加 `Authorization: Bearer <token>` 头：

```typescript
// 在 axios 实例创建后添加请求拦截器
api.interceptors.request.use(async (config) => {
  // 登录/注册等不需要 token 的接口跳过
  const publicPaths = ['/auth/register', '/auth/login', '/auth/verify-email',
    '/auth/resend-verification', '/auth/verify-token', '/auth/forgot-password',
    '/auth/reset-password'];
  if (publicPaths.some(p => config.url?.startsWith(p))) {
    return config;
  }

  // 从存储读取 token
  const { getToken } = require('../utils/auth');
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 改动 2: 移除所有 userId 参数

| 服务 | 方法 | 旧调用 | 新调用 |
|------|------|--------|--------|
| **auth** | `uploadAvatar` | `uploadAvatar(userId, uri)` | `uploadAvatar(uri)` |
| **pro** | `activate` | `activate(code, userId)` | `activate(code)` |
| **pro** | `getStatus` | `getStatus(userId)` → `GET /pro/status/:userId` | `getStatus()` → `GET /pro/status` |
| **skill** | `saveUserSkillTree` | `saveUserSkillTree(userId, ...)` | `saveUserSkillTree(...)` 去掉 body 中的 userId |
| **skill** | `getUserProgress` | `getUserProgress(userId)` → `GET /skills/progress/:userId` | `getUserProgress()` → `GET /skills/progress` |
| **skill** | `updateUserProgress` | `updateUserProgress(userId, ...)` → `PUT /skills/progress/:userId` | `updateUserProgress(...)` → `PUT /skills/progress` |
| **skill** | `getUserLearningReport` | `getUserLearningReport(userId)` → `GET /skills/report/:userId` | `getUserLearningReport()` → `GET /skills/report` |
| **monster** | `createMonster` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **monster** | `consumeStamina` | `consumeStamina(userId, amount)` | `consumeStamina(amount)` |
| **monster** | `chat` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **monster** | `getMessages` | `getMessages(userId)` → `GET /monster/messages/:userId` | `getMessages()` → `GET /monster/messages` |
| **monster** | `getMonsterStatus` | `getMonsterStatus(userId)` → `GET /monster/status/:userId` | `getMonsterStatus()` → `GET /monster/status` |
| **note** | `createNote` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **note** | `getNotes` | `getNotes(userId)` → `GET /notes/list/:userId` | `getNotes()` → `GET /notes/list` |
| **note** | `getNoteByDate` | `getNoteByDate(userId, date)` → `GET /notes/:userId/:date` | `getNoteByDate(date)` → `GET /notes/:date` |
| **reward** | `createReward` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **reward** | `getRewards` | `getRewards(userId)` → `GET /rewards/list/:userId` | `getRewards()` → `GET /rewards/list` |
| **domain** | `createDomain` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **domain** | `getDomains` | `getDomains(userId)` → `GET /domains/list/:userId` | `getDomains()` → `GET /domains/list` |
| **domain** | `updateNodeProgress` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **domain** | `startLearning` | `request` 含 `userId` | 去掉 body 中的 `userId` |
| **domain** | `getNodeProgresses` | `getNodeProgresses(userId, domainId)` | `getNodeProgresses(domainId)` 去掉 query userId |
| **domain** | `getStudyCount` | `getStudyCount(userId, domainId, nodeId)` | `getStudyCount(domainId, nodeId)` 去掉 query userId |

### 改动 3: 所有调用方适配

搜索移动端所有 `.tsx` / `.ts` 文件中调用上述 API 方法的地方，去掉传入的 `userId` 参数。

---

## ✅ 部署检查清单

### 服务端
- [ ] 拉取最新代码
- [ ] `.env` 中 `JWT_SECRET` 设置为强随机值（非默认 'learnflow-secret-key'）
- [ ] `.env` 中 `NODE_ENV=production`
- [ ] `npm install` 安装新依赖
- [ ] `npm run build` 编译通过
- [ ] 重启服务进程
- [ ] 验证 `/` 健康检查正常
- [ ] 验证无 token 请求受保护端点返回 401
- [ ] 验证旧 URL（带 `:userId`）返回 404

### 移动端
- [ ] 添加 JWT token 自动注入拦截器
- [ ] 更新所有 API 方法签名（去掉 userId 参数）
- [ ] 更新所有 API 方法中的 URL 路径（去掉 `/:userId`）
- [ ] 更新所有 API 方法中的 request body（去掉 userId 字段）
- [ ] 更新所有调用方代码（去掉传入的 userId）
- [ ] 登录后正确保存并读取 accessToken
- [ ] 所有页面功能测试通过

### 快速验证

```bash
# 服务端 — 完整注册→登录→调用流程验证
# 1. 注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"Test123!"}'

# 2. 获取验证码（检查数据库 email_verification_tokens 表）
# 3. 验证邮箱
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","token":"<验证码>"}'

# 4. 登录获取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"type":"email","email":"test@test.com","password":"Test123!","deviceId":"test","deviceType":"web"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 5. 用 token 访问受保护端点
curl http://localhost:3001/api/monster/status \
  -H "Authorization: Bearer $TOKEN"
```
