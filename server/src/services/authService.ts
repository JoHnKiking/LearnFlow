import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseConnection } from '../config/database';
import { DatabaseService } from './databaseService';
import { EmailService } from './emailService';
import { 
  User, CreateUserRequest, LoginRequest, AuthResponse, UserResponse 
} from '../models';

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'learnflow-secret-key';
  private static JWT_EXPIRES_IN = '7d';
  private static REFRESH_TOKEN_EXPIRES_IN = '30d';

  // 邮箱登录
  static async emailLogin(request: LoginRequest): Promise<AuthResponse> {
    const startTime = Date.now();
    const { email, password, deviceId, deviceType, deviceName } = request;

    console.log(`[AuthService] 开始用户登录流程 - 邮箱: ${email}`);

    if (!email || !password) {
      console.log('[AuthService] 登录验证失败 - 邮箱或密码为空');
      throw new Error('邮箱和密码不能为空');
    }

    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const rawUser = (rows as any[])[0];
    if (!rawUser) {
      console.log(`[AuthService] 登录失败 - 用户不存在: ${email}`);
      throw new Error('用户不存在');
    }

    if (rawUser.status === 'inactive') {
      console.log(`[AuthService] 登录失败 - 邮箱未验证: ${email}`);
      throw new Error('邮箱未验证，请先完成验证');
    }

    if (rawUser.status !== 'active') {
      console.log(`[AuthService] 登录失败 - 账户状态异常: ${email}`);
      throw new Error('账户状态异常，无法登录');
    }

    const user = this.mapUserFromDB(rawUser);

    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValidPassword) {
      console.log(`[AuthService] 登录失败 - 密码错误: ${email}`);
      throw new Error('密码错误');
    }

    const authResponse = await this.generateAuthResponse(user, deviceId, deviceType, deviceName);

    const duration = Date.now() - startTime;
    console.log(`[AuthService] 用户登录流程完成 - 邮箱: ${email}, 总耗时: ${duration}ms`);

    return authResponse;
  }

  // 用户注册（邮箱验证流程：先创建未激活用户，发送验证码）
  static async registerUser(request: CreateUserRequest): Promise<{ message: string; email: string }> {
    const startTime = Date.now();
    const { username, email, password } = request;

    console.log(`[AuthService] 开始用户注册流程 - 用户名: ${username}, 邮箱: ${email}`);

    if (!username || !email || !password) {
      console.log('[AuthService] 注册验证失败 - 缺少必填字段');
      throw new Error('用户名、邮箱和密码不能为空');
    }

    if (username.trim().length < 2) {
      throw new Error('用户名至少2个字符');
    }

    if (password.length < 6) {
      console.log(`[AuthService] 注册验证失败 - 密码长度不足`);
      throw new Error('密码长度至少6位');
    }

    const finalUsername = username.trim();

    const connection = await DatabaseConnection.getConnection();
    
    // 检查邮箱是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id, status FROM users WHERE email = ?',
      [email]
    );

    const existingUser = (existingUsers as any[])[0];
    if (existingUser) {
      if (existingUser.status === 'inactive') {
        // 用户已注册但未激活，重新发送验证码
        console.log(`[AuthService] 邮箱已注册但未激活，重新发送验证码: ${email}`);
        const code = await this.generateAndStoreCode(email);
        await EmailService.sendVerificationCode(email, code);
        return { message: '验证码已重新发送至邮箱', email };
      }
      console.log(`[AuthService] 邮箱已被注册: ${email}`);
      throw new Error('邮箱已被注册');
    }

    // 检查用户名是否已存在
    let uniqueUsername = finalUsername;
    let suffix = 1;
    while (true) {
      const [existingUsernames] = await connection.execute(
        'SELECT id FROM users WHERE username = ?',
        [uniqueUsername]
      );
      if ((existingUsernames as any[]).length === 0) break;
      uniqueUsername = `${finalUsername}${suffix}`;
      suffix++;
    }

    // 密码加密
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建未激活用户
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password_hash, status, created_at, updated_at) 
       VALUES (?, ?, ?, 'inactive', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [uniqueUsername, email, passwordHash]
    );

    const userId = (result as any).insertId;
    console.log(`[AuthService] 未激活用户创建成功 - 用户ID: ${userId}, 用户名: ${uniqueUsername}`);

    // 生成验证码并发送邮件
    const code = await this.generateAndStoreCode(email);
    await EmailService.sendVerificationCode(email, code);

    const duration = Date.now() - startTime;
    console.log(`[AuthService] 用户注册流程完成 - 用户名: ${uniqueUsername}, 总耗时: ${duration}ms`);
    
    return { message: '验证码已发送至邮箱，请查收', email };
  }

  // 生成并存储6位验证码
  private static async generateAndStoreCode(email: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效

    const connection = await DatabaseConnection.getConnection();
    // 删除该邮箱过期的旧验证码
    await connection.execute(
      'DELETE FROM email_verification_tokens WHERE email = ?',
      [email]
    );
    // 插入新验证码
    await connection.execute(
      'INSERT INTO email_verification_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, code, expiresAt]
    );

    console.log(`[AuthService] 验证码已生成 - 邮箱: ${email}, 过期时间: ${expiresAt}`);
    return code;
  }

  // 验证邮箱验证码并激活用户
  static async verifyEmail(email: string, token: string): Promise<AuthResponse> {
    const connection = await DatabaseConnection.getConnection();

    // 查找有效验证码
    const [rows] = await connection.execute(
      'SELECT * FROM email_verification_tokens WHERE email = ? AND token = ? AND expires_at > NOW()',
      [email, token]
    );

    const record = (rows as any[])[0];
    if (!record) {
      throw new Error('验证码无效或已过期');
    }

    // 检查尝试次数（最多3次）
    if (record.attempts >= 3) {
      await connection.execute(
        'DELETE FROM email_verification_tokens WHERE id = ?',
        [record.id]
      );
      throw new Error('验证码错误次数过多，请重新发送');
    }

    // 增加尝试次数
    await connection.execute(
      'UPDATE email_verification_tokens SET attempts = attempts + 1 WHERE id = ?',
      [record.id]
    );

    // 激活用户
    await connection.execute(
      "UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE email = ? AND status = 'inactive'",
      [email]
    );

    // 清理验证码
    await connection.execute(
      'DELETE FROM email_verification_tokens WHERE email = ?',
      [email]
    );

    // 获取用户信息并生成token
    const [userRows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = this.mapUserFromDB((userRows as any[])[0]);
    console.log(`[AuthService] 邮箱验证成功 - 用户ID: ${user.id}`);

    return this.generateAuthResponse(user, 'default-device', 'web', '注册设备');
  }

  // 重新发送验证码
  static async resendVerificationCode(email: string): Promise<{ message: string }> {
    const connection = await DatabaseConnection.getConnection();

    // 检查60秒冷却
    const [recent] = await connection.execute(
      'SELECT created_at FROM email_verification_tokens WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    const lastRecord = (recent as any[])[0];
    if (lastRecord) {
      const secondsSinceLast = (Date.now() - new Date(lastRecord.created_at).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLast);
        throw new Error(`请等待 ${waitSeconds} 秒后再发送`);
      }
    }

    const code = await this.generateAndStoreCode(email);
    await EmailService.sendVerificationCode(email, code);
    console.log(`[AuthService] 验证码已重新发送 - 邮箱: ${email}`);
    return { message: '验证码已重新发送至邮箱' };
  }

  // 直接发送验证码（已登录用户修改邮箱等场景）
  static async sendVerificationEmail(email: string): Promise<{ message: string }> {
    const code = await this.generateAndStoreCode(email);
    await EmailService.sendVerificationCode(email, code);
    console.log(`[AuthService] 验证码已发送 - 邮箱: ${email}`);
    return { message: '验证码已发送至邮箱' };
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

    // 检查是否已存在设备会话
    const existingSession = await DatabaseService.getDeviceSession(user.id, deviceId);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天
    
    if (existingSession) {
      // 更新现有会话的过期时间
      console.log(`[AuthService] 更新现有设备会话 - 会话ID: ${existingSession.id}`);
      await DatabaseService.updateDeviceSession(existingSession.id, {
        expiresAt,
        lastActiveAt: new Date()
      });
    } else {
      // 创建新的设备会话
      console.log(`[AuthService] 创建设备会话 - 用户ID: ${user.id}, 设备ID: ${deviceId}`);
      await DatabaseService.createDeviceSession({
        userId: user.id,
        deviceId,
        deviceType,
        deviceName,
        expiresAt
      });
    }

    // 更新用户登录信息
    await DatabaseService.updateUserLoginInfo(user.id);

    return {
      user: this.mapToUserResponse(user),
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // 密码加密
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  // 忘记密码 — 发送重置验证码
  static async forgotPassword(email: string): Promise<{ message: string; email: string }> {
    const connection = await DatabaseConnection.getConnection();

    // 检查用户是否存在且已激活
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = (rows as any[])[0];
    if (!user) {
      throw new Error('该邮箱未注册');
    }
    if (user.status !== 'active') {
      throw new Error('该账户尚未激活，无法重置密码');
    }

    // 检查 60 秒冷却
    const [recent] = await connection.execute(
      'SELECT created_at FROM email_verification_tokens WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    const lastRecord = (recent as any[])[0];
    if (lastRecord) {
      const secondsSinceLast = (Date.now() - new Date(lastRecord.created_at).getTime()) / 1000;
      if (secondsSinceLast < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLast);
        throw new Error(`请等待 ${waitSeconds} 秒后再发送`);
      }
    }

    const code = await this.generateAndStoreCode(email);
    await EmailService.sendPasswordResetCode(email, code);
    console.log(`[AuthService] 密码重置验证码已发送 - 邮箱: ${email}`);
    return { message: '重置验证码已发送至邮箱', email };
  }

  // 重置密码 — 验证验证码并更新密码
  static async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ message: string }> {
    if (newPassword.length < 6) {
      throw new Error('新密码长度至少6位');
    }

    const connection = await DatabaseConnection.getConnection();

    // 查找有效验证码
    const [rows] = await connection.execute(
      'SELECT * FROM email_verification_tokens WHERE email = ? AND token = ? AND expires_at > NOW()',
      [email, code]
    );
    const record = (rows as any[])[0];
    if (!record) {
      throw new Error('验证码无效或已过期');
    }

    // 检查尝试次数
    if (record.attempts >= 3) {
      await connection.execute(
        'DELETE FROM email_verification_tokens WHERE id = ?',
        [record.id]
      );
      throw new Error('验证码错误次数过多，请重新发送');
    }

    // 增加尝试次数
    await connection.execute(
      'UPDATE email_verification_tokens SET attempts = attempts + 1 WHERE id = ?',
      [record.id]
    );

    // 更新密码
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [passwordHash, email]
    );

    // 清理验证码
    await connection.execute(
      'DELETE FROM email_verification_tokens WHERE email = ?',
      [email]
    );

    console.log(`[AuthService] 密码重置成功 - 邮箱: ${email}`);
    return { message: '密码重置成功，请重新登录' };
  }

  // 数据库行到User对象映射
  private static mapUserFromDB(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      phone: row.phone,
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