import express from 'express';
import {
  createNote,
  getNotes,
  getNoteByDate,
  updateNote
} from '../controllers';

const router = express.Router();

router.post('/create', createNote);
router.get('/list', getNotes);
router.get('/:date', getNoteByDate);
router.put('/update', updateNote);

export default router;
