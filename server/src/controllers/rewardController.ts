import { Request, Response } from 'express';
import {
  createReward as createRewardService,
  getRewards as getRewardsService,
  claimReward as claimRewardService
} from '../services';

export const createReward = async (req: Request, res: Response) => {
  try {
    const { userId, type, amount, source } = req.body;

    if (!userId || !type || amount === undefined) {
      return res.status(400).json({ 
        error: 'User ID, type, and amount are required' 
      });
    }

    const result = await createRewardService(
      parseInt(userId),
      type,
      amount,
      source
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ 
      error: 'Failed to create reward',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRewards = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await getRewardsService(parseInt(userId));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting rewards:', error);
    res.status(500).json({ 
      error: 'Failed to get rewards',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const claimReward = async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }

    const result = await claimRewardService(parseInt(rewardId));
    
    res.json({
      success: result.success
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ 
      error: 'Failed to claim reward',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  createReward,
  getRewards,
  claimReward
};
