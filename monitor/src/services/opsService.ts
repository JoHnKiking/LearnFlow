// 功能运营配置服务
import { getConnection } from '../db';

// ========== 番茄钟 ==========
export async function getTomatoConfig() {
  const conn = await getConnection();
  try {
    const [[row]] = await conn.execute('SELECT * FROM config_tomato WHERE id = 1') as any;
    return row;
  } finally { conn.release(); }
}

export async function updateTomatoConfig(data: any) {
  const conn = await getConnection();
  try {
    await conn.execute(
      `UPDATE config_tomato SET work_minutes=?, short_break=?, long_break=?, long_break_after=?, auto_start_break=?, auto_start_work=?, sound_enabled=? WHERE id=1`,
      [data.work_minutes, data.short_break, data.long_break, data.long_break_after, data.auto_start_break ? 1 : 0, data.auto_start_work ? 1 : 0, data.sound_enabled ? 1 : 0]
    );
  } finally { conn.release(); }
}

// ========== AI 配置 ==========
export async function getAIConfig() {
  const conn = await getConnection();
  try {
    const [[row]] = await conn.execute('SELECT * FROM config_ai WHERE id = 1') as any;
    return row;
  } finally { conn.release(); }
}

export async function updateAIConfig(data: any) {
  const conn = await getConnection();
  try {
    await conn.execute(
      `UPDATE config_ai SET provider=?, model=?, temperature=?, max_tokens=?, system_prompt=?, monster_personalities=? WHERE id=1`,
      [data.provider, data.model, data.temperature, data.max_tokens, data.system_prompt || null, data.monster_personalities ? JSON.stringify(data.monster_personalities) : null]
    );
  } finally { conn.release(); }
}

// ========== 游戏化配置 ==========
export async function getGameConfig() {
  const conn = await getConnection();
  try {
    const [[row]] = await conn.execute('SELECT * FROM config_game WHERE id = 1') as any;
    return row;
  } finally { conn.release(); }
}

export async function updateGameConfig(data: any) {
  const conn = await getConnection();
  try {
    const fields = [
      'base_stamina','stamina_recover_rate','base_energy','energy_recover_rate',
      'exp_per_completion','level_up_base','level_up_multiplier',
      'free_jumps_per_day','free_energy_per_day','free_stamina_per_day','games_per_day',
      'pro_free_jumps','pro_energy_per_day','pro_stamina_per_day','pro_games_per_day'
    ];
    const sets = fields.map(f => `${f}=?`).join(',');
    const vals = fields.map(f => data[f]);
    await conn.execute(`UPDATE config_game SET ${sets} WHERE id=1`, vals);
  } finally { conn.release(); }
}

// ========== 推送日志 ==========
export async function getPushLogs(params: { page?: number }) {
  const conn = await getConnection();
  try {
    const { page = 1 } = params;
    const [rows] = await conn.execute(
      `SELECT pl.*, u.username FROM push_logs pl LEFT JOIN users u ON pl.user_id = u.id ORDER BY pl.created_at DESC LIMIT 20 OFFSET ?`,
      [(page - 1) * 20]
    );
    const [[{ count }]] = await conn.execute('SELECT COUNT(*) as count FROM push_logs') as any;
    return { list: rows as any[], total: count, page };
  } finally { conn.release(); }
}

export async function createPushLog(data: any) {
  const conn = await getConnection();
  try {
    await conn.execute(
      'INSERT INTO push_logs (user_id, title, body, type, status) VALUES (?, ?, ?, ?, ?)',
      [data.user_id || null, data.title, data.body, data.type || 'system', 'pending']
    );
  } finally { conn.release(); }
}
