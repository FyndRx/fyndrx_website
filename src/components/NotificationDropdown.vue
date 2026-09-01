<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationsStore } from '@/store/notifications';
import { formatDate } from '@/utils/date';
import { getNotificationStyle } from '@/utils/notificationDisplay';
import StatusBadge from '@/components/StatusBadge.vue';
import StatusIcon from '@/components/StatusIcon.vue';

const router = useRouter();
const store = useNotificationsStore();

const displayNotifications = computed(() =>
  store.recentNotifications.map((notification) => ({
    notification,
    style: getNotificationStyle(notification.data?.app_data?.type, notification.data?.app_data?.status),
  }))
);

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && !store.initialized) {
    store.fetchNotifications();
  }
};

const close = () => {
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (isOpen.value && containerRef.value && !containerRef.value.contains(e.target as Node)) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  store.initNotifications();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  store.cleanupNotifications();
});

const handleNotificationClick = async (notification: any) => {
  if (!notification.read_at) {
    await store.markAsRead(notification.id);
  }
  close();
  
  const appData = notification.data?.app_data;
  if (!appData) {
    router.push('/notifications');
    return;
  }

  // Navigate based on app_data type
  switch (appData.type) {
    case 'ORDER_STATUS_UPDATE':
    case 'ORDER_CREATED':
      if (appData.order_id) {
        router.push({ name: 'order-detail', params: { id: appData.order_id } });
      } else {
        router.push({ name: 'orders' });
      }
      break;
    case 'PRESCRIPTION_CREATED':
    case 'PRESCRIPTION_UPDATED':
      if (appData.prescription_id) {
        // Fallback to prescriptions list until individual view is available
        router.push({ name: 'prescriptions' });
      } else {
        router.push({ name: 'prescriptions' });
      }
      break;
    case 'PRICE_ALERT':
      if (appData.product_id) {
        router.push({ name: 'MedicationDetail', params: { id: appData.product_id } });
      } else {
        router.push({ name: 'price-alerts' });
      }
      break;
    default:
      router.push('/notifications');
      break;
  }
};

const viewAll = () => {
  close();
  router.push('/notifications');
};

const enablingPush = ref(false);
const enablePush = async () => {
  enablingPush.value = true;
  try {
    await store.initializeFirebasePush();
  } finally {
    enablingPush.value = false;
  }
};
</script>

<script lang="ts">
export default {
  name: 'NotificationDropdown'
};
</script>

