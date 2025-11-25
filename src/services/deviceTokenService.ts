import { apiService } from './api';

export interface DeviceToken {
  id: string;
  user_id: number;
  token: string;
  device_type: 'android' | 'ios' | 'web';
  device_name: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterDeviceTokenRequest {
  token: string;
  device_type: 'android' | 'ios' | 'web';
  device_name: string;
}

export const deviceTokenService = {
  async getDeviceTokens(): Promise<DeviceToken[]> {
    return await apiService.getAuth<DeviceToken[]>('/device-tokens');
  },

  async registerToken(data: RegisterDeviceTokenRequest): Promise<DeviceToken> {
    return await apiService.postAuth<DeviceToken>('/device-tokens', data);
  },

  async getDeviceToken(id: string): Promise<DeviceToken> {
    return await apiService.getAuth<DeviceToken>(`/device-tokens/${id}`);
  },

  async updateToken(id: string, token: string): Promise<DeviceToken> {
    return await apiService.putAuth<DeviceToken>(`/device-tokens/${id}`, { token });
  },

  async refreshToken(oldToken: string, newToken: string): Promise<DeviceToken> {
    return await apiService.postAuth<DeviceToken>('/device-tokens/refresh', {
      old_token: oldToken,
      new_token: newToken
    });
  },

  async activateToken(id: string): Promise<void> {
    return await apiService.postAuth<void>(`/device-tokens/${id}/activate`);
  },

  async deactivateToken(id: string): Promise<void> {
    return await apiService.postAuth<void>(`/device-tokens/${id}/deactivate`);
  },

  async deleteToken(id: string): Promise<void> {
    return await apiService.deleteAuth<void>(`/device-tokens/${id}`);
  }
};


