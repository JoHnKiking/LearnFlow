import { Request, Response } from 'express';
import {
  createMonster as createMonsterService,
  getMonsterStatus as getMonsterStatusService,
  consumeStamina as consumeStaminaService,
  recoverStamina as recoverStaminaService,
  consumeEnergy as consumeEnergyService,
  consumeEnergyAmount as consumeEnergyAmountService,
  recoverEnergy as recoverEnergyService,
  gainExp as gainExpService,
  chatWithMonster as chatWithMonsterService,
  getMonsterMessages as getMonsterMessagesService,
} from '../services';

export const createMonster = async (req: Request, res: Response) => {
  console.log(`[MonsterController] POST /monsters - 创建怪物`);
  try {
    const { userId, name, style, personality } = req.body;

    if (!userId || !name || !personality) {
      console.log(`[MonsterController] 参数验证失败 - 缺少必填字段`);
      return res.status(400).json({
        error: 'User ID, name, and personality are required'
      });
    }

    if (!['lively', 'calm', 'rebel'].includes(personality)) {
      console.log(`[MonsterController] 参数验证失败 - 无效性格: ${personality}`);
      return res.status(400).json({
        error: 'Personality must be one of lively, calm, or rebel'
      });
    }

    const result = await createMonsterService(parseInt(userId, 10), {
      name,
      style,
      personality,
    });

    console.log(`[MonsterController] 怪物创建成功`);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[MonsterController] 创建怪物失败:', error);
    res.status(500).json({
      error: 'Failed to create monster',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMonsterStatus = async (req: Request, res: Response) => {
  console.log(`[MonsterController] GET /monsters/:userId - 获取怪物状态`);
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const status = await getMonsterStatusService(parseInt(userId));

    if (!status) {
      console.log(`[MonsterController] 怪物不存在 - 用户ID: ${userId}`);
      return res.status(404).json({ error: 'Monster not found' });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('[MonsterController] 获取怪物状态失败:', error);
    res.status(500).json({ 
      error: 'Failed to get monster status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const consumeStamina = async (req: Request, res: Response) => {
  console.log(`[MonsterController] POST /monsters/consume-stamina - 消耗体力`);
  try {
    const { userId, amount = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const success = await consumeStaminaService(parseInt(userId), amount);
    
    res.json({
      success,
      error: success ? undefined : 'Not enough stamina'
    });
  } catch (error) {
    console.error('[MonsterController] 消耗体力失败:', error);
    res.status(500).json({ 
      error: 'Failed to consume stamina',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const recoverStamina = async (req: Request, res: Response) => {
  try {
    const { userId, amount = 20 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await recoverStaminaService(parseInt(userId), amount);
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error recovering stamina:', error);
    res.status(500).json({ 
      error: 'Failed to recover stamina',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const consumeEnergy = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const success = await consumeEnergyService(parseInt(userId));
    
    res.json({
      success,
      error: success ? undefined : 'Not enough energy'
    });
  } catch (error) {
    console.error('Error consuming energy:', error);
    res.status(500).json({ 
      error: 'Failed to consume energy',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const consumeEnergyAmount = async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || amount === undefined) {
      return res.status(400).json({ error: 'User ID and amount are required' });
    }

    const success = await consumeEnergyAmountService(parseInt(userId), amount);
    
    res.json({
      success,
      error: success ? undefined : 'Not enough energy'
    });
  } catch (error) {
    console.error('Error consuming energy:', error);
    res.status(500).json({ 
      error: 'Failed to consume energy',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const recoverEnergy = async (req: Request, res: Response) => {
  try {
    const { userId, amount = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await recoverEnergyService(parseInt(userId), amount);
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error recovering energy:', error);
    res.status(500).json({ 
      error: 'Failed to recover energy',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addExp = async (req: Request, res: Response) => {
  try {
    const { userId, exp } = req.body;

    if (!userId || exp === undefined) {
      return res.status(400).json({ 
        error: 'User ID and exp are required' 
      });
    }

    const result = await gainExpService(parseInt(userId), exp);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error adding exp:', error);
    res.status(500).json({ 
      error: 'Failed to add exp',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const chatWithMonster = async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ 
        error: 'User ID and message are required' 
      });
    }

    const response = await chatWithMonsterService(parseInt(userId), message);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error chatting with monster:', error);
    res.status(500).json({ 
      error: 'Failed to chat with monster',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMonsterMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const messages = await getMonsterMessagesService(parseInt(userId));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting monster messages:', error);
    res.status(500).json({ 
      error: 'Failed to get monster messages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
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
};
