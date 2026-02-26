import { Request, Response } from 'express';
import {
  createDomain as createDomainService,
  getDomains as getDomainsService,
  getDomainById as getDomainByIdService,
  updateNodeProgress as updateNodeProgressService,
  startLearning as startLearningService,
  finishLearning as finishLearningService
} from '../services';

export const createDomain = async (req: Request, res: Response) => {
  try {
    const { userId, name, type = 'preset' } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ 
        error: 'User ID and name are required' 
      });
    }

    const result = await createDomainService(parseInt(userId), name, type);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({ 
      error: 'Failed to create domain',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDomains = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await getDomainsService(parseInt(userId));
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting domains:', error);
    res.status(500).json({ 
      error: 'Failed to get domains',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    const domain = await getDomainByIdService(parseInt(id));

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json({
      success: true,
      data: domain
    });
  } catch (error) {
    console.error('Error getting domain:', error);
    res.status(500).json({ 
      error: 'Failed to get domain',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateNodeProgress = async (req: Request, res: Response) => {
  try {
    const { userId, domainId, nodeId, status, studyTime, notes } = req.body;

    if (!userId || !domainId || !nodeId || !status) {
      return res.status(400).json({ 
        error: 'User ID, domain ID, node ID, and status are required' 
      });
    }

    await updateNodeProgressService(
      parseInt(userId),
      parseInt(domainId),
      nodeId,
      status as 'pending' | 'doing' | 'done',
      studyTime,
      notes
    );
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error updating node progress:', error);
    res.status(500).json({ 
      error: 'Failed to update node progress',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const startLearning = async (req: Request, res: Response) => {
  try {
    const { userId, domainId, nodeId } = req.body;

    if (!userId || !domainId || !nodeId) {
      return res.status(400).json({ 
        error: 'User ID, domain ID, and node ID are required' 
      });
    }

    const result = await startLearningService(
      parseInt(userId),
      parseInt(domainId),
      nodeId
    );
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error starting learning:', error);
    res.status(500).json({ 
      error: 'Failed to start learning',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const finishLearning = async (req: Request, res: Response) => {
  try {
    const { recordId, duration, progressAfter } = req.body;

    if (!recordId || duration === undefined || progressAfter === undefined) {
      return res.status(400).json({ 
        error: 'Record ID, duration, and progressAfter are required' 
      });
    }

    await finishLearningService(recordId, duration, progressAfter);
    
    res.json({
      success: true
    });
  } catch (error) {
    console.error('Error finishing learning:', error);
    res.status(500).json({ 
      error: 'Failed to finish learning',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  createDomain,
  getDomains,
  getDomainById,
  updateNodeProgress,
  startLearning,
  finishLearning
};
