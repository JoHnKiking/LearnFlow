import { pool } from '../config/database';

export interface Monster {
  id: number;
  userId: number;
  level: number;
  exp: number;
  energy: number;
  maxEnergy: number;
  personalityParams?: any;
  lastEnergyRecover: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const createMonster = async (monsterData: {
  userId: number;
  personalityParams?: any;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO monsters (user_id, personality_params) VALUES (?, ?)',
    [monsterData.userId, JSON.stringify(monsterData.personalityParams || {})]
  );
  return (result as any).insertId;
};

export const getMonsterByUserId = async (userId: number): Promise<Monster | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM monsters WHERE user_id = ?',
    [userId]
  );
  const monsters = rows as Monster[];
  return monsters.length > 0 ? monsters[0] : null;
};

export const updateMonster = async (
  userId: number,
  updates: Partial<Omit<Monster, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.level !== undefined) {
    setClauses.push('level = ?');
    values.push(updates.level);
  }
  if (updates.exp !== undefined) {
    setClauses.push('exp = ?');
    values.push(updates.exp);
  }
  if (updates.energy !== undefined) {
    setClauses.push('energy = ?');
    values.push(updates.energy);
  }
  if (updates.maxEnergy !== undefined) {
    setClauses.push('max_energy = ?');
    values.push(updates.maxEnergy);
  }
  if (updates.personalityParams !== undefined) {
    setClauses.push('personality_params = ?');
    values.push(JSON.stringify(updates.personalityParams));
  }
  if (updates.lastEnergyRecover !== undefined) {
    setClauses.push('last_energy_recover = ?');
    values.push(updates.lastEnergyRecover);
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    
    await pool.execute(
      `UPDATE monsters SET ${setClauses.join(', ')} WHERE user_id = ?`,
      values
    );
  }
};

export const consumeEnergy = async (userId: number): Promise<boolean> => {
  const [result] = await pool.execute(
    'UPDATE monsters SET energy = energy - 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND energy > 0',
    [userId]
  );
  return (result as any).affectedRows > 0;
};

export const recoverEnergy = async (userId: number, amount: number = 1): Promise<void> => {
  await pool.execute(
    'UPDATE monsters SET energy = LEAST(energy + ?, max_energy), last_energy_recover = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [amount, userId]
  );
};
