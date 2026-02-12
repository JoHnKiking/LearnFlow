# LearnFlow 游戏化学习应用架构设计

## 1. 应用概述

LearnFlow 是一款将学习过程游戏化的应用，通过探险、怪物互动和知识解锁等机制，帮助用户更有动力地学习特定领域的知识。

### 核心玩法

1. **领域模块选择** - 用户选择要学习的知识领域
2. **探险地图生成** - AI 生成对应领域的探险地图
3. **怪物形象生成** - AI 生成具有个性的怪物形象
4. **学习资源解锁** - 通过探险解锁学习资源
5. **知识图谱** - 逐步点亮整个知识图谱
6. **成就系统** - 完成学习后解锁怪物故事和形象
7. **怪物互动** - 与怪物打字对话，怪物有独立个性
8. **资源管理** - 体力值和精力值系统
9. **恢复机制** - 小游戏和记忆触发恢复
10. **付费系统** - 解锁领域和购买体力

## 2. 技术架构

### 2.1 技术栈

- **前端**：React Native + Expo + TypeScript
- **状态管理**：React Context API + useReducer
- **路由**：Expo Router
- **AI 集成**：Kimi API (使用提供的 API Key)
- **存储**：AsyncStorage (本地存储)
- **支付**：待集成支付SDK
- **UI**：像素风格组件库

### 2.2 核心模块

| 模块 | 职责 | 文件位置 |
|------|------|----------|
| 认证模块 | 用户登录、注册 | `app/auth/` |
| 领域模块 | 领域选择、解锁 | `app/domains/` |
| 探险模块 | 地图生成、探索 | `app/explore/` |
| 学习模块 | 资源解锁、学习 | `app/learn/` |
| 怪物模块 | 怪物生成、对话 | `app/monster/` |
| 成就模块 | 成就系统、进度 | `app/achievements/` |
| 资源模块 | 体力、精力管理 | `app/resources/` |
| 付费模块 | 支付系统、购买 | `app/payment/` |
| 游戏模块 | 小游戏、恢复机制 | `app/games/` |

## 3. 数据模型

### 3.1 核心数据结构

#### 用户数据
```typescript
interface User {
  id: string;
  name: string;
  coins: number; // 游戏货币
  unlockedDomains: string[]; // 已解锁的领域
  totalPlayTime: number; // 总游戏时间
  achievements: string[]; // 已获得的成就
}
```

#### 领域数据
```typescript
interface Domain {
  id: string;
  name: string;
  description: string;
  price: number; // 解锁价格
  knowledgeGraph: KnowledgeNode[];
  monsters: Monster[];
  imageUrl: string; // 领域封面图
}
```

#### 知识节点
```typescript
interface KnowledgeNode {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  isUnlocked: boolean;
  position: { x: number; y: number }; // 图谱中的位置
  prerequisites: string[]; // 前置节点ID
}
```

#### 学习资源
```typescript
interface Resource {
  id: string;
  type: 'video' | 'article' | 'quiz';
  title: string;
  url: string;
  duration: number; // 学习时长（分钟）
  isCompleted: boolean;
}
```

#### 怪物数据
```typescript
interface Monster {
  id: string;
  name: string;
  personality: string; // 性格描述
  dialogues: Dialogue[];
  imageUrl: string; // AI生成的形象
  story: string; // 解锁后的故事
  isUnlocked: boolean;
}
```

#### 对话数据
```typescript
interface Dialogue {
  id: string;
  text: string;
  type: 'greeting' | 'encouragement' | 'discouragement' | 'rest' | 'random';
  condition?: string; // 触发条件
}
```

#### 资源系统
```typescript
interface UserResources {
  stamina: number; // 体力值
  energy: number; // 精力值
  lastRecovery: number; // 上次恢复时间
  maxStamina: number;
  maxEnergy: number;
}
```

## 4. 核心功能实现

### 4.1 AI 集成

#### Kimi API 集成

```typescript
// api/kimi.ts
const KIMI_API_KEY = 'sk-u4FUU0Xt2pqjLIv5iA7jdPYEC9aAvMEhtJ86jP1GHFbDuv8I';

// 生成怪物形象
export async function generateMonsterImage(prompt: string): Promise<string> {
  // 调用 Kimi API 生成怪物形象
}

// 生成探险地图
export async function generateAdventureMap(domain: string): Promise<MapData> {
  // 调用 Kimi API 生成探险地图
}

// 生成怪物对话
export async function generateMonsterDialogue(personality: string, context: string): Promise<string> {
  // 调用 Kimi API 生成对话
}
```

