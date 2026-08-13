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

export const programmingBasicsTree: SkillTree = {
  id: 'programming-basics',
  domain: 'programming-basics',
  title: '编程基础',
  description: 'Python入门→算法思维→项目实战，三阶通关编程',
  totalDuration: 21,
  learningMethod: '1. B站零基础Python视频跟练；2. MOOC《程序设计基础》系统学数据结构；3. LeetCode每周刷3道简单题；4. 最终独立完成一个命令行小项目',
  learningGoal: '能独立编写Python脚本解决实际问题、理解基础算法与数据结构、具备自学其他编程语言的能力',
  frameworkExplanation: '一阶：Python语法+环境配置+基础IO → 二阶：数据结构+算法入门+面向对象 → 三阶：项目实战+代码规范+Git协作',
  stages: [
    {
      id: 'beginner',
      name: 'Python语法入门',
      duration: 20,
      nodes: [
        { id: 'python-zero', name: '零基础Python快速入门', description: '从安装到写出第一个程序', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1wD4y1o7AS', duration: 7 },
        { id: 'cs-fundamentals', name: '计算机科学基础导论', description: '理解计算机工作原理', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/HIT-1001517001', duration: 7 },
        { id: 'python-practice', name: 'Python基础编程练习30题', description: '通过习题巩固语法基础', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1c4411e77t', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '数据结构与算法',
      duration: 20,
      nodes: [
        { id: 'data-structures', name: '数据结构入门：列表/栈/队列/树', description: '掌握基础数据结构', stage: 'intermediate', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/ZJU-93001', duration: 7 },
        { id: 'algorithms-basic', name: '基础算法：排序/查找/递归', description: '学习经典算法思想', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1uA411N7c5', duration: 7 },
        { id: 'oop-python', name: 'Python面向对象编程', description: '掌握类/继承/多态', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1v7411R7mp', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '项目实战与工程化',
      duration: 20,
      nodes: [
        { id: 'project-crawler', name: '实战：Python爬虫+数据分析', description: '完成一个数据爬取分析项目', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV12E411A7ZQ', duration: 7 },
        { id: 'project-flask', name: '实战：Flask搭建简易Web应用', description: '用Python框架构建Web服务', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV17r4y1y7jG', duration: 7 },
        { id: 'git-github', name: 'Git版本控制+GitHub协作', description: '掌握团队协作开发工具', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1pW411A7a5', duration: 6 },
      ],
    },
  ],
};

export const financeBasicsTree: SkillTree = {
  id: 'finance-basics',
  domain: 'finance-basics',
  title: '理财入门',
  description: '记账→储蓄→基础投资，从零管好每一笔钱',
  totalDuration: 21,
  learningMethod: '1. 下载记账App坚持记一个月；2. 读《小狗钱钱》建立理财思维；3. 支付宝体验货币基金；4. 制定个人月度预算表',
  learningGoal: '养成记账习惯、建立3-6个月应急金、了解货币基金/定期存款等低风险产品、能制定个人预算并每月复盘',
  frameworkExplanation: '一阶：理财观念+记账实操 → 二阶：储蓄策略+防御性资产 → 三阶：指数基金入门+财务规划',
  stages: [
    {
      id: 'beginner',
      name: '理财启蒙+记账习惯',
      duration: 20,
      nodes: [
        { id: 'money-mindset', name: '《小狗钱钱》财商思维入门', description: '建立正确金钱观与理财心态', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Lt411o7AB', duration: 7 },
        { id: 'accounting-101', name: '记账实操：收支分类+预算制定', description: '学会系统记账与预算管理', stage: 'beginner', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result/记账方法', duration: 7 },
        { id: 'consumer-psychology', name: '消费心理学：区分需要和想要', description: '避免冲动消费，理性购物', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1oi4y1s7dr', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '储蓄策略+安全资产',
      duration: 20,
      nodes: [
        { id: 'emergency-fund-101', name: '应急金规划：3-6个月生活费', description: '建立人生第一笔安全垫', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV13t411o7BA', duration: 7 },
        { id: 'saving-tools', name: '定期/大额存单/货币基金入门', description: '了解银行的存款类产品', stage: 'intermediate', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/JLU-1001777003', duration: 7 },
        { id: 'credit-card', name: '信用卡正确使用+征信科普', description: '学会用信用卡而非被用', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Ut411o7aA', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '投资入门+财务规划',
      duration: 20,
      nodes: [
        { id: 'index-fund-101', name: '指数基金入门：定投策略实操', description: '开始你的第一笔基金定投', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1kx411U7bh', duration: 7 },
        { id: 'insurance-101', name: '保险入门：四大险种怎么买', description: '了解基础保险配置', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Vt411o72w', duration: 7 },
        { id: 'financial-plan', name: '个人年度财务规划+复盘模板', description: '制定并执行个人理财计划', stage: 'advanced', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result/年度财务规划', duration: 6 },
      ],
    },
  ],
};

export const cetExamTree: SkillTree = {
  id: 'cet-exam',
  domain: 'cet-exam',
  title: '四六级备考',
  description: '单词→真题→技巧，高效通关四六级',
  totalDuration: 21,
  learningMethod: '1. 每天墨墨背单词打卡50个高频词；2. 华研外语真题每周2套精做；3. B站听力真题精听磨耳朵；4. 考前一周背诵作文万能模板',
  learningGoal: '四级425+或六级425+通过，掌握考试核心词汇、听力常考场景、阅读快速定位技巧、作文高分模板',
  frameworkExplanation: '一阶：高频词汇+语法补漏 → 二阶：分项突破听力/阅读/翻译 → 三阶：真题模考+作文模板背诵',
  stages: [
    {
      id: 'beginner',
      name: '词汇积累+语法补漏',
      duration: 20,
      nodes: [
        { id: 'cet-vocabulary', name: '四六级高频核心词汇突破', description: '掌握考试必考高频词', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1C5411w7QK', duration: 7 },
        { id: 'english-grammar-cet', name: '四六级语法考点速通', description: '快速过一遍常考语法点', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/CPU-1002345001', duration: 7 },
        { id: 'reading-skills', name: '长篇阅读快速定位技巧', description: '10分钟做完匹配题', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Ar4y1U7sV', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '分项突破听力+翻译',
      duration: 20,
      nodes: [
        { id: 'listening-cet', name: '四六级听力真题精听训练', description: '系统提升听力分数', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Jr4y1A7Fm', duration: 7 },
        { id: 'translation-cet', name: '汉译英翻译模板+高频句型', description: '掌握翻译得分套路', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV18N4y1U7gN', duration: 7 },
        { id: 'writing-template', name: '作文万能模板+高分替换词', description: '背诵即可上考场', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jv4y1K7qW', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '真题模考+考前冲刺',
      duration: 20,
      nodes: [
        { id: 'mock-exam', name: '四六级真题全真模考', description: '限时模拟真实考试', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1b94y1Z7xK', duration: 7 },
        { id: 'final-review', name: '考前7天冲刺计划', description: '临门一脚拿下425+', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1LM4y1w7AJ', duration: 7 },
        { id: 'error-review', name: '错题回顾+高频易错点复盘', description: '避免考场重复踩坑', stage: 'advanced', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result/四六级错题', duration: 6 },
      ],
    },
  ],
};

export const skillTrees: SkillTree[] = [
  aiProductManagerTree,
  programmingBasicsTree,
  personalFinanceTree,
  financeBasicsTree,
  englishCommunicationTree,
  cetExamTree,
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