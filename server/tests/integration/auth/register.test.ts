/**
 * POST /api/auth/register — 用户注册集成测试
 * POST /api/auth/login — 登录集成测试
 * 
 * 使用 vi.mock + vi.hoisted 确保 mock 在模块加载前生效
 */
import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

// ====== vi.mock 必须在文件顶层，会被 vitest 自动 hoist ======

const { mockConnection, mockExecute } = vi.hoisted(() => {
  const mc = {
    execute: vi.fn().mockResolvedValue([[], []]),
    query: vi.fn().mockResolvedValue([[], []]),
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    end: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue(undefined),
    release: vi.fn().mockResolvedValue(undefined),
  };
  return { mockConnection: mc, mockExecute: mc.execute };
});

vi.mock('../../../src/config/database', () => ({
  DatabaseConnection: {
    getConnection: vi.fn().mockResolvedValue({
      execute: mockExecute,
      query: mockExecute,
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      end: vi.fn(),
      ping: vi.fn().mockResolvedValue(undefined),
    }),
    closeConnection: vi.fn(),
    testConnection: vi.fn().mockResolvedValue(true),
  },
  dbConfig: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'learnflow_test',
  },
  pool: {},
}));

import { createApp } from '../../../src/app';
import { TestDataFactory } from '../../helpers/test-data';

const app = createApp();
const TEST_HASH_ACTIVE = bcrypt.hashSync('TestP@ss1', 12);

// ============================================================
// POST /api/auth/register
// ============================================================
describe('POST /api/auth/register', () => {
  // 默认 mock：邮箱+用户名均不存在，注册成功
  function setDefaultMock() {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT id, status FROM users WHERE email')) return [[]];
      if (sql.includes('SELECT id FROM users WHERE username')) return [[]];
      if (sql.includes('INSERT INTO users')) return [{ insertId: 1 }, []];
      if (sql.includes('DELETE FROM email_verification_tokens')) return [];
      if (sql.includes('INSERT INTO email_verification_tokens')) return [{ insertId: 1 }, []];
      return [];
    });
  }

  describe('✅ 正常注册', () => {
    test('TC-R01: 有效数据注册 → 返回成功信息', async () => {
      setDefaultMock();
      const userData = { username: 'newuser', email: 'new@test.com', password: 'TestP@ss1' };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('new@test.com');
    });

    test('TC-R02: 注册响应不包含敏感信息', async () => {
      setDefaultMock();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'safeuser', email: 'safe@test.com', password: 'TestP@ss1' });

      expect(res.status).toBe(200);
      expect(res.body).not.toHaveProperty('password');
    });
  });

  describe('🚫 参数校验', () => {
    test('TC-R03: 缺少 username → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'TestP@ss1' });
      expect(res.status).toBe(400);
    });

    test('TC-R04: 缺少 email → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', password: 'TestP@ss1' });
      expect(res.status).toBe(400);
    });

    test('TC-R05: 缺少 password → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@test.com' });
      expect(res.status).toBe(400);
    });

    test('TC-R06: 全部字段为空 → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: '', email: '', password: '' });
      expect(res.status).toBe(400);
    });

    test('TC-R07: username 少于 2 字符 → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'a', email: 'test@test.com', password: 'TestP@ss1' });
      expect(res.status).toBe(400);
    });

    test('TC-R08: password 少于 6 字符 → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@test.com', password: '12345' });
      expect(res.status).toBe(400);
    });

    test('TC-R09: 无效 Content-Type → 不崩溃', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('garbage');
      expect(res.status).not.toBe(500);
    });
  });

  describe('🔄 重复数据', () => {
    test('TC-R10: 已激活邮箱再次注册 → 400', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id, status FROM users WHERE email')) {
          return [[{ id: 1, status: 'active' }]];
        }
        return [];
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'taken@test.com', password: 'TestP@ss1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/邮箱已被注册/);
    });

    test('TC-R11: 未激活邮箱重新注册 → 重发验证码', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id, status FROM users WHERE email')) {
          return [[{ id: 1, status: 'inactive' }]];
        }
        if (sql.includes('DELETE FROM email_verification_tokens')) return [];
        if (sql.includes('INSERT INTO email_verification_tokens')) return [{ insertId: 1 }, []];
        return [];
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', email: 'inactive@test.com', password: 'TestP@ss1' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toMatch(/重新发送/);
    });
  });

  describe('📏 边界条件', () => {
    test('TC-R12: username 恰好 50 字符 → 接受', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'a'.repeat(50), email: 'longuser@test.com', password: 'TestP@ss1' });

      expect(res.status).toBe(200);
    });

    test('TC-R13: username 纯空格 → 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: '   ', email: 'x@test.com', password: 'TestP@ss1' });

      expect(res.status).toBe(400);
    });
  });

  describe('🔒 安全性', () => {
    test('TC-R14: XSS payload 在 username → 不崩溃', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: '<script>alert(1)</script>', email: 'xss@test.com', password: 'TestP@ss1' });

      expect(res.status).not.toBe(500);
    });

    test('TC-R15: 密码不在错误响应中泄露', async () => {
      // 触发注册错误：模拟邮箱已存在
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('SELECT id, status FROM users WHERE email')) {
          return [[{ id: 1, status: 'active' }]];
        }
        return [];
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test', email: 'test@test.com', password: 'MySecret123' });

      expect(res.status).not.toBe(200);
      expect(JSON.stringify(res.body)).not.toContain('MySecret123');
    });
  });
});

