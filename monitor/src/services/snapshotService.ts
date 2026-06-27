import { getConnection } from '../db';

/**
 * 监控快照服务
 * - 每 N 分钟自动采集一次数据库指标
 * - 提供历史快照查询（支持日线/周线/月线/全部聚合）
 */

export interface SnapRow {
  snapshot_at: string;
  total_users: number;
  dau: number;
  new_users_today: number;
  node_completions_today: number;
  study_minutes_today: number;
  pro_users: number;
  monster_messages_today: number;
  notes_created_today: number;
  module_creations_today: number;
  active_users_7d: number;
  total_domains: number;
  total_skill_trees: number;
}

// 采集代码不变
export async function takeSnapshot(): Promise<SnapRow | null> {
  const conn = await getConnection();
  try {
    const queries: Record<string, [string, any[]?]> = {
      total_users:         [`SELECT COUNT(*) as c FROM users WHERE status = 'active'`],
      dau:                 [`SELECT COUNT(DISTINCT user_id) as c FROM (SELECT user_id FROM study_records WHERE DATE(created_at)=CURDATE() UNION SELECT user_id FROM device_sessions WHERE DATE(last_active_at)=CURDATE()) t`],
      new_users_today:     [`SELECT COUNT(*) as c FROM users WHERE DATE(created_at)=CURDATE()`],
      node_completions_today: [`SELECT COUNT(*) as c FROM node_progress WHERE status='done' AND DATE(updated_at)=CURDATE()`],
      study_minutes_today: [`SELECT COALESCE(SUM(duration),0) as c FROM study_records WHERE DATE(created_at)=CURDATE()`],
      pro_users:           [`SELECT COUNT(*) as c FROM users WHERE is_pro=1`],
      monster_messages_today: [`SELECT COUNT(*) as c FROM monster_messages WHERE DATE(created_at)=CURDATE()`],
      notes_created_today: [`SELECT COUNT(*) as c FROM notes WHERE DATE(created_at)=CURDATE()`],
      module_creations_today: [`SELECT COUNT(*) as c FROM skill_trees WHERE DATE(created_at)=CURDATE()`],
      active_users_7d:     [`SELECT COUNT(DISTINCT user_id) as c FROM study_records WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`],
      total_domains:       [`SELECT COUNT(*) as c FROM domains`],
      total_skill_trees:   [`SELECT COUNT(*) as c FROM skill_trees`],
    };

    const results: Record<string, number> = {};
    for (const [key, [sql, params]] of Object.entries(queries)) {
      const [rows] = await conn.execute(sql, params || []);
      results[key] = (rows as any[])[0].c || 0;
    }

    await conn.execute(
      `INSERT INTO monitor_snapshots
       (snapshot_at, total_users, dau, new_users_today, node_completions_today,
        study_minutes_today, pro_users, monster_messages_today, notes_created_today,
        module_creations_today, active_users_7d, total_domains, total_skill_trees)
       VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        results.total_users, results.dau, results.new_users_today,
        results.node_completions_today, results.study_minutes_today,
        results.pro_users, results.monster_messages_today,
        results.notes_created_today, results.module_creations_today,
        results.active_users_7d, results.total_domains, results.total_skill_trees,
      ]
    );

    console.log(
      `[Snapshot] DAU=${results.dau} 完成=${results.node_completions_today} 时长=${results.study_minutes_today}min Pro=${results.pro_users}`
    );
    return { snapshot_at: new Date().toISOString(), ...results } as any;
  } catch (err) {
    console.error('[Snapshot] 采集失败:', err);
    return null;
  } finally {
    conn.release();
  }
}

// ==================== 折线图数据查询（支持日/周/月/全） ====================

export type ChartRange = 'day' | 'week' | 'month' | 'all';

function rangeConfig(range: ChartRange): { groupBy: string; dateFormat: string; limit: string } {
  switch (range) {
    case 'day':
      // 日线：5分钟粒度原始数据，最近24小时
      return { groupBy: '', dateFormat: '', limit: 'INTERVAL 24 HOUR' };
    case 'week':
      // 周线：每小时聚合，最近7天
      return { groupBy: "DATE_FORMAT(snapshot_at, '%Y-%m-%d %H:00')", dateFormat: "%m/%d %H:00", limit: 'INTERVAL 7 DAY' };
    case 'month':
      // 月线：每天聚合，最近30天
      return { groupBy: 'DATE(snapshot_at)', dateFormat: '%m/%d', limit: 'INTERVAL 30 DAY' };
    case 'all':
      // 全部：每天聚合，不限时间
      return { groupBy: 'DATE(snapshot_at)', dateFormat: '%m/%d', limit: 'INTERVAL 365 DAY' };
  }
}

/**
 * 查询聚合后的快照数据（供折线图）
 *
 * 聚合规则：
 * - 累计指标（node_*, study_minutes, monster_*, notes_*, module_*）取 MAX
 * - 瞬时指标（total_users, dau, new_*, pro_*, active_*, total_*）取 AVG
 */
export async function getSnapshots(range: ChartRange = 'day'): Promise<SnapRow[]> {
  const conn = await getConnection();
  try {
    const config = rangeConfig(range);

    if (range === 'day') {
      // 日线直接用原始数据
      const [rows] = await conn.execute(
        `SELECT * FROM monitor_snapshots
         WHERE snapshot_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         ORDER BY snapshot_at ASC`
      );
      return formatRows(rows as any[]);
    }

    // 周线/月线/全部：聚合查询
    const cumFields = [
      'node_completions_today', 'study_minutes_today',
      'monster_messages_today', 'notes_created_today', 'module_creations_today',
    ];
    const instFields = [
      'total_users', 'dau', 'new_users_today', 'pro_users',
      'active_users_7d', 'total_domains', 'total_skill_trees',
    ];

    const cumSelects = cumFields.map(f => `MAX(${f}) as ${f}`).join(', ');
    const instSelects = instFields.map(f => `ROUND(AVG(${f}),0) as ${f}`).join(', ');

    const [rows] = await conn.execute(
      `SELECT
        ${config.groupBy} as snapshot_at,
        ${cumSelects},
        ${instSelects}
       FROM monitor_snapshots
       WHERE snapshot_at >= DATE_SUB(NOW(), ${config.limit})
       GROUP BY ${config.groupBy}
       ORDER BY snapshot_at ASC`
    );

    return formatRows(rows as any[]);
  } finally {
    conn.release();
  }
}

function formatRows(rows: any[]): SnapRow[] {
  return rows.map(r => ({
    snapshot_at: r.snapshot_at instanceof Date ? r.snapshot_at.toISOString() : String(r.snapshot_at),
    total_users: r.total_users || 0,
    dau: r.dau || 0,
    new_users_today: r.new_users_today || 0,
    node_completions_today: r.node_completions_today || 0,
    study_minutes_today: r.study_minutes_today || 0,
    pro_users: r.pro_users || 0,
    monster_messages_today: r.monster_messages_today || 0,
    notes_created_today: r.notes_created_today || 0,
    module_creations_today: r.module_creations_today || 0,
    active_users_7d: r.active_users_7d || 0,
    total_domains: r.total_domains || 0,
    total_skill_trees: r.total_skill_trees || 0,
  }));
}

export async function getLatestSnapshot(): Promise<SnapRow | null> {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT * FROM monitor_snapshots ORDER BY id DESC LIMIT 1`
    );
    if (!(rows as any[]).length) return null;
    return formatRows(rows as any[])[0];
  } finally {
    conn.release();
  }
}
