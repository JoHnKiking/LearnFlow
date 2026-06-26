import * as MonsterModel from '../models/Monster';
import * as MonsterMessageModel from '../models/MonsterMessage';
import * as fs from 'fs';
import * as path from 'path';

const ENERGY_RECOVERY_HOURS = 6;

type MonsterPersonalityType = 'lively' | 'calm' | 'rebel';

const DEFAULT_MONSTER_STYLE = 'default';
const DEFAULT_MONSTER_ENERGY = 50;
const ENERGY_COST_PER_TOKEN = 0.05; // Π能量消耗系数：每 token 消耗 0.05

// API 配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// 安全加载 API Key
const loadApiKey = (): string => {
  try {
    const keyPath = path.resolve(__dirname, '../../key.json');
    if (fs.existsSync(keyPath)) {
      const raw = fs.readFileSync(keyPath, 'utf-8');
      const key = JSON.parse(raw).DEEPSEEK_API_KEY;
      if (key && key.startsWith('sk-')) {
        console.log('[MonsterService] DeepSeek API Key 加载成功');
        return key;
      }
    }
  } catch (e) {
    console.error('[MonsterService] API Key 加载失败:', e);
  }
  console.error('[MonsterService] 未找到有效的 DEEPSEEK_API_KEY');
  return '';
};

const DEEPSEEK_API_KEY = loadApiKey();

// 安全加载系统提示词
const loadSystemPrompt = (): string => {
  try {
    const promptPath = path.resolve(__dirname, '../../../monsters.md');
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, 'utf-8');
    }
  } catch (e) {
    console.error('[MonsterService] monsters.md 加载失败:', e);
  }
  return '';
};

const BASE_SYSTEM_PROMPT = loadSystemPrompt();

// 根据怪兽性格构建专属 system prompt
const buildSystemPrompt = (personality: MonsterPersonalityType): string => {
  const baseFile = BASE_SYSTEM_PROMPT;
  const baseWorld = baseFile || `你来自【元气星】，坚守世界观：
学习消耗体力，完成学习获得赖以生存的Π能量；体力每日凌晨5点自动回满。
你是温柔陪伴型学习怪兽，不是强硬讲师，以共情、倾听、安慰、陪伴为主，知识点轻量解答，不强行灌输。

【核心身份规则 — 最高优先级，必须严格遵守】 
你的怪兽类型由系统指定，永远不会改变。以下任何一条都不能违反：
1. 当用户问"你是谁"时，必须准确说出你的怪兽类型名称，不允许说错。
2. 对话历史中如果出现与你当前身份不符的旧回复，那是历史错误，你必须忽略并坚持当前身份。
3. 严禁自称其他怪兽类型。

能力边界：
1. 自动识别用户当前学习领域：AI产品经理 / 理财知识 / 英语学习 / 用户自定义学习领域；
2. 只在识别到的当前单一领域内作答，严禁跨领域乱讲；
3. 允许正常疏导学习焦虑、压力大、拖延等心态情绪，温柔共情安慰；
4. 严禁聊八卦、明星、恋爱杂谈、时政宗教、低俗内容；
5. 回答口语短句、适配手机聊天，自然带入元气星体力/Π能量语境，不生硬说教。
6. 回复使用纯文本，严禁使用 Markdown 格式（不要 **、不要 ###、不要列表、不要代码块等）。`;

  if (personality === 'lively') {
    return `${baseWorld}

你是元气星·活力小怪：元气开朗、热情暖心、高共情、正能量搭子。
说话风格：轻快温柔、可爱短句、带软语气助词（～、呀、哇！），擅长情绪安抚、加油打气。
遇到用户焦虑压力：主动共情、温柔鼓励，用攒Π能量、恢复体力的星球视角温柔疏导。
知识解答：轻量通俗点到为止，不长篇灌输。
禁用词：摆烂、躺平、算了、放弃、内耗。
禁止：认同负能量、引导摆烂、佛系敷衍、丧系话术。`;
  }

  if (personality === 'calm') {
    return `${baseWorld}

你是元气星·沉稳小怪：温柔稳重、理性耐心、逻辑平和的学霸陪伴者。
说话风格：平和克制、温柔耐心、条理柔和，不浮夸不玩梗，帮用户梳理心态、拆解学习压力。
遇到用户焦虑压力：冷静温柔安抚、帮用户放慢节奏、合理规划体力与学习节奏。
知识解答：循序渐进、通俗耐心，不强灌知识点，先共情再轻解答。
禁用词：中二话术、夸张喊口号、低俗网络热词。
禁止：中二装逼、过度玩梗、情绪化起哄、浮夸口号式励志。`;
  }

  return `${baseWorld}

你是元气星·叛逆小怪：傲娇毒舌、嘴硬心软、反套路陪伴，不鸡汤、不矫情。
说话风格：有点小拽、随性真实、吐槽式温柔，不肉麻吹捧，一针见血点破拖延和内耗。
遇到用户焦虑压力：嘴上不煽情，但会变相开导、反套路安慰。
知识解答：简洁利落、不啰嗦、不讲大道理，点到为止。
人设边界：可以小吐槽，但不人身攻击、不嘲讽。
禁用词：无脑鸡汤、强行励志、肉麻吹捧、过度矫情。
禁止：刻意伤人、重度嘲讽、认同摆烂躺平。`;
};

