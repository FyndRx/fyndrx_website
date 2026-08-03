import { defineStore } from 'pinia';
import { notificationService, type Notification } from '@/services/notificationService';
import { useAuthStore } from '@/store/auth';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    loading: false,
    initialized: false,
    pollingInterval: null as number | null,
  }),
  getters: {
    recentNotifications: (state) => state.notifications.slice(0, 5),
  },
  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) return;
        this.notifications = await notificationService.getNotifications();
        await this.fetchUnreadCount();
        this.initialized = true;
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchUnreadCount() {
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) return;
        this.unreadCount = await notificationService.getUnreadCount();
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    },
    async markAsRead(id: string) {
      try {
        await notificationService.markAsClicked(id);
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read_at) {
          notification.read_at = new Date().toISOString();
          if (this.unreadCount > 0) this.unreadCount--;
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    async markAllAsRead() {
      try {
        await notificationService.markAllAsRead();
        this.unreadCount = 0;
        this.notifications.forEach(n => {
          if (!n.read_at) n.read_at = new Date().toISOString();
        });
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    },
    async deleteNotification(id: string) {
      try {
        await notificationService.deleteNotification(id);
        this.notifications = this.notifications.filter(n => n.id !== id);
        await this.fetchUnreadCount();
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    startPolling() {
      if (this.pollingInterval) return;
      this.fetchNotifications();
      this.pollingInterval = window.setInterval(() => {
        this.fetchUnreadCount();
      }, 60000); // 60 seconds
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    }
  }
});
