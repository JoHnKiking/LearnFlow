import { pool } from '../config/database';

export interface StudyRecord {
  id: number;
  userId: number;
  domainId: number;
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  progressBefore: number;
  progressAfter: number;
  rewardObtained?: any;
  createdAt: Date;
  updatedAt: Date;
}

export const createStudyRecord = async (recordData: {
  userId: number;
  domainId: number;
  nodeId: string;
  startTime: Date;
  progressBefore: number;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO study_records (user_id, domain_id, node_id, start_time, progress_before) VALUES (?, ?, ?, ?, ?)',
    [recordData.userId, recordData.domainId, recordData.nodeId, recordData.startTime, recordData.progressBefore]
  );
  return (result as any).insertId;
};

export const updateStudyRecord = async (
  id: number,
  updates: Partial<Omit<StudyRecord, 'id' | 'userId' | 'domainId' | 'nodeId' | 'createdAt'>>
): Promise<void> => {
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.endTime !== undefined) {
    setClauses.push('end_time = ?');
    values.push(updates.endTime);
  }
  if (updates.duration !== undefined) {
    setClauses.push('duration = ?');
    values.push(updates.duration);
  }
  if (updates.progressAfter !== undefined) {
    setClauses.push('progress_after = ?');
    values.push(updates.progressAfter);
  }
  if (updates.rewardObtained !== undefined) {
    setClauses.push('reward_obtained = ?');
    values.push(JSON.stringify(updates.rewardObtained));
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await pool.execute(
      `UPDATE study_records SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
  }
};

export const getStudyRecordsByUser = async (userId: number, limit: number = 20): Promise<StudyRecord[]> => {
  const [rows] = await pool.execute(
    'SELECT * FROM study_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  const records = rows as any[];
  return records.map(r => ({
    ...r,
    rewardObtained: typeof r.reward_obtained === 'string' ? JSON.parse(r.reward_obtained) : r.reward_obtained
  }));
};
