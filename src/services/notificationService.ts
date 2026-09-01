import { apiService } from './api';
import type { PaginationMeta } from '@/models/api';
import { unwrapArrayResponse, unwrapApiResponse } from '@/utils/responseTransformers';

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

// Must mirror User::NOTIFICATION_CATEGORIES / NOTIFICATION_CHANNELS on the backend
// (app/Domains/Core/Models/User.php). The API always returns every category x
// channel combo — unset ones default to `true` server-side (opt-out model).
export type NotificationCategory = 'order_updates' | 'clinical' | 'promotions' | 'news' | 'reminders' | 'price_alerts';
export type NotificationChannel = 'email' | 'sms' | 'push';

export type NotificationPreferences = Record<NotificationCategory, Record<NotificationChannel, boolean>>;

// A partial update — only the category/channel(s) being changed need to be present,
// the backend merges it into what's already stored.
export type NotificationPreferencesUpdate = Partial<Record<NotificationCategory, Partial<Record<NotificationChannel, boolean>>>>;

/** `category` groups the backend's raw app_data.type values: 'order' matches
 * ORDER_STATUS_UPDATE/NEW_ORDER, 'prescription' matches NEW_PRESCRIPTION/
 * PRESCRIPTION_PRICED, 'pharmacy' matches NEW_PHARMACY_APPLICATION, 'broadcast'
 * matches BROADCAST (admin-sent announcements/campaigns), 'price_alert' matches
 * PRICE_ALERT (a watched medication's price dropped). */
export interface GetNotificationsParams {
  category?: 'order' | 'prescription' | 'pharmacy' | 'broadcast' | 'price_alert';
  status?: string;
  date_from?: string;
  date_to?: string;
  unread_only?: boolean;
  page?: number;
  per_page?: number;
}

export interface GetNotificationsResult {
  notifications: Notification[];
  meta: PaginationMeta | null;
}

export const notificationService = {
  async getNotifications(params?: GetNotificationsParams): Promise<GetNotificationsResult> {
    let url = '/notifications';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.unread_only) queryParams.append('unread_only', '1');
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await apiService.getAuth<any>(url);
    return {
      notifications: unwrapArrayResponse<Notification>(response),
      meta: response?.meta ?? null,
    };
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
    const response = await apiService.getAuth<any>('/notifications/preferences');
    return unwrapApiResponse<NotificationPreferences>(response);
  },

  /** Partial update — only include the category/channel(s) actually changing. */
  async updatePreferences(preferences: NotificationPreferencesUpdate): Promise<NotificationPreferences> {
    const response = await apiService.putAuth<any>('/notifications/preferences', { preferences });
    return unwrapApiResponse<NotificationPreferences>(response);
  },

  async testNotification(data: { title: string; body: string }): Promise<void> {
    return await apiService.postAuth<void>('/notifications/test', data);
  }
};


