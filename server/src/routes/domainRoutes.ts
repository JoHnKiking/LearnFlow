import express from 'express';
import {
  createDomain,
  getDomains,
  getDomainById,
  updateNodeProgress,
  startLearning,
  finishLearning
} from '../controllers';

const router = express.Router();

router.post('/create', createDomain);
router.get('/list/:userId', getDomains);
router.get('/:id', getDomainById);
router.put('/nodes/progress', updateNodeProgress);
router.post('/learning/start', startLearning);
router.post('/learning/finish', finishLearning);

export default router;
