import { Request, Response } from 'express';
import { 
  SkillTreeRequest, 
  SkillTreeListRequest, 
  SaveSkillTreeRequest 
} from '../types';
import { 
  generateMockSkillTree, 
  getSkillTreeList as getSkillTreeListService, 
  getSkillTreeById as getSkillTreeByIdService,
  saveUserSkillTree as saveUserSkillTreeService,
  getUserProgress as getUserProgressService,
  updateUserProgress as updateUserProgressService,
  getStatistics as getStatisticsService,
  searchPopularDomains as searchPopularDomainsService,
  getRecommendedPath as getRecommendedPathService,
  getUserLearningReport as getUserLearningReportService
} from '../services';

// 生成技能树
export const generateSkillTree = async (req: Request, res: Response) => {
  console.log(`[SkillController] POST /skill-tree/generate - 生成技能树`);
  try {
    const { domain, level = 'beginner' }: SkillTreeRequest = req.body;
    
    if (!domain) {
      console.log(`[SkillController] 参数验证失败 - 缺少领域`);
      return res.status(400).json({ error: 'Domain is required' });
    }

    console.log(`[SkillController] 生成技能树 - 领域: ${domain}, 等级: ${level}`);
    const skillTree = await generateMockSkillTree(domain, level);
    
    console.log(`[SkillController] 技能树生成成功`);
    res.json({
      success: true,
      data: skillTree
    });
  } catch (error) {
    console.error('[SkillController] 生成技能树失败:', error);
    res.status(500).json({ 
      error: 'Failed to generate skill tree',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 获取技能树列表
export const getSkillTreeList = async (req: Request, res: Response) => {
  console.log(`[SkillController] GET /skill-tree/list - 获取技能树列表`);
  try {
    const { page, limit, search, category }: SkillTreeListRequest = req.query;
    
    const result = await getSkillTreeListService({
      page: page ? parseInt(page as unknown as string) : 1,
      limit: limit ? parseInt(limit as unknown as string) : 10,
      search: search as string,
      category: category as string
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[SkillController] 获取技能树列表失败:', error);
    res.status(500).json({ 
      error: 'Failed to get skill tree list',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 根据ID获取技能树
export const getSkillTreeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Skill tree ID is required' });
    }

    const skillTree = await getSkillTreeByIdService(id);
    
    if (!skillTree) {
      return res.status(404).json({ error: 'Skill tree not found' });
    }
    
    res.json({
      success: true,
      data: skillTree
    });
  } catch (error) {
    console.error('Error getting skill tree:', error);
    res.status(500).json({ 
      error: 'Failed to get skill tree',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 保存用户技能树
export const saveUserSkillTree = async (req: Request, res: Response) => {
  try {
    const request: SaveSkillTreeRequest = {
      ...req.body,
      userId: String(req.user!.userId),
    };
    
    if (!request.skillTree) {
      return res.status(400).json({ 
        error: 'Skill tree is required' 
      });
    }

    const result = await saveUserSkillTreeService(request);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error saving skill tree:', error);
    res.status(500).json({ 
      error: 'Failed to save skill tree',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 获取用户进度
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { skillTreeId } = req.query;

    const progress = await getUserProgressService(userId.toString(), skillTreeId as string);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ 
      error: 'Failed to get user progress',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 更新用户进度
export const updateUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { skillTreeId, completedNodes = [], completedLinks = [] } = req.body;
    
    if (!skillTreeId) {
      return res.status(400).json({ 
        error: 'Skill tree ID is required' 
      });
    }

    const progress = await updateUserProgressService(
      userId.toString(), 
      skillTreeId, 
      completedNodes, 
      completedLinks
    );
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ 
      error: 'Failed to update user progress',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 获取统计信息
export const getStatistics = async (req: Request, res: Response) => {
  try {
    const stats = await getStatisticsService();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 搜索热门领域
export const searchPopularDomains = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Search keyword is required' });
    }

    const result = await searchPopularDomainsService(keyword as string);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error searching domains:', error);
    res.status(500).json({ 
      error: 'Failed to search domains',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 获取推荐学习路径
export const getRecommendedPath = async (req: Request, res: Response) => {
  try {
    const { domain, currentLevel = 'beginner', targetLevel = 'advanced' } = req.query;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const result = await getRecommendedPathService(
      domain as string, 
      currentLevel as string, 
      targetLevel as string
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting recommended path:', error);
    res.status(500).json({ 
      error: 'Failed to get recommended path',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 获取用户学习报告
export const getUserLearningReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { period = 'week' } = req.query;

    const result = await getUserLearningReportService(userId.toString(), period as string);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting user report:', error);
    res.status(500).json({ 
      error: 'Failed to get user report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  generateSkillTree,
  getSkillTreeList,
  getSkillTreeById,
  saveUserSkillTree,
  getUserProgress,
  updateUserProgress,
  getStatistics,
  searchPopularDomains,
  getRecommendedPath,
  getUserLearningReport
};
