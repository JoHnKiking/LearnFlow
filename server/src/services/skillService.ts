import { SkillNode, SkillTreeListRequest, UserProgress, SkillTreeStats, SaveSkillTreeRequest } from '../types/skill';

// 模拟数据存储
const userSkillTrees: Map<string, SkillNode[]> = new Map();
const userProgress: Map<string, UserProgress> = new Map();
const generatedTrees: Map<string, SkillNode> = new Map();

// 预置技能树数据
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
      },
      {
        id: '1-3',
        name: 'React',
        description: '前端框架',
        links: [
          { title: 'React官方文档', url: 'https://react.dev', type: 'documentation' as const }
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
          { title: 'Node.js文档', url: 'https://nodejs.org/docs', type: 'documentation' as const }
        ]
      },
      {
        id: '2-2',
        name: '数据库',
        description: '数据存储技术',
        children: [
          {
            id: '2-2-1',
            name: 'MongoDB',
            description: 'NoSQL数据库',
            links: [
              { title: 'MongoDB教程', url: 'https://www.mongodb.com/docs/', type: 'documentation' as const }
            ]
          },
          {
            id: '2-2-2',
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

// 初始化示例数据
const initMockData = () => {
  // 预置技能树
  Object.entries(mockSkillTrees).forEach(([domain, tree]) => {
    generatedTrees.set(domain, tree);
  });
  
  // 示例用户进度
  userProgress.set('user1-1', {
    userId: 'user1',
    skillTreeId: '1',
    completedNodes: ['1-1', '1-2-1'],
    completedLinks: ['mdn-html', 'js-tutorial'],
    progress: 40,
    lastUpdated: new Date()
  });
};

initMockData();

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 生成技能树
export const generateMockSkillTree = async (domain: string, level: string): Promise<SkillNode> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (mockSkillTrees[domain]) {
    return mockSkillTrees[domain];
  }
  
  const treeId = generateId();
  const customTree: SkillNode = {
    id: treeId,
    name: domain,
    description: `${domain}技能树`,
    children: [
      {
        id: `${treeId}-1`,
        name: `${domain}基础`,
        description: `${domain}基础知识`,
        links: [
          { title: `${domain}入门教程`, url: 'https://example.com', type: 'article' as const }
        ]
      },
      {
        id: `${treeId}-2`,
        name: `${domain}进阶`,
        description: `${domain}进阶知识`,
        links: [
          { title: `${domain}进阶教程`, url: 'https://example.com/advanced', type: 'article' as const }
        ]
      }
    ]
  };
  
  // 保存生成的技能树
  generatedTrees.set(treeId, customTree);
  return customTree;
};

// 获取技能树列表
export const getSkillTreeList = async (request: SkillTreeListRequest): Promise<{trees: SkillNode[], total: number}> => {
  const { page = 1, limit = 10, search = '', category = '' } = request;
  
  let trees = Array.from(generatedTrees.values());
  
  // 搜索过滤
  if (search) {
    trees = trees.filter(tree => 
      tree.name.toLowerCase().includes(search.toLowerCase()) ||
      tree.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // 分类过滤
  if (category) {
    trees = trees.filter(tree => 
      tree.name.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  // 分页
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTrees = trees.slice(startIndex, endIndex);
  
  return {
    trees: paginatedTrees,
    total: trees.length
  };
};

// 根据ID获取技能树
export const getSkillTreeById = async (id: string): Promise<SkillNode | null> => {
  return generatedTrees.get(id) || null;
};

// 保存用户技能树
export const saveUserSkillTree = async (request: SaveSkillTreeRequest): Promise<{success: boolean, treeId: string}> => {
  const { userId, skillTree, title, tags } = request;
  
  if (!userSkillTrees.has(userId)) {
    userSkillTrees.set(userId, []);
  }
  
  const userTrees = userSkillTrees.get(userId)!;
  const treeId = generateId();
  
  const savedTree: SkillNode = {
    ...skillTree,
    id: treeId,
    customTitle: title || skillTree.name,
    tags: tags || [],
    savedAt: new Date()
  } as SkillNode;
  
  userTrees.push(savedTree);
  
  return { success: true, treeId };
};

// 获取用户进度
export const getUserProgress = async (userId: string, skillTreeId?: string): Promise<UserProgress[]> => {
  const progress = Array.from(userProgress.values()).filter(p => p.userId === userId);
  
  if (skillTreeId) {
    return progress.filter(p => p.skillTreeId === skillTreeId);
  }
  
  return progress;
};

// 更新用户进度
export const updateUserProgress = async (userId: string, skillTreeId: string, completedNodes: string[], completedLinks: string[]): Promise<UserProgress> => {
  const progressKey = `${userId}-${skillTreeId}`;
  const totalNodes = 10; // 简化计算，实际应该从技能树获取
  const progress = Math.round((completedNodes.length / totalNodes) * 100);
  
  const userProgressData: UserProgress = {
    userId,
    skillTreeId,
    completedNodes,
    completedLinks,
    progress,
    lastUpdated: new Date()
  };
  
  userProgress.set(progressKey, userProgressData);
  return userProgressData;
};

// 获取统计信息
export const getStatistics = async (): Promise<SkillTreeStats> => {
  const domains = Array.from(generatedTrees.values()).map(tree => tree.name);
  const domainCounts = domains.reduce((acc, domain) => {
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularDomains = Object.entries(domainCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const allProgress = Array.from(userProgress.values());
  const averageProgress = allProgress.length > 0 
    ? Math.round(allProgress.reduce((sum, p) => sum + p.progress, 0) / allProgress.length)
    : 0;
  
  return {
    totalTrees: generatedTrees.size,
    popularDomains,
    averageProgress,
    totalUsers: new Set(Array.from(userProgress.values()).map(p => p.userId)).size
  };
};

// 搜索热门领域
export const searchPopularDomains = async (keyword: string): Promise<{keyword: string; results: string[]; total: number}> => {
  const popularDomains = [
    '前端开发', '后端开发', '移动开发', '数据科学', 
    '人工智能', '网络安全', '云计算', '区块链'
  ];
  
  const results = popularDomains.filter(domain =>
    domain.toLowerCase().includes(keyword.toLowerCase())
  );
  
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
      { step: 1, topic: '基础概念', estimatedTime: '2周' },
      { step: 2, topic: '核心技能', estimatedTime: '4周' },
      { step: 3, topic: '项目实践', estimatedTime: '3周' },
      { step: 4, topic: '进阶专题', estimatedTime: '2周' }
    ],
    totalEstimatedTime: '11周'
  };
};

// 获取用户学习报告
export const getUserLearningReport = async (userId: string, period: string) => {
  return {
    userId,
    period,
    summary: {
      totalLearningTime: '15小时',
      completedSkills: 8,
      averageProgress: 65,
      streakDays: 7
    },
    weeklyProgress: [
      { week: '第1周', progress: 20 },
      { week: '第2周', progress: 45 },
      { week: '第3周', progress: 65 }
    ],
    topSkills: ['JavaScript', 'React', 'Node.js'],
    recommendations: [
      '建议加强算法练习',
      '可以开始学习TypeScript',
      '尝试参与开源项目'
    ]
  };
};