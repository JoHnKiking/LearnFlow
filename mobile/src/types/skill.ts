export type PlatformType = 'bilibili' | 'xiaohongshu' | 'mooc';

export type StageType = 'beginner' | 'intermediate' | 'advanced';

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  stage: StageType;
  platform: PlatformType;
  url: string;
  duration: number;
  children?: SkillNode[];
}

export interface SkillTree {
  id: string;
  domain: string;
  title: string;
  description: string;
  stages: SkillStage[];
  totalDuration: number;
  learningMethod: string;
  learningGoal: string;
  frameworkExplanation: string;
}

export interface SkillStage {
  id: StageType;
  name: string;
  duration: number;
  nodes: SkillNode[];
}

export interface SkillLink {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'documentation';
}

export interface SkillTreeRequest {
  domain: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

// 认证相关类型
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  type: 'email' | 'wechat';
  email?: string;
  password?: string;
  wechatCode?: string;
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
}

export interface UserResponse {
  id: number;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatarUrl?: string;
  loginCount: number;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface MonsterSetupRequest {
  userId: number;
  name: string;
  style?: string;
  personality: 'lively' | 'calm' | 'rebel';
}

export interface MonsterResponse {
  id: number;
  name: string;
  style: string;
  level: number;
  exp: number;
  stamina: number;
  maxStamina: number;
  energy: number;
  maxEnergy: number;
  personality: 'lively' | 'calm' | 'rebel';
  personalityParams?: Record<string, number>;
  lastEnergyRecover?: Date;
  lastStaminaRecover?: Date;
}

// 聊天相关类型
export interface MonsterChatRequest {
  userId: number;
  message: string;
}

export interface MonsterChatResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface MonsterMessageItem {
  id: number;
  userId: number;
  message: string;
  isUser: boolean;
  createdAt: string;
}

export interface MonsterMessagesResponse {
  success: boolean;
  data: {
    messages: MonsterMessageItem[];
  };
}

// ============================================================
// 笔记相关类型
// 对应服务端 noteController / noteRoutes（POST/GET/PUT /api/notes/*）
// ============================================================

/** 创建笔记请求 */
export interface CreateNoteRequest {
  userId: number;
  date: string;       // ISO 日期字符串，如 '2026-05-23'
  content?: string;   // 笔记内容（可选）
}

/** 更新笔记请求 */
export interface UpdateNoteRequest {
  noteId: number;
  content?: string;   // 新的笔记内容
}

/** 笔记数据（服务端返回） */
export interface Note {
  id: number;
  user_id: number;
  date: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// 奖励相关类型
// 对应服务端 rewardController / rewardRoutes（POST/GET /api/rewards/*）
//
// 奖励类型仅支持 stamina（体力）和 energy（能量），不支持经验值
// 奖励来源仅两种：
//   - node_complete: 完成学习节点，时间长短对应不同奖励
//   - game_win: 小游戏胜利获得奖励
//
// 注意：叛逆型小怪的游戏奖励会在调用前由移动端将 amount 乘以 2，
//       rewardService 只做如实记录，不再二次翻倍
// ============================================================

/** 奖励类型：体力或能量 */
export type RewardType = 'stamina' | 'energy';

/** 奖励来源：完成节点 或 小游戏胜利 */
export type RewardSource = 'node_complete' | 'game_win';

/** 创建奖励请求 */
export interface CreateRewardRequest {
  userId: number;
  type: RewardType;       // 'stamina'（体力）| 'energy'（能量）
  amount: number;         // 奖励数量（叛逆型双倍由调用方计算后传入）
  source: RewardSource;   // 'node_complete' | 'game_win'
}

/** 领取奖励请求 */
export interface ClaimRewardRequest {
  rewardId: number;       // 要领取的奖励记录 ID
}

/** 奖励数据（服务端返回） */
export interface Reward {
  id: number;
  user_id: number;
  type: string;           // 'stamina' | 'energy'
  amount: number;         // 奖励数量
  source: string;         // 'node_complete' | 'game_win'
  claimed: boolean;       // 是否已领取
  created_at: string;     // 创建时间
}

// ============================================================
// 领域/学习域相关类型
// 对应服务端 domainController / domainRoutes（POST/GET/PUT /api/domains/*）
//
// 领域包括预设模块（理财、AI 等）和用户自定义模块
// 自定义模块同样支持添加阶段和节点，数据通过 domainService 持久化到服务端
// ============================================================

/** 领域类型：预设 或 自定义 */
export type DomainType = 'preset' | 'custom';

/** 创建领域请求 */
export interface CreateDomainRequest {
  userId: number;
  name: string;           // 领域名称，如 'JavaScript'、'Python'、'我的自定义领域'
  type?: DomainType;      // 领域类型，默认 'preset'
}

/** 更新节点进度请求 */
export interface UpdateNodeProgressRequest {
  userId: number;
  domainId: number;
  nodeId: string;         // 节点 ID
  status: 'pending' | 'doing' | 'done';  // 节点状态
  studyTime?: number;     // 学习时长（秒），可选
  notes?: string;         // 学习笔记，可选
}

/** 开始学习请求（创建学习记录，返回 recordId 供 finishLearning 使用） */
export interface StartLearningRequest {
  userId: number;
  domainId: number;
  nodeId: string;
}

/** 完成学习请求（更新学习记录的时长和进度） */
export interface FinishLearningRequest {
  recordId: number;       // startLearning 返回的学习记录 ID
  duration: number;       // 实际学习时长（秒）
  progressAfter: number;  // 学习后的进度百分比
}

/** 领域数据（服务端返回） */
export interface Domain {
  id: number;
  user_id: number;
  name: string;           // 领域名称
  type: string;           // 'preset' | 'custom'
  created_at: string;     // 创建时间
}