import { SkillNode } from '../types/skill';
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
  // 优先使用LLM生成技能树
  if (llmService) {
    try {
      console.log(`[SkillService] Generating skill tree for domain: ${domain}, level: ${level} using LLM`);
      const skillTree = await llmService.generateSkillTree({
        domain,
        level: level as 'beginner' | 'intermediate' | 'advanced',
        language: '中文',
        maxDepth: 4,
        includeResources: true
      });
      
      console.log('[SkillService] Skill tree generated successfully by LLM');
      return skillTree;
    } catch (error) {
      console.warn('[SkillService] LLM generation failed, falling back to mock data:', error);
    }
  }
  
  // 回退到模拟数据
  console.log(`[SkillService] Using mock data for domain: ${domain}`);
  let skillTree = mockSkillTrees[domain];
  
  if (!skillTree) {
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

// 辅助函数：生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