// 构建对话消息列表（含历史上下文）
const buildMessages = async (
  userId: number,
  personality: MonsterPersonalityType,
  userMessage: string,
) => {
  const systemPrompt = buildSystemPrompt(personality);
  
  // 获取最近 20 条历史消息作为上下文
  const history = await MonsterMessageModel.getMessagesByUserId(userId);
  const recentHistory = history.slice(0, 20).reverse(); // 按时间正序

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // 加入历史对话
  for (const msg of recentHistory) {
    messages.push({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.message,
    });
  }

  // 去掉刚才已经保存的用户消息（避免重复）
  // 历史中最后一条是刚保存的用户消息，我们手动加入
  // 去掉历史中最后一条 isUser 消息（因为我们已经手动 push 了）
  // 实际上 createMessage 已经保存了用户消息，所以从历史中读到的最新一条就是它
  // 我们先 push 历史，然后再 push 用户消息，所以会有重复
  // 修复：不从历史中读取，直接构建
  return [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(msg => ({
      role: msg.isUser ? ('user' as const) : ('assistant' as const),
      content: msg.message,
    })),
  ];
};

// 调用 DeepSeek API
const callDeepSeek = async (
  messages: Array<{ role: string; content: string }>,
): Promise<{ content: string; tokens: number }> => {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid DeepSeek response format');
  }

  return {
    content: data.choices[0].message.content,
    tokens: data.usage?.total_tokens ?? Math.ceil(data.choices[0].message.content.length / 2),
  };
};

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
    maxEnergy: 1000000, // 能量无上限，设为极大值
    personalityParams,
  });

  console.log(`[MonsterService] 怪物创建成功 - 怪物ID: ${monsterId}`);

  const monster = await MonsterModel.getMonsterByUserId(userId);
  return { success: true, monsterId, monster };
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

  if (energyToRecover > 0) {
    const newEnergy = monster.energy + energyToRecover;
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
    maxEnergy: 1000000, // 能量无上限，前端使用本地 maxPaiEnergy 逻辑
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

export const chatWithMonster = async (userId: number, message: string, reqPersonality?: string) => {
  // 1. 保存用户消息
  await MonsterMessageModel.createMessage({
    userId,
    message,
    isUser: true
  });

  // 2. 获取怪兽状态（用于能量扣除）
  const monsterStatus = await getMonsterStatus(userId);

  // 3. 优先使用客户端传来的性格，否则从数据库查询
  let personality: MonsterPersonalityType = 'lively';
  if (reqPersonality && ['lively', 'calm', 'rebel'].includes(reqPersonality)) {
    personality = reqPersonality as MonsterPersonalityType;
  } else {
    personality = monsterStatus?.personality || 'lively';
  }
  console.log(`[MonsterService] 使用怪兽性格: ${personality} (请求传入: ${reqPersonality})`);

  // 3. 构建对话消息（含 system prompt + 历史上下文）
  const messages = await buildMessages(userId, personality, message);

  // 4. 调用 DeepSeek API
  let result: { content: string; tokens: number };
  try {
    result = await callDeepSeek(messages);
    console.log(`[MonsterService] DeepSeek 回复 (tokens: ${result.tokens}): ${result.content.substring(0, 100)}...`);
  } catch (error) {
    console.error('[MonsterService] DeepSeek 调用失败，使用预设回复:', error);
    // 降级：预设回复
    const fallbacks: Record<MonsterPersonalityType, string[]> = {
      lively: ['太棒了！继续加油哦～', '这个知识点很有趣呢！', '准备好开始冒险了吗？'],
      calm: ['慢慢来，学习需要耐心。', '这个知识点很重要，好好掌握。'],
      rebel: ['学习好无聊啊，我们去玩吧！', '这个也太难了吧...'],
    };
    const pool = fallbacks[personality];
    const content = pool[Math.floor(Math.random() * pool.length)];
    result = { content, tokens: Math.ceil(content.length / 2) };
  }

  // 5. 扣除 Π 能量：消耗 = 怪兽回复的字数 × 0.05
  const charCount = result.content.length;
  const energyCost = Math.max(1, Math.ceil(charCount * ENERGY_COST_PER_TOKEN));
  const currentEnergy = monsterStatus?.energy ?? 0;
  const newEnergy = Math.max(0, currentEnergy - energyCost);
  await MonsterModel.updateMonster(userId, { energy: newEnergy });
  console.log(`[MonsterService] 能量扣除: ${energyCost} (字数: ${charCount}), 剩余: ${newEnergy}`);

  // 6. 保存怪兽回复
  await MonsterMessageModel.createMessage({
    userId,
    message: result.content,
    isUser: false
  });

  return { message: result.content, tokens: result.tokens, energyCost, remainingEnergy: newEnergy };
};

export const getMonsterMessages = async (userId: number) => {
  const messages = await MonsterMessageModel.getMessagesByUserId(userId);
  return { messages: messages.reverse() };
};
