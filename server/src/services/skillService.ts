import { SkillNode, SkillTreeListRequest, UserProgress, SkillTreeStats, SaveSkillTreeRequest } from '../types/skill';
import { DatabaseService } from './databaseService';
import { LLMService, LLMProvider } from './llmService';

// 预置技能树数据（用于生成新技能树）
const mockSkillTrees: Record<string, SkillNode> = {
  '前端开发': {
    id: '1',
    name: '前端开发',
    description: '前端开发技能树',
    children: [
      {
        id: '1-1',
        name: 'HTML/CSS',
        description: '网页基础结构',
        links: [
          { title: 'MDN HTML教程', url: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML', type: 'documentation' as const },
          { title: 'CSS教程', url: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS', type: 'documentation' as const }
        ]
      },
      {
        id: '1-2',
        name: 'JavaScript',
        description: '前端编程语言',
        children: [
          {
            id: '1-2-1',
            name: '基础语法',
            description: '变量、函数、循环等',
            links: [
              { title: 'JavaScript教程', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', type: 'documentation' as const }
            ]
          },
          {
            id: '1-2-2',
            name: 'DOM操作',
            description: '文档对象模型操作',
            links: [
              { title: 'DOM教程', url: 'https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model', type: 'documentation' as const }
            ]
          }
        ]
      }
    ]
  },
  '后端开发': {
    id: '2',
    name: '后端开发',
    description: '后端开发技能树',
    children: [
      {
        id: '2-1',
        name: 'Node.js',
        description: 'JavaScript运行时',
        links: [
          { title: 'Node.js官方文档', url: 'https://nodejs.org/docs', type: 'documentation' as const }
        ]
      },
      {
        id: '2-2',
        name: '数据库',
        description: '数据存储和管理',
        children: [
          {
            id: '2-2-1',
            name: 'MySQL',
            description: '关系型数据库',
            links: [
              { title: 'MySQL教程', url: 'https://dev.mysql.com/doc/', type: 'documentation' as const }
            ]
          }
        ]
      }
    ]
  }
};

// 初始化LLM服务（根据环境变量配置）
const initLLMService = (): LLMService | null => {
  const apiKey = process.env.LLM_API_KEY;
  const provider = process.env.LLM_PROVIDER as LLMProvider;
  
  if (!apiKey || !provider) {
    console.warn('LLM service not configured. Using mock data instead.');
    return null;
  }
  
  return new LLMService({
    provider,
    apiKey,
    baseURL: process.env.LLM_BASE_URL,
    model: process.env.LLM_MODEL
  });
};

const llmService = initLLMService();

// 生成技能树（优先使用LLM，失败时回退到模拟数据）
export const generateMockSkillTree = async (domain: string, level: string = 'beginner'): Promise<SkillNode> => {
  // 更新热门领域统计
  await DatabaseService.incrementDomainGeneratedCount(domain);
  
  // 优先使用LLM生成技能树
  if (llmService) {
    try {
      console.log(`Generating skill tree for domain: ${domain}, level: ${level} using LLM`);
      const skillTree = await llmService.generateSkillTree({
        domain,
        level: level as 'beginner' | 'intermediate' | 'advanced',
        language: '中文',
        maxDepth: 4,
        includeResources: true
      });
      
      console.log('Skill tree generated successfully by LLM');
      return skillTree;
    } catch (error) {
      console.warn('LLM generation failed, falling back to mock data:', error);
    }
  }
  
  // 回退到模拟数据
  console.log(`Using mock data for domain: ${domain}`);
  let skillTree = mockSkillTrees[domain];
  
  if (!skillTree) {
    // 如果领域不存在，创建一个基础技能树
    skillTree = {
      id: generateId(),
      name: domain,
      description: `${domain}技能学习路径`,
      children: [
        {
          id: generateId(),
          name: '基础知识',
          description: '学习该领域的基础概念',
          links: [
            { title: '入门指南', url: 'https://example.com', type: 'documentation' as const }
          ]
        },
        {
          id: generateId(),
          name: '进阶学习',
          description: '深入掌握核心技能',
          links: [
            { title: '进阶教程', url: 'https://example.com', type: 'documentation' as const }
          ]
        }
      ]
    };
  }
  
  return skillTree;
};

// 获取技能树列表（从数据库）
export const getSkillTreeList = async (request: SkillTreeListRequest) => {
  const { page = 1, limit = 10, search, category } = request;
  
  // 这里简化处理，实际应该根据搜索条件查询数据库
  const result = await DatabaseService.getSkillTreesByUserId(1, page, limit); // 使用测试用户ID
  
  return {
    trees: result.trees.map(tree => ({
      id: tree.id.toString(),
      name: tree.title,
      domain: tree.domain,
      description: tree.description,
      progress: tree.progress,
      createdAt: tree.createdAt
    })),
    total: result.total,
    page: result.page,
    limit: result.limit
  };
};

// 根据ID获取技能树（从数据库）
export const getSkillTreeById = async (id: string) => {
  const tree = await DatabaseService.getSkillTreeById(parseInt(id));
  
  if (!tree) {
    return null;
  }
  
  return {
    id: tree.id.toString(),
    name: tree.title,
    domain: tree.domain,
    description: tree.description,
    nodes: tree.nodes,
    progress: tree.progress,
    createdAt: tree.createdAt
  };
};

// 保存用户技能树（到数据库）
export const saveUserSkillTree = async (request: SaveSkillTreeRequest) => {
  const { userId, skillTree, title, tags } = request;
  
  try {
    const treeId = await DatabaseService.createSkillTree({
      userId: parseInt(userId),
      domain: skillTree.name,
      title: title || skillTree.name,
      description: skillTree.description,
      nodes: [skillTree], // 保存为单节点树
      isPublic: false
    });
    
    return { success: true, treeId: treeId.toString() };
  } catch (error) {
    console.error('保存技能树失败:', error);
    return { success: false, error: '保存失败' };
  }
};

// 获取用户进度（从数据库）
export const getUserProgress = async (userId: string, skillTreeId?: string): Promise<UserProgress[]> => {
  if (skillTreeId) {
    const progress = await DatabaseService.getUserProgress(parseInt(userId), parseInt(skillTreeId));
    return [{
      userId,
      skillTreeId,
      completedNodes: [], // 需要从学习记录计算
      completedLinks: [], // 需要从学习记录计算
      progress: progress.overallProgress,
      lastUpdated: progress.lastUpdated
    }];
  }
  
  // 获取用户所有技能树的进度
  const trees = await DatabaseService.getSkillTreesByUserId(parseInt(userId));
  const progresses: UserProgress[] = [];
  
  for (const tree of trees.trees) {
    const progress = await DatabaseService.getUserProgress(parseInt(userId), tree.id);
    progresses.push({
      userId,
      skillTreeId: tree.id.toString(),
      completedNodes: [],
      completedLinks: [],
      progress: progress.overallProgress,
      lastUpdated: progress.lastUpdated
    });
  }
  
  return progresses;
};

// 更新用户进度（到数据库）
export const updateUserProgress = async (userId: string, skillTreeId: string, completedNodes: string[], completedLinks: string[]): Promise<UserProgress> => {
  // 这里简化处理，实际应该更新学习记录表
  const progress = Math.round((completedNodes.length / 10) * 100); // 简化计算
  
  await DatabaseService.updateSkillTreeProgress(parseInt(skillTreeId), progress);
  
  return {
    userId,
    skillTreeId,
    completedNodes,
    completedLinks,
    progress,
    lastUpdated: new Date()
  };
};

// 获取统计信息（从数据库）
export const getStatistics = async (): Promise<SkillTreeStats> => {
  const popularDomains = await DatabaseService.getPopularDomains(5);
  
  // 简化统计计算
  return {
    totalTrees: 100, // 需要从数据库统计
    popularDomains: popularDomains.map(d => ({ domain: d.domain, count: d.popularity })),
    averageProgress: 45, // 需要从数据库计算
    totalUsers: 50 // 需要从数据库统计
  };
};

// 搜索热门领域（从数据库）
export const searchPopularDomains = async (keyword: string) => {
  // 更新搜索统计
  await DatabaseService.incrementDomainSearchCount(keyword);
  
  const domains = await DatabaseService.getPopularDomains(10);
  const results = domains
    .filter(d => d.domain.toLowerCase().includes(keyword.toLowerCase()))
    .map(d => d.domain);
  
  return {
    keyword,
    results,
    total: results.length
  };
};

// 获取推荐学习路径
export const getRecommendedPath = async (domain: string, currentLevel: string, targetLevel: string) => {
  return {
    domain,
    currentLevel,
    targetLevel,
    path: [
      { step: 1, topic: '基础知识', estimatedTime: '2周' },
      { step: 2, topic: '核心概念', estimatedTime: '3周' },
      { step: 3, topic: '实战项目', estimatedTime: '4周' }
    ],
    totalEstimatedTime: '9周'
  };
};

// 获取用户学习报告
export const getUserLearningReport = async (userId: string, period: string = 'month') => {
  return {
    userId,
    period,
    summary: {
      totalLearningTime: 120,
      completedSkills: 15,
      averageProgress: 65,
      streakDays: 7
    },
    recommendations: [
      '建议每天保持30分钟学习时间',
      '重点关注前端开发的核心概念',
      '尝试完成一个小型实战项目'
    ]
  };
};

// 辅助函数：生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};