<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { startOfWeek, startOfMonth, format as formatDateFns } from 'date-fns';
import { useNotificationsStore } from '@/store/notifications';
import { formatDate, dayGroupLabel } from '@/utils/date';
import { getNotificationStyle } from '@/utils/notificationDisplay';
import StatusBadge from '@/components/StatusBadge.vue';
import StatusIcon from '@/components/StatusIcon.vue';
import Dropdown from '@/components/Dropdown.vue';

const router = useRouter();
const store = useNotificationsStore();

// ── Filters — all backend-driven via store.setFilters(), not client-side array
// filtering, so "load more" pages in additional results that already match.
const unreadOnly = ref(false);
const selectedCategory = ref<'' | 'order' | 'prescription' | 'pharmacy' | 'broadcast' | 'price_alert'>('');
const selectedStatus = ref('');
const selectedDatePreset = ref<'all' | 'today' | 'week' | 'month'>('all');

const CATEGORY_OPTIONS: { key: '' | 'order' | 'prescription' | 'pharmacy' | 'broadcast' | 'price_alert'; label: string }[] = [
  { key: '', label: 'All Types' },
  { key: 'order', label: 'Orders' },
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'broadcast', label: 'Announcements' },
  { key: 'price_alert', label: 'Price Alerts' },
];

// Only order-lifecycle statuses are ever populated on a notification today
// (prescription/pharmacy notifications don't carry app_data.status) — offering
// prescription-only statuses here would just be filter options that always
// return zero results.
const STATUS_OPTIONS = [
  { key: '', label: 'All Statuses' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const DATE_PRESETS: { key: 'all' | 'today' | 'week' | 'month'; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const dateRangeForPreset = (preset: typeof selectedDatePreset.value) => {
  const today = formatDateFns(new Date(), 'yyyy-MM-dd');
  switch (preset) {
    case 'today':
      return { date_from: today, date_to: today };
    case 'week':
      return { date_from: formatDateFns(startOfWeek(new Date()), 'yyyy-MM-dd'), date_to: today };
    case 'month':
      return { date_from: formatDateFns(startOfMonth(new Date()), 'yyyy-MM-dd'), date_to: today };
    default:
      return { date_from: undefined, date_to: undefined };
  }
};

const statusDropdownOptions = STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.key }));

const hasActiveFilters = computed(() =>
  unreadOnly.value || !!selectedCategory.value || !!selectedStatus.value || selectedDatePreset.value !== 'all'
);

const activeFilterCount = computed(() =>
  [unreadOnly.value, !!selectedCategory.value, !!selectedStatus.value, selectedDatePreset.value !== 'all']
    .filter(Boolean).length
);

const clearFilters = () => {
  unreadOnly.value = false;
  selectedCategory.value = '';
  selectedStatus.value = '';
  selectedDatePreset.value = 'all';
};

const applyFilters = () => {
  store.setFilters({
    unread_only: unreadOnly.value || undefined,
    category: selectedCategory.value || undefined,
    status: selectedStatus.value || undefined,
    ...dateRangeForPreset(selectedDatePreset.value),
  });
};

watch([unreadOnly, selectedCategory, selectedStatus, selectedDatePreset], applyFilters);

const displayNotifications = computed(() =>
  store.notifications.map((notification) => ({
    notification,
    style: getNotificationStyle(notification.data?.app_data?.type, notification.data?.app_data?.status),
  }))
);

