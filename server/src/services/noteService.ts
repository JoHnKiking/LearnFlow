import * as NoteModel from '../models/Note';

export const createNote = async (userId: number, date: Date, content?: string) => {
  console.log(`[NoteService] 创建笔记 - 用户ID: ${userId}, 日期: ${date}`);

  // 纯笔记存储，不再自动调用 AI 生成怪兽评论
  const noteId = await NoteModel.createNote({
    userId,
    date,
    content,
  });

  console.log(`[NoteService] 笔记创建成功 - 笔记ID: ${noteId}`);
  return { success: true, noteId };
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
