import { API_BASE_URL } from './constants';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const config: RequestInit = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) throw new Error('请求失败');
  return response.json();
}

export const api = {
  monster: {
    getStatus: (userId: number) => request(`/monster/status?userId=${userId}`),
    chat: (userId: number, message: string) => request('/monster/chat', {
      method: 'POST',
      body: { userId, message },
    }),
  },
  domains: {
    getList: (userId: number) => request(`/domains?userId=${userId}`),
  },
  notes: {
    getList: (userId: number) => request(`/notes?userId=${userId}`),
    create: (userId: number, content: string, date: string) => request('/notes', {
      method: 'POST',
      body: { userId, content, date },
    }),
  },
};
