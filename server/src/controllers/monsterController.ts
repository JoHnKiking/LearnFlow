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
  console.log(`[MonsterController] POST /monster/create - 创建怪物`);
  try {
    const { name, style, personality } = req.body;
    const userId = req.user!.userId;

    if (!name || !personality) {
      console.log(`[MonsterController] 参数验证失败 - 缺少必填字段`);
      return res.status(400).json({
        error: 'Name and personality are required'
      });
    }

    if (!['lively', 'calm', 'rebel'].includes(personality)) {
      console.log(`[MonsterController] 参数验证失败 - 无效性格: ${personality}`);
      return res.status(400).json({
        error: 'Personality must be one of lively, calm, or rebel'
      });
    }

    const result = await createMonsterService(userId, {
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
  console.log(`[MonsterController] GET /monster/status - 获取怪物状态`);
  try {
    const userId = req.user!.userId;
    const status = await getMonsterStatusService(userId);

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
  console.log(`[MonsterController] POST /monster/stamina/consume - 消耗体力`);
  try {
    const { amount = 10 } = req.body;
    const userId = req.user!.userId;

    const success = await consumeStaminaService(userId, amount);
    
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
    const { amount = 20 } = req.body;
    const userId = req.user!.userId;

    await recoverStaminaService(userId, amount);
    
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
    const userId = req.user!.userId;
    const success = await consumeEnergyService(userId);
    
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
    const { amount } = req.body;
    const userId = req.user!.userId;

    if (amount === undefined) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const success = await consumeEnergyAmountService(userId, amount);
    
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
    const { amount = 1 } = req.body;
    const userId = req.user!.userId;

    await recoverEnergyService(userId, amount);
    
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
    const { exp } = req.body;
    const userId = req.user!.userId;

    if (exp === undefined) {
      return res.status(400).json({ 
        error: 'Exp is required' 
      });
    }

    const result = await gainExpService(userId, exp);
    
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
    const { message, personality: reqPersonality } = req.body;
    const userId = req.user!.userId;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const response = await chatWithMonsterService(userId, message, reqPersonality);
    
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
    const userId = req.user!.userId;
    const messages = await getMonsterMessagesService(userId);
    
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
