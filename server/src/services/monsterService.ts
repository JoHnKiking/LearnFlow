import * as MonsterModel from '../models/Monster';
import * as MonsterMessageModel from '../models/MonsterMessage';
import * as UserModel from '../models/User';
import { MonsterPersonality } from '../types/skill';

const ENERGY_RECOVERY_HOURS = 6;

export const createMonster = async (userId: number, personality: 'cheerful' | 'calm' | 'rebellious') => {
  const personalityParams: MonsterPersonality = {
    cheerful: personality === 'cheerful' ? 70 : 30,
    calm: personality === 'calm' ? 70 : 30,
    rebellious: personality === 'rebellious' ? 70 : 30
  };

  const monsterId = await MonsterModel.createMonster({
    userId,
    personalityParams
  });

  return { success: true, monsterId };
};

export const getMonsterStatus = async (userId: number) => {
  const monster = await MonsterModel.getMonsterByUserId(userId);
  const user = await UserModel.getUserById(userId);

  if (!monster) {
    return null;
  }

  const now = new Date();
  const lastRecover = new Date(monster.lastEnergyRecover);
  const hoursSinceRecover = (now.getTime() - lastRecover.getTime()) / (1000 * 60 * 60);
  const energyToRecover = Math.floor(hoursSinceRecover / ENERGY_RECOVERY_HOURS);

  if (energyToRecover > 0 && monster.energy < monster.maxEnergy) {
    const newEnergy = Math.min(monster.energy + energyToRecover, monster.maxEnergy);
    await MonsterModel.updateMonster(userId, {
      energy: newEnergy,
      lastEnergyRecover: now
    });
    monster.energy = newEnergy;
    monster.lastEnergyRecover = now;
  }

  const personalityParams = typeof monster.personalityParams === 'string' 
    ? JSON.parse(monster.personalityParams) 
    : monster.personalityParams;

  return {
    id: monster.id,
    name: user?.monsterName || '小怪兽',
    style: user?.monsterStyle || 'default',
    level: monster.level,
    exp: monster.exp,
    energy: monster.energy,
    maxEnergy: monster.maxEnergy,
    personality: personalityParams,
    lastEnergyRecover: monster.lastEnergyRecover
  };
};

export const consumeEnergy = async (userId: number): Promise<boolean> => {
  const success = await MonsterModel.consumeEnergy(userId);
  return success;
};

export const recoverEnergy = async (userId: number, amount: number = 1) => {
  await MonsterModel.recoverEnergy(userId, amount);
  return { success: true };
};

export const addExp = async (userId: number, exp: number) => {
  const monster = await MonsterModel.getMonsterByUserId(userId);
  if (!monster) {
    return { success: false, error: 'Monster not found' };
  }

  let newExp = monster.exp + exp;
  let newLevel = monster.level;
  const expToNextLevel = monster.level * 100;

  while (newExp >= expToNextLevel) {
    newExp -= expToNextLevel;
    newLevel++;
  }

  await MonsterModel.updateMonster(userId, {
    exp: newExp,
    level: newLevel
  });

  return { success: true, level: newLevel, exp: newExp };
};

export const chatWithMonster = async (userId: number, message: string) => {
  await MonsterMessageModel.createMessage({
    userId,
    message,
    isUser: true
  });

  const monsterStatus = await getMonsterStatus(userId);
  const personality = monsterStatus?.personality;
  let response = '';

  const cheerfulResponses = [
    '太棒了！继续加油哦～',
    '这个知识点很有趣呢！',
    '准备好开始冒险了吗？',
    '我相信你一定可以的！'
  ];

  const calmResponses = [
    '慢慢来，学习需要耐心。',
    '这个知识点很重要，好好掌握。',
    '保持专注，你会有所收获的。',
    '学习是一个渐进的过程。'
  ];

  const rebelliousResponses = [
    '学习好无聊啊，我们去玩吧！',
    '这个也太难了吧...',
    '要不休息一下？',
    '真的要学这个吗？'
  ];

  let responsePool: string[];
  if (personality?.cheerful > personality?.calm && personality?.cheerful > personality?.rebellious) {
    responsePool = cheerfulResponses;
  } else if (personality?.calm > personality?.cheerful && personality?.calm > personality?.rebellious) {
    responsePool = calmResponses;
  } else {
    responsePool = rebelliousResponses;
  }

  response = responsePool[Math.floor(Math.random() * responsePool.length)];

  await MonsterMessageModel.createMessage({
    userId,
    message: response,
    isUser: false
  });

  return { message: response };
};

export const getMonsterMessages = async (userId: number) => {
  const messages = await MonsterMessageModel.getMessagesByUserId(userId);
  return { messages: messages.reverse() };
};
