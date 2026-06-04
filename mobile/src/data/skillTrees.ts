import { SkillTree, StageType } from '../types/skill';

const PLATFORM_MAP = {
  'B站': 'bilibili',
  '网站': 'other',
  'MOOC': 'mooc',
  'Coursera': 'other',
  'YouTube': 'other',
  'App': 'other',
  '阅读': 'other',
  '实操': 'other',
} as const;

// ================================================================
// 模块一：AI 产品经理
// 总时长约 19.5h，三阶段：觉醒→锻造→出师
// ================================================================

export const aiProductManagerTree: SkillTree = {
  id: 'ai-product-manager',
  domain: 'ai-product-manager',
  title: 'AI产品经理',
  description: '从零掌握AI产品核心能力，含Prompt工程、RAG、Agent三大兵器',
  totalDuration: 20,
  learningMethod: '1. 先看吴恩达AI For Everyone建立认知；2. 李宏毅第1-2讲快速理解大模型；3. DeepLearning.AI学Prompt工程；4. 最终用Coze/Dify搭建一个AI Bot作为毕业作品',
  learningGoal: '能独立分析AI产品方案、写出合格PRD、理解RAG/Agent/Prompt三大技术栈的区别与选型，用低代码平台搭建可演示的AI原型',
  frameworkExplanation: '一阶觉醒：搞懂AI是什么、AI PM分几类、大模型怎么work → 二阶锻造：掌握Prompt工程、RAG检索增强、Agent智能体的原理与差异 → 三阶出师：独立完成AI产品PRD + 搭建原型 + 了解合规红线',
  stages: [
    {
      id: 'beginner',
      name: '一阶·觉醒',
      duration: 6,
      nodes: [
        {
          id: 'ai-for-everyone',
          name: '吴恩达《AI For Everyone》第1周',
          description: '只看Week1：什么是AI、能做什么不能做、AI项目流程',
          stage: 'beginner',
          platform: PLATFORM_MAP['Coursera'],
          url: 'https://www.coursera.org/learn/ai-for-everyone',
          duration: 2,
        },
        {
          id: 'lee-llm-intro',
          name: '李宏毅2024·生成式AI导论(第1-2讲)',
          description: '第1讲「生成式AI是什么」29min + 第2讲「生成式AI厉害在哪」26min',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1XS411w7qr',
          duration: 1,
        },
        {
          id: 'ai-pm-types',
          name: 'AI产品经理分类图谱+差异化路径',
          description: '阅读人人PM·AI专栏3篇：《AI PM入门》《大模型产品设计范式》《2B vs 2C AI产品差异》，理解算法型PM/应用型PM/平台型PM的区别',
          stage: 'beginner',
          platform: PLATFORM_MAP['网站'],
          url: 'https://www.woshipm.com/ai',
          duration: 3,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '二阶·锻造',
      duration: 7,
      nodes: [
        {
          id: 'prompt-engineering',
          name: 'Prompt工程实战(DeepLearning.AI)',
          description: '免费课程全部9节(1.5h)：角色设定、Few-shot、思维链、结构化输出。学完用ChatGPT/DeepSeek做3种Prompt实验',
          stage: 'intermediate',
          platform: PLATFORM_MAP['Coursera'],
          url: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers',
          duration: 3,
        },
        {
          id: 'rag-tutorial',
          name: 'RAG检索增强生成·快速入门',
          description: 'LangChain官方RAG Tutorial跟做一遍：文档切片→向量化→检索→生成。理解RAG解决了什么问题(幻觉/知识时效)，适合什么场景(客服/知识库/文档问答)',
          stage: 'intermediate',
          platform: PLATFORM_MAP['网站'],
          url: 'https://python.langchain.com/docs/tutorials/rag',
          duration: 2,
        },
        {
          id: 'agent-intro',
          name: 'AI Agent智能体通识+选型指南',
          description: '看李宏毅第4讲(47min)理解Agent原理，再看Dify官方文档Quickstart了解Agent搭建流程。掌握RAG vs Agent的选型差异：RAG=给AI装知识库，Agent=让AI会用工具',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1XS411w7qr',
          duration: 2,
        },
      ],
    },
    {
      id: 'advanced',
      name: '三阶·出师',
      duration: 7,
      nodes: [
        {
          id: 'ai-prd-practice',
          name: 'AI产品PRD实战撰写',
          description: '自选一个场景(如AI客服助手/AI写作搭档/AI代码审查)，写一份简版PRD：用户痛点→解决方案→功能描述→技术选型(RAG or Agent)→上线指标',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: 'https://www.woshipm.com/ai',
          duration: 3,
        },
        {
          id: 'build-ai-bot',
          name: '用Coze/Dify搭建AI Bot原型',
          description: '选Coze或Dify任一平台，搭建一个可用的AI Bot(如「日语学习搭子」)：配置System Prompt→挂载知识库→设置工具调用→公开链接分享给朋友测试',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: 'https://www.coze.com',
          duration: 3,
        },
        {
          id: 'ai-compliance',
          name: 'AI合规速览：欧盟AI法案+中国监管',
          description: '10分钟速读欧盟AI Act摘要 + 中国《生成式AI服务管理办法》要点。理解分级监管(不可接受风险/高风险/有限风险/最小风险)和国内备案要求',
          stage: 'advanced',
          platform: PLATFORM_MAP['网站'],
          url: 'https://artificialintelligenceact.eu',
          duration: 1,
        },
      ],
    },
  ],
};

// ================================================================
// 模块二：个人理财
// 总时长约 20.5h，三阶段：觉醒→锻造→出师
// ================================================================

export const personalFinanceTree: SkillTree = {
  id: 'personal-finance',
  domain: 'personal-finance',
  title: '个人理财',
  description: '从零建立理财体系：记账→安全配置→基金定投',
  totalDuration: 21,
  learningMethod: '1. MOOC《个人理财》1-2章打基础；2. 开随手记App同步记账；3. 支付宝买100元货币基金体验；4. 读完《小狗钱钱》+《穷查理宝典》部分章节',
  learningGoal: '能独立做家庭财务盘点、完成保险+基金配置方案、开始指数基金定投，形成长期理财习惯',
  frameworkExplanation: '一阶觉醒：建立复利思维+开始记账 → 二阶锻造：理解保险配置+货币基金→ 三阶出师：指数定投实操+完成资产配置计划书',
  stages: [
    {
      id: 'beginner',
      name: '一阶·觉醒',
      duration: 6,
      nodes: [
        {
          id: 'finance-mooc',
          name: '对外经贸大学MOOC《个人理财》第1-2章',
          description: '只看前两章：理财观念+家庭财务报表(跳过纯理论)，约2h。理解资产vs负债、复利公式',
          stage: 'beginner',
          platform: PLATFORM_MAP['MOOC'],
          url: 'https://www.icourse163.org/course/UIBE-1206453822',
          duration: 2,
        },
        {
          id: 'book-dog-money',
          name: '《小狗钱钱》精读+复利思维训练',
          description: '读前5章(约100页，2h)：梦想储蓄罐、成功日记、金蛋与鹅。用复利计算器算一下：每月存2000，年化8%，30年后是多少?',
          stage: 'beginner',
          platform: PLATFORM_MAP['阅读'],
          url: '',
          duration: 2,
        },
        {
          id: 'start-budgeting',
          name: '下载随手记App，开始记账',
          description: '实操：下载随手记→自定义分类→记录当天全部支出→持续到模块结束。目标：搞清楚每个月钱花哪了',
          stage: 'beginner',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '二阶·锻造',
      duration: 8,
      nodes: [
        {
          id: 'insurance-guide',
          name: 'B站「保险避坑指南」P1-P4',
          description: '重疾险怎么买、医疗险避坑、意外险怎么选、教育金是智商税吗？学完画一张家庭保险四象限图',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1G9VH6XEsY',
          duration: 2,
        },
        {
          id: 'fund-documentary',
          name: '央视《基金》纪录片(上篇)+货币基金对比',
          description: '看纪录片上半部分了解基金起源。然后实操：打开支付宝理财，对比3只货币基金(7日年化/费率/规模)，挑最好的买100元体验',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1FJ4m1T7Cg',
          duration: 3,
        },
        {
          id: 'emergency-plan',
          name: '家庭应急金规划+低风险组合实操',
          description: '计算3-6个月生活费的应急金额→分配：50%货币基金+30%短债基金+20%活期→在支付宝完成配置',
          stage: 'intermediate',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 3,
        },
      ],
    },
    {
      id: 'advanced',
      name: '三阶·出师',
      duration: 7,
      nodes: [
        {
          id: 'index-fund-investing',
          name: 'B站「指数基金定投指南」P1-P5',
          description: '什么是指数基金→为什么要定投→选什么指数(沪深300/中证500)→怎么止盈→实操演示。学完在支付宝设置一笔每月200的定投计划',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1hP4y1n7GB',
          duration: 3,
        },
        {
          id: 'book-poor-charlie',
          name: '《穷查理宝典》第1-100页',
          description: '重点看芒格投资理念和人类误判心理学。不需要全读完，选3个最触动你的思维模型做笔记',
          stage: 'advanced',
          platform: PLATFORM_MAP['阅读'],
          url: '',
          duration: 2,
        },
        {
          id: 'asset-plan',
          name: '完成个人资产配置计划书',
          description: '综合所学输出一份计划：现有资产盘点→风险测评→保险配置→基金定投方案→年度复盘机制。1000字即可',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
  ],
};

// ================================================================
// 模块三：英语无障碍沟通
// 总时长约 21h，三阶段：觉醒→锻造→出师
// ================================================================

export const englishCommunicationTree: SkillTree = {
  id: 'english-communication',
  domain: 'english-communication',
  title: '英语无障碍沟通',
  description: '开口→听懂→实战，三阶告别哑巴英语',
  totalDuration: 21,
  learningMethod: '1. 每天B站音标跟读15min；2. BBC 6 Minute English精听每周3篇；3. English with Lucy学日常表达；4. 最终用HelloTalk找老外实战3次',
  learningGoal: '能开口做英文自我介绍、听懂慢速英语播客、用英语完成日常购物/点餐/电话沟通，最终用HelloTalk和老外聊上半小时',
  frameworkExplanation: '一阶觉醒：纠正发音+听慢速→二阶锻造：精听BBC+模仿母语者日常对话→三阶出师：职场英语+找老外实战',
  stages: [
    {
      id: 'beginner',
      name: '一阶·觉醒',
      duration: 7,
      nodes: [
        {
          id: 'phonetics',
          name: 'B站「美式音标完整纠正」P1-P10',
          description: '44个音标逐一跟读，重点练L/R/Th/æ这些中文没有的音。每个视频约3分钟，10个共30min，配合反复跟读练习',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1Ji4y1P7Lu',
          duration: 2,
        },
        {
          id: 'voa-slow',
          name: 'VOA Learning English Level1 跟读5篇',
          description: '选5篇你感兴趣的话题(科技/健康/文化)。每篇：听一遍→看文本→逐句跟读→手机录音→对比原文找差距。每篇约30min',
          stage: 'beginner',
          platform: PLATFORM_MAP['网站'],
          url: 'https://learningenglish.voanews.com',
          duration: 3,
        },
        {
          id: 'self-intro',
          name: '录制一份英文自我介绍',
          description: '写100字自我介绍→背下来→录音→不满意就重录→发到朋友圈或小红书求反馈→迭代到第3版。开口比完美更重要',
          stage: 'beginner',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '二阶·锻造',
      duration: 7,
      nodes: [
        {
          id: 'bbc-six-minute',
          name: 'BBC 6 Minute English 精听10篇',
          description: '选10个你感兴趣的话题(每篇6分钟)。三步法：①盲听抓大意 ②看Transcript逐句听 ③影子跟读(听一句跟一句)。每篇约20min，10篇=3h',
          stage: 'intermediate',
          platform: PLATFORM_MAP['网站'],
          url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
          duration: 3,
        },
        {
          id: 'english-with-lucy',
          name: 'YouTube「English with Lucy」日常篇5集',
          description: '看5个精选视频：How to sound polite、Stop saying "very"、Shopping English、Restaurant English、Phone English。每个约15min，跟读3遍',
          stage: 'intermediate',
          platform: PLATFORM_MAP['YouTube'],
          url: 'https://www.youtube.com/@EnglishwithLucy',
          duration: 2,
        },
        {
          id: 'friends-practice',
          name: '《Friends》S1E1 无字幕挑战',
          description: '关字幕看一遍→开英文字幕看一遍→挑5句经典台词逐句模仿语调→录下来和原声对比。一集22min，反复练够2h',
          stage: 'intermediate',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
    {
      id: 'advanced',
      name: '三阶·出师',
      duration: 7,
      nodes: [
        {
          id: 'business-english',
          name: '电子科技大学MOOC《职场沟通英语》第1-3章',
          description: '直接学可套用的模板：英文邮件万能句式、电话会议话术、Presentation结构。不需要全部看完，找你有用的模板记下来',
          stage: 'advanced',
          platform: PLATFORM_MAP['MOOC'],
          url: 'https://www.icourse163.org/course/UESTC-1001754007',
          duration: 2,
        },
        {
          id: 'ted-shadow',
          name: 'TED演讲影子跟读训练',
          description: '选1篇你喜欢的(推荐《The Power of Introverts》19min)。逐句暂停→模仿语速/语调/停顿→录音对比→重复直到流畅。不追求完美，追求自然',
          stage: 'advanced',
          platform: PLATFORM_MAP['网站'],
          url: 'https://www.ted.com/talks',
          duration: 2,
        },
        {
          id: 'hellotalk-practice',
          name: 'HelloTalk找3位母语者实战对话',
          description: '注册→完善profile→发Moments吸引关注→主动找3位母语者→每人聊至少1次(文字+语音)→记录对方纠正你的表达。不怕犯错，实战是唯一捷径',
          stage: 'advanced',
          platform: PLATFORM_MAP['App'],
          url: 'https://www.hellotalk.com',
          duration: 3,
        },
      ],
    },
  ],
};

// ================================================================
// 模块四：编程基础（面向大学生零基础）
// 总时长约 20h，三阶段：觉醒→锻造→出师
// ================================================================

export const programmingBasicsTree: SkillTree = {
  id: 'programming-basics',
  domain: 'programming-basics',
  title: '编程基础',
  description: '零基础入门编程：计算思维→Python语法→小项目实战',
  totalDuration: 20,
  learningMethod: '1. B站Python教程跟敲代码；2. 菜鸟教程在线动手练；3. 每学完一章在LeetCode做3道简单题巩固；4. 最后完成一个小项目作为结业作品',
  learningGoal: '掌握Python基础语法、理解变量/循环/函数三大核心概念、能在LeetCode做简单题、独立完成命令行小工具',
  frameworkExplanation: '一阶觉醒：建立编程思维+Python基础语法→二阶锻造：数据结构+简单算法+调试能力→三阶出师：Git入门+代码规范+小型项目实战',
  stages: [
    {
      id: 'beginner',
      name: '一阶·觉醒',
      duration: 6,
      nodes: [
        {
          id: 'python-basics-video',
          name: 'B站「Python零基础教程」P1-P15',
          description: '跟学前15讲：环境安装→Hello World→变量→数据类型→条件判断→循环→列表→字典→函数→文件操作。每讲约15min，边看边在本地IDE敲一遍',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1qW4y1a7fU',
          duration: 2,
        },
        {
          id: 'python-practice-online',
          name: '菜鸟教程Python3在线练习',
          description: '跟着教程把基础语法全部敲一遍：字符串操作→列表推导式→字典遍历→函数参数→异常处理。在线运行不用装环境，适合碎片时间',
          stage: 'beginner',
          platform: PLATFORM_MAP['网站'],
          url: 'https://www.runoob.com/python3/python3-tutorial.html',
          duration: 2,
        },
        {
          id: 'algorithm-thinking',
          name: '计算思维入门+LeetCode第1题',
          description: '先看《计算思维》科普文章理解"拆解→模式识别→抽象→算法"四步法。然后在LeetCode做人生第一道题「两数之和」，学会看题解和调试',
          stage: 'beginner',
          platform: PLATFORM_MAP['网站'],
          url: 'https://leetcode.cn/problems/two-sum/',
          duration: 2,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '二阶·锻造',
      duration: 7,
      nodes: [
        {
          id: 'data-structures',
          name: 'B站「数据结构与算法」P1-P8入门',
          description: '只看前8讲：数组→链表→栈→队列→哈希表→二叉树→排序→搜索。每个视频约15min，重点理解概念和适用场景，不用手写实现',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV12a411i7Hd',
          duration: 2,
        },
        {
          id: 'leetcode-easy',
          name: 'LeetCode简单题5道精练',
          description: '做以下5题：①回文数 ②罗马数字转整数 ③有效的括号 ④合并两个有序链表 ⑤二叉树的中序遍历。每题先自己想10min→看题解→独立敲出来→提交通过',
          stage: 'intermediate',
          platform: PLATFORM_MAP['网站'],
          url: 'https://leetcode.cn/problemset/all/?difficulty=EASY',
          duration: 3,
        },
        {
          id: 'debugging-skills',
          name: '调试技巧+常见Bug排查',
          description: '学习Print调试法→断点调试→异常栈分析。故意写3个有Bug的代码片段，用调试工具找出问题。推荐VSCode内置调试器',
          stage: 'intermediate',
          platform: PLATFORM_MAP['网站'],
          url: 'https://code.visualstudio.com/docs/editor/debugging',
          duration: 2,
        },
      ],
    },
    {
      id: 'advanced',
      name: '三阶·出师',
      duration: 7,
      nodes: [
        {
          id: 'git-intro',
          name: 'Git/GitHub 20分钟极速入门',
          description: '学完以下操作：git init→add→commit→push→clone→pull。在GitHub创建一个仓库并把你的项目代码传上去。推荐廖雪峰Git教程前5节',
          stage: 'advanced',
          platform: PLATFORM_MAP['网站'],
          url: 'https://www.liaoxuefeng.com/wiki/896043488029600',
          duration: 2,
        },
        {
          id: 'mini-project',
          name: '命令行小项目：待办清单管理器',
          description: '用Python写一个命令行TODO List：支持添加/完成/删除/查看/持久化(存JSON文件)。写完发到GitHub仓库。这是最好的结业项目',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 3,
        },
        {
          id: 'code-style',
          name: 'PEP8代码规范+Code Review',
          description: '阅读PEP8规范摘要(10分钟)。然后打开你之前写的代码，逐行检查并重构：变量命名→函数长度→注释→空行→导入顺序。养成好习惯',
          stage: 'advanced',
          platform: PLATFORM_MAP['网站'],
          url: 'https://pep8.org',
          duration: 2,
        },
      ],
    },
  ],
};

// ================================================================
// 模块五：理财入门（面向大学生的零基础理财）
// 总时长约 19h，三阶段：觉醒→锻造→出师
// ================================================================

export const financeBasicsTree: SkillTree = {
  id: 'finance-basics',
  domain: 'finance-basics',
  title: '理财入门',
  description: '大学生专属理财第一课：记账→攒钱→让零花钱生钱',
  totalDuration: 19,
  learningMethod: '1. B站大学生理财系列打基础；2. 下载随手记App开始记账；3. 支付宝买10元货币基金体验钱生钱；4. 读完《小狗钱钱》建立理财观',
  learningGoal: '养成记账习惯、理解复利和资产配置基本概念、能管理好自己的生活费、开始第一笔基金定投',
  frameworkExplanation: '一阶觉醒：建立理财观念+开始记账+理解零花钱管理→二阶锻造：认识基金/股票/保险基础+风险测评+实操买基金→三阶出师：做一份个人理财计划书+为毕业后的财务独立做准备',
  stages: [
    {
      id: 'beginner',
      name: '一阶·觉醒',
      duration: 6,
      nodes: [
        {
          id: 'student-finance-video',
          name: 'B站「大学生理财入门」系列P1-P6',
          description: '看前6集：大学生为什么要理财→分清"需要"和"想要"→零花钱怎么分→什么是复利→记账的魔力→大学生常见消费陷阱。每集约8min',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1QtVD6AEiM',
          duration: 2,
        },
        {
          id: 'start-budget-book',
          name: '《小狗钱钱》精读前5章',
          description: '读前5章：梦想储蓄罐→成功日记→金蛋与鹅→债务：不要杀死你的鹅→金钱魔法。约100页，做读书笔记。微信读书免费阅读（需下载微信读书App），也可自行搜索资源',
          stage: 'beginner',
          platform: PLATFORM_MAP['阅读'],
          url: 'https://yd.qq.com/web/bookDetail/923322b0811e202c4g0134e5',
          duration: 2,
        },
        {
          id: 'start-budgeting-student',
          name: '下载随手记App开始记账30天',
          description: '下载随手记→设置大学生专属分类(食堂/奶茶/交通/购物/娱乐)→记录每天每一笔支出→周末复盘。目标：30天后知道钱都花哪了',
          stage: 'beginner',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '二阶·锻造',
      duration: 7,
      nodes: [
        {
          id: 'fund-basics',
          name: 'B站「基金入门」P1-P4',
          description: '什么是基金→货币基金/债券基金/股票基金区别→基金定投是什么→怎么选基金。学完打开支付宝理财看看你的风险测评等级',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1H75Q6XEFb',
          duration: 2,
        },
        {
          id: 'buy-first-fund',
          name: '买人生第一只基金（10元起步）',
          description: '打开支付宝→理财→基金→搜索"天弘余额宝货币"→买入10元体验。感受t+1到账、每日收益、万份收益这些概念。实际操作才能真理解',
          stage: 'intermediate',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 1,
        },
        {
          id: 'insurance-basics',
          name: '大学生保险认知：医保就够了？',
          description: '理解大学生医保覆盖范围→商业保险补充哪些→警惕校园"保险"推销陷阱。B站搜索"大学生医保"看2-3个科普视频。重点：不买贵的只买对的',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1G9VH6XEsY',
          duration: 2,
        },
        {
          id: 'p2p-trap',
          name: '大学生理财防骗指南',
          description: '认清校园贷/杀猪盘/P2P/虚拟货币炒作的本质。B站看1集反诈科普视频。记住一条铁律：年化收益超过6%就要打问号，超过10%就有本金损失风险',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1ZQVq6uE6R',
          duration: 2,
        },
      ],
    },
    {
      id: 'advanced',
      name: '三阶·出师',
      duration: 6,
      nodes: [
        {
          id: 'investment-plan',
          name: '制定个人理财计划书',
          description: '综合所学写一份计划书(500字)：每月生活费分配方案→储蓄目标→基金定投计划→防骗清单。写到备忘录里，每月对照执行',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
        {
          id: 'index-fund-basics',
          name: '指数基金定投：每月100元开始',
          description: '理解沪深300/中证500/科创50是什么。在支付宝设置每月自动定投100元到沪深300指数基金。不用管涨跌，坚持到毕业看结果',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1H75Q6XEFb',
          duration: 2,
        },
        {
          id: 'graduate-finance',
          name: '毕业后的财务过渡清单',
          description: '准备毕业后的财务规划：租房预算→社保公积金了解→工资到手怎么分配→信用卡使用原则→第一份保险。提前1年了解，毕业不慌',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
  ],
};

// ================================================================
// 模块六：四六级过关（面向大学生的CET-4/6备考）
// 总时长约 20h，三阶段：觉醒→锻造→出师
// ================================================================

export const cetExamTree: SkillTree = {
  id: 'cet-exam',
  domain: 'cet-exam',
  title: '四六级过关',
  description: '大学生英语四六级备考：词汇→听力→阅读→写作→翻译全攻略',
  totalDuration: 20,
  learningMethod: '1. 百词斩每天背30个核心高频词；2. B站听力真题精听训练；3. 写作模板背诵+仿写；4. 考前刷3套真题卷',
  learningGoal: '四六级500+：听力听懂关键信息、阅读速度达100词/分钟、写作能用模板写出180词短文、翻译能准确完成中译英段落',
  frameworkExplanation: '一阶觉醒：高频词汇积累+听力/阅读基础扫盲→二阶锻造：听力精听+阅读快速定位+写作模板+翻译技巧→三阶出师：真题冲刺+错题复盘+考试策略',
  stages: [
    {
      id: 'beginner',
      name: '一阶·觉醒',
      duration: 6,
      nodes: [
        {
          id: 'cet-vocab',
          name: '百词斩四六级高频词 前300词',
          description: '每天30个新词+复习前一天的。用百词斩App背，配合例句记忆。第一周目标：完成300个核心高频词，能中英互译',
          stage: 'beginner',
          platform: PLATFORM_MAP['App'],
          url: 'https://www.baicizhan.com',
          duration: 2,
        },
        {
          id: 'listening-basics',
          name: 'B站「四六级备考」听力基础篇',
          description: '跟学：题型介绍→短篇新闻→长对话→听力篇章→听写技巧。在该系列中找"听力导学"相关章节，学完直接做10道真题测试水平',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 2,
        },
        {
          id: 'reading-basics',
          name: '长难句分析+快速阅读训练',
          description: '学完：定语从句→名词性从句→倒装→被动语态→长难句拆解法。然后做3篇快速阅读限时训练(15min/篇)',
          stage: 'beginner',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 2,
        },
      ],
    },
    {
      id: 'intermediate',
      name: '二阶·锻造',
      duration: 7,
      nodes: [
        {
          id: 'listening-intensive',
          name: '听力真题精听训练（5套）',
          description: '选5套历年真题听力。三步精听法：①盲听做题 ②看transcript逐句听 ③跟读模仿语速。每套约40min',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 2,
        },
        {
          id: 'reading-skills',
          name: '阅读理解技巧：定位+排除+主旨',
          description: '学完三大题型解题技巧：选词填空→长篇阅读匹配→仔细阅读。口诀：先题后文、定位关键词、排除干扰项、抓主旨句。做10道真题练手',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 2,
        },
        {
          id: 'writing-template',
          name: '写作模板+万能句式背诵',
          description: '背熟3套万能模板：议论文(现象分析)→应用文(书信/通知)→图表作文。每套模板含开头/正文/结尾各2-3个句式。背完写2篇真题作文',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 2,
        },
        {
          id: 'translation-skills',
          name: '翻译技巧：中译英三步法',
          description: '学会三步法：拆解中文意群→找主干→逐层翻译。练习10个真题翻译句：传统文化→社会发展→科技环保→教育就业。重点：不求信达雅，求准确完整',
          stage: 'intermediate',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 1,
        },
      ],
    },
    {
      id: 'advanced',
      name: '三阶·出师',
      duration: 7,
      nodes: [
        {
          id: 'mock-test-1',
          name: '真题模拟卷1 + 错题复盘',
          description: '按考试时间完整做一套真题（听力25min+阅读40min+翻译30min+写作30min→约2h）。做完逐题对答案，错题标出原因：词汇不懂/技巧不会/粗心',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
        {
          id: 'mock-test-2',
          name: '真题模拟卷2 + 针对性补弱',
          description: '再做一套真题，重点练习模拟卷1中暴露的弱项。如果听力弱就多做精听，阅读弱就多练定位。目标：第二套比第一套多20分',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
        {
          id: 'exam-strategy',
          name: '考前冲刺+考试策略制定',
          description: '最后冲刺：①重看所有错题 ②熟记写作模板 ③背熟黄金100句 ④制定答题顺序策略(先做擅长的) ⑤准备考试物品清单。心态：能做完就是胜利',
          stage: 'advanced',
          platform: PLATFORM_MAP['B站'],
          url: 'https://www.bilibili.com/video/BV1AbuBznE4c',
          duration: 1,
        },
        {
          id: 'score-estimate',
          name: '估分+查漏补缺',
          description: '用评分标准给自己估分：听力35%×得分率+阅读35%×得分率+翻译15%×得分率+写作15%×得分率。低于425的模块标记为"重点突破"',
          stage: 'advanced',
          platform: PLATFORM_MAP['实操'],
          url: '',
          duration: 2,
        },
      ],
    },
  ],
};

export const skillTrees: SkillTree[] = [
  aiProductManagerTree,
  personalFinanceTree,
  englishCommunicationTree,
  programmingBasicsTree,
  financeBasicsTree,
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

export const PLATFORM_NAME_MAP: Record<string, string> = {
  bilibili: 'B站',
  xiaohongshu: '小红书',
  mooc: 'MOOC',
  other: '其他',
};
