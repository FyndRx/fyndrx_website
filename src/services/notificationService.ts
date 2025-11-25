import { apiService } from './api';

export interface Notification {
  id: string;
  user_id: number;
  type: string;
  title: string;
  body: string;
  data?: any;
  read_at?: string;
  opened_at?: string;
  clicked_at?: string;
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
    return await apiService.getAuth<Notification[]>('/notifications');
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
    const response = await apiService.getAuth<{ count: number }>('/notifications/unread-count');
    return response.count;
  },

  async markAllAsRead(): Promise<void> {
    return await apiService.postAuth<void>('/notifications/mark-all-read');
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


