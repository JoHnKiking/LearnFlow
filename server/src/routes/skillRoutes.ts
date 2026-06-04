import express from 'express';
import { generateSkillTree } from '../controllers';

const router = express.Router();

// 技能树生成
router.post('/generate', generateSkillTree);

export default router;
