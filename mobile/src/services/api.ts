import axios from 'axios';
import { SkillNode, SkillTreeRequest } from '../types/skill';

// 使用开发机的实际IP地址，而不是localhost
const API_BASE_URL = 'http://192.168.1.109:3001/api';

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
    console.error('API Response Error:', error.message);
    return Promise.reject(error);
  }
);

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