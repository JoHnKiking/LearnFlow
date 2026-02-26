import { pool } from '../config/database';

export interface Reward {
  id: number;
  userId: number;
  type: string;
  amount: number;
  source?: string;
  claimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createReward = async (rewardData: {
  userId: number;
  type: string;
  amount: number;
  source?: string;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO rewards (user_id, type, amount, source) VALUES (?, ?, ?, ?)',
    [rewardData.userId, rewardData.type, rewardData.amount, rewardData.source || null]
  );
  return (result as any).insertId;
};

export const getRewardsByUserId = async (userId: number): Promise<Reward[]> => {
  const [rows] = await pool.execute(
    'SELECT * FROM rewards WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Reward[];
};

export const claimReward = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute(
    'UPDATE rewards SET claimed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND claimed = FALSE',
    [id]
  );
  return (result as any).affectedRows > 0;
};