### 4.2 游戏化核心流程

1. **启动流程**
   - 检查用户状态
   - 加载已解锁领域
   - 初始化资源系统

2. **领域选择流程**
   - 显示可用领域
   - 处理领域解锁/购买
   - 进入选中领域

3. **探险流程**
   - 生成/加载探险地图
   - 处理用户移动
   - 触发事件和怪物
   - 解锁知识节点

4. **学习流程**
   - 显示解锁的学习资源
   - 处理资源学习完成
   - 更新知识图谱状态

5. **怪物互动流程**
   - 触发怪物对话
   - 处理用户输入
   - 生成怪物回应
   - 更新怪物状态

6. **资源管理流程**
   - 消耗体力和精力
   - 触发恢复机制
   - 处理资源购买

### 4.3 小游戏实现

| 游戏类型 | 用途 | 实现方式 |
|---------|------|----------|
| 下棋 | 恢复体力 | 简单五子棋实现 |
| 华容道 | 恢复精力 | 滑块拼图实现 |
| 海龟汤 | 恢复资源 | 文字推理游戏 |
| 记忆触发 | 恢复资源 | 文字记忆游戏 |

## 5. UI/UX 设计

### 5.1 设计风格

- **主风格**：像素风
- **色彩方案**：明亮活泼的色彩
- **字体**：像素风格字体
- **图标**：8-bit 风格图标
- **动画**：复古游戏风格动画

### 5.2 核心界面

1. **启动界面** - 像素风格 Logo 和动画
2. **主菜单** - 领域选择、成就、商店
3. **领域界面** - 知识图谱概览
4. **探险界面** - 像素风格地图和角色
5. **学习界面** - 资源展示和学习
6. **怪物界面** - 怪物对话和互动
7. **资源界面** - 体力精力管理
8. **商店界面** - 付费解锁和购买

### 5.3 参考设计

参考 GitHub Game Off 2025 获奖作品的像素风格：
- 参考作品 1、3、6 的画风和游戏板块设计
- 链接：https://github.blog/open-source/gaming/light-waves-rising-tides-and-drifting-ships-game-off-2025-winners/#h-8-ooqo

## 6. 商业模式

### 6.1 付费点

1. **初始解锁** - 一次性付费 6 元解锁基础游戏
2. **领域解锁** - 每个领域模块 6 元
3. **体力购买** - 用钱购买体力值
4. **加速恢复** - 购买恢复加速道具

### 6.2 免费内容

- 基础游戏体验
- 部分领域的试玩
- 每日免费体力恢复
- 基础小游戏

## 7. 开发计划

### 7.1 MVP 阶段

1. **前置准备**
   - 构建 AI 知识图谱
   - 寻找对应的学习视频资源

2. **核心功能**
   - 领域选择界面
   - 基础探险地图
   - 简单怪物对话
   - 学习资源解锁
   - 基础知识图谱

3. **技术实现**
   - 集成 Kimi API
   - 实现核心游戏逻辑
   - 构建像素风格 UI

### 7.2 后续阶段

1. **功能完善**
   - 高级 AI 生成
   - 完整成就系统
   - 多样化小游戏
   - 付费系统集成

2. **内容扩展**
   - 更多领域模块
   - 丰富怪物形象
   - 扩展知识图谱

3. **优化改进**
   - 性能优化
   - 用户体验改进
   - 内容更新机制

## 8. 技术风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| AI 生成速度慢 | 用户体验差 | 实现缓存机制，预生成部分内容 |
| 支付集成复杂 | 商业模式受阻 | 分阶段集成，先实现核心功能 |
| 游戏平衡性 | 学习体验不佳 | 持续测试和调整游戏参数 |
| 内容质量 | 学习效果受影响 | 人工审核和优化 AI 生成内容 |

## 9. 总结

LearnFlow 游戏化学习应用通过将学习过程转化为有趣的探险体验，结合 AI 生成的个性化内容，为用户提供了一种全新的学习方式。这种方法不仅能提高用户的学习动力，还能通过游戏机制帮助用户更好地记忆和理解知识。

通过模块化的技术架构和清晰的开发计划，我们可以逐步实现这个创新的学习应用，为用户带来既有趣又有效的学习体验。