// ============================================================
// POST /api/auth/login
// ============================================================
describe('POST /api/auth/login', () => {
  function mockActiveUser() {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM users WHERE email')) {
        return [[{
          id: 1, username: 'testuser', email: 'active@test.com',
          password_hash: TEST_HASH_ACTIVE, status: 'active',
          login_count: 0, avatar_url: null, nickname: null,
          phone: null, created_at: new Date(), updated_at: new Date(),
          is_pro: 0, pro_activated_at: null, pro_expires_at: null,
        }]];
      }
      if (sql.includes('SELECT * FROM device_sessions WHERE')) return [[]];
      if (sql.includes('INSERT INTO device_sessions')) return [{ insertId: 1, affectedRows: 1 }, []];
      if (sql.includes('UPDATE users SET last_login_at')) return [{ affectedRows: 1 }, []];
      if (sql.includes('UPDATE device_sessions SET')) return [{ affectedRows: 1 }, []];
      return [];
    });
  }

  describe('✅ 正常登录', () => {
    test('TC-L01: 有效凭据 → 200 + token', async () => {
      mockActiveUser();
      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'active@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    test('TC-L02: 用户信息不含密码', async () => {
      mockActiveUser();
      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'active@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });

      expect(res.body.data.user).not.toHaveProperty('password_hash');
    });

    test('TC-L03: access token 可解析', async () => {
      mockActiveUser();
      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'active@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });

      const jwt = await import('jsonwebtoken');
      const decoded = jwt.verify(
        res.body.data.accessToken,
        process.env.JWT_SECRET || 'learnflow-secret-key'
      ) as any;
      expect(decoded.userId).toBe(1);
      expect(decoded.type).toBe('access');
    });
  });

  describe('🚫 凭证错误', () => {
    test('TC-L04: 错误密码 → 400', async () => {
      mockActiveUser();
      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'active@test.com', password: 'WrongPass!',
        deviceId: 'test-device', deviceType: 'web',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/密码错误/);
    });

    test('TC-L05: 不存在邮箱 → 400', async () => {
      mockExecute.mockReturnValue([[]]);
      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'no@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });
      expect(res.status).toBe(400);
    });

    test('TC-L06: 缺少 type → 400', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'x@test.com', password: 'TestP@ss1',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('🔒 账户状态', () => {
    test('TC-L07: inactive 账户 → 拒绝', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('SELECT * FROM users WHERE email')) {
          return [[{
            id: 2, username: 'inactive', email: 'inactive@test.com',
            password_hash: TEST_HASH_ACTIVE, status: 'inactive',
            login_count: 0, created_at: new Date(), updated_at: new Date(),
          }]];
        }
        return [];
      });

      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'inactive@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/未验证/);
    });

    test('TC-L08: banned 账户 → 拒绝', async () => {
      mockExecute.mockImplementation((sql: string) => {
        if (sql.includes('SELECT * FROM users WHERE email')) {
          return [[{
            id: 3, username: 'banned', email: 'banned@test.com',
            password_hash: TEST_HASH_ACTIVE, status: 'banned',
            login_count: 0, created_at: new Date(), updated_at: new Date(),
          }]];
        }
        return [];
      });

      const res = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'banned@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('🔒 安全性', () => {
    test('TC-L09: SQL 注入 → 不绕过认证', async () => {
      mockExecute.mockReturnValue([[]]);
      const injections = ["' OR '1'='1", "'; DROP TABLE users; --"];

      for (const inj of injections) {
        const res = await request(app).post('/api/auth/login').send({
          type: 'email', email: inj, password: inj,
          deviceId: 'test-device', deviceType: 'web',
        });
        expect(res.status).not.toBe(200);
        expect(res.status).not.toBe(500);
      }
    });

    test('TC-L10: 登录后 token 可访问受保护端点', async () => {
      mockActiveUser();
      const loginRes = await request(app).post('/api/auth/login').send({
        type: 'email', email: 'active@test.com', password: 'TestP@ss1',
        deviceId: 'test-device', deviceType: 'web',
      });

      const token = loginRes.body.data.accessToken;
      const res = await request(app)
        .get('/api/skills/list')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).not.toBe(401);
    });
  });
});

