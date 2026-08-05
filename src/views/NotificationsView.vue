<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationsStore } from '@/store/notifications';
import { formatDate } from '@/utils/date';

const router = useRouter();
const store = useNotificationsStore();
const selectedFilter = ref<'all' | 'unread'>('all');

const filteredNotifications = computed(() => {
  if (selectedFilter.value === 'unread') {
    return store.notifications.filter(n => !n.read_at);
  }
  return store.notifications;
});

const handleNotificationClick = async (notification: any) => {
  if (!notification.read_at) {
    await store.markAsRead(notification.id);
  }
  
  const appData = notification.data?.app_data;
  if (!appData) return;

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
        router.push({ name: 'prescriptions' });
      } else {
        router.push({ name: 'prescriptions' });
      }
      break;
  }
};

const deleteNotification = async (id: string, e: Event) => {
  e.stopPropagation();
  if (confirm('Are you sure you want to delete this notification?')) {
    await store.deleteNotification(id);
  }
};

onMounted(() => {
  if (!store.initialized) {
    store.fetchNotifications();
  }
});
</script>

<template>
  <div class="min-h-screen pt-24 pb-12 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
    <!-- Abstract Background Decorators -->
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
    <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8 relative z-10">
      <!-- Header Area -->
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-gradient-to-br from-[#246BFD] to-blue-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <h1 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Notifications</h1>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium ml-13">Stay updated on your orders and account activity</p>
        </div>
        
        <button
          v-if="store.unreadCount > 0"
          @click="store.markAllAsRead"
          class="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#246BFD] to-blue-500 hover:from-blue-600 hover:to-blue-500 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 self-start md:self-auto flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          Mark all as read
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-8">
        <div class="inline-flex p-1 bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl">
          <button
            @click="selectedFilter = 'all'"
            class="px-6 py-2.5 font-bold transition-all rounded-full relative"
            :class="selectedFilter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
          >
            All Notifications
          </button>
          <button
            @click="selectedFilter = 'unread'"
            class="px-6 py-2.5 font-bold transition-all rounded-full relative flex items-center gap-2"
            :class="selectedFilter === 'unread' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
          >
            Unread
            <span
              v-if="store.unreadCount > 0"
              class="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-black text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-md shadow-red-500/20"
            >
              {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading && store.notifications.length === 0" class="py-20 text-center">
        <div class="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-[#246BFD] border-r-[#246BFD] mx-auto"></div>
        <p class="mt-5 text-gray-500 font-medium animate-pulse">Syncing notifications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNotifications.length === 0" class="py-20">
        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/50 dark:border-gray-700/50 shadow-sm max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-300">
          <div class="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-3">
            <svg class="w-12 h-12 text-gray-400 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <h3 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">You're all caught up!</h3>
          <p class="text-gray-500 dark:text-gray-400">There are no {{ selectedFilter === 'unread' ? 'unread ' : '' }}notifications at this time. Go grab a coffee!</p>
        </div>
      </div>

      <!-- Notifications List -->
      <div v-else class="space-y-4">
        <transition-group name="list" tag="div" class="space-y-4">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            class="group p-5 md:p-6 transition-all duration-300 cursor-pointer rounded-3xl relative overflow-hidden backdrop-blur-xl border border-white/60 dark:border-gray-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 active:translate-y-0"
            :class="!notification.read_at ? 'bg-white/90 dark:bg-gray-800/90 ring-1 ring-[#246BFD]/20' : 'bg-white/50 dark:bg-gray-800/50 opacity-80 hover:opacity-100'"
          >
            <!-- Glowing background for unread -->
            <div v-if="!notification.read_at" class="absolute -top-24 -right-24 w-48 h-48 bg-[#246BFD]/10 rounded-full blur-3xl group-hover:bg-[#246BFD]/20 transition-colors"></div>

            <div class="flex gap-4 md:gap-6 items-start relative z-10">
              
              <!-- Dynamic Icon Box -->
              <div 
                class="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 shadow-sm border border-white/40 dark:border-gray-700/50"
                :class="[
                  notification.data?.app_data?.type?.includes('ORDER') ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-orange-600 dark:text-orange-400' : 
                  notification.data?.app_data?.type?.includes('PRESCRIPTION') ? 'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 text-violet-600 dark:text-violet-400' : 
                  'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-600 dark:text-gray-300'
                ]"
              >
                <!-- Determine Icon based on app_data type or status -->
                <svg v-if="notification.data?.app_data?.status === 'processing'" class="w-7 h-7 animate-[spin_4s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <svg v-else-if="notification.data?.app_data?.status === 'confirmed'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <svg v-else-if="notification.data?.app_data?.type?.includes('ORDER')" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <svg v-else-if="notification.data?.app_data?.type?.includes('PRESCRIPTION')" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-4">
                  <h3
                    class="text-lg font-bold text-gray-900 dark:text-white"
                    :class="{ 'font-black': !notification.read_at, 'text-gray-700 dark:text-gray-200': notification.read_at }"
                  >
                    {{ notification.data?.title || 'System Notification' }}
                  </h3>
                  <span class="text-xs font-semibold text-gray-400 dark:text-gray-500 shrink-0 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                    {{ formatDate(notification.created_at) }}
                  </span>
                </div>
                
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ notification.data?.body || 'You have a new update in your account.' }}
                </p>
                
                <!-- Status Pill -->
                <div v-if="notification.data?.app_data?.status" class="mt-3 inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600">
                  <span class="w-2 h-2 rounded-full mr-2" :class="notification.data.app_data.status === 'confirmed' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : notification.data.app_data.status === 'processing' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-gray-500'"></span>
                  {{ notification.data.app_data.status }}
                </div>
                
                <div class="mt-5 flex items-center gap-3">
                  <button
                    v-if="notification.data?.app_data?.type"
                    class="px-5 py-2 text-sm font-bold rounded-full bg-[#246BFD]/10 text-[#246BFD] hover:bg-[#246BFD] hover:text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                  >
                    View Details
                  </button>
                  <button
                    @click.stop="deleteNotification(notification.id, $event)"
                    class="px-4 py-2 text-sm font-bold rounded-full text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
