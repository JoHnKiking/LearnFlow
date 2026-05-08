import { pool } from '../config/database';

export interface Monster {
  id: number;
  userId: number;
  name: string;
  style: string;
  personality: 'lively' | 'calm' | 'rebel';
  level: number;
  exp: number;
  stamina: number;
  maxStamina: number;
  energy: number;
  maxEnergy: number;
  personalityParams?: string | Record<string, number>;
  lastEnergyRecover: Date;
  lastStaminaRecover: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const createMonster = async (monsterData: {
  userId: number;
  name: string;
  style: string;
  personality: 'lively' | 'calm' | 'rebel';
  stamina: number;
  maxStamina: number;
  energy: number;
  maxEnergy: number;
  personalityParams?: Record<string, number>;
}): Promise<number> => {
  const [result] = await pool.execute(
    `INSERT INTO monsters (
      user_id, name, style, personality, stamina, max_stamina, energy, max_energy, personality_params
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      style = VALUES(style),
      personality = VALUES(personality),
      stamina = VALUES(stamina),
      max_stamina = VALUES(max_stamina),
      energy = VALUES(energy),
      max_energy = VALUES(max_energy),
      personality_params = VALUES(personality_params),
      updated_at = CURRENT_TIMESTAMP`,
    [
      monsterData.userId,
      monsterData.name,
      monsterData.style,
      monsterData.personality,
      monsterData.stamina,
      monsterData.maxStamina,
      monsterData.energy,
      monsterData.maxEnergy,
      JSON.stringify(monsterData.personalityParams || {}),
    ]
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
  if (updates.stamina !== undefined) {
    setClauses.push('stamina = ?');
    values.push(updates.stamina);
  }
  if (updates.maxStamina !== undefined) {
    setClauses.push('max_stamina = ?');
    values.push(updates.maxStamina);
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
  if (updates.lastStaminaRecover !== undefined) {
    setClauses.push('last_stamina_recover = ?');
    values.push(updates.lastStaminaRecover);
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

export const consumeStamina = async (userId: number, amount: number = 10): Promise<boolean> => {
  const [result] = await pool.execute(
    'UPDATE monsters SET stamina = stamina - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND stamina >= ?',
    [amount, userId, amount]
  );
  return (result as any).affectedRows > 0;
};

export const recoverStamina = async (userId: number, amount: number = 20): Promise<void> => {
  await pool.execute(
    'UPDATE monsters SET stamina = LEAST(stamina + ?, max_stamina), last_stamina_recover = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [amount, userId]
  );
};

export const consumeEnergy = async (userId: number): Promise<boolean> => {
  const [result] = await pool.execute(
    'UPDATE monsters SET energy = energy - 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND energy > 0',
    [userId]
  );
  return (result as any).affectedRows > 0;
};

export const consumeEnergyAmount = async (userId: number, amount: number): Promise<boolean> => {
  const [result] = await pool.execute(
    'UPDATE monsters SET energy = energy - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND energy >= ?',
    [amount, userId, amount]
  );
  return (result as any).affectedRows > 0;
};

export const recoverEnergy = async (userId: number, amount: number = 1): Promise<void> => {
  await pool.execute(
    'UPDATE monsters SET energy = LEAST(energy + ?, max_energy), last_energy_recover = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
    [amount, userId]
  );
};
