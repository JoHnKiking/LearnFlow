import express from 'express';
import { ProController } from '../controllers/proController';

const router = express.Router();

router.post('/generate-codes', ProController.generateCodes);
router.post('/activate', ProController.activateCode);
router.get('/status', ProController.getStatus);

export default router;
