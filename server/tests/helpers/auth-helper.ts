/**
 * 认证测试辅助
 * 
 * 生成 JWT token、构造认证请求头等。
 */
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../../src/middleware/authMiddleware';

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-2026';

/**
 * 生成测试用 access token
 */
export function generateAccessToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'access' },
    TEST_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * 生成测试用 refresh token
 */
export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    TEST_JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * 生成已过期的 token（用于测试过期场景）
 */
export function generateExpiredToken(userId: number): string {
  return jwt.sign(
    { userId, type: 'access' },
    TEST_JWT_SECRET,
    { expiresIn: '0s' }
  );
}

/**
 * 生成使用错误密钥签名的 token
 */
export function generateTokenWithWrongSecret(userId: number): string {
  return jwt.sign(
    { userId, type: 'access' },
    'wrong-secret-key',
    { expiresIn: '7d' }
  );
}

/**
 * 生成 refresh token 类型但用作 access token
 */
export function generateRefreshTokenAsAccess(userId: number): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    TEST_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * 构造带 Bearer token 的认证请求头
 */
export function authHeader(userId: number): { Authorization: string } {
  return {
    Authorization: `Bearer ${generateAccessToken(userId)}`,
  };
}

/**
 * 构造带过期 token 的请求头
 */
export function expiredAuthHeader(userId: number): { Authorization: string } {
  return {
    Authorization: `Bearer ${generateExpiredToken(userId)}`,
  };
}

/**
 * 构造带错误密钥 token 的请求头
 */
export function wrongSecretAuthHeader(userId: number): { Authorization: string } {
  return {
    Authorization: `Bearer ${generateTokenWithWrongSecret(userId)}`,
  };
}

/**
 * 验证 JWT token 并返回 payload
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, TEST_JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
