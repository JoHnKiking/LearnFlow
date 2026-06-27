// 用户管理服务
import { getConnection } from '../db';

const PAGE_SIZE = 20;

export async function getUserList(params: {
  search?: string; status?: string; isPro?: string; page?: number; sort?: string;
}) {
  const conn = await getConnection();
  try {
    const { search, status, isPro, page = 1, sort = 'newest' } = params;
    const offset = (page - 1) * PAGE_SIZE;

    let where = 'WHERE 1=1';
    const vals: any[] = [];

    if (search) { where += ' AND (u.username LIKE ? OR u.email LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }
    if (status) { where += ' AND u.status = ?'; vals.push(status); }
    if (isPro === '1') { where += ' AND u.is_pro = 1'; }
    if (isPro === '0') { where += ' AND u.is_pro = 0'; }

    const orderBy = sort === 'oldest' ? 'u.created_at ASC' : 'u.created_at DESC';

    const [rows] = await conn.execute(
      `SELECT u.id, u.username, u.email, u.nickname, u.status, u.is_pro,
              u.pro_expires_at, u.last_login_at, u.login_count,
              u.onboarding_completed, u.created_at,
              COALESCE(sr.total_min, 0) as total_study_min
       FROM users u
       LEFT JOIN (
         SELECT user_id, SUM(duration) as total_min FROM study_records GROUP BY user_id
       ) sr ON u.id = sr.user_id
       ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...vals, PAGE_SIZE, offset]
    );

    const [[{ count }]] = await conn.execute(
      `SELECT COUNT(*) as count FROM users u ${where}`, vals
    ) as any;

    return {
      list: (rows as any[]).map(r => ({
        ...r,
        last_login_at: r.last_login_at,
        created_at: r.created_at,
        pro_expires_at: r.pro_expires_at,
      })),
      total: count,
      page,
      pageSize: PAGE_SIZE,
    };
  } finally { conn.release(); }
}

export async function getUserDetail(userId: number) {
  const conn = await getConnection();
  try {
    const [[user]] = await conn.execute(
      `SELECT * FROM users WHERE id = ?`, [userId]
    ) as any;

    if (!user) return null;

    const [sessions] = await conn.execute(
      `SELECT * FROM device_sessions WHERE user_id = ? ORDER BY last_active_at DESC LIMIT 5`, [userId]
    );

    const [domains] = await conn.execute(
      `SELECT d.name, np.status, COUNT(*) as cnt
       FROM node_progress np
       JOIN domains d ON np.domain_id = d.id
       WHERE np.user_id = ? AND d.user_id = ?
       GROUP BY d.name, np.status`, [userId, userId]
    );

    const [[studyStats]] = await conn.execute(
      `SELECT COUNT(DISTINCT DATE(created_at)) as study_days,
              SUM(duration) as total_min
       FROM study_records WHERE user_id = ?`, [userId]
    ) as any;

    const [[recentDays]] = await conn.execute(
      `SELECT COUNT(DISTINCT DATE(created_at)) as days
       FROM study_records WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`, [userId]
    ) as any;

    return {
      user,
      sessions: sessions as any[],
      domainProgress: domains as any[],
      studyStats,
      consecutiveDays: recentDays?.days || 0,
    };
  } finally { conn.release(); }
}

export async function updateUserStatus(userId: number, status: string) {
  const conn = await getConnection();
  try {
    await conn.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
  } finally { conn.release(); }
}

export async function getUserStats() {
  const conn = await getConnection();
  try {
    const [[total]] = await conn.execute(`SELECT COUNT(*) as c FROM users`) as any;
    const [[active7d]] = await conn.execute(
      `SELECT COUNT(DISTINCT user_id) as c FROM study_records WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    ) as any;
    const [[pro]] = await conn.execute(`SELECT COUNT(*) as c FROM users WHERE is_pro = 1`) as any;
    const [[banned]] = await conn.execute(`SELECT COUNT(*) as c FROM users WHERE status = 'banned'`) as any;
    const [[regToday]] = await conn.execute(`SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = CURDATE()`) as any;

    // 留存：注册30天+的用户中有学习记录的比例
    const [[retention]] = await conn.execute(
      `SELECT COUNT(DISTINCT u.id) as total,
              COUNT(DISTINCT CASE WHEN EXISTS (
                SELECT 1 FROM study_records sr WHERE sr.user_id = u.id
              ) THEN u.id END) as retained
       FROM users u WHERE u.created_at <= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    ) as any;

    return {
      total: total.c, active7d: active7d.c, pro: pro.c, banned: banned.c,
      regToday: regToday.c,
      retentionRate: retention.total > 0 ? Math.round(retention.retained / retention.total * 100) : 0,
    };
  } finally { conn.release(); }
}
