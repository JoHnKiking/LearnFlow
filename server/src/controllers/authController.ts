import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest, CreateUserRequest } from '../models';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// 头像上传配置
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const ext = path.extname(file.originalname);
      cb(null, `avatar_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
}).single('avatar');

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response) {
    const startTime = Date.now();
    const { username, email } = req.body;
    
    try {
      console.log(`[AuthController] 开始处理用户注册 - 用户名: ${username}, 邮箱: ${email}`);
      
      const registerRequest: CreateUserRequest = req.body;
      
      // 验证必填字段
      if (!registerRequest.username || !registerRequest.email || !registerRequest.password) {
        console.log(`[AuthController] 注册验证失败 - 缺少必填字段`);
        return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
      }
      
      if (registerRequest.password.length < 6) {
        console.log(`[AuthController] 注册验证失败 - 密码长度不足`);
        return res.status(400).json({ error: '密码长度至少6位' });
      }
      
      console.log(`[AuthController] 调用注册服务...`);
      // 调用注册服务（邮箱验证模式，返回提示信息）
      const result = await AuthService.registerUser(registerRequest);
      
      const duration = Date.now() - startTime;
      console.log(`[AuthController] 用户注册成功 - 用户名: ${username}, 耗时: ${duration}ms`);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[AuthController] 注册失败 - 用户名: ${username}, 错误: ${error}, 耗时: ${duration}ms`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '注册失败'
      });
    }
  }

  // 验证邮箱
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { email, token } = req.body;
      
      if (!email || !token) {
        return res.status(400).json({ error: '邮箱和验证码不能为空' });
      }

      console.log(`[AuthController] 开始验证邮箱 - 邮箱: ${email}`);
      const authResponse = await AuthService.verifyEmail(email, token);
      
      console.log(`[AuthController] 邮箱验证成功 - 用户ID: ${authResponse.user.id}`);
      res.json({
        success: true,
        data: authResponse
      });
    } catch (error) {
      console.error(`[AuthController] 邮箱验证失败 - 错误: ${error}`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '验证失败'
      });
    }
  }

  // 重新发送验证码
  static async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: '邮箱不能为空' });
      }

      console.log(`[AuthController] 重新发送验证码 - 邮箱: ${email}`);
      const result = await AuthService.resendVerificationCode(email);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error(`[AuthController] 重发验证码失败 - 错误: ${error}`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '重发失败'
      });
    }
  }

  // 用户登录
  static async login(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const loginRequest: LoginRequest = req.body;
      console.log(`[AuthController] 开始处理登录 - 类型: ${loginRequest.type}, 邮箱: ${loginRequest.email || 'N/A'}`);
      
      if (!loginRequest.type) {
        console.log(`[AuthController] 登录验证失败 - 缺少登录类型`);
        return res.status(400).json({ error: '登录类型不能为空' });
      }

      let authResponse;
      
      if (loginRequest.type === 'email') {
        authResponse = await AuthService.emailLogin(loginRequest);
      } else {
        console.log(`[AuthController] 登录验证失败 - 不支持的登录类型: ${loginRequest.type}`);
        return res.status(400).json({ error: '不支持的登录类型' });
      }

      const duration = Date.now() - startTime;
      console.log(`[AuthController] 登录成功 - 邮箱: ${loginRequest.email || 'N/A'}, 耗时: ${duration}ms`);
      res.json({
        success: true,
        data: authResponse
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[AuthController] 登录失败 - 错误: ${error}, 耗时: ${duration}ms`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '登录失败'
      });
    }
  }

  // 刷新访问令牌
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken, deviceId } = req.body;
      
      if (!refreshToken || !deviceId) {
        return res.status(400).json({ error: '刷新令牌和设备ID不能为空' });
      }

      const authResponse = await AuthService.refreshToken(refreshToken, deviceId);
      
      res.json({
        success: true,
        data: authResponse
      });
    } catch (error) {
      console.error('刷新令牌失败:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '刷新令牌失败'
      });
    }
  }

  // 验证令牌
  static async verifyToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: '令牌不能为空' });
      }

      const decoded = await AuthService.verifyToken(token);
      
      res.json({
        success: true,
        data: decoded
      });
    } catch (error) {
      console.error('验证令牌失败:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '令牌无效'
      });
    }
  }

  // 忘记密码 — 发送重置验证码
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: '邮箱不能为空' });
      }

      console.log(`[AuthController] 忘记密码请求 - 邮箱: ${email}`);
      const result = await AuthService.forgotPassword(email);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(`[AuthController] 忘记密码失败 - 错误: ${error}`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '发送失败',
      });
    }
  }

  // 重置密码 — 验证验证码并更新密码
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: '邮箱、验证码和新密码不能为空' });
      }

      console.log(`[AuthController] 重置密码请求 - 邮箱: ${email}`);
      const result = await AuthService.resetPassword(email, code, newPassword);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(`[AuthController] 重置密码失败 - 错误: ${error}`);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '重置失败',
      });
    }
  }

  // 上传头像
  static async uploadAvatar(req: Request, res: Response) {
    upload(req, res, async (err: any) => {
      if (err) {
        console.error('[AuthController] 头像上传失败:', err.message);
        return res.status(400).json({ error: '上传失败: ' + err.message });
      }
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: '未选择文件' });
      }

      const userId = req.user!.userId;

      try {
        const connection = await (await import('../config/database')).DatabaseConnection.getConnection();
        const avatarUrl = `/uploads/avatars/${file.filename}`;

        await connection.execute(
          'UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [avatarUrl, userId]
        );

        console.log(`[AuthController] 头像上传成功 - 用户ID: ${userId}`);
        res.json({ success: true, data: { avatarUrl } });
      } catch (error) {
        console.error('[AuthController] 更新头像URL失败:', error);
        res.status(500).json({ error: '服务器错误' });
      }
    });
  }

  // 用户登出
  static async logout(req: Request, res: Response) {
    try {
      // 这里可以添加清理设备会话的逻辑
      // 在实际应用中，可能需要将令牌加入黑名单
      
      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      console.error('登出失败:', error);
      res.status(500).json({
        success: false,
        error: '登出失败'
      });
    }
  }
}