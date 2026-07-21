import { pool } from '../config/database';

export interface Feedback {
  id: number;
  userId: number;
  category: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createFeedback = async (feedbackData: {
  userId: number;
  category: string;
  content: string;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO feedbacks (user_id, category, content, status) VALUES (?, ?, ?, ?)',
    [feedbackData.userId, feedbackData.category, feedbackData.content, 'pending']
  );
  return (result as any).insertId;
};

export const getFeedbacksByUserId = async (userId: number): Promise<Feedback[]> => {
  const [rows] = await pool.execute(
    'SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as Feedback[];
};

export const getFeedbackById = async (id: number): Promise<Feedback | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM feedbacks WHERE id = ?',
    [id]
  );
  const feedbacks = rows as Feedback[];
  return feedbacks.length > 0 ? feedbacks[0] : null;
};
