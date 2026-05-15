import * as MonsterModel from '../models/Monster';
import * as MonsterMessageModel from '../models/MonsterMessage';

const ENERGY_RECOVERY_HOURS = 6;

type MonsterPersonalityType = 'lively' | 'calm' | 'rebel';

const DEFAULT_MONSTER_STYLE = 'default';
const DEFAULT_MONSTER_ENERGY = 50;

const buildPersonalityParams = (
  personality: MonsterPersonalityType
): Record<'cheerful' | 'calm' | 'rebellious', number> => ({
  cheerful: personality === 'lively' ? 70 : 30,
  calm: personality === 'calm' ? 70 : 30,
  rebellious: personality === 'rebel' ? 70 : 30,
});

const getMaxStamina = (personality: MonsterPersonalityType): number =>
  personality === 'calm' ? 120 : 100;

export const createMonster = async (
  userId: number,
  payload: {
    name: string;
    style?: string;
    personality: MonsterPersonalityType;
  }
) => {
  console.log(`[MonsterService] 创建怪物 - 用户ID: ${userId}, 名称: ${payload.name}, 性格: ${payload.personality}`);
  const personalityParams = buildPersonalityParams(payload.personality);
  const maxStamina = getMaxStamina(payload.personality);

  const monsterId = await MonsterModel.createMonster({
    userId,
    name: payload.name,
    style: payload.style || DEFAULT_MONSTER_STYLE,
    personality: payload.personality,
    stamina: maxStamina,
    maxStamina,
    energy: DEFAULT_MONSTER_ENERGY,
    maxEnergy: DEFAULT_MONSTER_ENERGY,
    personalityParams,
  });

  console.log(`[MonsterService] 怪物创建成功 - 怪物ID: ${monsterId}`);
  return { success: true, monsterId };
};

export const getMonsterStatus = async (userId: number) => {
  console.log(`[MonsterService] 获取怪物状态 - 用户ID: ${userId}`);
  const monster = await MonsterModel.getMonsterByUserId(userId);

  if (!monster) {
    console.log(`[MonsterService] 怪物不存在 - 用户ID: ${userId}`);
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
    name: monster.name,
    style: monster.style,
    level: monster.level,
    exp: monster.exp,
    stamina: monster.stamina,
    maxStamina: monster.maxStamina,
    energy: monster.energy,
    maxEnergy: monster.maxEnergy,
    personality: monster.personality,
    personalityParams,
    lastEnergyRecover: monster.lastEnergyRecover,
    lastStaminaRecover: monster.lastStaminaRecover
  };
};

export const consumeStamina = async (userId: number, amount: number = 10): Promise<boolean> => {
  const success = await MonsterModel.consumeStamina(userId, amount);
  return success;
};

export const recoverStamina = async (userId: number, amount: number = 20) => {
  await MonsterModel.recoverStamina(userId, amount);
  return { success: true };
};

export const updateMonsterStamina = async (
  userId: number,
  delta: number
) => {
  console.log(`[MonsterService] 更新体力 - 用户ID: ${userId}, 变化量: ${delta}`);
  const monster = await MonsterModel.getMonsterByUserId(userId);

  if (!monster) {
    console.log(`[MonsterService] 更新体力失败 - 怪物不存在`);
    return { success: false, message: '怪物不存在' };
  }

  const newStamina = Math.max(0, Math.min(monster.maxStamina, monster.stamina + delta));
  await MonsterModel.updateMonster(monster.userId, { stamina: newStamina });

  console.log(`[MonsterService] 体力更新成功 - 旧值: ${monster.stamina}, 新值: ${newStamina}`);
  return { success: true, stamina: newStamina };
};

export const consumeEnergy = async (userId: number): Promise<boolean> => {
  console.log(`[MonsterService] 消耗能量 - 用户ID: ${userId}`);
  const success = await MonsterModel.consumeEnergy(userId);
  console.log(`[MonsterService] 能量消耗${success ? '成功' : '失败'}`);
  return success;
};

export const consumeEnergyAmount = async (userId: number, amount: number): Promise<boolean> => {
  const success = await MonsterModel.consumeEnergyAmount(userId, amount);
  return success;
};

export const recoverEnergy = async (userId: number, amount: number = 1) => {
  await MonsterModel.recoverEnergy(userId, amount);
  return { success: true };
};

export const gainExp = async (userId: number, exp: number) => {
  console.log(`[MonsterService] 获得经验 - 用户ID: ${userId}, 经验: ${exp}`);
  const monster = await MonsterModel.getMonsterByUserId(userId);

  if (!monster) {
    console.log(`[MonsterService] 获得经验失败 - 怪物不存在`);
    return { success: false, message: '怪物不存在' };
  }

  const newExp = monster.exp + exp;
  const expToLevel = monster.level * 100;
  let newLevel = monster.level;
  let remainingExp = newExp;

  while (remainingExp >= expToLevel) {
    remainingExp -= expToLevel;
    newLevel++;
  }

  await MonsterModel.updateMonster(userId, {
    level: newLevel,
    exp: remainingExp,
  });

  console.log(`[MonsterService] 经验更新 - 等级: ${monster.level} -> ${newLevel}, 经验: ${monster.exp} -> ${remainingExp}`);
  return { success: true, level: newLevel, exp: remainingExp };
};

export const chatWithMonster = async (userId: number, message: string) => {
  await MonsterMessageModel.createMessage({
    userId,
    message,
    isUser: true
  });

  const monsterStatus = await getMonsterStatus(userId);
  const personality = monsterStatus?.personalityParams;
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
