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

// B站搜索链接生成器 — 比假BVID更诚实
const bilibiliSearch = (keyword: string) =>
  `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;

// ==================== AI产品经理 ====================
export const aiProductManagerTree: SkillTree = {
  id: 'ai-product-manager',
  domain: 'ai-product-manager',
  title: 'AI产品经理',
  description: '从理解大模型到做出AI产品：Prompt工程、RAG、Agent，产品经理的AI实战课',
  totalDuration: 60,
  learningMethod: '1. 先用ChatGPT/Kimi/DeepSeek自己玩Prompt，建立直觉；2. 看MOOC和B站理解大模型原理；3. 每天拆解一个AI产品的设计逻辑；4. 在Cursor里亲手搭一个RAG小应用作为作品。完成整个模块奖励50点额外Π能量',
  learningGoal: '能独立完成AI产品的需求分析到上线跟踪，理解LLM能力边界与成本结构，会写高质量的Prompt和PRD，面试能聊清楚RAG、Agent、微调的区别',
  frameworkExplanation: '认知（AI技术基础+行业术语）→ 能力（Prompt工程+产品思维）→ 实战（PRD写作+商业合规+做出作品）',
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
          url: 'https://www.bilibili.com/video/BV1XS411w7qr',
          duration: 7,
        },
        {
          id: 'ai-terminology',
          name: 'AI行业名词/API/微调通俗科普',
          description: '掌握AI领域核心术语与API应用',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1qCkbYsEQs',
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
          url: 'https://www.bilibili.com/video/BV1gmBXYKEka',
          duration: 7,
        },
        {
          id: 'prompt-engineering',
          name: 'Prompt提示工程实战',
          description: '掌握提示词设计与优化技巧',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1oDE166Epw',
          duration: 7,
        },
        {
          id: 'rag-explained',
          name: 'RAG检索增强通俗拆解',
          description: '理解RAG技术原理与应用场景',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1rGCvBVEtR',
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
          url: 'https://www.bilibili.com/video/BV1kv4y1A7rH',
          duration: 7,
        },
        {
          id: 'ai-commercialization',
          name: 'AI商业变现&行业落地案例',
          description: '探索AI商业化路径与成功案例',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV13hjA6qE7a',
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

// ==================== 个人理财 ====================
export const personalFinanceTree: SkillTree = {
  id: 'personal-finance',
  domain: 'personal-finance',
  title: '理财进阶',
  description: '不只是存钱——学会让钱替你工作，从记账到定投的完整路径',
  totalDuration: 21,
  learningMethod: '1. 立刻下载记账App开始记，先记一个月再说；2. 支付宝买100块货币基金体验"钱生钱"；3. 读《小狗钱钱》+《穷查理宝典》精华章节；4. 每月做一次财务复盘。完成整个模块奖励50点额外Π能量',
  learningGoal: '能独立做家庭财务盘点、完成保险+基金配置方案、开始指数基金定投，形成"赚钱→记账→投资→复盘"的长期习惯',
  frameworkExplanation: '一阶觉醒：建立复利思维+开始记账 → 二阶锻造：理解保险配置+货币基金→ 三阶出师：指数定投实操+完成资产配置计划书',
  stages: [
    {
      id: 'beginner',
      name: '理财思维启蒙',
      duration: 20,
      nodes: [
        { id: 'finance-basics', name: '理财底层逻辑+复利思维', description: '建立正确的理财观念与复利认知', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 7 },
        { id: 'budget-planning', name: '个人财务记账+收支规划', description: '掌握个人财务管理基础方法', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/NCWU-1002705001', duration: 7 },
        { id: 'financial-tools', name: '基础金融工具科普', description: '了解常见金融产品与工具', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Qr4y1t7xX', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '安全资产配置',
      duration: 20,
      nodes: [
        { id: 'insurance-guide', name: '保险配置避坑指南', description: '科学配置保险产品', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1ZPCNYoExc', duration: 7 },
        { id: 'low-risk-investment', name: '国债/货币基金/债券基金入门', description: '学习低风险投资产品', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Qr4y1t7xX', duration: 7 },
        { id: 'emergency-fund', name: '家庭应急金+低风险组合', description: '建立应急储备与安全资产组合', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '基金进阶+长期财富规划',
      duration: 20,
      nodes: [
        { id: 'index-fund-investing', name: '指数基金定投+止盈止损', description: '掌握指数基金投资策略', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 7 },
        { id: 'asset-allocation', name: '资产配置模型+基金组合搭建', description: '学习科学的资产配置方法', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 7 },
        { id: 'advanced-tools', name: '可转债/REITs高阶工具+投资心态', description: '掌握进阶投资工具与心态管理', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Qr4y1t7xX', duration: 6 },
      ],
    },
  ],
};

// ==================== 英语沟通 ====================
export const englishCommunicationTree: SkillTree = {
  id: 'english-communication',
  domain: 'english-communication',
  title: '英语学习',
  description: '开口→听懂→实战，三阶告别哑巴英语。搭配AI口语陪练效率翻倍',
  totalDuration: 21,
  learningMethod: '1. 每天B站音标跟读15min做嘴型训练；2. 用ChatGPT语音模式/Duolingo每天对话5分钟；3. BBC 6 Minute English精听每周3篇；4. 最终用HelloTalk找老外实战3次。完成整个模块奖励50点额外Π能量',
  learningGoal: '能开口做英文自我介绍、听懂慢速英语播客、用英语完成日常购物/点餐/电话沟通，敢说不怕错',
  frameworkExplanation: '一阶觉醒：纠正发音+听慢速→二阶锻造：精听BBC+模仿母语者日常对话→三阶出师：职场英语+找老外实战',
  stages: [
    {
      id: 'beginner',
      name: '音标+词汇+基础语法',
      duration: 20,
      nodes: [
        { id: 'phonetics', name: '美式音标发音纠正', description: '掌握标准美式发音', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1n54y1B7bE', duration: 7 },
        { id: 'english-grammar', name: '零基础英语语法系统入门', description: '系统学习英语基础语法', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/CPU-1002345001', duration: 7 },
        { id: 'core-vocabulary', name: '口语高频2000核心词汇', description: '掌握日常口语必备词汇', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1ds421u7fh', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '场景听力+日常口语',
      duration: 20,
      nodes: [
        { id: 'daily-conversation', name: '日常生活情景口语全套', description: '掌握日常场景对话能力', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1emBiYcEAV', duration: 7 },
        { id: 'listening-training', name: '慢速→常速听力磨耳朵训练', description: '循序渐进提升听力水平', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV18bZJB7Eas', duration: 7 },
        { id: 'pronunciation-improvement', name: '连读弱读摆脱中式口音', description: '改善发音，摆脱口音问题', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1SZ4y1K7Lr', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '职场口语+无障碍实战',
      duration: 20,
      nodes: [
        { id: 'business-english', name: '职场商务会议/面试口语', description: '掌握职场英语沟通技巧', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1F44y1677Z', duration: 7 },
        { id: 'cross-cultural', name: '跨文化交际+老外聊天逻辑', description: '理解西方文化与交流习惯', stage: 'advanced', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/ZJUT-1002123001', duration: 7 },
        { id: 'fluent-speaking', name: '无字幕跟读+即兴自由表达', description: '实现流利口语与即兴表达', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1emBiYcEAV', duration: 6 },
      ],
    },
  ],
};

// ==================== 编程基础 ====================
export const programmingBasicsTree: SkillTree = {
  id: 'programming-basics',
  domain: 'programming-basics',
  title: '编程基础',
  description: 'Vibe Coding之后想深入理解底层？从Python语法到算法，搞懂AI帮你写的代码在做什么',
  totalDuration: 21,
  learningMethod: '1. 先玩过Vibe Coding启蒙再来，带着好奇心学；2. B站视频边看边写，不背只理解；3. 用LeetCode简单题验证自己的理解；4. 最终目标：能看懂开源项目的代码逻辑。完成整个模块奖励50点额外Π能量',
  learningGoal: '能独立编写Python脚本解决问题、看懂基础算法与数据结构、理解AI生成的代码逻辑而非盲目复制、具备自学其他编程语言的能力',
  frameworkExplanation: '一阶：Python语法+变量循环（玩起来）→ 二阶：数据结构+算法+面向对象（深下去）→ 三阶：爬虫/Flask项目+Git协作（做出来）',
  stages: [
    {
      id: 'beginner',
      name: 'Python语法入门',
      duration: 20,
      nodes: [
        { id: 'python-zero', name: '零基础Python快速入门', description: '从安装到写出第一个程序', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1xPznYuEAQ', duration: 7 },
        { id: 'cs-fundamentals', name: '计算机科学基础导论', description: '理解计算机工作原理', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/HIT-1001517001', duration: 7 },
        { id: 'python-practice', name: 'Python基础编程练习30题', description: '通过习题巩固语法基础', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1rpWjevEip', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '数据结构与算法',
      duration: 20,
      nodes: [
        { id: 'data-structures', name: '数据结构入门：列表/栈/队列/树', description: '掌握基础数据结构', stage: 'intermediate', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/ZJU-93001', duration: 7 },
        { id: 'algorithms-basic', name: '基础算法：排序/查找/递归', description: '学习经典算法思想', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1ka4y1E7h7', duration: 7 },
        { id: 'oop-python', name: 'Python面向对象编程', description: '掌握类/继承/多态', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1FXDVYkEQh', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '项目实战与工程化',
      duration: 20,
      nodes: [
        { id: 'project-crawler', name: '实战：Python爬虫+数据分析', description: '完成一个数据爬取分析项目', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1rpWjevEip', duration: 7 },
        { id: 'project-flask', name: '实战：Flask搭建简易Web应用', description: '用Python框架构建Web服务', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV11PoTYkEE1', duration: 7 },
        { id: 'git-github', name: 'Git版本控制+GitHub协作', description: '掌握团队协作开发工具', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1np4y1M7CZ', duration: 6 },
      ],
    },
  ],
};

// ==================== 理财入门 ====================
export const financeBasicsTree: SkillTree = {
  id: 'finance-basics',
  domain: 'finance-basics',
  title: '理财入门',
  description: '管好每一分钱的开始：记账→储蓄→低风险投资，建立跟钱的良好关系',
  totalDuration: 21,
  learningMethod: '1. 下载记账App坚持记一个月（记了就赢了）；2. 读《小狗钱钱》建立正确的金钱观；3. 支付宝买100块货币基金体验收益到账的感觉；4. 每月底花15分钟做预算复盘。完成整个模块奖励50点额外Π能量',
  learningGoal: '养成记账习惯不费力、建立3-6个月应急金有安全感、了解货币基金/定期存款等稳健产品、能制定个人月度预算并执行',
  frameworkExplanation: '一阶：理财观念+记账实操 → 二阶：储蓄策略+防御性资产 → 三阶：指数基金入门+财务规划',
  stages: [
    {
      id: 'beginner',
      name: '理财启蒙+记账习惯',
      duration: 20,
      nodes: [
        { id: 'money-mindset', name: '《小狗钱钱》财商思维入门', description: '建立正确金钱观与理财心态', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 7 },
        { id: 'accounting-101', name: '记账实操：收支分类+预算制定', description: '学会系统记账与预算管理', stage: 'beginner', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=记账方法', duration: 7 },
        { id: 'consumer-psychology', name: '消费心理学：区分需要和想要', description: '避免冲动消费，理性购物', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '储蓄策略+安全资产',
      duration: 20,
      nodes: [
        { id: 'emergency-fund-101', name: '应急金规划：3-6个月生活费', description: '建立人生第一笔安全垫', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 7 },
        { id: 'saving-tools', name: '定期/大额存单/货币基金入门', description: '了解银行的存款类产品', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Qr4y1t7xX', duration: 7 },
        { id: 'credit-card', name: '信用卡正确使用+征信科普', description: '学会用信用卡而非被用', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1Qr4y1t7xX', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '投资入门+财务规划',
      duration: 20,
      nodes: [
        { id: 'index-fund-101', name: '指数基金入门：定投策略实操', description: '开始你的第一笔基金定投', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1jNmKBcEZv', duration: 7 },
        { id: 'insurance-101', name: '保险入门：四大险种怎么买', description: '了解基础保险配置', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1ZPCNYoExc', duration: 7 },
        { id: 'financial-plan', name: '个人年度财务规划+复盘模板', description: '制定并执行个人理财计划', stage: 'advanced', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=年度财务规划', duration: 6 },
      ],
    },
  ],
};

// ==================== 四六级备考 ====================
export const cetExamTree: SkillTree = {
  id: 'cet-exam',
  domain: 'cet-exam',
  title: '四六级备考',
  description: '单词→真题→技巧，高效通关四六级。用AI帮你批改作文和翻译',
  totalDuration: 21,
  learningMethod: '1. 每天墨墨背单词打卡50个高频词（坚持就是胜利）；2. 华研外语真题每周精做2套；3. B站听力真题精听磨耳朵；4. 用ChatGPT/DeepSeek批改你的作文和翻译；5. 考前一周背作文万能模板。完成整个模块奖励50点额外Π能量',
  learningGoal: '四级425+或六级425+顺利通过，掌握核心词汇、听力常考场景、阅读快速定位技巧、作文高分模板',
  frameworkExplanation: '一阶：高频词汇+语法补漏 → 二阶：分项突破听力/阅读/翻译 → 三阶：真题模考+作文模板背诵',
  stages: [
    {
      id: 'beginner',
      name: '词汇积累+语法补漏',
      duration: 20,
      nodes: [
        { id: 'cet-vocabulary', name: '四六级高频核心词汇突破', description: '掌握考试必考高频词', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1N2RDBxE14', duration: 7 },
        { id: 'english-grammar-cet', name: '四六级语法考点速通', description: '快速过一遍常考语法点', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/CPU-1002345001', duration: 7 },
        { id: 'reading-skills', name: '长篇阅读快速定位技巧', description: '10分钟做完匹配题', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1N2RDBxE14', duration: 6 },
      ],
    },
    {
      id: 'intermediate',
      name: '分项突破听力+翻译',
      duration: 20,
      nodes: [
        { id: 'listening-cet', name: '四六级听力真题精听训练', description: '系统提升听力分数', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1N2RDBxE14', duration: 7 },
        { id: 'translation-cet', name: '汉译英翻译模板+高频句型', description: '掌握翻译得分套路', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV11T4y197gV', duration: 7 },
        { id: 'writing-template', name: '作文万能模板+高分替换词', description: '背诵即可上考场', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV11T4y197gV', duration: 6 },
      ],
    },
    {
      id: 'advanced',
      name: '真题模考+考前冲刺',
      duration: 20,
      nodes: [
        { id: 'mock-exam', name: '四六级真题全真模考', description: '限时模拟真实考试', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1N2RDBxE14', duration: 7 },
        { id: 'final-review', name: '考前7天冲刺计划', description: '临门一脚拿下425+', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV11T4y197gV', duration: 7 },
        { id: 'error-review', name: '错题回顾+高频易错点复盘', description: '避免考场重复踩坑', stage: 'advanced', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=四六级错题', duration: 6 },
      ],
    },
  ],
};

// ==================== 暑假专区 ====================

export const officeSkillsTree: SkillTree = {
  id: 'office-skills',
  domain: 'office-skills',
  title: '基础办公技能',
  description: 'Word/Excel/PPT + AI加持：快速搞定论文排版、数据分析、答辩展示',
  totalDuration: 24,
  learningMethod: '1. 跟着B站视频边看边操作，每个节点至少动手做一遍；2. 学会用AI（ChatGPT/Copilot）帮你写Excel公式和PPT大纲；3. 学完一个工具立刻用它做一个真实作品（简历/报表/答辩PPT）。完成整个模块奖励50点额外Π能量',
  learningGoal: '能独立用Word排版论文和报告，用Excel+AI做数据分析和图表，用PPT（可搭配AI生成大纲）完成课堂展示和答辩，具备大学社团和实习的基本办公能力',
  frameworkExplanation: '采用"工具入门→效率提升→综合实战"三层递进：初级阶段逐个工具快速上手，中级阶段掌握函数/设计/排版等效率技巧，高级阶段用真实场景项目串联三个工具',
  stages: [
    {
      id: 'beginner',
      name: '工具快速上手',
      duration: 8,
      nodes: [
        { id: 'word-basics', name: 'Word基础排版：文字/段落/页面设置', description: '掌握文字格式、段落间距、页边距等基础排版', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1YQ4y1M73G', duration: 3 },
        { id: 'excel-basics', name: 'Excel入门：数据录入与表格美化', description: '学会数据输入、单元格格式、简单表格制作', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1wD4y1V7ZU', duration: 3 },
        { id: 'ppt-basics', name: 'PPT快速上手：母版与基础动画', description: '从零制作一份完整的课堂展示PPT', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1wD4y1V7ZU', duration: 2 },
      ],
    },
    {
      id: 'intermediate',
      name: '效率技巧进阶',
      duration: 8,
      nodes: [
        { id: 'excel-formula', name: 'Excel常用函数：SUM/IF/VLOOKUP/数据透视表', description: '掌握数据处理核心函数，告别手动计算', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1M34y1C7HZ', duration: 3 },
        { id: 'word-long-doc', name: 'Word长文档排版：目录/页眉页脚/样式', description: '论文和报告排版必备技能', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1YQ4y1M73G', duration: 3 },
        { id: 'ppt-design', name: 'PPT设计美化：配色/字体/图文排版', description: '让PPT从"能看"变成"好看"', stage: 'intermediate', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=PPT设计技巧', duration: 2 },
      ],
    },
    {
      id: 'advanced',
      name: '综合实战输出',
      duration: 8,
      nodes: [
        { id: 'office-project', name: '综合实战：Excel分析→Word报告→PPT汇报', description: '模拟真实工作流，打通三个工具', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1wD4y1V7ZU', duration: 4 },
        { id: 'office-efficiency', name: '办公效率工具：快捷键/模板/协同办公', description: '10倍提升办公效率的实用技巧', stage: 'advanced', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=办公效率技巧', duration: 4 },
      ],
    },
  ],
};

export const vibeCodingTree: SkillTree = {
  id: 'vibe-coding',
  domain: 'vibe-coding',
  title: 'Vibe Coding 启蒙',
  description: '像聊天一样写代码：把想法说给AI，它帮你实现。你负责想、看、改，AI负责写',
  totalDuration: 27,
  learningMethod: '1. 核心思路：把AI当作你的编程搭档，你负责想清楚"做什么"，AI负责"怎么写"；2. 遇到报错不要慌，先读错误信息（哪怕看不懂），再复制给AI询问解决方案；3. 每学完一个阶段做一个真实小作品，成就感是最好的驱动力。完成整个模块奖励50点额外Π能量',
  learningGoal: '能用AI工具（Cursor/Windsurf/ChatGPT）独立完成一个网页或小工具的开发与上线，掌握问题拆解、代码阅读、Debug工作流三项核心能力，具备在AI时代持续自学任何技术的基础思维',
  frameworkExplanation: '颠覆传统"先学语法再写代码"路径：第一阶段建立AI编程认知（你不需要背语法），第二阶段培养AI协作能力（会提问比会写代码更重要），第三阶段从使用者进阶为创造者（做出真实作品并发布）',
  stages: [
    {
      id: 'beginner',
      name: 'AI编程认知：重新理解编程',
      duration: 9,
      nodes: [
        { id: 'ai-era-mindset', name: 'AI时代为什么学编程：你能做AI做不到的事', description: '认识AI的边界，理解人类在编程中的不可替代价值——定义问题、判断好坏、理解需求', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('AI时代 编程入门 2025'), duration: 3 },
        { id: 'first-ai-project', name: '5分钟用AI写出你的第一个网页', description: '用Cursor/ChatGPT从零生成一个个人主页，体验AI编程的魔力，建立"我能行"的信心', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('Cursor AI编程 零基础'), duration: 3 },
        { id: 'thinking-like-programmer', name: '编程思维第一课：问题拆解与流程表达', description: '学习如何把大问题拆成小步骤、用自然语言描述清楚需求——这是你唯一需要"学会"的技能', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('编程思维 问题拆解 流程图'), duration: 3 },
      ],
    },
    {
      id: 'intermediate',
      name: 'AI协作实战：会提问比会写代码重要',
      duration: 9,
      nodes: [
        { id: 'prompt-for-coding', name: '编程Prompt工程：如何精准描述需求让AI一次写对', description: '掌握需求描述的黄金模板：背景+目标+约束+示例，让AI生成的代码质量提升10倍', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('AI编程 Prompt 技巧 Vibe Coding'), duration: 3 },
        { id: 'read-ai-code', name: '读懂AI生成的代码（不是背诵）', description: '快速看懂变量/函数/循环/条件判断在做什么——像读菜单一样读代码，不需要默写', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('零基础 看懂代码 Python 变量 函数'), duration: 3 },
        { id: 'debug-workflow', name: 'Debug工作流：遇到报错三步法', description: '第1步：自己读错误信息（哪怕只看懂关键词）→ 第2步：复制错误信息问AI → 第3步：根据AI建议修复并验证。这是AI时代最重要的技能', stage: 'intermediate', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=Python调试技巧', duration: 3 },
      ],
    },
    {
      id: 'advanced',
      name: '从使用者到创造者：做出真实作品',
      duration: 9,
      nodes: [
        { id: 'build-real-project', name: '从想法到产品：用AI协作完成一个完整项目', description: '选一个你真正想用的工具（记账本/学习计划/个人主页），用AI从零开发、迭代、完善', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('Vibe Coding 完整项目 实战'), duration: 4 },
        { id: 'deploy-online', name: '部署上线：让全世界看到你的作品', description: '用GitHub Pages或Vercel免费部署，生成一个链接分享给朋友——真正的成就感来自"别人能用"', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('GitHub Pages 部署 免费 网站'), duration: 3 },
        { id: 'ai-learning-roadmap', name: 'AI时代的持续学习路线图', description: '了解前端/后端/数据/AI各方向在AI辅助下的学习路径，找到你真正感兴趣的方向继续深入', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: bilibiliSearch('AI时代 程序员 学习路线 2025'), duration: 2 },
      ],
    },
  ],
};

export const speechExpressionTree: SkillTree = {
  id: 'speech-expression',
  domain: 'speech-expression',
  title: '演讲表达',
  description: '别让表达能力成为你的短板——克服紧张、搭好结构、讲出感染力',
  totalDuration: 24,
  learningMethod: '1. 每学一个技巧立刻对着手机录视频回看（很难受但最有效）；2. 拆解TED/B站优秀演讲的结构和节奏；3. 可以用ChatGPT语音模式模拟听众提问；4. 每周至少完整讲一次并迭代。完成整个模块奖励50点额外Π能量',
  learningGoal: '能自信站上讲台，用清晰的结构和生动的表达完成10分钟演讲，适用于课堂展示、社团竞选、面试自我介绍等场景',
  frameworkExplanation: '采用"心理建设→结构设计→表达呈现"三层递进：初级阶段解决"不敢讲"，中级阶段解决"讲什么"，高级阶段解决"讲得好"',
  stages: [
    {
      id: 'beginner',
      name: '心理建设与基础',
      duration: 8,
      nodes: [
        { id: 'speech-fear', name: '克服演讲紧张：3个立刻见效的方法', description: '从生理和心理两个层面消除紧张感', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1WZ4y1A7EF', duration: 3 },
        { id: 'speech-voice', name: '声音训练：音量/语速/停顿的控制', description: '让你的声音更有感染力和说服力', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1C44y1D7JK', duration: 3 },
        { id: 'speech-body', name: '肢体语言：站姿/手势/眼神交流', description: '用身体语言增强表达效果', stage: 'beginner', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=演讲肢体语言', duration: 2 },
      ],
    },
    {
      id: 'intermediate',
      name: '内容设计与呈现',
      duration: 8,
      nodes: [
        { id: 'speech-structure', name: '演讲结构设计：黄金圈/金字塔/时间线', description: '学会搭建清晰有力的演讲框架', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV17d4y1F7FE', duration: 3 },
        { id: 'speech-story', name: '故事化表达：让听众记住你的内容', description: '用故事思维包装观点，让演讲不再枯燥', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV17d4y1F7FE', duration: 3 },
        { id: 'speech-ppt', name: 'PPT与演讲的配合艺术', description: '让PPT成为你的助手而非提词器', stage: 'intermediate', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=演讲PPT设计', duration: 2 },
      ],
    },
    {
      id: 'advanced',
      name: '实战演练与进阶',
      duration: 8,
      nodes: [
        { id: 'speech-impromptu', name: '即兴演讲：没准备也能讲得出彩', description: '掌握即兴表达的万能公式', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1C44y1D7JK', duration: 4 },
        { id: 'speech-practice', name: '模拟实战：录制你的10分钟演讲并迭代', description: '综合运用所学，完成一次完整演讲', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1C44y1D7JK', duration: 4 },
      ],
    },
  ],
};

export const videoEditingTree: SkillTree = {
  id: 'video-editing',
  domain: 'video-editing',
  title: '视频剪辑',
  description: '从剪映到出片：掌握剪辑全流程，做出B站/小红书风格的短视频',
  totalDuration: 27,
  learningMethod: '1. 用剪映（手机/电脑版）入门，边看教程边实操；2. 拆解3个你喜欢的up主的剪辑手法并模仿；3. 了解AI剪辑工具（剪映AI功能/Runway）能做到什么；4. 每阶段完成一个短视频作为成长记录。完成整个模块奖励50点额外Π能量',
  learningGoal: '能独立完成从素材整理到成片输出的完整流程，熟练使用剪映核心功能，能制作有节奏感、有审美的短视频，了解AI辅助剪辑提效的方法',
  frameworkExplanation: '采用"工具操作→技巧提升→创作输出"三层递进：初级阶段掌握剪辑软件基本操作，中级阶段学习转场/特效/调色等进阶技巧，高级阶段聚焦叙事节奏和完整创作',
  stages: [
    {
      id: 'beginner',
      name: '剪辑工具入门',
      duration: 9,
      nodes: [
        { id: 'edit-tool', name: '剪辑软件选择与界面认知', description: '了解剪映/必剪等工具，选择适合自己的开始', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1TP5464EsH', duration: 3 },
        { id: 'edit-basic-op', name: '基础操作：剪切/分割/排序/速度调整', description: '掌握剪辑最核心的操作', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1TP5464EsH', duration: 3 },
        { id: 'edit-material', name: '素材管理：拍摄/导入/分类/粗剪', description: '建立高效的素材管理习惯', stage: 'beginner', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=剪辑素材管理', duration: 3 },
      ],
    },
    {
      id: 'intermediate',
      name: '进阶技巧提升',
      duration: 9,
      nodes: [
        { id: 'edit-transition', name: '转场与关键帧动画', description: '让画面过渡流畅自然，告别生硬切换', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1TP5464EsH', duration: 3 },
        { id: 'edit-audio', name: '字幕识别与音频处理', description: '自动字幕+背景音乐+音效，提升视频质感', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1TP5464EsH', duration: 3 },
        { id: 'edit-color', name: '调色入门：滤镜/HSL/曲线', description: '用调色让视频画面更有电影感', stage: 'intermediate', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=视频调色教程', duration: 3 },
      ],
    },
    {
      id: 'advanced',
      name: '创作输出与发布',
      duration: 9,
      nodes: [
        { id: 'edit-rhythm', name: '叙事节奏：剪辑思维与卡点技巧', description: '学会用剪辑节奏讲故事，抓住观众注意力', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1P64y1C7Q5', duration: 4 },
        { id: 'edit-final', name: '完整作品实战：从策划到成片', description: '综合运用所有技巧，完成一个3分钟短视频', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1TP5464EsH', duration: 3 },
        { id: 'edit-publish', name: '发布运营：封面/标题/标签/发布时间', description: '让用心做的视频被更多人看到', stage: 'advanced', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=视频发布运营技巧', duration: 2 },
      ],
    },
  ],
};

// ==================== 大学课程 ====================

export const advancedMathTree: SkillTree = {
  id: 'advanced-math',
  domain: 'advanced-math',
  title: '高等数学',
  description: '微积分、级数、微分方程——高数没那么可怕，找对老师就能学懂',
  totalDuration: 27,
  learningMethod: '1. 核心看B站宋浩老师，全网口碑最好的高数课；2. 配合MOOC做系统性练习；3. 每学完一章做课后习题（不做题等于白学）；4. 考前用小红书搜高频考点和真题解析。完成整个模块奖励50点额外Π能量',
  learningGoal: '掌握一元/多元微积分、级数、微分方程等核心知识，能独立解决理工科常见的数学问题，为考研数学和后续专业课打好基础',
  frameworkExplanation: '采用"基础→进阶→综合"三层递进：初级阶段建立极限和导数概念，中级阶段攻克积分与级数，高级阶段掌握多元微积分和微分方程',
  stages: [
    {
      id: 'beginner',
      name: '极限与导数',
      duration: 9,
      nodes: [
        { id: 'math-limit', name: '函数极限与连续', description: '理解极限的定义与计算，建立微积分基础概念', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1UW411E7iT', duration: 3 },
        { id: 'math-derivative', name: '导数与微分', description: '掌握求导法则与微分的几何意义', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1UW411E7iT', duration: 3 },
        { id: 'math-mean-value', name: '微分中值定理与导数应用', description: '洛必达法则、泰勒公式、函数性态分析', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/SDU-1001983002', duration: 3 },
      ],
    },
    {
      id: 'intermediate',
      name: '积分与级数',
      duration: 9,
      nodes: [
        { id: 'math-integral', name: '不定积分与定积分', description: '掌握换元积分法、分部积分法等核心计算技巧', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1UW411E7iT', duration: 3 },
        { id: 'math-integral-app', name: '定积分的应用', description: '面积、体积、弧长——定积分的几何应用', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1UW411E7iT', duration: 3 },
        { id: 'math-series', name: '无穷级数', description: '数项级数、幂级数、傅里叶级数入门', stage: 'intermediate', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/SDU-1001983002', duration: 3 },
      ],
    },
    {
      id: 'advanced',
      name: '多元微积分与微分方程',
      duration: 9,
      nodes: [
        { id: 'math-multi-var', name: '多元函数微分学', description: '偏导数、全微分、方向导数与梯度', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1ox4y167xb', duration: 3 },
        { id: 'math-multi-integral', name: '重积分与曲线曲面积分', description: '二重积分、三重积分、格林公式', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV16L411i78J', duration: 3 },
        { id: 'math-ode', name: '常微分方程', description: '一阶方程、二阶线性方程、常系数齐次方程', stage: 'advanced', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/SDU-1001983002', duration: 3 },
      ],
    },
  ],
};

export const collegeCSTree: SkillTree = {
  id: 'college-cs',
  domain: 'college-cs',
  title: '大学生计算机基础',
  description: '搞懂电脑在做什么：从硬件到网络，从二进制到AI，不被"技术黑话"吓住',
  totalDuration: 24,
  learningMethod: '1. 先通过MOOC建立系统框架；2. B站看装机/装系统/配网络实操视频；3. 动手：拆装虚拟机、配置路由器、用AI帮你解释不懂的概念；4. 最终目标：电脑出问题能自己排查而不是喊"学长"。完成整个模块奖励50点额外Π能量',
  learningGoal: '理解计算机硬件组成与工作原理、掌握操作系统基本概念、了解网络协议与互联网架构，具备基本的计算机问题排查能力',
  frameworkExplanation: '采用"硬件→系统→网络"三层递进：初级阶段认识计算机硬件和进制编码，中级阶段理解操作系统和文件管理，高级阶段掌握网络原理和信息安全基础',
  stages: [
    {
      id: 'beginner',
      name: '计算机基础认知',
      duration: 8,
      nodes: [
        { id: 'cs-overview', name: '计算机科学导论', description: '了解计算机发展史、学科全貌、与各专业的交叉', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/BUAA-1449930188', duration: 3 },
        { id: 'cs-hardware', name: '计算机硬件组成原理', description: 'CPU、内存、硬盘、主板——从零认识电脑零件', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1JvNszPEA4', duration: 3 },
        { id: 'cs-binary', name: '二进制与编码基础', description: '理解计算机如何用0和1表示一切', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV15e4y147G2', duration: 2 },
      ],
    },
    {
      id: 'intermediate',
      name: '操作系统与软件',
      duration: 8,
      nodes: [
        { id: 'cs-os', name: '操作系统基础', description: '进程管理、内存管理、文件系统核心概念', stage: 'intermediate', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/course/HIT-1001517001', duration: 3 },
        { id: 'cs-software', name: '常用软件与效率工具', description: 'VS Code/浏览器插件/云盘/笔记工具推荐', stage: 'intermediate', platform: PLATFORM_MAP['小红书'], url: 'https://www.xiaohongshu.com/search_result?keyword=大学生必备软件', duration: 2 },
        { id: 'cs-file-system', name: '文件管理与数据存储', description: '学会科学组织文件，了解云存储基本原理', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1LP411V76W', duration: 3 },
      ],
    },
    {
      id: 'advanced',
      name: '网络与安全',
      duration: 8,
      nodes: [
        { id: 'cs-network', name: '计算机网络基础', description: 'IP地址/DNS/HTTP协议——看懂上网的原理', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1D362YpETh', duration: 3 },
        { id: 'cs-security', name: '信息安全与隐私防护', description: '密码管理、防诈骗、隐私设置实操指南', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV13U4y1Z7Vm', duration: 3 },
        { id: 'cs-trends', name: '前沿技术概览：AI/云计算/物联网', description: '了解计算机科学的未来发展方向', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1D362YpETh', duration: 2 },
      ],
    },
  ],
};

export const linearAlgebraTree: SkillTree = {
  id: 'linear-algebra',
  domain: 'linear-algebra',
  title: '线性代数',
  description: '矩阵、向量、特征值——理解线代的几何直觉，为AI/ML打数学基础',
  totalDuration: 24,
  learningMethod: '1. 核心看B站宋浩老师线代视频，全网口碑最佳；2. 配合3Blue1Brown的「线性代数的本质」建立几何直觉；3. 每学完一章做矩阵计算练习；4. 了解线代在机器学习中的应用（PCA降维等）。完成整个模块奖励50点额外Π能量',
  learningGoal: '掌握矩阵运算、向量空间、特征值等核心知识，理解线性代数的几何意义而非死记公式，能为机器学习/数据分析等后续课程打下数学基础',
  frameworkExplanation: '采用"计算→空间→应用"三层递进：初级阶段掌握矩阵与行列式的计算，中级阶段建立向量空间和线性变换的几何直觉，高级阶段攻克特征值与二次型',
  stages: [
    {
      id: 'beginner',
      name: '矩阵与行列式',
      duration: 8,
      nodes: [
        { id: 'la-matrix', name: '矩阵及其运算', description: '矩阵加减乘除、转置、逆矩阵的计算', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1aW411Q7x1', duration: 3 },
        { id: 'la-determinant', name: '行列式的计算与性质', description: '掌握行列式计算技巧，理解其几何意义', stage: 'beginner', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1aW411Q7x1', duration: 3 },
        { id: 'la-matrix-eq', name: '矩阵的秩与线性方程组', description: '用矩阵方法求解线性方程组', stage: 'beginner', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/spoc/learn/SDCJDX-1449622164', duration: 2 },
      ],
    },
    {
      id: 'intermediate',
      name: '向量空间与线性变换',
      duration: 8,
      nodes: [
        { id: 'la-vector', name: '向量组的线性相关性', description: '理解线性相关/无关，掌握极大无关组', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1aW411Q7x1', duration: 3 },
        { id: 'la-vector-space', name: '向量空间与基变换', description: '建立向量空间的几何直觉', stage: 'intermediate', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1aW411Q7x1', duration: 3 },
        { id: 'la-linear-trans', name: '线性变换与矩阵表示', description: '理解线性变换的矩阵表示，为机器学习打基础', stage: 'intermediate', platform: PLATFORM_MAP['中国大学MOOC'], url: 'https://www.icourse163.org/spoc/learn/SDCJDX-1449622164', duration: 2 },
      ],
    },
    {
      id: 'advanced',
      name: '特征值与二次型',
      duration: 8,
      nodes: [
        { id: 'la-eigenvalue', name: '特征值与特征向量', description: '矩阵对角化，PCA降维的数学基础', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1aW411Q7x1', duration: 3 },
        { id: 'la-quadratic', name: '二次型与标准型', description: '正交变换法化二次型为标准型', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1ZC411j7mu', duration: 3 },
        { id: 'la-applied', name: '线性代数的应用场景', description: '机器学习/图形学/数据分析中的线性代数', stage: 'advanced', platform: PLATFORM_MAP['B站'], url: 'https://www.bilibili.com/video/BV1FvWCeGEX8', duration: 2 },
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
  officeSkillsTree,
  vibeCodingTree,
  speechExpressionTree,
  videoEditingTree,
  advancedMathTree,
  collegeCSTree,
  linearAlgebraTree,
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
