import { pool } from '../config/database';
import { SkillNode } from '../types/skill';

export interface Domain {
  id: number;
  userId: number;
  name: string;
  type: 'custom' | 'preset';
  mindMapData: SkillNode;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export const createDomain = async (domainData: {
  userId: number;
  name: string;
  type: 'custom' | 'preset';
  mindMapData: SkillNode;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO domains (user_id, name, type, mind_map_data) VALUES (?, ?, ?, ?)',
    [domainData.userId, domainData.name, domainData.type, JSON.stringify(domainData.mindMapData)]
  );
  return (result as any).insertId;
};

export const getDomainsByUserId = async (userId: number): Promise<Domain[]> => {
  const [rows] = await pool.execute(
    'SELECT * FROM domains WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  const domains = rows as any[];
  return domains.map(d => ({
    ...d,
    mindMapData: typeof d.mind_map_data === 'string' ? JSON.parse(d.mind_map_data) : d.mind_map_data
  }));
};

export const getDomainById = async (id: number): Promise<Domain | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM domains WHERE id = ?',
    [id]
  );
  const domains = rows as any[];
  if (domains.length === 0) return null;
  const d = domains[0];
  return {
    ...d,
    mindMapData: typeof d.mind_map_data === 'string' ? JSON.parse(d.mind_map_data) : d.mind_map_data
  };
};

export const updateDomainProgress = async (id: number, progress: number): Promise<void> => {
  await pool.execute(
    'UPDATE domains SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [progress, id]
  );
};
