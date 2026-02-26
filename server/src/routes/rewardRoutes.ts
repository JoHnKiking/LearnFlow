import express from 'express';
import {
  createReward,
  getRewards,
  claimReward
} from '../controllers';

const router = express.Router();

router.post('/create', createReward);
router.get('/list/:userId', getRewards);
router.post('/claim', claimReward);

export default router;
