import express from 'express';
import {
  createMonster,
  getMonsterStatus,
  consumeStamina,
  recoverStamina,
  consumeEnergy,
  consumeEnergyAmount,
  recoverEnergy,
  addExp,
  chatWithMonster,
  getMonsterMessages
} from '../controllers';

const router = express.Router();

router.post('/create', createMonster);
router.get('/status', getMonsterStatus);
router.post('/stamina/consume', consumeStamina);
router.post('/stamina/recover', recoverStamina);
router.post('/energy/consume', consumeEnergy);
router.post('/energy/consume-amount', consumeEnergyAmount);
router.post('/energy/recover', recoverEnergy);
router.post('/exp/add', addExp);
router.post('/chat', chatWithMonster);
router.get('/messages', getMonsterMessages);

export default router;
