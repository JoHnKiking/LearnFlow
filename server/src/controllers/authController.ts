import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest, CreateUserRequest } from '../models';

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response) {
    const startTime = Date.now();
    const { username, phone } = req.body;
    
    try {
      console.log(`[AuthController] 开始处理用户注册 - 用户名: ${username}, 手机号: ${phone}`);
      
      const registerRequest: CreateUserRequest = req.body;
      
      // 验证必填字段
      if (!registerRequest.username || !registerRequest.phone || !registerRequest.password) {
        console.log(`[AuthController] 注册验证失败 - 缺少必填字段`);
        return res.status(400).json({ error: '用户名、手机号和密码不能为空' });
      }
      
      if (registerRequest.password.length < 6) {
        console.log(`[AuthController] 注册验证失败 - 密码长度不足`);
        return res.status(400).json({ error: '密码长度至少6位' });
      }
      
      console.log(`[AuthController] 调用注册服务...`);
      // 调用注册服务
      const authResponse = await AuthService.registerUser(registerRequest);
      
      const duration = Date.now() - startTime;
      console.log(`[AuthController] 用户注册成功 - 用户名: ${username}, 耗时: ${duration}ms`);
      
      res.json({
        success: true,
        data: authResponse
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

  // 用户登录
  static async login(req: Request, res: Response) {
    try {
      const loginRequest: LoginRequest = req.body;
      
      if (!loginRequest.type) {
        return res.status(400).json({ error: '登录类型不能为空' });
      }

      let authResponse;
      
      if (loginRequest.type === 'phone') {
        authResponse = await AuthService.phoneLogin(loginRequest);
      } else if (loginRequest.type === 'wechat') {
        authResponse = await AuthService.wechatLogin(loginRequest);
      } else {
        return res.status(400).json({ error: '不支持的登录类型' });
      }

      res.json({
        success: true,
        data: authResponse
      });
    } catch (error) {
      console.error('登录失败:', error);
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