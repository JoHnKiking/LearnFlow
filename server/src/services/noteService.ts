import * as NoteModel from '../models/Note';
import * as MonsterService from './monsterService';

export const createNote = async (userId: number, date: Date, content?: string) => {
  console.log(`[NoteService] 创建笔记 - 用户ID: ${userId}, 日期: ${date}`);
  let monsterComment: string | undefined;
  
  if (content) {
    console.log(`[NoteService] 请求怪物评论`);
    const commentResult = await MonsterService.chatWithMonster(userId, `我今天学习了：${content}`);
    monsterComment = commentResult.message;
  }

  const noteId = await NoteModel.createNote({
    userId,
    date,
    content,
    monsterComment
  });

  console.log(`[NoteService] 笔记创建成功 - 笔记ID: ${noteId}`);
  return { success: true, noteId, monsterComment };
};

export const getNotes = async (userId: number) => {
  console.log(`[NoteService] 获取笔记列表 - 用户ID: ${userId}`);
  const notes = await NoteModel.getNotesByUserId(userId);
  console.log(`[NoteService] 获取到 ${notes.length} 条笔记`);
  return { notes };
};

export const getNoteByDate = async (userId: number, date: Date) => {
  console.log(`[NoteService] 按日期获取笔记 - 用户ID: ${userId}, 日期: ${date}`);
  const note = await NoteModel.getNoteByDate(userId, date);
  return note;
};

export const updateNote = async (noteId: number, content?: string) => {
  console.log(`[NoteService] 更新笔记 - 笔记ID: ${noteId}`);
  await NoteModel.updateNote(noteId, { content });
  console.log(`[NoteService] 笔记更新成功`);
  return { success: true };
};