// Backend already returns newest-first, so grouping is a single linear pass:
// start a new group whenever the calendar day changes.
const groupedNotifications = computed(() => {
  const groups: { label: string; items: typeof displayNotifications.value }[] = [];
  for (const entry of displayNotifications.value) {
    const label = dayGroupLabel(entry.notification.created_at);
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.label === label) {
      currentGroup.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }
  return groups;
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
    case 'PRICE_ALERT':
      if (appData.product_id) {
        router.push({ name: 'MedicationDetail', params: { id: appData.product_id } });
      } else {
        router.push({ name: 'price-alerts' });
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
  <div class="pb-12 relative overflow-hidden">
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
      <div class="mb-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-gray-700/50 shadow-sm p-5 md:p-6 space-y-5">
        <!-- Panel header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-[#246BFD]/10 flex items-center justify-center text-[#246BFD]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            </div>
            <h2 class="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Filters</h2>
            <span
              v-if="hasActiveFilters"
              class="px-2 py-0.5 rounded-full bg-[#246BFD] text-white text-[11px] font-black"
            >
              {{ activeFilterCount }} active
            </span>
          </div>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-sm font-bold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Clear all
          </button>
        </div>

        <!-- Read state -->
        <div>
          <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Read state</p>
          <div class="flex flex-wrap gap-2">
            <button
              @click="unreadOnly = false"
              class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border"
              :class="!unreadOnly ? 'bg-[#246BFD] text-white border-[#246BFD] shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40'"
            >
              All
            </button>
            <button
              @click="unreadOnly = true"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border"
              :class="unreadOnly ? 'bg-[#246BFD] text-white border-[#246BFD] shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40'"
            >
              Unread
              <span
                v-if="store.unreadCount > 0"
                class="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-black rounded-full"
                :class="unreadOnly ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm shadow-red-500/20'"
              >
                {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Type -->
        <div>
          <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Type</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in CATEGORY_OPTIONS"
              :key="opt.key"
              @click="selectedCategory = opt.key"
              class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border"
              :class="selectedCategory === opt.key ? 'bg-[#246BFD] text-white border-[#246BFD] shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40'"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Time range + Status -->
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 md:items-end">
          <div>
            <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Time Range</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in DATE_PRESETS"
                :key="opt.key"
                @click="selectedDatePreset = opt.key"
                class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border"
                :class="selectedDatePreset === opt.key ? 'bg-[#246BFD] text-white border-[#246BFD] shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="w-full md:w-56">
            <p class="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</p>
            <Dropdown
              v-model="selectedStatus"
              :options="statusDropdownOptions"
              placeholder="All Statuses"
              variant="outlined"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.loading && store.notifications.length === 0" class="py-20 text-center">
        <div class="animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-[#246BFD] border-r-[#246BFD] mx-auto"></div>
        <p class="mt-5 text-gray-500 font-medium animate-pulse">Syncing notifications...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.notifications.length === 0" class="py-20">
        <div class="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/50 dark:border-gray-700/50 shadow-sm max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-300">
          <div class="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-3">
            <svg class="w-12 h-12 text-gray-400 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <h3 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{{ hasActiveFilters ? 'No matches' : "You're all caught up!" }}</h3>
          <p class="text-gray-500 dark:text-gray-400">{{ hasActiveFilters ? 'No notifications match these filters.' : 'There are no notifications at this time. Go grab a coffee!' }}</p>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="mt-5 px-5 py-2.5 text-sm font-bold text-[#246BFD] bg-[#246BFD]/10 rounded-full hover:bg-[#246BFD] hover:text-white transition-all"
          >
            Clear filters
          </button>
        </div>
      </div>

      <!-- Notifications List, grouped by date -->
      <div v-else class="space-y-8">
        <div v-for="group in groupedNotifications" :key="group.label">
          <h2 class="mb-4 px-1 text-sm font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {{ group.label }}
          </h2>
          <transition-group name="list" tag="div" class="space-y-4">
            <div
              v-for="{ notification, style } in group.items"
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
                  :class="style.containerClass"
                >
                  <!-- Determine Icon based on app_data status, falling back to type -->
                  <StatusIcon v-if="notification.data?.app_data?.status" :status="notification.data.app_data.status" class="w-7 h-7" />
                  <svg v-else-if="style.iconKey === 'order'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  <svg v-else-if="style.iconKey === 'prescription'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <svg v-else-if="style.iconKey === 'pharmacy'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 15h.01M15 15h.01"/></svg>
                  <svg v-else-if="style.iconKey === 'broadcast'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c2.32.184 4.594.583 6.75 1.65 1.185.632 1.986-.7 1.986-1.5V6.75c0-.8-.801-2.132-1.986-1.5-2.156 1.067-4.43 1.466-6.75 1.65m0 9.18V6.75"/></svg>
                  <svg v-else-if="style.iconKey === 'price_alert'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 17h8m0 0V9m0 8L11 5l-4 4-6-6"/></svg>
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
                    <span
                      :title="formatDate(notification.created_at, 'MMM d, yyyy h:mm a')"
                      class="text-xs font-semibold text-gray-400 dark:text-gray-500 shrink-0 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg"
                    >
                      {{ formatDate(notification.created_at, 'h:mm a') }}
                    </span>
                  </div>

                  <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {{ notification.data?.body || 'You have a new update in your account.' }}
                  </p>

                  <!-- Status Pill -->
                  <StatusBadge
                    v-if="notification.data?.app_data?.status"
                    :status="notification.data.app_data.status"
                    size="sm"
                    show-dot
                    glow
                    class="mt-3 shadow-sm"
                  />

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

        <!-- Load More -->
        <div v-if="store.hasMore" class="flex justify-center pt-2">
          <button
            @click="store.loadMoreNotifications()"
            :disabled="store.loadingMore"
            class="px-6 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ store.loadingMore ? 'Loading…' : 'Load More Notifications' }}
          </button>
        </div>
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
