import express from 'express';
import {
  createMonster,
  getMonsterStatus,
  consumeEnergy,
  recoverEnergy,
  addExp,
  chatWithMonster,
  getMonsterMessages
} from '../controllers';

const router = express.Router();

router.post('/create', createMonster);
router.get('/status/:userId', getMonsterStatus);
router.post('/energy/consume', consumeEnergy);
router.post('/energy/recover', recoverEnergy);
router.post('/exp/add', addExp);
router.post('/chat', chatWithMonster);
router.get('/messages/:userId', getMonsterMessages);

export default router;
