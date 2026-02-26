import { pool } from '../config/database';

export interface Note {
  id: number;
  userId: number;
  date: Date;
  content?: string;
  monsterComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createNote = async (noteData: {
  userId: number;
  date: Date;
  content?: string;
  monsterComment?: string;
}): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO notes (user_id, date, content, monster_comment) VALUES (?, ?, ?, ?)',
    [noteData.userId, noteData.date, noteData.content || null, noteData.monsterComment || null]
  );
  return (result as any).insertId;
};

export const getNotesByUserId = async (userId: number): Promise<Note[]> => {
  const [rows] = await pool.execute(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY date DESC',
    [userId]
  );
  return rows as Note[];
};

export const getNoteByDate = async (userId: number, date: Date): Promise<Note | null> => {
  const [rows] = await pool.execute(
    'SELECT * FROM notes WHERE user_id = ? AND date = ?',
    [userId, date]
  );
  const notes = rows as Note[];
  return notes.length > 0 ? notes[0] : null;
};

export const updateNote = async (
  id: number,
  updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.date !== undefined) {
    setClauses.push('date = ?');
    values.push(updates.date);
  }
  if (updates.content !== undefined) {
    setClauses.push('content = ?');
    values.push(updates.content);
  }
  if (updates.monsterComment !== undefined) {
    setClauses.push('monster_comment = ?');
    values.push(updates.monsterComment);
  }

  if (setClauses.length > 0) {
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    await pool.execute(
      `UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
  }
};
