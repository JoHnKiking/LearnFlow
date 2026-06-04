import mysql from 'mysql2/promise';
import { DatabaseConnection } from '../config/database';
import { 
  User, CreateUserRequest, UserResponse,
  DeviceSession, CreateDeviceSessionRequest, UpdateDeviceSessionRequest
} from '../models';

export class DatabaseService {
  
  // ===== 用户相关操作 =====
  
  static async getUserById(id: number): Promise<User | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    const user = (rows as mysql.RowDataPacket[])[0];
    return user ? this.mapUserFromDB(user) : null;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = ?',
      [username]
    );
    const user = (rows as mysql.RowDataPacket[])[0];
    return user ? this.mapUserFromDB(user) : null;
  }

  static async createUser(userData: CreateUserRequest): Promise<number> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [userData.username, userData.email, userData.password]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  // ===== 用户认证相关操作 =====

  static async getUserByEmail(email: string): Promise<User | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    );
    const user = (rows as mysql.RowDataPacket[])[0];
    return user ? this.mapUserFromDB(user) : null;
  }

  static async getUserByWechatOpenId(openId: string): Promise<User | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE wechat_openid = ? AND status = "active"',
      [openId]
    );
    const user = (rows as mysql.RowDataPacket[])[0];
    return user ? this.mapUserFromDB(user) : null;
  }

  static async updateUserLoginInfo(userId: number): Promise<boolean> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = login_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  }

  // ===== 设备会话相关操作 =====

  static async createDeviceSession(sessionData: CreateDeviceSessionRequest): Promise<number> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO device_sessions (user_id, device_id, device_type, device_name, expires_at) VALUES (?, ?, ?, ?, ?)',
      [
        sessionData.userId,
        sessionData.deviceId,
        sessionData.deviceType,
        sessionData.deviceName || null,
        sessionData.expiresAt
      ]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  static async getDeviceSession(userId: number, deviceId: string): Promise<DeviceSession | null> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM device_sessions WHERE user_id = ? AND device_id = ? AND expires_at > CURRENT_TIMESTAMP',
      [userId, deviceId]
    );
    const session = (rows as mysql.RowDataPacket[])[0];
    return session ? this.mapDeviceSessionFromDB(session) : null;
  }

  static async updateDeviceSession(sessionId: number, updateData: UpdateDeviceSessionRequest): Promise<boolean> {
    const connection = await DatabaseConnection.getConnection();
    const [result] = await connection.execute(
      'UPDATE device_sessions SET last_active_at = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        updateData.lastActiveAt || new Date(),
        updateData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sessionId
      ]
    );
    return (result as mysql.ResultSetHeader).affectedRows > 0;
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const connection = await DatabaseConnection.getConnection();
    await connection.execute(
      'DELETE FROM device_sessions WHERE expires_at <= CURRENT_TIMESTAMP'
    );
  }

  // ===== 辅助方法 =====

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

  private static mapDeviceSessionFromDB(row: any): DeviceSession {
    return {
      id: row.id,
      userId: row.user_id,
      deviceId: row.device_id,
      deviceType: row.device_type,
      deviceName: row.device_name,
      lastActiveAt: new Date(row.last_active_at),
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
