export interface User {
  id: number;
  username?: string;
  email?: string;
  phone?: string;
  wechatOpenId?: string;
  wechatUnionId?: string;
  passwordHash?: string;
  nickname?: string;
  avatarUrl?: string;
  lastLoginAt?: Date;
  loginCount: number;
  status: 'active' | 'inactive' | 'banned';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username?: string;
  email?: string;
  phone?: string;
  wechatOpenId?: string;
  wechatUnionId?: string;
  password?: string;
  nickname?: string;
  avatarUrl?: string;
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
  expiresIn: number;
}