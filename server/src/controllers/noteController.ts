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
    const { date, content } = req.body;
    const userId = req.user!.userId;

    if (!date) {
      console.log(`[NoteController] 参数验证失败 - 缺少必填字段`);
      return res.status(400).json({ 
        error: 'Date is required' 
      });
    }

    const result = await createNoteService(
      userId,
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
  console.log(`[NoteController] GET /notes/list - 获取笔记列表`);
  try {
    const userId = req.user!.userId;
    const result = await getNotesService(userId);
    
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
  console.log(`[NoteController] GET /notes/:date - 按日期获取笔记`);
  try {
    const { date } = req.params;
    const userId = req.user!.userId;

    if (!date) {
      return res.status(400).json({ 
        error: 'Date is required' 
      });
    }

    const note = await getNoteByDateService(userId, new Date(date));
    
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
