import * as NoteModel from '../models/Note';
import * as MonsterService from './monsterService';

export const createNote = async (userId: number, date: Date, content?: string) => {
  let monsterComment: string | undefined;
  
  if (content) {
    const commentResult = await MonsterService.chatWithMonster(userId, `我今天学习了：${content}`);
    monsterComment = commentResult.message;
  }

  const noteId = await NoteModel.createNote({
    userId,
    date,
    content,
    monsterComment
  });

  return { success: true, noteId, monsterComment };
};

export const getNotes = async (userId: number) => {
  const notes = await NoteModel.getNotesByUserId(userId);
  return { notes };
};

export const getNoteByDate = async (userId: number, date: Date) => {
  const note = await NoteModel.getNoteByDate(userId, date);
  return note;
};

export const updateNote = async (noteId: number, content?: string) => {
  await NoteModel.updateNote(noteId, { content });
  return { success: true };
};
