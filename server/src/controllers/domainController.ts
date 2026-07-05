import { Request, Response } from 'express';
import {
  createDomain as createDomainService,
  getDomains as getDomainsService,
  getDomainById as getDomainByIdService,
  updateNodeProgress as updateNodeProgressService,
  startLearning as startLearningService,
  finishLearning as finishLearningService,
  getNodeProgressesByDomain as getNodeProgressesByDomainService,
  getNodeStudyCount as getNodeStudyCountService,
} from '../services';

export const createDomain = async (req: Request, res: Response) => {
  console.log(`[DomainController] POST /domains - 创建领域`);
  try {
    const { name, type = 'preset' } = req.body;
    const userId = req.user!.userId;

    if (!name) {
      console.log(`[DomainController] 参数验证失败 - 缺少必填字段`);
      return res.status(400).json({ 
        error: 'Name is required' 
      });
    }

    const result = await createDomainService(userId, name, type);
    
    console.log(`[DomainController] 领域创建成功`);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[DomainController] 创建领域失败:', error);
    res.status(500).json({ 
      error: 'Failed to create domain',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDomains = async (req: Request, res: Response) => {
  console.log(`[DomainController] GET /domains/list - 获取领域列表`);
  try {
    const userId = req.user!.userId;
    const result = await getDomainsService(userId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[DomainController] 获取领域列表失败:', error);
    res.status(500).json({ 
      error: 'Failed to get domains',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDomainById = async (req: Request, res: Response) => {
  console.log(`[DomainController] GET /domains/:id - 获取领域详情`);
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    const domain = await getDomainByIdService(parseInt(id));

    if (!domain) {
      console.log(`[DomainController] 领域不存在 - 领域ID: ${id}`);
      return res.status(404).json({ error: 'Domain not found' });
    }
    
    res.json({
      success: true,
      data: domain
    });
  } catch (error) {
    console.error('[DomainController] 获取领域详情失败:', error);
    res.status(500).json({ 
      error: 'Failed to get domain',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateNodeProgress = async (req: Request, res: Response) => {
  console.log(`[DomainController] PUT /domains/nodes/progress - 更新节点进度`);
  try {
    const { domainId, nodeId, status, studyTime, notes } = req.body;
    const userId = req.user!.userId;

    if (!domainId || !nodeId || !status) {
      console.log(`[DomainController] 参数验证失败 - 缺少必填字段`);
      return res.status(400).json({ 
        error: 'Domain ID, node ID, and status are required' 
      });
    }

    await updateNodeProgressService(
      userId,
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
    const { domainId, nodeId } = req.body;
    const userId = req.user!.userId;

    if (!domainId || !nodeId) {
      return res.status(400).json({ 
        error: 'Domain ID and node ID are required' 
      });
    }

    const result = await startLearningService(
      userId,
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

export const getNodeProgresses = async (req: Request, res: Response) => {
  console.log(`[DomainController] GET /domains/:domainId/node-progresses`);
  try {
    const { domainId } = req.params;
    const userId = req.user!.userId;

    if (!domainId) {
      return res.status(400).json({ error: 'domainId is required' });
    }

    const result = await getNodeProgressesByDomainService(
      userId,
      parseInt(domainId)
    );

    res.json(result);
  } catch (error) {
    console.error('[DomainController] 获取节点进度列表失败:', error);
    res.status(500).json({ error: 'Failed to get node progresses' });
  }
};

export const getNodeStudyCount = async (req: Request, res: Response) => {
  console.log(`[DomainController] GET /domains/study-count`);
  try {
    const { domainId, nodeId } = req.query;
    const userId = req.user!.userId;

    if (!domainId || !nodeId) {
      return res.status(400).json({ error: 'domainId and nodeId are required' });
    }

    const result = await getNodeStudyCountService(
      userId,
      parseInt(domainId as string),
      nodeId as string
    );

    res.json(result);
  } catch (error) {
    console.error('[DomainController] 获取学习次数失败:', error);
    res.status(500).json({ error: 'Failed to get study count' });
  }
};

export default {
  createDomain,
  getDomains,
  getDomainById,
  updateNodeProgress,
  startLearning,
  finishLearning,
  getNodeProgresses,
  getNodeStudyCount,
};
