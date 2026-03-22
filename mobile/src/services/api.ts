import axios from 'axios';
import { 
  SkillNode, 
  SkillTreeRequest,
  CreateUserRequest, 
  LoginRequest, 
  UserResponse,
  AuthResponse 
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