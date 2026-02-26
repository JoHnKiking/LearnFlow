import { Request, Response } from 'express';
import { 
  createMonster as createMonsterService,
  getMonsterStatus as getMonsterStatusService,
  consumeEnergy as consumeEnergyService,
  recoverEnergy as recoverEnergyService,
  addExp as addExpService,
  chatWithMonster as chatWithMonsterService,
  getMonsterMessages as getMonsterMessagesService
} from '../services';
import * as UserModel from '../models/User';

export const createMonster = async (req: Request, res: Response) => {
  try {
    const { userId, name, style, personality } = req.body;

    if (!userId || !name || !personality) {
      return res.status(400).json({ 
        error: 'User ID, name, and personality are required' 
      });
    }

    await UserModel.updateUser(userId, {
      monsterName: name,
      monsterStyle: style || 'default'
    });

    const result = await createMonsterService(userId, personality);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating monster:', error);
    res.status(500).json({ 
      error: 'Failed to create monster',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getMonsterStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const status = await getMonsterStatusService(parseInt(userId));

    if (!status) {
      return res.status(404).json({ error: 'Monster not found' });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting monster status:', error);
    res.status(500).json({ 
      error: 'Failed to get monster status',
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

    const result = await addExpService(parseInt(userId), exp);
    
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
  consumeEnergy,
  recoverEnergy,
  addExp,
  chatWithMonster,
  getMonsterMessages
};
