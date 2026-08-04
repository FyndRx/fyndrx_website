import { apiService } from './api';

export interface AppData {
  type: string;
  order_id?: string;
  status?: string;
  deep_link?: string;
  prescription_id?: string;
  [key: string]: any;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string | null;
  color?: string | null;
  duration?: string | null;
  format?: string;
  status?: string | null;
  app_data?: AppData;
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiService.getAuth<any>('/notifications');
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (response?.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  },

  async getNotificationById(id: string): Promise<Notification> {
    return await apiService.getAuth<Notification>(`/notifications/${id}`);
  },

  async getNotificationsByType(type: string): Promise<Notification[]> {
    return await apiService.getAuth<Notification[]>(`/notifications/type/${type}`);
  },

  async getStats(): Promise<NotificationStats> {
    return await apiService.getAuth<NotificationStats>('/notifications/stats');
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiService.getAuth<any>('/notifications/unread-count');
    if (response?.data?.unread_count !== undefined) {
      return response.data.unread_count;
    }
    return response?.unread_count || response?.count || 0;
  },

  async markAllAsRead(): Promise<void> {
    await apiService.postAuth('/notifications/mark-all-read');
  },

  async registerDeviceToken(token: string): Promise<void> {
    await apiService.postAuth('/device-tokens', {
      device_token: token,
      device_type: 'web',
    });
  },

  async markAsOpened(id: string): Promise<void> {
    return await apiService.postAuth<void>(`/notifications/${id}/opened`);
  },

  async markAsClicked(id: string): Promise<void> {
    return await apiService.postAuth<void>(`/notifications/${id}/clicked`);
  },

  async deleteNotification(id: string): Promise<void> {
    return await apiService.deleteAuth<void>(`/notifications/${id}`);
  },

  async getPreferences(): Promise<NotificationPreferences> {
    return await apiService.getAuth<NotificationPreferences>('/notifications/preferences');
  },

  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    return await apiService.putAuth<void>('/notifications/preferences', preferences);
  },

  async testNotification(data: { title: string; body: string }): Promise<void> {
    return await apiService.postAuth<void>('/notifications/test', data);
  }
};


