import { Request, Response } from 'express';
import {
  createNote as createNoteService,
  getNotes as getNotesService,
  getNoteByDate as getNoteByDateService,
  updateNote as updateNoteService
} from '../services';

export const createNote = async (req: Request, res: Response) => {
  console.log(`[NoteController] POST /notes - 创建笔记`);
  try {
    const { userId, date, content } = req.body;

    if (!userId || !date) {
      console.log(`[NoteController] 参数验证失败 - 缺少必填字段`);
      return res.status(400).json({ 
        error: 'User ID and date are required' 
      });
    }

    const result = await createNoteService(
      parseInt(userId),
      new Date(date),
      content
    );
    
    console.log(`[NoteController] 笔记创建成功`);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[NoteController] 创建笔记失败:', error);
    res.status(500).json({ 
      error: 'Failed to create note',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  console.log(`[NoteController] GET /notes/:userId - 获取笔记列表`);
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await getNotesService(parseInt(userId));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[NoteController] 获取笔记列表失败:', error);
    res.status(500).json({ 
      error: 'Failed to get notes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getNoteByDate = async (req: Request, res: Response) => {
  console.log(`[NoteController] GET /notes/:userId/:date - 按日期获取笔记`);
  try {
    const { userId, date } = req.params;

    if (!userId || !date) {
      return res.status(400).json({ 
        error: 'User ID and date are required' 
      });
    }

    const note = await getNoteByDateService(parseInt(userId), new Date(date));
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('[NoteController] 按日期获取笔记失败:', error);
    res.status(500).json({ 
      error: 'Failed to get note by date',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  console.log(`[NoteController] PUT /notes - 更新笔记`);
  try {
    const { noteId, content } = req.body;

    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    await updateNoteService(parseInt(noteId), content);
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('[NoteController] 更新笔记失败:', error);
    res.status(500).json({ 
      error: 'Failed to update note',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  createNote,
  getNotes,
  getNoteByDate,
  updateNote
};
