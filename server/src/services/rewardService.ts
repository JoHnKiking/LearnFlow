import * as RewardModel from '../models/Reward';

export const createReward = async (userId: number, type: 'stamina' | 'energy', amount: number, source?: string) => {
  console.log(`[RewardService] 创建奖励 - 用户ID: ${userId}, 类型: ${type}, 数量: ${amount}`);
  const rewardId = await RewardModel.createReward({
    userId,
    type,
    amount,
    source
  });
  console.log(`[RewardService] 奖励创建成功 - 奖励ID: ${rewardId}`);
  return { success: true, rewardId };
};

export const getRewards = async (userId: number) => {
  console.log(`[RewardService] 获取奖励列表 - 用户ID: ${userId}`);
  const rewards = await RewardModel.getRewardsByUserId(userId);
  console.log(`[RewardService] 获取到 ${rewards.length} 条奖励`);
  return { rewards };
};

export const claimReward = async (rewardId: number) => {
  console.log(`[RewardService] 领取奖励 - 奖励ID: ${rewardId}`);
  const success = await RewardModel.claimReward(rewardId);
  console.log(`[RewardService] 奖励领取${success ? '成功' : '失败'}`);
  return { success };
};
