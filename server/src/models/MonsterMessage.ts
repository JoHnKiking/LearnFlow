import { pool } from '../config/database';

export interface MonsterMessage {
  id: number;
  userId: number;
  message: string;
  isUser: boolean;
  createdAt: Date;
}

export const createMessage = async (messageData: {
  userId: number;
  message: string;
  isUser: boolean;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO monster_messages (user_id, message, is_user) VALUES (?, ?, ?)',
    [messageData.userId, messageData.message, messageData.isUser]
  );
  return (result as any).insertId;
};

export const getMessagesByUserId = async (userId: number, limit: number = 50): Promise<MonsterMessage[]> => {
  // mysql2 prepared statements do not support parameterised LIMIT
  // use query() instead of execute() for this pattern
  const userIdNum = Number(userId);
  const limitNum = Number(limit);
  const [rows] = await pool.query(
    `SELECT * FROM monster_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limitNum}`,
    [userIdNum]
  );
  return rows as MonsterMessage[];
};
