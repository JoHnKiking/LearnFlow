export interface DeviceSession {
  id: number;
  userId: number;
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeviceSessionRequest {
  userId: number;
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
  expiresAt: Date;
}

export interface UpdateDeviceSessionRequest {
  lastActiveAt?: Date;
  expiresAt?: Date;
}