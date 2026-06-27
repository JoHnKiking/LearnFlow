// 内容资源管理服务
import { getConnection } from '../db';

export async function getDomainList(params: { search?: string; type?: string; page?: number }) {
  const conn = await getConnection();
  try {
    const { search, type, page = 1 } = params;
    const limit = 20;
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const vals: any[] = [];
    if (search) { where += ' AND d.name LIKE ?'; vals.push(`%${search}%`); }
    if (type) { where += ' AND d.type = ?'; vals.push(type); }

    const [rows] = await conn.query(
      `SELECT d.*, u.username,
              COUNT(DISTINCT np.id) as total_nodes,
              COUNT(DISTINCT CASE WHEN np.status = 'done' THEN np.id END) as done_nodes
       FROM domains d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN node_progress np ON d.id = np.domain_id
       ${where}
       GROUP BY d.id
       ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
      [...vals, limit, offset]
    );
    const [[{ count }]] = await conn.query(
      `SELECT COUNT(*) as count FROM domains d ${where}`, vals
    ) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function getSkillTreeList(params: { search?: string; page?: number }) {
  const conn = await getConnection();
  try {
    const { search, page = 1 } = params;
    const limit = 20;
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const vals: any[] = [];
    if (search) { where += ' AND (st.title LIKE ? OR st.domain LIKE ?)'; vals.push(`%${search}%`, `%${search}%`); }

    const [rows] = await conn.query(
      `SELECT st.*, u.username
       FROM skill_trees st JOIN users u ON st.user_id = u.id
       ${where} ORDER BY st.created_at DESC LIMIT ? OFFSET ?`,
      [...vals, limit, offset]
    );
    const [[{ count }]] = await conn.query(
      `SELECT COUNT(*) as count FROM skill_trees st ${where}`, vals
    ) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function getMonsterList(params: { page?: number }) {
  const conn = await getConnection();
  try {
    const { page = 1 } = params;
    const [rows] = await conn.query(
      `SELECT m.*, u.username
       FROM monsters m JOIN users u ON m.user_id = u.id
       ORDER BY m.level DESC LIMIT 20 OFFSET ?`, [(page - 1) * 20]
    );
    const [[{ count }]] = await conn.query(`SELECT COUNT(*) as count FROM monsters`) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function getNoteList(params: { userId?: number; date?: string; page?: number }) {
  const conn = await getConnection();
  try {
    const { userId, date, page = 1 } = params;
    let where = 'WHERE 1=1';
    const vals: any[] = [];
    if (userId) { where += ' AND n.user_id = ?'; vals.push(userId); }
    if (date) { where += ' AND n.date = ?'; vals.push(date); }

    const [rows] = await conn.query(
      `SELECT n.*, u.username
       FROM notes n JOIN users u ON n.user_id = u.id
       ${where} ORDER BY n.created_at DESC LIMIT 20 OFFSET ?`,
      [...vals, (page - 1) * 20]
    );
    const [[{ count }]] = await conn.query(
      `SELECT COUNT(*) as count FROM notes n ${where}`, vals
    ) as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function getPopularDomainsList(limit: number = 20) {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM popular_domains ORDER BY search_count + generated_count DESC LIMIT ?`, [limit]
    );
    return rows as any[];
  } finally { conn.release(); }
}
