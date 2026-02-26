import { Request, Response } from 'express';
import {
  createNote as createNoteService,
  getNotes as getNotesService,
  getNoteByDate as getNoteByDateService,
  updateNote as updateNoteService
} from '../services';

export const createNote = async (req: Request, res: Response) => {
  try {
    const { userId, date, content } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ 
        error: 'User ID and date are required' 
      });
    }

    const result = await createNoteService(
      parseInt(userId),
      new Date(date),
      content
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ 
      error: 'Failed to create note',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getNotes = async (req: Request, res: Response) => {
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
    console.error('Error getting notes:', error);
    res.status(500).json({ 
      error: 'Failed to get notes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getNoteByDate = async (req: Request, res: Response) => {
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
    console.error('Error getting note by date:', error);
    res.status(500).json({ 
      error: 'Failed to get note by date',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateNote = async (req: Request, res: Response) => {
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
    console.error('Error updating note:', error);
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
