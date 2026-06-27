// 权限 & 系统管理服务
import { getConnection } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.MONITOR_JWT_SECRET || 'monitor-admin-secret';
const JWT_EXPIRES = '12h';

// ========== 登录 ==========
export async function login(username: string, password: string) {
  const conn = await getConnection();
  try {
    const [[user]] = await conn.query(
      'SELECT * FROM admin_users WHERE username = ? AND status = 1', [username]
    ) as any;
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    // 更新最后登录时间
    await conn.query('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return { token, user: { id: user.id, username: user.username, role: user.role } };
  } finally { conn.release(); }
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

// ========== 管理员管理 ==========
export async function getAdminList() {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT id, username, role, status, last_login_at, created_at FROM admin_users ORDER BY created_at'
    );
    return rows as any[];
  } finally { conn.release(); }
}

export async function createAdmin(username: string, password: string, role: string) {
  const conn = await getConnection();
  try {
    const hash = await bcrypt.hash(password, 10);
    await conn.query(
      'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role]
    );
  } finally { conn.release(); }
}

export async function updateAdminStatus(id: number, status: number) {
  const conn = await getConnection();
  try {
    await conn.query('UPDATE admin_users SET status = ? WHERE id = ?', [status, id]);
  } finally { conn.release(); }
}

export async function changePassword(id: number, newPassword: string) {
  const conn = await getConnection();
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await conn.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, id]);
  } finally { conn.release(); }
}

// ========== 操作日志 ==========
export async function writeLog(adminId: number, username: string, action: string, target: string, detail: string, ip: string) {
  const conn = await getConnection();
  try {
    await conn.query(
      'INSERT INTO audit_logs (admin_id, username, action, target, detail, ip) VALUES (?,?,?,?,?,?)',
      [adminId, username, action, target, detail, ip]
    );
  } finally { conn.release(); }
}

export async function getAuditLogs(params: { page?: number; action?: string }) {
  const conn = await getConnection();
  try {
    const { page = 1, action } = params;
    let where = 'WHERE 1=1';
    const vals: any[] = [];
    if (action) { where += ' AND action = ?'; vals.push(action); }

    const [rows] = await conn.query(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT 30 OFFSET ?`,
      [...vals, (page - 1) * 30]
    );
    const [[{ count }]] = await conn.query(`SELECT COUNT(*) as count FROM audit_logs ${where}`, vals) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}
