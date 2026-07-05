/**
 * JWT 认证中间件测试
 * 
 * 验证 authMiddleware 正确拦截未认证请求，允许合法请求通过。
 */
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import {
  generateAccessToken,
  generateRefreshTokenAsAccess,
  authHeader,
  expiredAuthHeader,
  wrongSecretAuthHeader,
} from '../../helpers/auth-helper';

const app = createApp();

describe('🔒 JWT 认证中间件 authMiddleware', () => {
  // ====== 未提供 token ======
  describe('无 token', () => {
    test('SEC-A01: 无 Authorization 头 → 401', async () => {
      const res = await request(app).get('/api/skills/list');
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('SEC-A02: 无 token 访问受保护端点(怪兽) → 401', async () => {
      const res = await request(app).get('/api/monster/status');
      expect(res.status).toBe(401);
    });

    test('SEC-A03: 无 token 访问受保护端点(笔记) → 401', async () => {
      const res = await request(app).get('/api/notes/list');
      expect(res.status).toBe(401);
    });

    test('SEC-A04: 无 token 访问受保护端点(奖励) → 401', async () => {
      const res = await request(app).get('/api/rewards/list');
      expect(res.status).toBe(401);
    });

    test('SEC-A05: 无 token 访问受保护端点(领域) → 401', async () => {
      const res = await request(app).get('/api/domains/list');
      expect(res.status).toBe(401);
    });

    test('SEC-A06: 无 token 访问受保护端点(Pro) → 401', async () => {
      const res = await request(app).get('/api/pro/status');
      expect(res.status).toBe(401);
    });

    test('SEC-A07: 无 token 访问受保护端点(AI) → 401', async () => {
      const res = await request(app).post('/api/ai/fill-module');
      expect(res.status).toBe(401);
    });
  });

  // ====== 无效 token ======
  describe('无效 token', () => {
    test('SEC-A08: 错误格式(无 Bearer 前缀) → 401', async () => {
      const token = generateAccessToken(1);
      const res = await request(app)
        .get('/api/skills/list')
        .set('Authorization', token);

      expect(res.status).toBe(401);
    });

    test('SEC-A09: 空 token → 401', async () => {
      const res = await request(app)
        .get('/api/skills/list')
        .set('Authorization', 'Bearer ');

      expect(res.status).toBe(401);
    });

    test('SEC-A10: 乱码 token → 401', async () => {
      const res = await request(app)
        .get('/api/skills/list')
        .set('Authorization', 'Bearer garbage-token-value');

      expect(res.status).toBe(401);
    });

    test('SEC-A11: 错误密钥签名的 token → 401', async () => {
      const res = await request(app)
        .get('/api/skills/list')
        .set(wrongSecretAuthHeader(1));

      expect(res.status).toBe(401);
    });

    test('SEC-A12: refresh token 用作 access token → 401', async () => {
      const refreshToken = generateRefreshTokenAsAccess(1);
      const res = await request(app)
        .get('/api/skills/list')
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(res.status).toBe(401);
    });
  });

  // ====== 过期 token ======
  describe('过期 token', () => {
    test('SEC-A13: 过期 token → 401', async () => {
      const res = await request(app)
        .get('/api/skills/list')
        .set(expiredAuthHeader(1));

      expect(res.status).toBe(401);
    });
  });

  // ====== 有效 token ======
  describe('有效 token', () => {
    test('SEC-A14: 有效 token → 通过认证', async () => {
      const token = generateAccessToken(1);
      const res = await request(app)
        .get('/api/skills/list')
        .set('Authorization', `Bearer ${token}`);

      // 不返回 401 即通过认证
      // （后续业务可能返回 500 因为数据库未 mock，但只要不是 401 就说明认证通过）
      expect(res.status).not.toBe(401);
    });

    test('SEC-A15: 不同 userId 的 token → 通过认证', async () => {
      const token = generateAccessToken(999);
      const res = await request(app)
        .get('/api/monster/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).not.toBe(401);
    });
  });

  // ====== 健康检查端点不受保护 ======
  describe('公开端点', () => {
    test('SEC-A16: 健康检查端点无需认证 → 200', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
    });

    test('SEC-A17: 认证路由无需认证 → 可访问', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ type: 'email', email: 'x@x.com', password: 'x' });

      expect(res.status).not.toBe(401);
    });
  });
});
