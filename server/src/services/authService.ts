import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { DatabaseConnection } from '../config/database';
import { DatabaseService } from './databaseService';
import { 
  User, CreateUserRequest, LoginRequest, AuthResponse, UserResponse 
} from '../models';

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'learnflow-secret-key';
  private static JWT_EXPIRES_IN = '7d';
  private static REFRESH_TOKEN_EXPIRES_IN = '30d';

  // 微信配置
  private static WECHAT_CONFIG = {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
  };

  // 手机号登录
  static async phoneLogin(request: LoginRequest): Promise<AuthResponse> {
    const startTime = Date.now();
    const { phone, password, deviceId, deviceType, deviceName } = request;
    
    console.log(`[AuthService] 开始用户登录流程 - 手机号: ${phone}`);
    
    if (!phone || !password) {
      console.log(`[AuthService] 登录验证失败 - 手机号或密码为空`);
      throw new Error('手机号和密码不能为空');
    }

    // 查找用户
    console.log(`[AuthService] 查询数据库 - 手机号: ${phone}`);
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE phone = ? AND status = "active"',
      [phone]
    );
    
    const user = (rows as any[])[0];
    if (!user) {
      console.log(`[AuthService] 登录失败 - 用户不存在: ${phone}`);
      throw new Error('用户不存在');
    }

    console.log(`[AuthService] 用户查询成功 - 用户ID: ${user.id}, 用户名: ${user.username}`);

    // 验证密码
    console.log(`[AuthService] 开始密码验证...`);
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log(`[AuthService] 登录失败 - 密码错误: ${phone}`);
      throw new Error('密码错误');
    }

    console.log(`[AuthService] 密码验证成功`);
    
    const authResponse = await this.generateAuthResponse(user, deviceId, deviceType, deviceName);
    
    const duration = Date.now() - startTime;
    console.log(`[AuthService] 用户登录流程完成 - 手机号: ${phone}, 总耗时: ${duration}ms`);
    
    return authResponse;
  }

  // 用户注册（数据库存储）
  static async registerUser(request: CreateUserRequest): Promise<AuthResponse> {
    const startTime = Date.now();
    const { username, phone, password } = request;
    
    console.log(`[AuthService] 开始用户注册流程 - 用户名: ${username}, 手机号: ${phone}`);
    
    if (!username || !phone || !password) {
      console.log(`[AuthService] 注册验证失败 - 缺少必填字段`);
      throw new Error('用户名、手机号和密码不能为空');
    }

    if (password.length < 6) {
      console.log(`[AuthService] 注册验证失败 - 密码长度不足`);
      throw new Error('密码长度至少6位');
    }

    console.log(`[AuthService] 获取数据库连接...`);
    const connection = await DatabaseConnection.getConnection();
    
    // 检查手机号是否已存在
    console.log(`[AuthService] 检查手机号是否已存在: ${phone}`);
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );
    
    if ((existingUsers as any[]).length > 0) {
      console.log(`[AuthService] 手机号已被注册: ${phone}`);
      throw new Error('手机号已被注册');
    }

    // 检查用户名是否已存在
    console.log(`[AuthService] 检查用户名是否已存在: ${username}`);
    const [existingUsernames] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if ((existingUsernames as any[]).length > 0) {
      console.log(`[AuthService] 用户名已被使用: ${username}`);
      throw new Error('用户名已被使用');
    }

    // 密码加密
    console.log(`[AuthService] 开始密码加密...`);
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log(`[AuthService] 密码加密完成`);

    // 创建用户
    console.log(`[AuthService] 开始创建用户记录...`);
    const [result] = await connection.execute(
      `INSERT INTO users (username, phone, password_hash, status, created_at, updated_at) 
       VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [username, phone, passwordHash]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;
    console.log(`[AuthService] 用户创建成功 - 用户ID: ${userId}`);

    // 获取新创建的用户
    console.log(`[AuthService] 获取新创建的用户信息...`);
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    const user = (rows as any[])[0];
    const mappedUser = this.mapUserFromDB(user);

    // 生成认证响应
    console.log(`[AuthService] 生成认证令牌...`);
    const authResponse = this.generateAuthResponse(mappedUser, 'default-device', 'web', '注册设备');
    
    const duration = Date.now() - startTime;
    console.log(`[AuthService] 用户注册流程完成 - 用户名: ${username}, 总耗时: ${duration}ms`);
    
    return authResponse;
  }

  // 微信登录
  static async wechatLogin(request: LoginRequest): Promise<AuthResponse> {
    const { wechatCode, deviceId, deviceType, deviceName } = request;
    
    if (!wechatCode) {
      throw new Error('微信授权码不能为空');
    }

    // 获取微信access_token和用户信息
    const wechatUserInfo = await this.getWechatUserInfo(wechatCode);
    
    // 查找或创建用户
    const user = await this.findOrCreateWechatUser(wechatUserInfo);

    return this.generateAuthResponse(user, deviceId, deviceType, deviceName);
  }

  // 获取微信用户信息
  private static async getWechatUserInfo(code: string): Promise<any> {
    try {
      // 获取access_token
      const tokenResponse = await axios.get(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.WECHAT_CONFIG.appId}&secret=${this.WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`
      );

      const { access_token, openid } = tokenResponse.data;

      // 获取用户信息
      const userInfoResponse = await axios.get(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`
      );

      return userInfoResponse.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error('微信登录失败：' + errorMessage);
    }
  }

  // 查找或创建微信用户
  private static async findOrCreateWechatUser(wechatUserInfo: any): Promise<User> {
    const { openid, unionid, nickname, headimgurl } = wechatUserInfo;

    const connection = await DatabaseConnection.getConnection();
    
    // 查找用户
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE wechat_openid = ? OR wechat_unionid = ?',
      [openid, unionid]
    );

    let user = (rows as any[])[0];

    if (user) {
      // 更新用户信息
      await connection.execute(
        'UPDATE users SET nickname = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nickname, headimgurl, user.id]
      );
    } else {
      // 创建新用户
      const [result] = await connection.execute(
        'INSERT INTO users (wechat_openid, wechat_unionid, nickname, avatar_url) VALUES (?, ?, ?, ?)',
        [openid, unionid, nickname, headimgurl]
      );
      
      const [newUserRows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [(result as any).insertId]
      );
      
      user = (newUserRows as any[])[0];
    }

    return this.mapUserFromDB(user);
  }

  // 生成认证响应
  private static async generateAuthResponse(
    user: User, 
    deviceId: string, 
    deviceType: 'ios' | 'android' | 'web',
    deviceName?: string
  ): Promise<AuthResponse> {
    console.log(`[AuthService] 生成认证令牌 - 用户ID: ${user.id}`);
    
    // 生成JWT令牌
    const accessToken = jwt.sign(
      { userId: user.id, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as any }
    );

    // 创建设备会话
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天
    await DatabaseService.createDeviceSession({
      userId: user.id,
      deviceId,
      deviceType,
      deviceName,
      expiresAt
    });

    // 更新用户登录信息
    await DatabaseService.updateUserLoginInfo(user.id);

    return {
      user: this.mapToUserResponse(user),
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60 // 7天（秒）
    };
  }

  // 验证令牌
  static async verifyToken(token: string): Promise<{ userId: number; type: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return { userId: decoded.userId, type: decoded.type };
    } catch (error) {
      throw new Error('令牌无效或已过期');
    }
  }

  // 刷新令牌
  static async refreshToken(refreshToken: string, deviceId: string): Promise<AuthResponse> {
    const decoded = await this.verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('无效的刷新令牌');
    }

    // 检查设备会话
    const session = await DatabaseService.getDeviceSession(decoded.userId, deviceId);
    if (!session || new Date(session.expiresAt) < new Date()) {
      throw new Error('设备会话已过期');
    }

    // 获取用户信息
    const user = await DatabaseService.getUserById(decoded.userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 生成新的访问令牌
    const newAccessToken = jwt.sign(
      { userId: user.id, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN as any }
    );

    return {
      user: this.mapToUserResponse(user),
      accessToken: newAccessToken,
      refreshToken, // 使用原来的刷新令牌
      expiresIn: 7 * 24 * 60 * 60
    };
  }

  // 密码加密
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  // 数据库行到User对象映射
  private static mapUserFromDB(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      phone: row.phone,
      wechatOpenId: row.wechat_openid,
      wechatUnionId: row.wechat_unionid,
      passwordHash: row.password_hash,
      nickname: row.nickname,
      avatarUrl: row.avatar_url,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      loginCount: row.login_count,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  // User到UserResponse映射
  private static mapToUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };
  }
}