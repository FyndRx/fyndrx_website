import { defineStore } from 'pinia';
import { notificationService, type Notification } from '@/services/notificationService';
import { useAuthStore } from '@/store/auth';
import { requestNotificationPermission, onForegroundMessage } from '@/services/firebase';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    loading: false,
    initialized: false,
    firebaseInitialized: false,
  }),
  getters: {
    recentNotifications: (state) => state.notifications.slice(0, 5),
  },
  actions: {
    async initializeFirebasePush() {
      if (this.firebaseInitialized) return;
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      
      const token = await requestNotificationPermission();
      if (token) {
        try {
          await notificationService.registerDeviceToken(token);
          this.firebaseInitialized = true;
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }

      onForegroundMessage((payload: any) => {
        console.log('New foreground notification received:', payload);
        // Refresh the notifications list to get the formatted message from the database
        this.fetchNotifications();
      });
    },
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
        const newCount = await notificationService.getUnreadCount();
        if (newCount > this.unreadCount) {
          this.unreadCount = newCount;
          // Fetch the new notifications list, but don't await to avoid blocking polling
          this.fetchNotifications();
        } else {
          this.unreadCount = newCount;
        }
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
    initNotifications() {
      if (this.initialized) return;
      this.fetchNotifications();
      this.initializeFirebasePush();
    },
    cleanupNotifications() {
      // Nothing to clean up anymore since polling is removed, but we keep the method for lifecycle symmetry.
    }
  }
});