<template>
  <div ref="containerRef" class="relative inline-block text-left shrink-0">
    <!-- Bell Button -->
    <button
      @click.stop="toggle"
      class="relative p-2.5 rounded-full transition-all duration-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 group active:scale-95"
      title="Notifications"
    >
      <div class="absolute inset-0 bg-[#246BFD]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <svg class="w-6 h-6 text-gray-700 dark:text-gray-200 transition-transform duration-300 group-hover:rotate-12 group-hover:text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>
      <span
        v-if="store.unreadCount > 0"
        class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg shadow-red-500/40 border-2 border-white dark:border-gray-900 animate-pulse"
      >
        {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-95 translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-3 w-[340px] sm:w-[400px] origin-top-right rounded-3xl bg-white/75 dark:bg-gray-900/75 backdrop-blur-2xl border border-white/60 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus:outline-none overflow-hidden flex flex-col max-h-[85vh]"
        @click.stop
      >
        <!-- Decorative Glows -->
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-[#246BFD]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between relative z-10">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Notifications
            </h3>
            <span v-if="store.unreadCount > 0" class="px-2 py-0.5 rounded-md bg-[#246BFD]/10 text-[#246BFD] text-xs font-bold">
              {{ store.unreadCount }} new
            </span>
          </div>
          <button
            v-if="store.unreadCount > 0"
            @click="store.markAllAsRead"
            class="text-xs font-semibold text-gray-500 hover:text-[#246BFD] dark:text-gray-400 dark:hover:text-[#246BFD] transition-colors"
          >
            Mark all read
          </button>
        </div>

        <!-- Enable Push Prompt -->
        <div
          v-if="store.pushPermission === 'default'"
          class="mx-4 mt-3 p-3 rounded-2xl bg-[#246BFD]/5 border border-[#246BFD]/15 flex items-center gap-3 relative z-10"
        >
          <p class="flex-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            Get instant alerts for orders & prescriptions.
          </p>
          <button
            @click="enablePush"
            :disabled="enablingPush"
            class="shrink-0 px-3 py-1.5 rounded-full bg-[#246BFD] text-white text-xs font-bold hover:bg-[#1a5ae0] transition-colors disabled:opacity-60"
          >
            {{ enablingPush ? 'Enabling…' : 'Enable' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="store.loading && store.notifications.length === 0" class="p-6 space-y-5 relative z-10">
          <div v-for="i in 3" :key="i" class="flex gap-4 animate-pulse">
            <div class="w-12 h-12 bg-gray-200/60 dark:bg-gray-700/60 rounded-2xl shrink-0"></div>
            <div class="flex-1 space-y-3 py-1.5">
              <div class="h-4 bg-gray-200/60 dark:bg-gray-700/60 rounded-md w-3/4"></div>
              <div class="h-3 bg-gray-200/60 dark:bg-gray-700/60 rounded-md w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="store.notifications.length === 0" class="px-6 py-12 text-center relative z-10">
          <div class="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mb-5 shadow-inner rotate-3">
            <svg class="w-10 h-10 text-gray-400/80 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-bold mb-1.5">All caught up!</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">You don't have any new notifications.</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="overflow-y-auto flex-1 p-2 space-y-1 relative z-10 custom-scrollbar">
          <div
            v-for="{ notification, style } in displayNotifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="group p-3 rounded-2xl flex gap-3.5 cursor-pointer transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80 relative overflow-hidden"
            :class="{
              'bg-white/60 dark:bg-gray-800/60 shadow-sm border border-white/80 dark:border-gray-700/80': !notification.read_at,
              'hover:scale-[1.02] active:scale-[0.98]': true
            }"
          >
            <!-- Unread Glowing Indicator -->
            <div
              v-if="!notification.read_at"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#246BFD] to-blue-400 rounded-r-full shadow-[0_0_8px_rgba(36,107,253,0.5)]"
            ></div>

            <!-- Dynamic Icon Box -->
            <div
              class="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110 shadow-sm border border-white/40 dark:border-gray-700/50"
              :class="style.containerClass"
            >
              <!-- Determine Icon based on app_data status, falling back to type -->
              <StatusIcon v-if="notification.data?.app_data?.status" :status="notification.data.app_data.status" class="w-6 h-6" />
              <svg v-else-if="style.iconKey === 'order'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <svg v-else-if="style.iconKey === 'prescription'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <svg v-else-if="style.iconKey === 'pharmacy'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/></svg>
              <svg v-else-if="style.iconKey === 'broadcast'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c2.32.184 4.594.583 6.75 1.65 1.185.632 1.986-.7 1.986-1.5V6.75c0-.8-.801-2.132-1.986-1.5-2.156 1.067-4.43 1.466-6.75 1.65m0 9.18V6.75"/></svg>
              <svg v-else-if="style.iconKey === 'price_alert'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 17h8m0 0V9m0 8L11 5l-4 4-6-6"/></svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 py-0.5">
              <div class="flex justify-between items-start gap-2 mb-0.5">
                <p class="text-sm font-bold text-gray-900 dark:text-white truncate" :class="{ 'text-gray-600 dark:text-gray-300 font-medium': notification.read_at }">
                  {{ notification.data?.title || 'Notification' }}
                </p>
                <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap pt-0.5">
                  {{ formatDate(notification.created_at) }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {{ notification.data?.body || 'You have a new update.' }}
              </p>

              <!-- Status Pill (if available) -->
              <StatusBadge
                v-if="notification.data?.app_data?.status"
                :status="notification.data.app_data.status"
                size="xs"
                show-dot
                class="mt-2"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="store.notifications.length > 0" class="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 relative z-10 rounded-b-3xl">
          <button
            @click="viewAll"
            class="w-full py-2.5 text-sm font-bold text-[#246BFD] bg-white dark:bg-gray-800 border border-white dark:border-gray-700 rounded-full hover:shadow-md hover:border-[#246BFD]/30 transition-all duration-300"
          >
            View all notifications
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}
</style>
