import axios from 'axios';
import {
  SkillNode,
  SkillTreeRequest,
  CreateUserRequest,
  LoginRequest,
  UserResponse,
  AuthResponse,
  MonsterSetupRequest,
  MonsterChatRequest,
  MonsterChatResponse,
  MonsterMessagesResponse,
  MonsterResponse,
  // 新增：笔记相关类型
  CreateNoteRequest,
  UpdateNoteRequest,
  Note,
  // 新增：奖励相关类型
  CreateRewardRequest,
  ClaimRewardRequest,
  Reward,
  // 新增：领域/学习域相关类型
  CreateDomainRequest,
  UpdateNodeProgressRequest,
  StartLearningRequest,
  FinishLearningRequest,
  Domain,
} from '../types/skill';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 添加请求拦截器，方便调试
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器，方便调试
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Axios 无法建连时常无 response，仅 message 为 Network Error
    if (!error.response && error.message === 'Network Error') {
      return Promise.reject(
        new Error('无法连接服务器，请检查手机网络、服务器是否在线，以及 API 地址是否正确')
      );
    }

    // 网络连接错误
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.error('网络连接失败，请检查网络连接和服务器状态');
      console.error('当前API地址:', API_BASE_URL);
      return Promise.reject(new Error('网络连接失败，请检查网络连接'));
    }
    
    // DNS解析错误
    if (error.code === 'ENOTFOUND') {
      console.error('DNS解析失败，无法连接到服务器');
      console.error('域名解析失败:', error.hostname);
      return Promise.reject(new Error('无法连接到服务器，请检查网络设置'));
    }
    
    // 超时错误
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，服务器响应过慢');
      return Promise.reject(new Error('请求超时，请检查网络连接'));
    }
    
    // 对于400错误（客户端错误），不记录错误日志，只提取错误信息
    if (error.response && error.response.status === 400) {
      // 提取后端返回的具体错误信息
      if (error.response.data) {
        const backendError = error.response.data;
        if (backendError.error) {
          // 返回后端的具体错误消息
          return Promise.reject(new Error(backendError.error));
        } else if (backendError.message) {
          return Promise.reject(new Error(backendError.message));
        }
      }
      // 如果没有具体错误信息，返回通用错误
      return Promise.reject(new Error('注册失败，请检查输入信息'));
    }
    
    // 对于其他错误（如网络错误、500错误等），记录日志
    console.error('API Response Error:', error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  // 用户注册
  register: async (request: CreateUserRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', request);
    return response.data.data;
  },

  // 用户登录
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', request);
    return response.data.data;
  },

  // 刷新令牌
  refreshToken: async (refreshToken: string, deviceId: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken, deviceId });
    return response.data.data;
  },

  // 验证令牌
  verifyToken: async (token: string): Promise<any> => {
    const response = await api.post('/auth/verify-token', { token });
    return response.data.data;
  },

  // 用户登出
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export const skillService = {
  // 生成技能树
  generateSkillTree: async (request: SkillTreeRequest): Promise<SkillNode> => {
    const response = await api.post('/skills/generate', request);
    return response.data.data;
  },

  // 获取技能树列表
  getSkillTreeList: async (page: number = 1, limit: number = 10, search?: string) => {
    const response = await api.get('/skills/list', {
      params: { page, limit, search }
    });
    return response.data.data;
  },

  // 根据ID获取技能树
  getSkillTreeById: async (id: string): Promise<SkillNode> => {
    const response = await api.get(`/skills/${id}`);
    return response.data.data;
  },

  // 保存用户技能树
  saveUserSkillTree: async (userId: string, skillTree: SkillNode, title?: string, tags?: string[]) => {
    const response = await api.post('/skills/save', {
      userId,
      skillTree,
      title,
      tags
    });
    return response.data.data;
  },

  // 获取用户进度
  getUserProgress: async (userId: string, skillTreeId?: string) => {
    const response = await api.get(`/skills/progress/${userId}`, {
      params: { skillTreeId }
    });
    return response.data.data;
  },

  // 更新用户进度
  updateUserProgress: async (userId: string, skillTreeId: string, completedNodes: string[], completedLinks: string[]) => {
    const response = await api.put(`/skills/progress/${userId}`, {
      skillTreeId,
      completedNodes,
      completedLinks
    });
    return response.data.data;
  },

  // 搜索热门领域
  searchPopularDomains: async (keyword: string) => {
    const response = await api.get('/skills/search/domains', {
      params: { keyword }
    });
    return response.data.data;
  },

  // 获取推荐学习路径
  getRecommendedPath: async (domain: string, currentLevel: string = 'beginner', targetLevel: string = 'advanced') => {
    const response = await api.get('/skills/recommendations/path', {
      params: { domain, currentLevel, targetLevel }
    });
    return response.data.data;
  },

  // 获取统计信息
  getStatistics: async () => {
    const response = await api.get('/skills/stats/overview');
    return response.data.data;
  },

  // 获取用户学习报告
  getUserLearningReport: async (userId: string, period: string = 'week') => {
    const response = await api.get(`/skills/report/${userId}`, {
      params: { period }
    });
    return response.data.data;
  }
};

