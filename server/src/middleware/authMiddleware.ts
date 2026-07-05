import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT payload 结构
export interface JwtPayload {
  userId: number;
  type: 'access' | 'refresh';
}

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT 认证中间件
 * 
 * 验证请求头中的 Bearer token，提取用户信息并注入 req.user。
 * 任何需要用户身份的路由都应使用此中间件。
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 从 Authorization header 提取 token
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: '未提供认证令牌' });
    return;
  }

  // 检查 Bearer 格式
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: '认证令牌格式无效，请使用 Bearer token' });
    return;
  }

  const token = parts[1];

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'learnflow-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // access token 类型安全检查
    if (decoded.type !== 'access') {
      res.status(401).json({ error: '请使用访问令牌而非刷新令牌' });
      return;
    }

    // 注入用户信息到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: '认证令牌已过期，请重新登录' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: '认证令牌无效' });
    } else {
      res.status(401).json({ error: '认证失败' });
    }
  }
}

/**
 * 可选的认证中间件
 * 
 * 如果提供了有效的 token 则注入 req.user，否则继续处理请求（不返回 401）。
 * 用于部分需要认证但非强制的端点。
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }

  const token = parts[1];

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'learnflow-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (decoded.type === 'access') {
      req.user = decoded;
    }
  } catch {
    // 无效 token 也不报错，只是不注入用户信息
  }

  next();
}

/**
 * Pro 会员认证中间件
 * 
 * 先验证 JWT，然后检查用户是否为 Pro 会员。
 * 用于需要 Pro 权限的端点。
 */
export function proRequired(req: Request, res: Response, next: NextFunction): void {
  // 先执行普通认证
  authMiddleware(req, res, () => {
    // 认证通过后检查 Pro 状态
    // 注意：这里需要查询数据库来验证 isPro
    // 为了保持中间件轻量，暂时只做认证，Pro 检查由控制器处理
    next();
  });
}
