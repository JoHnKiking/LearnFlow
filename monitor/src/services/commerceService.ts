// 商业化 & VIP 管理服务
import { getConnection } from '../db';

export async function getProUserList(params: { search?: string; expiring?: string; page?: number }) {
  const conn = await getConnection();
  try {
    const { search, page = 1 } = params;
    const limit = 20;
    const offset = (page - 1) * limit;
    let where = 'WHERE u.is_pro = 1';
    const vals: any[] = [];
    if (search) { where += ' AND (u.username LIKE ? OR u.email LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }
    if (params.expiring === '7') { where += ' AND u.pro_expires_at IS NOT NULL AND u.pro_expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)'; }

    const [rows] = await conn.execute(
      `SELECT u.id, u.username, u.email, u.is_pro, u.pro_activated_at, u.pro_expires_at, u.created_at
       FROM users u ${where} ORDER BY u.pro_activated_at DESC LIMIT ? OFFSET ?`,
      [...vals, limit, offset]
    );
    const [[{ count }]] = await conn.execute(`SELECT COUNT(*) as count FROM users u ${where}`, vals) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function getActivationCodes(params: { status?: string; page?: number }) {
  const conn = await getConnection();
  try {
    const { status, page = 1 } = params;
    let where = 'WHERE 1=1';
    const vals: any[] = [];
    if (status) { where += ' AND ac.status = ?'; vals.push(status); }

    const [rows] = await conn.execute(
      `SELECT ac.*, u.username as used_by_name
       FROM activation_codes ac LEFT JOIN users u ON ac.used_by = u.id
       ${where} ORDER BY ac.created_at DESC LIMIT 20 OFFSET ?`,
      [...vals, (page - 1) * 20]
    );
    const [[{ count }]] = await conn.execute(`SELECT COUNT(*) as count FROM activation_codes ac ${where}`, vals) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function generateActivationCode(planId: string, count: number = 1) {
  const conn = await getConnection();
  try {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = 'LF-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      await conn.execute('INSERT INTO activation_codes (code, plan_id, status) VALUES (?, ?, ?)', [code, planId, 'unused']);
      codes.push(code);
    }
    return codes;
  } finally { conn.release(); }
}

export async function getCommerceStats() {
  const conn = await getConnection();
  try {
    const [[proTotal]] = await conn.execute(`SELECT COUNT(*) as c FROM users WHERE is_pro = 1`) as any;
    const [[proToday]] = await conn.execute(`SELECT COUNT(*) as c FROM users WHERE is_pro = 1 AND DATE(pro_activated_at) = CURDATE()`) as any;
    const [[expiring7d]] = await conn.execute(
      `SELECT COUNT(*) as c FROM users WHERE is_pro = 1 AND pro_expires_at IS NOT NULL AND pro_expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`
    ) as any;
    const [[totalUsers]] = await conn.execute(`SELECT COUNT(*) as c FROM users`) as any;

    const [planDist] = await conn.execute(
      `SELECT plan_id, COUNT(*) as cnt FROM activation_codes WHERE status = 'used' GROUP BY plan_id`
    );

    return {
      proTotal: proTotal.c, proToday: proToday.c, expiring7d: expiring7d.c,
      totalUsers: totalUsers.c,
      conversionRate: totalUsers.c > 0 ? Math.round(proTotal.c / totalUsers.c * 10000) / 100 : 0,
      planDistribution: (planDist as any[]).map(r => ({ planId: r.plan_id, count: r.cnt })),
    };
  } finally { conn.release(); }
}
