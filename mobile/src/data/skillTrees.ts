import { SkillTree, StageType } from '../types/skill';

const PLATFORM_MAP = {
  'B站': 'bilibili',
  '小红书': 'xiaohongshu',
  '中国大学MOOC': 'mooc',
} as const;

const STAGE_MAP: Record<StageType, string> = {
  beginner: '初级阶段',
  intermediate: '中级阶段',
  advanced: '高级阶段',
};

export const aiProductManagerTree: SkillTree = {
  id: 'ai-product-manager',
  domain: 'ai-product-manager',
  title: 'AI产品经理',
  description: '掌握AI产品设计与落地的核心能力',
  totalDuration: 60,
  learningMethod: '1. 先观看MOOC课程建立基础认知框架；2. 结合B站视频深入理解大模型原理；3. 通过小红书案例实践产品思考；4. 每周完成一个Prompt工程练习',
  learningGoal: '成为具备AI产品设计能力的产品经理，能够独立完成AI产品需求分析、PRD撰写、项目推进，熟悉AI技术边界与商业落地路径',
  frameworkExplanation: '采用"认知-能力-实战"三层递进结构：初级阶段建立AI技术认知基础，中级阶段培养产品核心能力，高级阶段聚焦实战落地与商业合规，符合产品经理成长的自然路径',
  stages: [
    {
      id: 'beginner',
      name: '基础认知打底',
      duration: 20,
      nodes: [
        {
          id: 'ai-basic-concepts',
          name: '人工智能基础概念通识',
          description: '系统学习AI基础概念与发展历程',
          stage: 'beginner',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/HIT-1001997005',
          duration: 7,
        },
        {
          id: 'llm-fundamentals',
          name: '大模型LLM基础原理入门',
          description: '理解大语言模型的核心原理',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1pu411o7BE',
          duration: 7,
        },
        {
          id: 'ai-terminology',
          name: 'AI行业名词/API/微调通俗科普',
          description: '掌握AI领域核心术语与API应用',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1m84y1w7aG',
          duration: 6,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '产品核心能力',
      duration: 20,
      nodes: [
        {
          id: 'product-analysis',
          name: '产品需求分析&用户思维',
          description: '培养产品思维与用户需求分析能力',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1sb411i7aG',
          duration: 7,
        },
        {
          id: 'prompt-engineering',
          name: 'Prompt提示工程实战',
          description: '掌握提示词设计与优化技巧',
          stage: 'intermediate',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/BUPT-1002564002',
          duration: 7,
        },
        {
          id: 'rag-explained',
          name: 'RAG检索增强通俗拆解',
          description: '理解RAG技术原理与应用场景',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1cW4y1u7fH',
          duration: 6,
        },
      ],
    },
    {
      id: 'advanced',
      name: '实战落地+商业合规',
      duration: 20,
      nodes: [
        {
          id: 'ai-prd-document',
          name: 'AI产品PRD文档&项目协作',
          description: '学习AI产品文档撰写与项目管理',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1jt411o7cQ',
          duration: 7,
        },
        {
          id: 'ai-commercialization',
          name: 'AI商业变现&行业落地案例',
          description: '探索AI商业化路径与成功案例',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1kW411o7a9',
          duration: 7,
        },
        {
          id: 'ai-ethics-compliance',
          name: 'AI隐私合规&伦理规范',
          description: '了解AI伦理与数据隐私合规要求',
          stage: 'advanced',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/SUFE-1003056001',
          duration: 6,
        },
      ],
    },
  ],
};

export const personalFinanceTree: SkillTree = {
  id: 'personal-finance',
  domain: 'personal-finance',
  title: '理财进阶',
  description: '从零建立理财体系：记账→安全配置→基金定投',
  totalDuration: 21,
  learningMethod: '1. MOOC《个人理财》1-2章打基础；2. 开随手记App同步记账；3. 支付宝买100元货币基金体验；4. 读完《小狗钱钱》+《穷查理宝典》部分章节',
  learningGoal: '能独立做家庭财务盘点、完成保险+基金配置方案、开始指数基金定投，形成长期理财习惯',
  frameworkExplanation: '一阶觉醒：建立复利思维+开始记账 → 二阶锻造：理解保险配置+货币基金→ 三阶出师：指数定投实操+完成资产配置计划书',

  stages: [
    {
      id: 'beginner',
      name: '理财思维启蒙',
      duration: 20,
      nodes: [
        {
          id: 'finance-basics',
          name: '理财底层逻辑+复利思维',
          description: '建立正确的理财观念与复利认知',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1eK411578Q',
          duration: 7,
        },
        {
          id: 'budget-planning',
          name: '个人财务记账+收支规划',
          description: '掌握个人财务管理基础方法',
          stage: 'beginner',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/NCWU-1002705001',
          duration: 7,
        },
        {
          id: 'financial-tools',
          name: '基础金融工具科普',
          description: '了解常见金融产品与工具',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1sb411o7aS',
          duration: 6,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '安全资产配置',
      duration: 20,
      nodes: [
        {
          id: 'insurance-guide',
          name: '保险配置避坑指南',
          description: '科学配置保险产品',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1Vt411o72w',
          duration: 7,
        },
        {
          id: 'low-risk-investment',
          name: '国债/货币基金/债券基金入门',
          description: '学习低风险投资产品',
          stage: 'intermediate',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/JLU-1001777003',
          duration: 7,
        },
        {
          id: 'emergency-fund',
          name: '家庭应急金+低风险组合',
          description: '建立应急储备与安全资产组合',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1Mt411o7aW',
          duration: 6,
        },
      ],
    },
    {
      id: 'advanced',
      name: '基金进阶+长期财富规划',
      duration: 20,
      nodes: [
        {
          id: 'index-fund-investing',
          name: '指数基金定投+止盈止损',
          description: '掌握指数基金投资策略',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1At411o74U',
          duration: 7,
        },
        {
          id: 'asset-allocation',
          name: '资产配置模型+基金组合搭建',
          description: '学习科学的资产配置方法',
          stage: 'advanced',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/HUBEIU-1003206001',
          duration: 7,
        },
        {
          id: 'advanced-tools',
          name: '可转债/REITs高阶工具+投资心态',
          description: '掌握进阶投资工具与心态管理',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1Rt411o78X',
          duration: 6,
        },
      ],
    },
  ],
};

export const englishCommunicationTree: SkillTree = {
  id: 'english-communication',
  domain: 'english-communication',
  title: '英语学习',
  description: '开口→听懂→实战，三阶告别哑巴英语',
  totalDuration: 21,
  learningMethod: '1. 每天B站音标跟读15min；2. BBC 6 Minute English精听每周3篇；3. English with Lucy学日常表达；4. 最终用HelloTalk找老外实战3次',
  learningGoal: '能开口做英文自我介绍、听懂慢速英语播客、用英语完成日常购物/点餐/电话沟通，最终用HelloTalk和老外聊上半小时',
  frameworkExplanation: '一阶觉醒：纠正发音+听慢速→二阶锻造：精听BBC+模仿母语者日常对话→三阶出师：职场英语+找老外实战',

  stages: [
    {
      id: 'beginner',
      name: '音标+词汇+基础语法',
      duration: 20,
      nodes: [
        {
          id: 'phonetics',
          name: '美式音标发音纠正',
          description: '掌握标准美式发音',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV16s411o79B',
          duration: 7,
        },
        {
          id: 'english-grammar',
          name: '零基础英语语法系统入门',
          description: '系统学习英语基础语法',
          stage: 'beginner',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/CPU-1002345001',
          duration: 7,
        },
        {
          id: 'core-vocabulary',
          name: '口语高频2000核心词汇',
          description: '掌握日常口语必备词汇',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1Ds411o77k',
          duration: 6,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '场景听力+日常口语',
      duration: 20,
      nodes: [
        {
          id: 'daily-conversation',
          name: '日常生活情景口语全套',
          description: '掌握日常场景对话能力',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1ms411o78X',
          duration: 7,
        },
        {
          id: 'listening-training',
          name: '慢速→常速听力磨耳朵训练',
          description: '循序渐进提升听力水平',
          stage: 'intermediate',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/SDU-1001888002',
          duration: 7,
        },
        {
          id: 'pronunciation-improvement',
          name: '连读弱读摆脱中式口音',
          description: '改善发音，摆脱口音问题',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1rs411o7aJ',
          duration: 6,
        },
      ],
    },
    {
      id: 'advanced',
      name: '职场口语+无障碍实战',
      duration: 20,
      nodes: [
        {
          id: 'business-english',
          name: '职场商务会议/面试口语',
          description: '掌握职场英语沟通技巧',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1ts411o79b',
          duration: 7,
        },
        {
          id: 'cross-cultural',
          name: '跨文化交际+老外聊天逻辑',
          description: '理解西方文化与交流习惯',
          stage: 'advanced',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/ZJUT-1002123001',
          duration: 7,
        },
        {
          id: 'fluent-speaking',
          name: '无字幕跟读+即兴自由表达',
          description: '实现流利口语与即兴表达',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1ss411o79b',
          duration: 6,
        },
      ],
    },
  ],
};

export const skillTrees: SkillTree[] = [
  aiProductManagerTree,
  personalFinanceTree,
  englishCommunicationTree,
];

export const getSkillTreeByDomain = (domain: string): SkillTree | undefined => {
  return skillTrees.find(tree => tree.domain === domain);
};

export const getAllSkillTreeDomains = (): { id: string; title: string; description: string }[] => {
  return skillTrees.map(tree => ({
    id: tree.domain,
    title: tree.title,
    description: tree.description,
  }));
};

export const STAGE_NAME_MAP = STAGE_MAP;
export const PLATFORM_NAME_MAP: Record<string, string> = {
  bilibili: 'B站',
  xiaohongshu: '小红书',
  mooc: '中国大学MOOC',
};