export const monsterService = {
  // 用户创建/初始化自己的小怪兽
  createMonster: async (request: MonsterSetupRequest): Promise<MonsterResponse> => {
    const response = await api.post('/monster/create', request);
    return response.data.data;
  },

  // 扣除体力（学习时调用）
  consumeStamina: async (userId: number, amount: number): Promise<{ success: boolean }> => {
    const response = await api.post('/monster/stamina/consume', { userId, amount });
    return response.data;
  },

  // 与小怪兽对话
  chat: async (request: MonsterChatRequest): Promise<MonsterChatResponse> => {
    const response = await api.post('/monster/chat', request);
    return response.data;
  },

  // 获取历史对话消息
  getMessages: async (userId: number): Promise<MonsterMessagesResponse> => {
    const response = await api.get(`/monster/messages/${userId}`);
    return response.data;
  },

  // 获取怪兽状态（类型/体力/能量等）
  getMonsterStatus: async (userId: number): Promise<any> => {
    const response = await api.get(`/monster/status/${userId}`);
    return response.data;
  },
};

// ============================================================
// 笔记服务
// 对应服务端 POST/GET/PUT /api/notes/*
// 用于怪兽页笔记的持久化存储，替代纯 AsyncStorage 方案
// ============================================================
export const noteService = {
  /** 创建笔记 */
  createNote: async (request: CreateNoteRequest): Promise<Note> => {
    const response = await api.post('/notes/create', request);
    return response.data.data;
  },

  /** 获取某用户的所有笔记列表 */
  getNotes: async (userId: number): Promise<Note[]> => {
    const response = await api.get(`/notes/list/${userId}`);
    return response.data.data;
  },

  /** 按日期获取某用户的笔记 */
  getNoteByDate: async (userId: number, date: string): Promise<Note | null> => {
    const response = await api.get(`/notes/${userId}/${date}`);
    return response.data.data;
  },

  /** 更新笔记内容 */
  updateNote: async (request: UpdateNoteRequest): Promise<void> => {
    await api.put('/notes/update', request);
  },
};

// ============================================================
// 奖励服务
// 对应服务端 POST/GET /api/rewards/*
//
// 奖励类型仅支持 stamina（体力）和 energy（能量），不支持经验值
// 奖励来源仅两种：
//   - node_complete: 完成学习节点，时间长短对应不同奖励
//   - game_win: 小游戏胜利获得奖励
//
// 叛逆型小怪双倍：调用方在传入 amount 时自行 *= 2，
//   rewardService 只做如实记录，不再二次翻倍
// ============================================================
export const rewardService = {
  /** 创建奖励记录（完成节点或小游戏胜利后发放体力/能量） */
  createReward: async (request: CreateRewardRequest): Promise<{ success: boolean; rewardId: number }> => {
    const response = await api.post('/rewards/create', request);
    return response.data.data;
  },

  /** 获取某用户的奖励列表 */
  getRewards: async (userId: number): Promise<{ rewards: Reward[] }> => {
    const response = await api.get(`/rewards/list/${userId}`);
    return response.data.data;
  },

  /** 领取/兑换奖励 */
  claimReward: async (request: ClaimRewardRequest): Promise<{ success: boolean }> => {
    const response = await api.post('/rewards/claim', request);
    return response.data;
  },
};

// ============================================================
// 用户服务
// 对应服务端 PUT /api/users/profile
// ============================================================
export const userService = {
  /** 更新用户资料（头像等） */
  updateProfile: async (data: { avatar?: string }): Promise<void> => {
    const token = await (await import('../utils/auth')).getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await api.put('/auth/profile', data, { headers });
  },
};

// ============================================================
// 领域/学习域服务
// 对应服务端 POST/GET/PUT /api/domains/*
//
// 领域包括预设模块（理财、AI 等）和用户自定义模块
// 自定义模块同样支持添加阶段和节点，通过本服务持久化到服务端
// 支持记录节点学习进度、开始/完成学习
// ============================================================
export const domainService = {
  /** 创建学习领域（用户选择预设模块或自定义模块时调用） */
  createDomain: async (request: CreateDomainRequest): Promise<Domain> => {
    const response = await api.post('/domains/create', request);
    return response.data.data;
  },

  /** 获取某用户的所有学习领域列表 */
  getDomains: async (userId: number): Promise<Domain[]> => {
    const response = await api.get(`/domains/list/${userId}`);
    return response.data.data;
  },

  /** 根据 ID 获取单个学习领域详情 */
  getDomainById: async (id: number): Promise<Domain> => {
    const response = await api.get(`/domains/${id}`);
    return response.data.data;
  },

  /** 更新节点学习进度（标记为待学习/进行中/已完成） */
  updateNodeProgress: async (request: UpdateNodeProgressRequest): Promise<void> => {
    await api.put('/domains/nodes/progress', request);
  },

  /** 开始学习（创建学习记录，返回 recordId 供 finishLearning 使用） */
  startLearning: async (request: StartLearningRequest): Promise<{ success: boolean; recordId: number }> => {
    const response = await api.post('/domains/learning/start', request);
    return response.data.data;
  },

  /** 完成学习（更新学习记录的实际时长和进度） */
  finishLearning: async (request: FinishLearningRequest): Promise<void> => {
    await api.post('/domains/learning/finish', request);
  },
};