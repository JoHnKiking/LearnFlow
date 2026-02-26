import * as RewardModel from '../models/Reward';

export const createReward = async (userId: number, type: string, amount: number, source?: string) => {
  const rewardId = await RewardModel.createReward({
    userId,
    type,
    amount,
    source
  });
  return { success: true, rewardId };
};

export const getRewards = async (userId: number) => {
  const rewards = await RewardModel.getRewardsByUserId(userId);
  return { rewards };
};

export const claimReward = async (rewardId: number) => {
  const success = await RewardModel.claimReward(rewardId);
  return { success };
};
