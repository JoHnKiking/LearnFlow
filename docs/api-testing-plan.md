# LearnFlow API 全面测试方案

> **API 测试专家** | 2026-07-05 | 版本 v1.0
>
> **质量状态**: 🔴 当前零测试覆盖 — 紧急需建立测试体系
> **目标覆盖**: 95%+ 端点覆盖，90%+ 自动化率

---

## 目录

1. [现状诊断](#1-现状诊断)
2. [测试架构设计](#2-测试架构设计)
3. [测试分层策略](#3-测试分层策略)
4. [功能测试用例设计](#4-功能测试用例设计)
5. [安全测试方案](#5-安全测试方案)
6. [性能测试方案](#6-性能测试方案)
7. [集成测试方案](#7-集成测试方案)
8. [测试自动化与 CI/CD](#8-测试自动化与-cicd)
9. [风险评估与优先级](#9-风险评估与优先级)
10. [实施路线图](#10-实施路线图)

---

## 1. 现状诊断

### 1.1 代码审查发现

通过对 `server/` 目录的全面审查，发现以下关键问题：

| 严重级别 | 问题 | 影响范围 |
|---------|------|---------|
| 🔴 严重 | **零测试覆盖** — 43 个端点无任何自动化测试 | 全部 API |
| 🔴 严重 | **无 JWT 认证中间件** — 所有路由公开访问，userId 通过参数/请求体传递 | 全部 API |
| 🔴 严重 | **JWT Secret 硬编码兜底值** `'learnflow-secret-key'` | 认证系统 |
| 🟠 高危 | **错误响应格式不一致** — `{error}` / `{success,error}` / `{error,message}` 三种格式混用 | 全部 API |
| 🟠 高危 | **SQL 注入风险** — 部分查询直接拼接参数 | 数据访问层 |
| 🟡 中等 | **API Key 硬编码** — DeepSeek key 存于 `key.json` 文件 | AI 服务 |
| 🟡 中等 | **无速率限制** — 无请求频率控制 | 全部 API |
| 🟡 中等 | **无输入校验框架** — 手动校验，不一致 | 全部 API |
| 🟢 低 | **技能树服务有 userId 硬编码** (`skillService.ts` 中硬编码 userId=1) | 技能树 API |

### 1.2 API 端点盘点

| 路由组 | 端点数量 | 无认证 | 风险等级 |
|--------|---------|--------|---------|
| `/api/auth` | 10 | ✅ 全部公开 | 🔴 高 |
| `/api/skills` | 10 | ✅ 无保护 | 🟠 中高 |
| `/api/monster` | 10 | ✅ 无保护 | 🟠 中高 |
| `/api/domains` | 8 | ✅ 无保护 | 🟠 中高 |
| `/api/notes` | 4 | ✅ 无保护 | 🟡 中 |
| `/api/rewards` | 3 | ✅ 无保护 | 🟡 中 |
| `/api/pro` | 3 | ✅ 无保护 | 🔴 高 |
| `/api/ai` | 1 | ✅ 无保护 | 🟠 中高 |
| **总计** | **43** | — | — |

---

## 2. 测试架构设计

### 2.1 技术选型

```
测试框架层
├── Vitest               ← 单元测试 & API 集成测试运行器
├── Supertest            ← HTTP 断言库（Express 兼容）
├── k6                   ← 性能/负载测试
├── Faker.js             ← 测试数据生成
└── testcontainers       ← 数据库容器化测试环境（可选）
```

**选型理由**:
- **Vitest** > Jest: 原生 TypeScript/ESM 支持，与项目技术栈一致，速度快 3-5 倍
- **Supertest**: Express 生态标准 HTTP 测试工具，无需启动服务器即可测试
- **k6**: 相比 Artillery/JMeter 更轻量，脚本化程度高，CI 友好
- **Faker.js**: 生成逼真的测试数据，避免硬编码

### 2.2 目录结构

```
server/
├── src/
│   └── ...
├── tests/
│   ├── setup.ts                 # 全局测试配置（DB 连接、Mock 初始化）
│   ├── helpers/
│   │   ├── test-data.ts         # 测试数据工厂
│   │   ├── auth-helper.ts       # 认证辅助（获取 token）
│   │   └── db-helper.ts         # 数据库清理/种子数据
│   ├── unit/
│   │   ├── services/
│   │   │   ├── authService.test.ts
│   │   │   ├── monsterService.test.ts
│   │   │   ├── domainService.test.ts
│   │   │   ├── skillService.test.ts
│   │   │   ├── proService.test.ts
│   │   │   ├── aiFillService.test.ts
│   │   │   ├── emailService.test.ts
│   │   │   └── llmService.test.ts
│   │   └── models/
│   │       ├── User.test.ts
│   │       └── Monster.test.ts
│   ├── integration/
│   │   ├── auth/
│   │   │   ├── register.test.ts
│   │   │   ├── login.test.ts
│   │   │   ├── verify-email.test.ts
│   │   │   ├── refresh-token.test.ts
│   │   │   ├── forgot-password.test.ts
│   │   │   └── reset-password.test.ts
│   │   ├── skills/
│   │   │   ├── generate.test.ts
│   │   │   ├── list.test.ts
│   │   │   ├── progress.test.ts
│   │   │   └── report.test.ts
│   │   ├── monster/
│   │   │   ├── create.test.ts
│   │   │   ├── status.test.ts
│   │   │   ├── stamina.test.ts
│   │   │   ├── energy.test.ts
│   │   │   └── chat.test.ts
│   │   ├── domains/
│   │   │   ├── create.test.ts
│   │   │   ├── learning.test.ts
│   │   │   └── progress.test.ts
│   │   ├── notes/
│   │   │   └── notes.test.ts
│   │   ├── rewards/
│   │   │   └── rewards.test.ts
│   │   ├── pro/
│   │   │   ├── generate-codes.test.ts
│   │   │   ├── activate.test.ts
│   │   │   └── status.test.ts
│   │   └── ai/
│   │       └── fill-module.test.ts
│   ├── security/
│   │   ├── auth-bypass.test.ts     # 认证绕过测试
│   │   ├── injection.test.ts       # SQL 注入测试
│   │   ├── rate-limit.test.ts      # 速率限制测试
│   │   └── owasp-api.test.ts       # OWASP API Top 10 测试
│   ├── performance/
│   │   ├── load-test.js            # k6 负载测试脚本
│   │   ├── stress-test.js          # k6 压力测试脚本
│   │   └── endurance-test.js       # k6 持久性测试脚本
│   └── contract/
│       └── api-contract.test.ts    # API 契约测试
├── vitest.config.ts                # Vitest 配置
├── k6.config.js                    # k6 配置
└── package.json                    # 添加测试脚本
```

### 2.3 环境策略

```
测试环境分层:
┌──────────────────────────────────────┐
│  Layer 1: 单元测试                    │
│  - 内存运行，Mock 所有外部依赖         │
│  - 目标: <1s / 单测, <30s / 套件     │
├──────────────────────────────────────┤
│  Layer 2: 集成测试 (API)              │
│  - 真实 Express App + 测试数据库       │
│  - 目标: <5s / 用例, <2min / 套件    │
├──────────────────────────────────────┤
│  Layer 3: 安全测试                    │
│  - 独立安全套件，集成环境运行           │
│  - 目标: <5min / 套件                │
├──────────────────────────────────────┤
│  Layer 4: 性能测试                    │
│  - 独立运行，生产级环境               │
│  - 目标: <15min / 套件               │
└──────────────────────────────────────┘
```

---

## 3. 测试分层策略

### 3.1 测试金字塔

```
            ╱─────╲
           ╱  E2E  ╲           ← 少量（暂缓实现）
          ╱─────────╲
         ╱  集成+安全  ╲        ← 中量（核心路径 + 安全扫描）
        ╱───────────────╲
       ╱    API 集成测试   ╲     ← 大量（每个端点 5-15 个用例）
      ╱─────────────────────╲
     ╱     服务层单元测试      ╲  ← 大量（Mock 外部依赖，覆盖业务逻辑）
    ╱───────────────────────────╲
```

### 3.2 每端点测试覆盖矩阵

每个 API 端点必须覆盖以下维度：

| 维度 | 最少用例数 | 说明 |
|------|----------|------|
| 正常路径 (Happy Path) | 2-3 | 正常请求/响应 |
| 参数校验 (Validation) | 3-5 | 缺失、无效、边界值参数 |
| 错误处理 (Error Handling) | 2-3 | 业务错误、系统错误 |
| 边界条件 (Edge Cases) | 2-3 | 并发、空数据、极大值 |
| 安全 (Security) | 1-2 | 未授权访问、注入 |
| **每端点最少** | **10-16** | — |

---

## 4. 功能测试用例设计

### 4.1 认证模块 (`/api/auth`) — 10 端点

#### 4.1.1 POST `/api/auth/register` — 用户注册

```typescript
// tests/integration/auth/register.test.ts
describe('POST /api/auth/register', () => {
  // === 正常路径 ===
  test('TC-R01: 使用有效数据注册新用户 → 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'SecureP@ss1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@example.com');
  });

  // === 参数校验 ===
  test('TC-R02: 缺少 username → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'SecureP@ss1' });
    expect(res.status).toBe(400);
  });

  test('TC-R03: username 少于 2 字符 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a', email: 'test@example.com', password: 'SecureP@ss1' });
    expect(res.status).toBe(400);
  });

  test('TC-R04: 无效 email 格式 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'not-email', password: 'SecureP@ss1' });
    expect(res.status).toBe(400);
  });

  test('TC-R05: 密码少于 6 字符 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: '12345' });
    expect(res.status).toBe(400);
  });

  test('TC-R06: 超长 username (>50字符) → 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'a'.repeat(51), email: 'test@example.com', password: 'SecureP@ss1' });
    expect(res.status).toBe(400);
  });

  // === 重复数据 ===
  test('TC-R07: 重复 username 注册 → 400/409', async () => {
    // 先注册一次
    await registerUser('existing', 'existing@example.com', 'SecureP@ss1');
    // 再用相同 username
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'existing', email: 'new@example.com', password: 'SecureP@ss1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('用户名');
  });

  test('TC-R08: 重复 email 注册 → 400/409', async () => {
    await registerUser('user1', 'dup@example.com', 'SecureP@ss1');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'user2', email: 'dup@example.com', password: 'SecureP@ss1' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('邮箱');
  });

  // === 边界条件 ===
  test('TC-R09: username 包含特殊字符 → 根据规则返回', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test<script>', email: 'test@example.com', password: 'SecureP@ss1' });
    // 应拒绝或转义 XSS
    expect(res.status).not.toBe(500);
  });

  test('TC-R10: 并发注册相同 username → 只有一个成功', async () => {
    const promises = Array(3).fill(null).map(() =>
      request(app).post('/api/auth/register')
        .send({ username: 'concurrent', email: `${Date.now()}@example.com`, password: 'SecureP@ss1' })
    );
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 201).length;
    expect(successCount).toBeLessThanOrEqual(1); // 最多一个成功
  });
});
```

#### 4.1.2 POST `/api/auth/login` — 登录

```typescript
describe('POST /api/auth/login', () => {
  test('TC-L01: 有效凭据登录 → 200 + token', async () => { /* ... */ });
  test('TC-L02: 错误密码 → 401', async () => { /* ... */ });
  test('TC-L03: 不存在邮箱 → 401', async () => { /* ... */ });
  test('TC-L04: 未验证邮箱(inactive)用户登录 → 403', async () => { /* ... */ });
  test('TC-L05: 缺少 email → 400', async () => { /* ... */ });
  test('TC-L06: 缺少 password → 400', async () => { /* ... */ });
  test('TC-L07: 空字符串邮箱 → 400', async () => { /* ... */ });
  test('TC-L08: 登录后检查 last_login_at 更新', async () => { /* ... */ });
  test('TC-L09: 登录后 login_count 递增', async () => { /* ... */ });
  test('TC-L10: 设备会话创建成功', async () => { /* ... */ });
  test('TC-L11: 登录响应格式校验（含 token 结构）', async () => {
    const res = await login('test@example.com', 'SecureP@ss1');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('username');
    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });
});
```

#### 4.1.3 其余认证端点用例概览

| 端点 | 用例数 | 关键场景 |
|------|--------|---------|
| `POST /verify-email` | 8 | 有效验证码 / 过期验证码 / 错误验证码 / 3次尝试锁定 / 不存在邮箱 |
| `POST /resend-verification` | 6 | 正常重发 / 60秒冷却限制 / 不存在邮箱 / 已验证用户 |
| `POST /refresh-token` | 8 | 有效 refresh token / 过期 token / 篡改 token / 设备不匹配 |
| `POST /verify-token` | 5 | 有效 token / 过期 token / 空 token / 格式错误 token |
| `POST /logout` | 4 | 正常登出 / 无 token / 已登出再登出 |
| `POST /forgot-password` | 5 | 正常发送 / 不存在邮箱 / 未验证用户 |
| `POST /reset-password` | 7 | 正常重置 / 错误验证码 / 过期验证码 / 相同密码 |
| `POST /avatar-upload` | 7 | 正常上传 / 文件过大(>5MB) / 非图片文件 / 无文件 |

### 4.2 怪兽模块 (`/api/monster`) — 10 端点

```typescript
// tests/integration/monster/create.test.ts
describe('POST /api/monster/create', () => {
  test('TC-MC01: 创建怪兽 → 初始体力100/能量50/等级1', async () => {
    const res = await request(app).post('/api/monster/create').send({
      userId: 1, name: '小火焰', personality: 'lively'
    });
    expect(res.status).toBe(200);
    expect(res.body.data.monster.stamina).toBe(100);
    expect(res.body.data.monster.energy).toBe(50);
    expect(res.body.data.monster.level).toBe(1);
  });
  test('TC-MC02: 同一 userId 重复创建 → 400', async () => { /* 唯一约束 */ });
  test('TC-MC03: 缺少 userId → 400', async () => { /* ... */ });
  test('TC-MC04: 无效 personality → 400', async () => { /* ... */ });
  test('TC-MC05: 三种性格 (lively/calm/rebel) 分别创建 → 成功', async () => { /* ... */ });
  test('TC-MC06: name 空字符串 → 400', async () => { /* ... */ });
});

describe('POST /api/monster/stamina/consume', () => {
  test('TC-MS01: 消耗 10 体力 → stamina 减少', async () => { /* ... */ });
  test('TC-MS02: 体力不足时消耗 → 失败', async () => { /* ... */ });
  test('TC-MS03: 消耗负数体力 → 400', async () => { /* ... */ });
  test('TC-MS04: 消耗超过当前体力 → 失败', async () => { /* ... */ });
  test('TC-MS05: 未创建怪兽的 userId → 404', async () => { /* ... */ });
});

describe('POST /api/monster/energy/consume', () => {
  test('TC-ME01: 消耗 1 点能量 → 成功', async () => { /* ... */ });
  test('TC-ME02: 能量为 0 时聊天 → 提示能量不足', async () => { /* ... */ });
  test('TC-ME03: 能量恢复机制 — 6小时后检查', async () => { /* 需要时间 Mock */ });
});

describe('POST /api/monster/chat', () => {
  test('TC-MCH01: 正常对话 → 返回 AI 回复', async () => { /* ... */ });
  test('TC-MCH02: 对话消耗能量', async () => { /* ... */ });
  test('TC-MCH03: AI 失败时返回 fallback 回复', async () => { /* Mock DeepSeek 失败 */ });
  test('TC-MCH04: 空消息 → 400', async () => { /* ... */ });
  test('TC-MCH05: 消息超长 → 400', async () => { /* ... */ });
  test('TC-MCH06: 三种性格回复风格不同', async () => { /* ... */ });
  test('TC-MCH07: 历史消息上下文 (最近20条)', async () => { /* ... */ });
});
```

### 4.3 技能树模块 (`/api/skills`) — 10 端点

| 端点 | 用例数 | 关键场景 |
|------|--------|---------|
| `POST /generate` | 8 | LLM 成功生成 / LLM fallback / 无效 domain / 空 domain |
| `GET /list` | 7 | 正常分页 / 空列表 / search 过滤 / category 过滤 / 超大页码 |
| `GET /:id` | 5 | 存在的 ID / 不存在的 ID / 非数字 ID / 私有技能树 |
| `POST /save` | 7 | 正常保存 / 重复保存 / 无 userId / 超长 title |
| `GET /progress/:userId` | 6 | 有进度 / 无进度 / 不存在的 userId / 按 skillTreeId 过滤 |
| `PUT /progress/:userId` | 7 | 更新已完成节点 / 空节点 / 不存在的节点 |
| `GET /search/domains` | 5 | 精确搜索 / 模糊搜索 / 空 keyword |
| `GET /recommendations/path` | 6 | 推荐路径 / 无 level 参数 / 无效 level |
| `GET /stats/overview` | 3 | 正常获取 / 空数据 |
| `GET /report/:userId` | 8 | 日报/周报/月报 / 无效 period / 新用户无数据 |

### 4.4 其余模块用例概览

| 模块 | 端点 | 总用例数 | 特殊场景 |
|------|------|--------|---------|
| **Domains** | 8 | ~90 | AI 生成技能树、节点完成发放奖励、递归计算进度、Free/Pro 限制 |
| **Notes** | 4 | ~45 | 同日期重复笔记 / 怪兽评论 / 空内容笔记 |
| **Rewards** | 3 | ~35 | 过期奖励 / 重复领取 |
| **Pro** | 3 | ~40 | 激活码格式 (LF-)、套餐类型 (monthly/yearly/lifetime)、过期检测、已使用激活码 |
| **AI** | 1 | ~15 | API 超时、JSON 解析失败、无效模块名、fallback 链接 |

**功能测试总预估: ~560 个测试用例**

---

## 5. 安全测试方案

### 5.1 认证与授权测试

```typescript
// tests/security/auth-bypass.test.ts
describe('🔒 认证绕过测试', () => {
  // 由于当前架构无 auth 中间件，这些测试验证风险，同时为未来的 auth 中间件铺路
  test('SEC-A01: 无 token 访问受保护端点 → 应返回 401', async () => {
    // 当前这些端点不检查 auth，记录为安全债务
    const endpoints = [
      { method: 'get', path: '/api/skills/progress/1' },
      { method: 'get', path: '/api/monster/status/1' },
      { method: 'get', path: '/api/domains/list/1' },
      { method: 'get', path: '/api/rewards/list/1' },
      { method: 'get', path: '/api/pro/status/1' },
    ];
    for (const ep of endpoints) {
      const res = await request(app)[ep.method](ep.path);
      // 🔴 当前跳过断言（记录为待修复）
      expect(res.status).toBe(401); // 目标行为
    }
  });

  test('SEC-A02: 用户 A 无法访问用户 B 的数据', async () => {
    // 创建两个用户，用 userId A 获取 userId B 的数据
    const userA = await registerAndVerify('userA', 'a@test.com', 'Pass123!');
    const userB = await registerAndVerify('userB', 'b@test.com', 'Pass123!');
    // 用 A 的身份获取 B 的 domains
    const res = await request(app).get(`/api/domains/list/${userB.id}`);
    // 🔴 当前无保护，任何人可获取任何人的数据
    // 目标：只有 token 对应的用户才能访问自己的数据
    expect(res.status).toBe(403);
  });

  test('SEC-A03: 篡改 JWT payload → 拒绝', async () => {
    // 生成 token，修改 payload，验证被拒绝
  });

  test('SEC-A04: 使用过期 token → 拒绝', async () => { /* ... */ });
  test('SEC-A05: 登出后的 token → 拒绝', async () => { /* 需 token 黑名单 */ });
});
```

### 5.2 注入攻击测试

```typescript
// tests/security/injection.test.ts
describe('🔒 SQL 注入测试', () => {
  const sqlInjections = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "1' UNION SELECT username, password_hash FROM users --",
    "' OR 1=1 --",
    "admin'--",
    "1; UPDATE users SET is_pro=1 WHERE 1=1 --",
  ];

  test('SEC-I01: 登录端点 SQL 注入防护', async () => {
    for (const injection of sqlInjections) {
      const res = await request(app).post('/api/auth/login').send({
        email: injection,
        password: 'anything'
      });
      expect(res.status).not.toBe(500); // 不应崩溃
      expect(res.status).toBe(401); // 不应绕过认证
    }
  });

  test('SEC-I02: 搜索端点 SQL 注入防护', async () => {
    for (const injection of sqlInjections) {
      const res = await request(app)
        .get(`/api/skills/search/domains?keyword=${encodeURIComponent(injection)}`);
      expect(res.status).not.toBe(500);
      // 应返回安全结果，不应泄露数据
    }
  });

  test('SEC-I03: userId 参数注入防护', async () => {
    const endpoints = [
      { method: 'get', path: '/api/monster/status/' },
      { method: 'get', path: '/api/rewards/list/' },
      { method: 'get', path: '/api/notes/list/' },
    ];
    for (const injection of sqlInjections) {
      for (const ep of endpoints) {
        const res = await request(app).get(`${ep.path}${encodeURIComponent(injection)}`);
        expect(res.status).not.toBe(500);
      }
    }
  });
});

describe('🔒 XSS 测试', () => {
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert(1)',
    '<svg onload=alert(1)>',
    '" onfocus="alert(1)" autofocus="true"',
  ];

  test('SEC-X01: 注册 username XSS 防护', async () => {
    for (const payload of xssPayloads) {
      const res = await request(app).post('/api/auth/register').send({
        username: payload,
        email: `${Date.now()}@test.com`,
        password: 'SecureP@ss1'
      });
      // 应拒绝包含 XSS 的用户名或正确转义
      expect(res.status).not.toBe(500);
    }
  });

  test('SEC-X02: 笔记内容 XSS 防护', async () => {
    for (const payload of xssPayloads) {
      const res = await request(app).post('/api/notes/create').send({
        userId: 1, date: new Date().toISOString().split('T')[0], content: payload
      });
      expect(res.status).not.toBe(500);
    }
  });

  test('SEC-X03: 怪兽聊天消息 XSS 防护', async () => {
    for (const payload of xssPayloads) {
      const res = await request(app).post('/api/monster/chat').send({
        userId: 1, message: payload
      });
      expect(res.status).not.toBe(500);
    }
  });
});
```

### 5.3 OWASP API Security Top 10 (2023) 覆盖

| OWASP 风险 | 测试用例 | 当前状态 |
|-----------|---------|---------|
| API1: 对象级授权失效 | 用户 A 访问用户 B 数据 | 🔴 未防护 |
| API2: 认证失效 | 无 token 访问 / 篡改 token | 🔴 未防护 |
| API3: 对象属性级授权失效 | 修改不该修改的字段 | 🔴 未防护 |
| API4: 资源消耗无限制 | 无速率限制 / 大文件上传 | 🔴 未防护 |
| API5: 功能级授权失效 | 普通用户访问管理接口 | 🔴 未防护 |
| API6: 敏感业务流无限制访问 | 自动注册 / 批量操作 | 🔴 未防护 |
| API7: 服务端请求伪造 (SSRF) | AI 服务 URL 注入 | 🟡 部分防护 |
| API8: 安全配置错误 | 错误信息泄露 / CORS 配置 | 🟡 部分防护 |
| API9: 存量资产管理不当 | 旧版 API 端点未下线 | 🟢 无旧端点 |
| API10: API 不安全使用 | 第三方 API Key 泄露 | 🔴 key.json 暴露 |

---

## 6. 性能测试方案

### 6.1 k6 负载测试脚本

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// 自定义指标
const loginTime = new Trend('login_duration', true);
const authFailRate = new Rate('auth_fail_rate');
const apiErrorRate = new Rate('api_error_rate');

export const options = {
  // 阶段式负载：逐渐增加到高负载
  stages: [
    { duration: '1m', target: 20 },   // 预热：20 并发
    { duration: '3m', target: 100 },  // 增加到 100 并发
    { duration: '5m', target: 100 },  // 维持 100 并发
    { duration: '2m', target: 200 },  // 压力测试：200 并发
    { duration: '2m', target: 0 },    // 冷却
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],  // 95% 请求 <200ms
    http_req_failed: ['rate<0.001'],                  // 错误率 <0.1%
    'login_duration': ['p(95)<300'],                  // 登录 <300ms
    'api_error_rate': ['rate<0.01'],                   // API 错误 <1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001';

export default function () {
  group('认证流程', () => {
    // 登录测试
    const loginStart = Date.now();
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
      email: `user_${__VU}@test.com`,
      password: 'TestPass123!'
    }), { headers: { 'Content-Type': 'application/json' } });

    loginTime.add(Date.now() - loginStart);

    check(loginRes, {
      'login successful': (r) => r.status === 200,
      'has token': (r) => r.json('data.token') !== undefined,
    }) || authFailRate.add(1);
  });

  sleep(1);

  group('技能树查询', () => {
    const res = http.get(`${BASE_URL}/api/skills/list?page=1&limit=20`);
    check(res, {
      'skill list ok': (r) => r.status === 200,
      'has data': (r) => r.json('data.trees') !== undefined,
    }) || apiErrorRate.add(1);
  });

  group('怪兽状态查询', () => {
    const userId = __VU % 100 + 1; // 模拟 100 个用户
    const res = http.get(`${BASE_URL}/api/monster/status/${userId}`);
    check(res, {
      'monster status ok': (r) => r.status === 200,
    }) || apiErrorRate.add(1);
  });

  group('技能树生成（仅 10% 请求）', () => {
    if (Math.random() < 0.1) {
      const res = http.post(`${BASE_URL}/api/skills/generate`, JSON.stringify({
        domain: 'Python Programming',
        level: 'intermediate'
      }), { headers: { 'Content-Type': 'application/json' } });
      check(res, {
        'generate ok or fallback': (r) => r.status === 200 || r.status === 202,
      });
    }
  });

  sleep(Math.random() * 3);
}

export function handleSummary(data) {
  return {
    'tests/performance/reports/summary.json': JSON.stringify(data),
    stdout: `
============================================================
  LearnFlow API 负载测试报告
============================================================
  总请求数:        ${data.metrics.http_reqs.values.count}
  失败率:          ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
  平均响应时间:    ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
  P95 响应时间:    ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
  P99 响应时间:    ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
  登录 P95:        ${data.metrics.login_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
============================================================
    `,
  };
}
```

### 6.2 压力测试场景

```javascript
// tests/performance/stress-test.js — 突破性压力测试
export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 1000 },  // 极限
    { duration: '1m', target: 0 },
  ],
};

// 测试目标：找到系统拐点
// - 在哪个并发数下 P95 超 200ms？
// - 在哪个并发数下开始出现 5xx 错误？
// - 数据库连接池是否耗尽？
```

### 6.3 特定端点性能 SLA

| 端点类别 | P50 | P95 | P99 | 备注 |
|---------|-----|-----|-----|------|
| 简单查询 (GET list/status) | <50ms | <100ms | <200ms | 纯 DB 查询 |
| 认证操作 (login/register) | <100ms | <200ms | <500ms | bcrypt 耗时 |
| AI 相关 (generate/chat) | <3s | <10s | <15s | LLM 依赖 |
| 文件上传 (avatar) | <500ms | <2s | <5s | 文件大小相关 |

---

## 7. 集成测试方案

### 7.1 业务流程端到端测试

```typescript
// tests/integration/flows/user-journey.test.ts
describe('🎯 用户完整旅程', () => {
  test('FLOW-01: 新用户完整流程', async () => {
    // 1. 注册
    const registerRes = await request(app).post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@test.com', password: 'Pass123!' });
    expect(registerRes.status).toBe(201);

    // 2. 验证邮箱（使用数据库中的验证码）
    const code = await getVerificationCode('new@test.com');
    const verifyRes = await request(app).post('/api/auth/verify-email')
      .send({ email: 'new@test.com', token: code });
    expect(verifyRes.status).toBe(200);

    // 3. 登录
    const loginRes = await request(app).post('/api/auth/login')
      .send({ email: 'new@test.com', password: 'Pass123!' });
    expect(loginRes.status).toBe(200);
    const userId = loginRes.body.data.user.id;

    // 4. 创建怪兽
    const monsterRes = await request(app).post('/api/monster/create')
      .send({ userId, name: '小火龙', personality: 'lively' });
    expect(monsterRes.status).toBe(200);

    // 5. 创建学习领域
    const domainRes = await request(app).post('/api/domains/create')
      .send({ userId, name: 'JavaScript', type: 'preset' });
    expect(domainRes.status).toBe(200);
    const domainId = domainRes.body.data.domainId;

    // 6. 开始学习
    const startRes = await request(app).post('/api/domains/learning/start')
      .send({ userId, domainId, nodeId: 'node_1' });
    expect(startRes.status).toBe(200);

    // 7. 完成学习
    const finishRes = await request(app).post('/api/domains/learning/finish')
      .send({ recordId: startRes.body.data.recordId, duration: 30, progressAfter: 10 });
    expect(finishRes.status).toBe(200);

    // 8. 写笔记
    const noteRes = await request(app).post('/api/notes/create')
      .send({ userId, date: new Date().toISOString().split('T')[0], content: '学到了闭包' });
    expect(noteRes.status).toBe(200);

    // 9. 查奖励
    const rewardRes = await request(app).get(`/api/rewards/list/${userId}`);
    expect(rewardRes.status).toBe(200);
    // 完成学习应有经验奖励
    expect(rewardRes.body.data.rewards.length).toBeGreaterThan(0);

    // 10. 怪兽状态更新
    const statusRes = await request(app).get(`/api/monster/status/${userId}`);
    expect(statusRes.body.data.exp).toBeGreaterThan(0);
  });
});
```

### 7.2 Pro 会员流程测试

```typescript
test('FLOW-02: Pro 激活与限制切换', async () => {
  // 1. 免费用户 — 验证限制
  // 2. 生成激活码（管理端）
  // 3. 用户激活 Pro
  // 4. 验证权益生效（能量上限、体力上限、无限模块）
  // 5. 验证过期后降级
});
```

### 7.3 并发与数据一致性

```typescript
describe('🔄 并发安全测试', () => {
  test('CONC-01: 并发消耗体力 → 不会透支', async () => {
    // 创建怪兽，并发 10 次消耗 20 体力（初始 100）
    const monster = await createMonster(userId, 'test', 'lively');
    const promises = Array(10).fill(null).map(() =>
      request(app).post('/api/monster/stamina/consume')
        .send({ userId, amount: 20 })
    );
    const results = await Promise.all(promises);
    // 最多消耗 5 次（100/20=5），其余应失败
    const successes = results.filter(r => r.body.success === true).length;
    expect(successes).toBeLessThanOrEqual(5);
    // 检查最终体力 >= 0
    const status = await getMonsterStatus(userId);
    expect(status.stamina).toBeGreaterThanOrEqual(0);
  });

  test('CONC-02: 并发激活同一激活码 → 只有一个成功', async () => {
    const code = await generateProCode('monthly');
    const promises = Array(3).fill(null).map((_, i) => {
      const uid = 100 + i;
      return request(app).post('/api/pro/activate').send({ code, userId: uid });
    });
    const results = await Promise.all(promises);
    const successes = results.filter(r => r.status === 200 && r.body.data.success);
    expect(successes.length).toBe(1);
  });
});
```

---

## 8. 测试自动化与 CI/CD

### 8.1 package.json 脚本配置

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --dir tests/unit",
    "test:integration": "vitest run --dir tests/integration",
    "test:security": "vitest run --dir tests/security",
    "test:perf": "k6 run tests/performance/load-test.js",
    "test:perf:stress": "k6 run tests/performance/stress-test.js",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=test-results.xml",
    "test:pre-commit": "vitest run --dir tests/unit --changed"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "@vitest/coverage-v8": "^1.x",
    "supertest": "^6.x",
    "@faker-js/faker": "^8.x",
    "@types/supertest": "^6.x"
  }
}
```

### 8.2 Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'tests/coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 85,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
```

### 8.3 GitHub Actions CI 配置

```yaml
# .github/workflows/api-tests.yml
name: LearnFlow API Tests

on:
  push:
    branches: [main, develop]
    paths: ['server/**']
  pull_request:
    branches: [main]
    paths: ['server/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: testpass
          MYSQL_DATABASE: learnflow_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        working-directory: server
        run: npm ci

      - name: Initialize test database
        working-directory: server
        run: mysql -h 127.0.0.1 -u root -ptestpass learnflow_test < schema.sql
        env:
          MYSQL_PWD: testpass

      - name: Run unit tests
        working-directory: server
        run: npm run test:unit

      - name: Run integration tests
        working-directory: server
        run: npm run test:integration
        env:
          DB_HOST: 127.0.0.1
          DB_USER: root
          DB_PASSWORD: testpass
          DB_NAME: learnflow_test
          JWT_SECRET: ci-test-secret-key
          NODE_ENV: test

      - name: Run security tests
        working-directory: server
        run: npm run test:security

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: server/tests/coverage
          flags: api

  performance:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run k6 load test
        uses: grafana/k6-action@v0.3
        with:
          filename: server/tests/performance/load-test.js
          flags: --out json=results.json
      - name: Upload performance results
        uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: results.json
```

### 8.4 质量门禁 (Quality Gates)

```
┌─────────────────────────────────────────────┐
│  质量门禁规则                                  │
├─────────────────────────────────────────────┤
│  ✅ 单元测试全部通过                           │
│  ✅ 集成测试通过率 ≥ 98%                       │
│  ✅ 代码覆盖率 ≥ 80%                          │
│  ✅ 安全测试零 Critical/High 发现              │
│  ✅ P95 响应时间 ≤ SLA 阈值                    │
│  ✅ 无新增 TypeScript 类型错误                  │
├─────────────────────────────────────────────┤
│  ⚠️ 阻断合并: 任一门禁未通过则 PR 无法合并       │
└─────────────────────────────────────────────┘
```

---

## 9. 风险评估与优先级

### 9.1 风险矩阵

| 优先级 | 风险项 | 影响 | 可能性 | 测试覆盖建议 |
|--------|-------|------|--------|------------|
| **P0** | 无认证导致数据泄露 | 🔴 严重 | 🔴 高 | 立即实现 auth 中间件 + 认证测试 |
| **P0** | SQL 注入攻击 | 🔴 严重 | 🟠 中 | 全面注入测试 + 参数化查询 |
| **P0** | JWT Secret 泄露 | 🔴 严重 | 🟡 低 | 环境变量管理 + Secret 轮换 |
| **P1** | 并发数据不一致 | 🟠 高 | 🟠 中 | 事务测试 + 并发用例 |
| **P1** | AI 服务不可用 | 🟠 高 | 🟠 中 | fallback 机制测试 |
| **P1** | Pro 激活码滥用 | 🟠 高 | 🟡 低 | 并发激活 + 重放测试 |
| **P2** | 邮箱验证码暴力破解 | 🟡 中 | 🟡 低 | 速率限制 + 尝试次数测试 |
| **P2** | 大文件上传 DDoS | 🟡 中 | 🟡 低 | 文件大小限制 + 速率限制 |
| **P2** | 错误信息泄露 | 🟡 中 | 🟢 低 | 错误响应格式统一测试 |

### 9.2 优先级测试路线

```
Phase 1 (Week 1-2):    修复 + 基础覆盖
  ├── 修复: 添加 JWT auth 中间件
  ├── 测试: 认证模块全部 10 端点 (90+ 用例)
  └── 测试: SQL 注入安全扫描

Phase 2 (Week 3-4):    核心业务覆盖
  ├── 测试: 怪兽模块 10 端点 (90+ 用例)
  ├── 测试: 学习领域 8 端点 (90+ 用例)
  └── 测试: Pro 会员 3 端点 (40+ 用例)

Phase 3 (Week 5-6):    扩展覆盖 + 性能
  ├── 测试: 技能树 10 端点 (70+ 用例)
  ├── 测试: 笔记 + 奖励 + AI (95+ 用例)
  └── 测试: 性能负载测试

Phase 4 (Week 7-8):    自动化 + CI/CD
  ├── 集成: GitHub Actions CI pipeline
  ├── 集成: 质量门禁
  └── 测试: 业务流程端到端
```

---

## 10. 实施路线图

### 10.1 测试环境准备 (Day 1-2)

- [ ] 创建 `server/tests/` 目录结构
- [ ] 配置 Vitest + Supertest
- [ ] 搭建测试数据库（独立于开发数据库）
- [ ] 编写 `tests/setup.ts`（全局 beforeAll/afterAll）
- [ ] 编写测试数据工厂 `tests/helpers/test-data.ts`
- [ ] 编写数据库清理辅助 `tests/helpers/db-helper.ts`

### 10.2 测试基础设施 (Day 3-5)

```typescript
// tests/setup.ts - 全局测试配置
import { beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app';
import { initDatabase, closeDatabase } from '../src/config/database';
import { cleanupDatabase } from './helpers/db-helper';

// 使用测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_NAME = 'learnflow_test';

export let app: Express;

beforeAll(async () => {
  app = createApp();
  await initDatabase();
  await cleanupDatabase(); // 清空测试数据
});

afterAll(async () => {
  await closeDatabase();
});
```

```typescript
// tests/helpers/test-data.ts - 测试数据工厂
import { faker } from '@faker-js/faker';

export const TestDataFactory = {
  newUser: (overrides = {}) => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: 'TestP@ss1',
    ...overrides,
  }),

  newMonster: (overrides = {}) => ({
    name: faker.animal.dog(),
    style: 'default' as const,
    personality: faker.helpers.arrayElement(['lively', 'calm', 'rebel']),
    ...overrides,
  }),

  newDomain: (overrides = {}) => ({
    name: faker.lorem.words(2),
    type: 'preset' as const,
    ...overrides,
  }),

  newNote: (overrides = {}) => ({
    date: new Date().toISOString().split('T')[0],
    content: faker.lorem.paragraph(),
    ...overrides,
  }),

  // ... 更多工厂方法
};
```

### 10.3 实施检查清单

| 阶段 | 任务 | 产出 | 状态 |
|------|------|------|------|
| **准备** | 搭建测试基础设施 | vitest 配置、测试 DB、种子数据 | ⬜ |
| **P0** | 实现 JWT auth 中间件 | `authMiddleware.ts` + 应用到所有路由 | ⬜ |
| **P0** | 认证模块测试 | 90+ 测试用例 | ⬜ |
| **P0** | SQL 注入安全测试 | 安全测试套件 | ⬜ |
| **P1** | 怪兽模块测试 | 90+ 测试用例 | ⬜ |
| **P1** | Domain 模块测试 | 90+ 测试用例 | ⬜ |
| **P1** | Pro 模块测试 | 40+ 测试用例 | ⬜ |
| **P2** | 技能树模块测试 | 70+ 测试用例 | ⬜ |
| **P2** | Notes + Rewards + AI 测试 | 95+ 测试用例 | ⬜ |
| **P2** | 业务流程集成测试 | 端到端旅程 | ⬜ |
| **P2** | k6 性能测试 | 负载 + 压力 + 持久性 | ⬜ |
| **P3** | CI/CD Pipeline | GitHub Actions | ⬜ |
| **P3** | 测试报告 Dashboard | 覆盖率可视化 | ⬜ |

---

## 附录 A: 测试数据管理

```typescript
// tests/helpers/db-helper.ts
export async function seedTestUser(username: string, email: string, password: string): Promise<User> {
  const hash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash, status) VALUES (?, ?, ?, ?)',
    [username, email, hash, 'active']
  );
  return { id: (result as any).insertId, username, email };
}

export async function seedTestMonster(userId: number, name: string): Promise<Monster> {
  const [result] = await pool.execute(
    'INSERT INTO monsters (user_id, name, personality, stamina, energy, level) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, 'lively', 100, 50, 1]
  );
  return { id: (result as any).insertId, userId, name };
}

export async function cleanupDatabase(): Promise<void> {
  // 按外键依赖顺序清理
  const tables = [
    'monster_messages', 'activation_codes', 'study_records', 'node_progress',
    'learning_records', 'notes', 'rewards', 'domains', 'skill_trees',
    'popular_domains', 'monsters', 'device_sessions',
    'email_verification_tokens', 'users'
  ];
  for (const table of tables) {
    await pool.execute(`DELETE FROM ${table}`);
  }
}
```

## 附录 B: 常见问题排查指南

| 症状 | 可能原因 | 排查方法 |
|------|---------|---------|
| 测试全部超时 | 数据库未启动 | 检查 MySQL 服务和连接配置 |
| 邮箱相关测试失败 | SMTP 未 Mock | 在测试环境 Mock emailService |
| AI 相关测试不稳定 | 外部 API 波动 | 使用 Mock 或 nock 拦截 HTTP 请求 |
| 并发测试数据不一致 | 缺少事务/锁 | 检查数据库隔离级别，添加事务 |
| 测试之间互相影响 | 数据未清理 | 在每个 `afterAll` 中调用 `cleanupDatabase` |

## 附录 C: Mock 策略

```typescript
// Mock 策略优先级
// 1. 单元测试: Mock 所有外部依赖（DB、SMTP、LLM API）
// 2. API 集成测试: Mock SMTP 和 LLM API，使用真实测试 DB
// 3. 性能测试: 使用真实服务，无 Mock

// LLM Mock 示例 (nock)
import nock from 'nock';

beforeAll(() => {
  // Mock DeepSeek API
  nock('https://api.deepseek.com')
    .post('/v1/chat/completions')
    .reply(200, {
      choices: [{
        message: {
          content: JSON.stringify({
            name: 'Mock Skill Tree',
            children: [{ name: 'Mock Node', children: [] }]
          })
        }
      }]
    })
    .persist(); // 持久化 mock，测试间复用

  // Mock SMTP
  vi.mock('../src/services/emailService', () => ({
    sendVerificationCode: vi.fn().mockResolvedValue(true),
    sendPasswordResetCode: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
  }));
});

afterAll(() => {
  nock.cleanAll();
  vi.restoreAllMocks();
});
```

---

> **API 测试专家签字**: 以上方案基于对 LearnFlow 服务端 43 个 API 端点、8 个路由组、11 个服务、13 张数据库表的全面审查制定。
>
> **下一步行动**: 请确认方案后，进入 Phase 1 实施 —— 优先完成 JWT auth 中间件修复和认证模块测试覆盖。
