/**
 * 数据库测试辅助
 * 
 * 提供测试环境的数据库管理和认证辅助功能。
 * 使用真实的 MySQL 连接（需测试数据库可用）。
 */
import mysql from 'mysql2/promise';

const TEST_DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnflow_test',
};

/**
 * 获取测试数据库连接
 */
export async function getTestConnection(): Promise<mysql.Connection> {
  return mysql.createConnection(TEST_DB_CONFIG);
}

/**
 * 清空所有测试数据表（按外键依赖顺序）
 */
export async function cleanupDatabase(): Promise<void> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getTestConnection();
    const tables = [
      'monster_messages',
      'activation_codes',
      'study_records',
      'node_progress',
      'learning_records',
      'notes',
      'rewards',
      'domains',
      'skill_trees',
      'popular_domains',
      'monsters',
      'device_sessions',
      'email_verification_tokens',
      'users',
    ];
    for (const table of tables) {
      await connection.execute(`DELETE FROM \`${table}\``);
    }
  } catch {
    // 数据库不可用时静默失败，测试会使用 Mock
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * 创建种子测试用户并返回用户信息
 */
export async function seedTestUser(
  username: string,
  email: string,
  password: string,
  status: 'active' | 'inactive' = 'active'
): Promise<{ id: number; username: string; email: string; passwordHash: string } | null> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getTestConnection();
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password_hash, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [username, email, passwordHash, status]
    );
    return {
      id: (result as any).insertId,
      username,
      email,
      passwordHash,
    };
  } catch {
    return null;
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * 插入验证码到数据库
 */
export async function seedVerificationCode(email: string, code: string): Promise<boolean> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getTestConnection();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await connection.execute(
      `INSERT INTO email_verification_tokens (email, token, attempts, expires_at, created_at) 
       VALUES (?, ?, 0, ?, NOW())`,
      [email, code, expiresAt]
    );
    return true;
  } catch {
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * 从数据库读取验证码
 */
export async function getVerificationCode(email: string): Promise<string | null> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getTestConnection();
    const [rows] = await connection.execute(
      'SELECT token FROM email_verification_tokens WHERE email = ? ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    const record = (rows as any[])[0];
    return record?.token || null;
  } catch {
    return null;
  } finally {
    if (connection) await connection.end();
  }
}

/**
 * 测试数据库是否可用
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await getTestConnection();
    await connection.execute('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    if (connection) await connection.end();
  }
}
