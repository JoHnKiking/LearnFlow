import { Request, Response } from 'express';
import {
  createReward as createRewardService,
  getRewards as getRewardsService,
  claimReward as claimRewardService
} from '../services';

export const createReward = async (req: Request, res: Response) => {
  console.log(`[RewardController] POST /rewards - 创建奖励`);
  try {
    const { userId, type, amount, source } = req.body;

    if (!userId || !type || amount === undefined) {
      console.log(`[RewardController] 参数验证失败 - 缺少必填字段`);
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
    
    console.log(`[RewardController] 奖励创建成功`);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[RewardController] 创建奖励失败:', error);
    res.status(500).json({ 
      error: 'Failed to create reward',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getRewards = async (req: Request, res: Response) => {
  console.log(`[RewardController] GET /rewards/:userId - 获取奖励列表`);
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
    console.error('[RewardController] 获取奖励列表失败:', error);
    res.status(500).json({ 
      error: 'Failed to get rewards',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const claimReward = async (req: Request, res: Response) => {
  console.log(`[RewardController] POST /rewards/claim - 领取奖励`);
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
    console.error('[RewardController] 领取奖励失败:', error);
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
