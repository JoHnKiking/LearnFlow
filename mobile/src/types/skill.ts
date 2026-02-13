export interface SkillNode {
  id: string;
  name: string;
  description: string;
  children?: SkillNode[];
  links?: SkillLink[];
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
  phone: string;
  password: string;
}

export interface LoginRequest {
  type: 'phone' | 'wechat';
  phone?: string;
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
  expiresAt: Date;
}