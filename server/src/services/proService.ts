import crypto from 'crypto';
import { DatabaseConnection } from '../config/database';

const PLAN_DURATION: Record<string, number | null> = {
  monthly: 30,       // 30 days
  yearly: 365,       // 365 days
  lifetime: null,    // permanent
};

export class ProService {
  // 生成一批激活码
  static async generateCodes(count: number, planId: string, createdBy?: string): Promise<string[]> {
    if (!PLAN_DURATION[planId] && planId !== 'lifetime') {
      throw new Error('无效的套餐类型');
    }

    const connection = await DatabaseConnection.getConnection();
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const code = 'LF-' + crypto.randomBytes(6).toString('hex').toUpperCase();
      await connection.execute(
        'INSERT INTO activation_codes (code, plan_id, created_by, status) VALUES (?, ?, ?, ?)',
        [code, planId, createdBy || null, 'unused']
      );
      codes.push(code);
    }

    console.log(`[ProService] 生成 ${count} 个激活码, 套餐: ${planId}`);
    return codes;
  }

  // 验证并激活
  static async activateCode(code: string, userId: number): Promise<{
    success: boolean;
    planId?: string;
    expiresAt?: string;
  }> {
    const connection = await DatabaseConnection.getConnection();

    // 查找未使用的激活码
    const [rows] = await connection.execute(
      'SELECT * FROM activation_codes WHERE code = ? AND status = ?',
      [code, 'unused']
    );

    const record = (rows as any[])[0];
    if (!record) {
      throw new Error('激活码无效或已被使用');
    }

    // 计算过期时间
    const duration = PLAN_DURATION[record.plan_id];
    let expiresAt: Date | null = null;
    if (duration !== null && duration !== undefined) {
      expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    }

    // 更新激活码状态
    await connection.execute(
      'UPDATE activation_codes SET status = ?, used_by = ?, used_at = NOW() WHERE id = ?',
      ['used', userId, record.id]
    );

    // 更新用户 Pro 状态
    if (expiresAt) {
      await connection.execute(
        'UPDATE users SET is_pro = 1, pro_activated_at = NOW(), pro_expires_at = ? WHERE id = ?',
        [expiresAt, userId]
      );
    } else {
      // 永久会员
      await connection.execute(
        'UPDATE users SET is_pro = 1, pro_activated_at = NOW(), pro_expires_at = NULL WHERE id = ?',
        [userId]
      );
    }

    console.log(`[ProService] 激活码使用成功 - 用户ID: ${userId}, 套餐: ${record.plan_id}, 过期: ${expiresAt || '永久'}`);
    return {
      success: true,
      planId: record.plan_id,
      expiresAt: expiresAt?.toISOString(),
    };
  }

  // 查询用户 Pro 状态
  static async getProStatus(userId: number): Promise<{
    isPro: boolean;
    planId?: string;
    activatedAt?: string;
    expiresAt?: string;
  }> {
    const connection = await DatabaseConnection.getConnection();
    const [rows] = await connection.execute(
      'SELECT is_pro, pro_activated_at, pro_expires_at FROM users WHERE id = ?',
      [userId]
    );

    const user = (rows as any[])[0];
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查是否过期
    if (user.is_pro && user.pro_expires_at && new Date(user.pro_expires_at) < new Date()) {
      // 已过期，自动取消 Pro
      await connection.execute(
        'UPDATE users SET is_pro = 0 WHERE id = ?',
        [userId]
      );
      return { isPro: false };
    }

    // 查询使用的激活码类型
    let planId: string | undefined;
    if (user.is_pro) {
      const [codeRows] = await connection.execute(
        'SELECT plan_id FROM activation_codes WHERE used_by = ? ORDER BY used_at DESC LIMIT 1',
        [userId]
      );
      const codeRecord = (codeRows as any[])[0];
      planId = codeRecord?.plan_id;
    }

    return {
      isPro: !!user.is_pro,
      planId,
      activatedAt: user.pro_activated_at ? new Date(user.pro_activated_at).toISOString() : undefined,
      expiresAt: user.pro_expires_at ? new Date(user.pro_expires_at).toISOString() : undefined,
    };
  }

  // 列出所有激活码（管理用）
  static async listCodes(filter?: { status?: string; planId?: string }): Promise<any[]> {
    const connection = await DatabaseConnection.getConnection();
    let sql = 'SELECT * FROM activation_codes WHERE 1=1';
    const params: any[] = [];

    if (filter?.status) {
      sql += ' AND status = ?';
      params.push(filter.status);
    }
    if (filter?.planId) {
      sql += ' AND plan_id = ?';
      params.push(filter.planId);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';
    const [rows] = await connection.execute(sql, params);
    return rows as any[];
  }
}
