import express from 'express';
import { fillModuleContent } from '../controllers/aiController';

const router = express.Router();

router.post('/fill-module', fillModuleContent);

export default router;
