import express from 'express';
import { ProController } from '../controllers/proController';

const router = express.Router();

// 生成激活码（管理端）
router.post('/generate-codes', ProController.generateCodes);

// 激活 Pro
router.post('/activate', ProController.activateCode);

// 查询 Pro 状态
router.get('/status/:userId', ProController.getStatus);

export default router;
