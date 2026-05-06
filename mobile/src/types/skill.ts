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