// ============================================================
// POST /api/auth/verify-email
// ============================================================
describe('POST /api/auth/verify-email', () => {
  test('TC-VE01: 有效验证码 → token', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM email_verification_tokens WHERE email')) {
        return [[{ id: 1, email: 'test@test.com', token: '123456', attempts: 0, expires_at: new Date(Date.now() + 600000) }]];
      }
      if (sql.includes('UPDATE email_verification_tokens SET attempts')) return [{ affectedRows: 1 }, []];
      if (sql.includes("UPDATE users SET status = 'active'")) return [{ affectedRows: 1 }, []];
      if (sql.includes('DELETE FROM email_verification_tokens WHERE email')) return [];
      if (sql.includes('SELECT * FROM users WHERE email')) {
        return [[{ id: 1, username: 'test', email: 'test@test.com', status: 'active', login_count: 0, created_at: new Date(), updated_at: new Date() }]];
      }
      if (sql.includes('SELECT * FROM device_sessions WHERE')) return [[]];
      if (sql.includes('INSERT INTO device_sessions')) return [{ insertId: 1, affectedRows: 1 }, []];
      if (sql.includes('UPDATE users SET last_login_at')) return [{ affectedRows: 1 }, []];
      return [];
    });

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'test@test.com', token: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('TC-VE02: 过期验证码 → 400', async () => {
    mockExecute.mockReturnValue([[]]);
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: 'test@test.com', token: '123456' });
    expect(res.status).toBe(400);
  });

  test('TC-VE03: 缺少参数 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({});
    expect(res.status).toBe(400);
  });
});

// ============================================================
// POST /api/auth/forgot-password & reset-password
// ============================================================
describe('POST /api/auth/forgot-password', () => {
  test('TC-FP01: 已激活用户 → 发送验证码', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM users WHERE email')) {
        return [[{ id: 1, email: 'active@test.com', status: 'active' }]];
      }
      if (sql.includes('SELECT created_at FROM email_verification_tokens')) return [[]];
      if (sql.includes('DELETE FROM email_verification_tokens WHERE email')) return [];
      if (sql.includes('INSERT INTO email_verification_tokens')) return [{ insertId: 1 }, []];
      return [];
    });

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'active@test.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('TC-FP02: 未注册邮箱 → 400', async () => {
    mockExecute.mockReturnValue([[]]);
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'unknown@test.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/reset-password', () => {
  test('TC-RP01: 有效验证码 → 重置成功', async () => {
    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('SELECT * FROM email_verification_tokens WHERE email')) {
        return [[{ id: 1, email: 'test@test.com', token: '123456', attempts: 0, expires_at: new Date(Date.now() + 600000) }]];
      }
      if (sql.includes('UPDATE email_verification_tokens SET attempts')) return [];
      if (sql.includes('UPDATE users SET password_hash')) return [];
      if (sql.includes('DELETE FROM email_verification_tokens WHERE email')) return [];
      return [];
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'test@test.com', code: '123456', newPassword: 'NewPass1!' });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/成功/);
  });

  test('TC-RP02: 新密码少于6位 → 400', async () => {
    mockExecute.mockReturnValue([[]]);
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'test@test.com', code: '123456', newPassword: '12345' });
    expect(res.status).toBe(400);
  });

  test('TC-RP03: 缺少参数 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// POST /api/auth/verify-token & refresh-token
// ============================================================
describe('POST /api/auth/verify-token', () => {
  test('TC-VT01: 有效 token → 返回 userId', async () => {
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign(
      { userId: 1, type: 'access' },
      process.env.JWT_SECRET || 'learnflow-secret-key',
      { expiresIn: '7d' }
    );

    const res = await request(app)
      .post('/api/auth/verify-token')
      .send({ token });
    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe(1);
  });

  test('TC-VT02: 无效 token → 400', async () => {
    const res = await request(app)
      .post('/api/auth/verify-token')
      .send({ token: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('TC-VT03: 缺少 token → 400', async () => {
    const res = await request(app)
      .post('/api/auth/verify-token')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/refresh-token', () => {
  test('TC-RF01: 有效 refresh token → 新 access token', async () => {
    const jwt = await import('jsonwebtoken');
    const refreshToken = jwt.sign(
      { userId: 1, type: 'refresh' },
      process.env.JWT_SECRET || 'learnflow-secret-key',
      { expiresIn: '30d' }
    );

    mockExecute.mockImplementation((sql: string) => {
      if (sql.includes('FROM device_sessions WHERE')) {
        return [[{ id: 1, user_id: 1, device_id: 'test-device', expires_at: new Date(Date.now() + 86400000) }]];
      }
      if (sql.includes('FROM users WHERE id')) {
        return [[{ id: 1, username: 'test', email: 'test@test.com', password_hash: null, status: 'active', login_count: 1, created_at: new Date(), updated_at: new Date() }]];
      }
      if (sql.includes('UPDATE users SET last_login_at')) return [{ affectedRows: 1 }, []];
      return [];
    });

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken, deviceId: 'test-device' });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('TC-RF02: 缺少参数 → 400', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({});
    expect(res.status).toBe(400);
  });
});

// ============================================================
// POST /api/auth/logout
// ============================================================
describe('POST /api/auth/logout', () => {
  test('TC-LO01: 正常登出 → 200', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
