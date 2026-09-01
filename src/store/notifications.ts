import { defineStore } from 'pinia';
import { notificationService, type Notification, type GetNotificationsParams } from '@/services/notificationService';
import { useAuthStore } from '@/store/auth';
import { requestNotificationPermission, onForegroundMessage } from '@/services/firebase';
import { useNotification } from '@/composables/useNotification';
import { playNotificationSound } from '@/utils/notificationSound';

export type NotificationFilters = Pick<GetNotificationsParams, 'category' | 'status' | 'date_from' | 'date_to' | 'unread_only'>;

const NOTIFICATIONS_PER_PAGE = 20;

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    loading: false,
    loadingMore: false,
    initialized: false,
    firebaseInitialized: false,
    // Browsers require a user gesture to prompt for notification permission, so we
    // track the current status separately and only auto-enable push when it's
    // already 'granted' from a previous visit.
    pushPermission: (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported') as NotificationPermission | 'unsupported',
    filters: {} as NotificationFilters,
    currentPage: 1,
    lastPage: 1,
  }),
  getters: {
    recentNotifications: (state) => state.notifications.slice(0, 5),
    hasMore: (state) => state.currentPage < state.lastPage,
  },
  actions: {
    // Call this only from a user gesture (e.g. a button click) — Chrome and others
    // silently suppress the permission prompt when it's requested automatically.
    async initializeFirebasePush() {
      if (this.firebaseInitialized) return;
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      const token = await requestNotificationPermission();
      this.pushPermission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
      if (token) {
        try {
          await notificationService.registerDeviceToken(token);
          this.firebaseInitialized = true;
        } catch (error) {
          console.error('Failed to register FCM token:', error);
        }
      }

      onForegroundMessage((payload: any) => {
        const title = payload?.data?.title || payload?.notification?.title || 'New Notification';
        const body = payload?.data?.body || payload?.notification?.body || 'You have a new update.';

        playNotificationSound();
        useNotification().info(title, body);

        // Tab is focused (that's why this ran instead of the service worker's
        // background handler), but the user may not be looking at this tab.
        if (document.hidden && Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/notification-icon.png', badge: '/notification-badge.png' });
        }

        // Refresh the notifications list to get the formatted message from the database
        this.fetchNotifications();
      });
    },
    async fetchNotifications(append = false) {
      if (append) {
        this.loadingMore = true;
      } else {
        this.loading = true;
      }
      try {
        const authStore = useAuthStore();
        if (!authStore.isAuthenticated) return;
        const page = append ? this.currentPage + 1 : 1;
        const { notifications, meta } = await notificationService.getNotifications({
          ...this.filters,
          page,
          per_page: NOTIFICATIONS_PER_PAGE,
        });
        this.notifications = append ? [...this.notifications, ...notifications] : notifications;
        this.currentPage = meta?.current_page ?? page;
        this.lastPage = meta?.last_page ?? 1;
        await this.fetchUnreadCount();
        this.initialized = true;
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },
    async loadMoreNotifications() {
      if (!this.hasMore || this.loadingMore) return;
      await this.fetchNotifications(true);
    },
    async setFilters(filters: NotificationFilters) {
      this.filters = filters;
      await this.fetchNotifications();
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
    initNotifications() {
      if (this.initialized) return;
      this.fetchNotifications();
      // Only auto-enable push if the user already granted permission on a past
      // visit — otherwise wait for an explicit "Enable notifications" click.
      if (this.pushPermission === 'granted') {
        this.initializeFirebasePush();
      }
    },
    cleanupNotifications() {
      // Nothing to clean up anymore since polling is removed, but we keep the method for lifecycle symmetry.
    }
  }
});
