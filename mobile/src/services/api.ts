import axios from 'axios';
import {
  SkillNode,
  SkillTreeRequest,
  CreateUserRequest,
  LoginRequest,
  UserResponse,
  AuthResponse,
  MonsterSetupRequest,
  MonsterResponse,
  MonsterChatRequest,
  MonsterChatResponse,
  MonsterMessagesResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  Note,
  CreateRewardRequest,
  ClaimRewardRequest,
  Reward,
  CreateDomainRequest,
  UpdateNodeProgressRequest,
  StartLearningRequest,
  FinishLearningRequest,
  Domain,
} from '../types/skill';
import { API_BASE_URL } from '../utils/constants';
import { getAccessToken } from '../utils/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ============================================================
// 🔒 JWT 认证拦截器 — 自动注入 Bearer token
// ============================================================
const PUBLIC_PATHS = [
  '/auth/register',
  '/auth/login',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/verify-token',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password',
];

api.interceptors.request.use(async (config) => {
  // 公开端点无需 token
  const isPublic = PUBLIC_PATHS.some(p => config.url?.startsWith(p));
  if (isPublic) return config;

  // 注入 JWT token
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
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
      const isTunnel = API_BASE_URL.includes('ngrok');
      const steps = [
        '无法连接服务器',
        `API 地址: ${API_BASE_URL}`,
        '',
        '排查步骤：',
        '1. 确认服务器已启动（本机访问 http://localhost:3001 测试）',
      ];

      if (isTunnel) {
        steps.push(
          '2. 确认 ngrok 正在运行：ngrok http 3001',
          '3. 检查 ngrok Forwarding 地址是否与上方 API 地址一致（免费版每次重启 ngrok 子域可能变）',
          '4. 若不匹配，修改 app.json 的 extra.apiBaseUrl 后重启 Metro',
          '5. 手机浏览器访问 ngrok 地址，确认可达',
        );
      } else {
        steps.push(
          '2. 同一 WiFi：确认手机和电脑连接同一 WiFi',
          '3. 手机用流量：需将 app.json 的 apiBaseUrl 改为 ngrok https 地址',
          '4. 打开手机浏览器访问上述 API 地址，确认可达',
          '5. 若地址变了，修改 app.json 的 extra.apiBaseUrl 后重启 Metro',
        );
      }

      return Promise.reject(new Error(steps.join('\n')));
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
    
    // 401 认证失败 — 特殊提示
    if (error.response && error.response.status === 401) {
      const token = getAccessToken();
      if (!token) {
        return Promise.reject(new Error('未登录，请先登录'));
      }
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    // 对于400错误（客户端错误），提取后端错误信息
    if (error.response && error.response.status === 400) {
      if (error.response.data) {
        const backendError = error.response.data;
        if (backendError.error) {
          return Promise.reject(new Error(backendError.error));
        } else if (backendError.message) {
          return Promise.reject(new Error(backendError.message));
        }
      }
      return Promise.reject(new Error('请求失败，请检查输入信息'));
    }
    
    console.error('API Response Error:', error.message);
    return Promise.reject(error);
  }
);

// ============================================================
// 认证服务（无需 token）
// ============================================================
export const authService = {
  register: async (request: CreateUserRequest): Promise<{ message: string; email: string }> => {
    const response = await api.post('/auth/register', request);
    return response.data.data;
  },

  verifyEmail: async (email: string, token: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-email', { email, token });
    return response.data.data;
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data.data;
  },

  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', request);
    return response.data.data;
  },

  refreshToken: async (refreshToken: string, deviceId: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken, deviceId });
    return response.data.data;
  },

  verifyToken: async (token: string): Promise<any> => {
    const response = await api.post('/auth/verify-token', { token });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // ⚠️ 头像上传现在需要 JWT 认证（拦截器自动注入 token）
  uploadAvatar: async (uri: string): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    const response = await api.post('/auth/avatar-upload', formData);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string; email: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data.data;
  },
};

// ============================================================
// Pro 服务（需要 token）
// ============================================================
export const proService = {
  activate: async (code: string): Promise<{ success: boolean; planId?: string; expiresAt?: string }> => {
    const response = await api.post('/pro/activate', { code });
    return response.data.data;
  },

  getStatus: async (): Promise<{ isPro: boolean; planId?: string; expiresAt?: string }> => {
    const response = await api.get('/pro/status');
    return response.data.data;
  },
};

