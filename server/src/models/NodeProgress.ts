import { pool } from '../config/database';

export interface NodeProgress {
  id: number;
  userId: number;
  domainId: number;
  nodeId: string;
  status: 'pending' | 'doing' | 'done';
  studyTime: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createNodeProgress = async (progressData: {
  userId: number;
  domainId: number;
  nodeId: string;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO node_progress (user_id, domain_id, node_id) VALUES (?, ?, ?)',
    [progressData.userId, progressData.domainId, progressData.nodeId]
  );
  return (result as any).insertId;
};

export const getNodeProgress = async (
  userId: number,
  domainId: number,
  nodeId: string
): Promise<NodeProgress | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM node_progress WHERE user_id = ? AND domain_id = ? AND node_id = ?',
    [userId, domainId, nodeId]
  );
  const progresses = rows as NodeProgress[];
  return progresses.length > 0 ? progresses[0] : null;
};

export const getNodeProgressesByDomain = async (
  userId: number,
  domainId: number
): Promise<NodeProgress[]> => {
  const [rows] = await pool.execute(
    'SELECT * FROM node_progress WHERE user_id = ? AND domain_id = ?',
    [userId, domainId]
  );
  return rows as NodeProgress[];
};

export const updateNodeProgress = async (
  userId: number,
  domainId: number,
  nodeId: string,
  updates: Partial<Omit<NodeProgress, 'id' | 'userId' | 'domainId' | 'nodeId' | 'createdAt'>>
): Promise<void> => {
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    values.push(updates.status);
  }
  if (updates.studyTime !== undefined) {
    setClauses.push('study_time = ?');
    values.push(updates.studyTime);
  }
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    values.push(updates.notes);
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId, domainId, nodeId);
    
    await pool.execute(
      `UPDATE node_progress SET ${setClauses.join(', ')} WHERE user_id = ? AND domain_id = ? AND node_id = ?`,
      values
    );
  }
};
