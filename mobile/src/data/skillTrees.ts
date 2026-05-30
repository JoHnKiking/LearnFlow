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
          url: 'https://www.bilibili.com/video/BV1PiVc6yE6K',
          duration: 7,
        },
        {
          id: 'ai-terminology',
          name: 'AI行业名词/API/微调通俗科普',
          description: '掌握AI领域核心术语与API应用',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1Qbo8Y9Eeg',
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
          url: 'https://www.bilibili.com/video/BV1kY411G7x2',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/PKU-1002697008',
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
          url: 'https://www.bilibili.com/video/BV1kY411G7x2',
          duration: 7,
        },
        {
          id: 'ai-commercialization',
          name: 'AI商业变现&行业落地案例',
          description: '探索AI商业化路径与成功案例',
          stage: 'advanced',
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/ZJU-1003368001',
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
  title: '个人理财',
  description: '建立科学的理财观念与资产配置能力',
  totalDuration: 60,
  learningMethod: '1. 从B站视频建立理财思维；2. 通过MOOC学习系统理财知识；3. 参考小红书实践案例；4. 实际记账3个月验证效果',
  learningGoal: '建立完整的个人财务体系，实现财务自由的第一步，能够独立进行资产配置、风险控制和长期财富规划',
  frameworkExplanation: '遵循"认知-配置-进阶"的理财学习路径：初级阶段培养理财思维和记账习惯，中级阶段学习安全资产配置，高级阶段掌握进阶投资工具与长期规划，符合从基础到进阶的学习规律',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/WHU-1002928001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/UIBE-1002736001',
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
          url: 'https://www.bilibili.com/video/BV1G9VH6XEsY',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/BNU-1001864001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/SWUFE-1003372001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/SWUFE-1003373001',
          duration: 6,
        },
      ],
    },
  ],
};

export const englishCommunicationTree: SkillTree = {
  id: 'english-communication',
  domain: 'english-communication',
  title: '英语无障碍沟通',
  description: '提升英语听说能力，实现无障碍沟通',
  totalDuration: 60,
  learningMethod: '1. 每天30分钟音标跟读；2. 精听+泛听结合训练；3. 模仿native speaker语调；4. 每周2次口语练习',
  learningGoal: '实现日常英语无障碍沟通，能够自信地进行日常对话、职场交流和跨文化沟通',
  frameworkExplanation: '采用"基础-进阶-实战"的语言学习框架：初级阶段打牢发音和词汇基础，中级阶段提升听力和日常口语，高级阶段聚焦职场应用和实战能力，符合语言学习循序渐进的规律',
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
          url: 'https://www.bilibili.com/video/BV1Ji4y1P7Lu',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/BFU-1003374001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/BNU-1003376001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/NJU-1003377001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/FUDAN-1003378001',
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
          platform: PLATFORM_MAP['中国大学MOOC'],
          url: 'https://www.icourse163.org/course/SISU-1003379001',
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
  other: '其他',
};