// ============================================================
// 技能树服务（需要 token）
// ============================================================
export const skillService = {
  generateSkillTree: async (request: SkillTreeRequest): Promise<SkillNode> => {
    const response = await api.post('/skills/generate', request);
    return response.data.data;
  },

  getSkillTreeList: async (page: number = 1, limit: number = 10, search?: string) => {
    const response = await api.get('/skills/list', {
      params: { page, limit, search }
    });
    return response.data.data;
  },

  getSkillTreeById: async (id: string): Promise<SkillNode> => {
    const response = await api.get(`/skills/${id}`);
    return response.data.data;
  },

  saveUserSkillTree: async (skillTree: SkillNode, title?: string, tags?: string[]) => {
    const response = await api.post('/skills/save', {
      skillTree,
      title,
      tags
    });
    return response.data.data;
  },

  getUserProgress: async (skillTreeId?: string) => {
    const response = await api.get('/skills/progress', {
      params: { skillTreeId }
    });
    return response.data.data;
  },

  updateUserProgress: async (skillTreeId: string, completedNodes: string[], completedLinks: string[]) => {
    const response = await api.put('/skills/progress', {
      skillTreeId,
      completedNodes,
      completedLinks
    });
    return response.data.data;
  },

  searchPopularDomains: async (keyword: string) => {
    const response = await api.get('/skills/search/domains', {
      params: { keyword }
    });
    return response.data.data;
  },

  getRecommendedPath: async (domain: string, currentLevel: string = 'beginner', targetLevel: string = 'advanced') => {
    const response = await api.get('/skills/recommendations/path', {
      params: { domain, currentLevel, targetLevel }
    });
    return response.data.data;
  },

  getStatistics: async () => {
    const response = await api.get('/skills/stats/overview');
    return response.data.data;
  },

  getUserLearningReport: async (period: string = 'week') => {
    const response = await api.get('/skills/report', {
      params: { period }
    });
    return response.data.data;
  }
};

// ============================================================
// 怪兽服务（需要 token）
// ============================================================
export const monsterService = {
  createMonster: async (request: Omit<MonsterSetupRequest, 'userId'>): Promise<MonsterResponse> => {
    const response = await api.post('/monster/create', request);
    return response.data.data;
  },

  consumeStamina: async (amount: number): Promise<{ success: boolean }> => {
    const response = await api.post('/monster/stamina/consume', { amount });
    return response.data;
  },

  chat: async (request: Omit<MonsterChatRequest, 'userId'>): Promise<MonsterChatResponse> => {
    const response = await api.post('/monster/chat', request);
    return response.data;
  },

  getMessages: async (): Promise<MonsterMessagesResponse> => {
    const response = await api.get('/monster/messages');
    return response.data;
  },

  getMonsterStatus: async (): Promise<MonsterResponse> => {
    const response = await api.get('/monster/status');
    return response.data;
  },
};

// ============================================================
// 笔记服务（需要 token）
// ============================================================
export const noteService = {
  createNote: async (request: Omit<CreateNoteRequest, 'userId'>): Promise<Note> => {
    const response = await api.post('/notes/create', request);
    return response.data.data;
  },

  getNotes: async (): Promise<Note[]> => {
    const response = await api.get('/notes/list');
    return response.data.data;
  },

  getNoteByDate: async (date: string): Promise<Note | null> => {
    const response = await api.get(`/notes/${date}`);
    return response.data.data;
  },

  updateNote: async (request: UpdateNoteRequest): Promise<void> => {
    await api.put('/notes/update', request);
  },
};

// ============================================================
// 奖励服务（需要 token）
// ============================================================
export const rewardService = {
  createReward: async (request: Omit<CreateRewardRequest, 'userId'>): Promise<{ success: boolean; rewardId: number }> => {
    const response = await api.post('/rewards/create', request);
    return response.data.data;
  },

  getRewards: async (): Promise<{ rewards: Reward[] }> => {
    const response = await api.get('/rewards/list');
    return response.data.data;
  },

  claimReward: async (request: ClaimRewardRequest): Promise<{ success: boolean }> => {
    const response = await api.post('/rewards/claim', request);
    return response.data;
  },
};

// ============================================================
// 领域/学习域服务（需要 token）
// ============================================================
export const domainService = {
  createDomain: async (request: Omit<CreateDomainRequest, 'userId'>): Promise<Domain> => {
    const response = await api.post('/domains/create', request);
    return response.data.data;
  },

  getDomains: async (): Promise<Domain[]> => {
    const response = await api.get('/domains/list');
    return response.data.data;
  },

  getDomainById: async (id: number): Promise<Domain> => {
    const response = await api.get(`/domains/${id}`);
    return response.data.data;
  },

  updateNodeProgress: async (request: Omit<UpdateNodeProgressRequest, 'userId'>): Promise<void> => {
    await api.put('/domains/nodes/progress', request);
  },

  startLearning: async (request: Omit<StartLearningRequest, 'userId'>): Promise<{ success: boolean; recordId: number }> => {
    const response = await api.post('/domains/learning/start', request);
    return response.data.data;
  },

  finishLearning: async (request: FinishLearningRequest): Promise<void> => {
    await api.post('/domains/learning/finish', request);
  },

  getNodeProgresses: async (domainId: number): Promise<any[]> => {
    const response = await api.get(`/domains/${domainId}/node-progresses`);
    return response.data?.data || [];
  },

  getStudyCount: async (domainId: number, nodeId: string): Promise<number> => {
    const response = await api.get('/domains/study-count', { params: { domainId, nodeId } });
    return response.data?.count || 0;
  },
};
