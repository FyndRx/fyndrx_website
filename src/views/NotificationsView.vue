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
  <div class="pb-24">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
        <div>
          <h1 class="mb-2 text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white"><span class="text-brand-500 dark:text-brand-400">Notifications</span></h1>
          <p class="text-gray-600 dark:text-gray-300">Stay updated on your orders and account activity</p>
        </div>

        <button
          v-if="store.unreadCount > 0"
          type="button"
          @click="store.markAllAsRead"
          class="flex items-center self-start gap-2 px-5 py-2.5 text-sm md:self-auto font-medium text-white rounded-full shadow-glow-brand transition duration-200 bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          Mark all as read
        </button>
      </div>

      <!-- Filters -->
      <section class="p-5 mb-8 space-y-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 md:p-6" aria-label="Filters">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">Filters</h2>
            <span v-if="hasActiveFilters" class="px-2.5 py-0.5 text-xs font-medium text-white rounded-full bg-brand-500">{{ activeFilterCount }} active</span>
          </div>
          <button
            v-if="hasActiveFilters"
            type="button"
            @click="clearFilters"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors rounded-full dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            Clear all
          </button>
        </div>

        <!-- Read state -->
        <div>
          <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Read state</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="Read state">
            <button type="button" :aria-pressed="!unreadOnly" @click="unreadOnly = false" class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30" :class="!unreadOnly ? 'bg-brand-500 text-white shadow-glow-brand' : 'bg-white/80 text-gray-700 ring-1 ring-gray-200 backdrop-blur hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300'">All</button>
            <button type="button" :aria-pressed="unreadOnly" @click="unreadOnly = true" class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30" :class="unreadOnly ? 'bg-brand-500 text-white shadow-glow-brand' : 'bg-white/80 text-gray-700 ring-1 ring-gray-200 backdrop-blur hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300'">
              Unread
              <span
                v-if="store.unreadCount > 0"
                class="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-xs font-semibold rounded-full"
                :class="unreadOnly ? 'bg-white/25 text-white' : 'bg-red-500 text-white'"
              >{{ store.unreadCount > 99 ? '99+' : store.unreadCount }}</span>
            </button>
          </div>
        </div>

        <!-- Type -->
        <div>
          <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="Type">
            <button
              v-for="opt in CATEGORY_OPTIONS"
              :key="opt.key"
              type="button"
              :aria-pressed="selectedCategory === opt.key"
              @click="selectedCategory = opt.key"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              :class="selectedCategory === opt.key ? 'bg-brand-500 text-white shadow-glow-brand' : 'bg-white/80 text-gray-700 ring-1 ring-gray-200 backdrop-blur hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300'"
            >{{ opt.label }}</button>
          </div>
        </div>

        <!-- Time range + Status -->
        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 md:items-end">
          <div>
            <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Time range</p>
            <div class="flex flex-wrap gap-2" role="group" aria-label="Time range">
              <button
                v-for="opt in DATE_PRESETS"
                :key="opt.key"
                type="button"
                :aria-pressed="selectedDatePreset === opt.key"
                @click="selectedDatePreset = opt.key"
                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                :class="selectedDatePreset === opt.key ? 'bg-brand-500 text-white shadow-glow-brand' : 'bg-white/80 text-gray-700 ring-1 ring-gray-200 backdrop-blur hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300'"
              >{{ opt.label }}</button>
            </div>
          </div>

          <div class="w-full md:w-56">
            <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <Dropdown
              v-model="selectedStatus"
              :options="statusDropdownOptions"
              placeholder="All Statuses"
              variant="outlined"
              size="small"
            />
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div v-if="store.loading && store.notifications.length === 0" class="py-20 text-center">
        <div class="w-10 h-10 mx-auto border-2 rounded-full animate-spin border-brand-500 border-t-transparent" role="status" aria-label="Loading"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Loading notifications…</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="store.notifications.length === 0" class="py-12">
        <div class="max-w-lg p-12 mx-auto text-center rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-brand-500/10">
            <svg class="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <h3 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ hasActiveFilters ? 'No matches' : "You're all caught up" }}</h3>
          <p class="text-gray-500 dark:text-gray-400">{{ hasActiveFilters ? 'No notifications match these filters.' : 'New updates about your orders and account will show up here.' }}</p>
          <button
            v-if="hasActiveFilters"
            type="button"
            @click="clearFilters"
            class="px-6 py-3 mt-6 text-sm font-medium text-white rounded-full shadow-glow-brand transition duration-200 bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >Clear filters</button>
        </div>
      </div>

      <!-- Notifications List, grouped by date -->
      <div v-else class="space-y-8">
        <div v-for="group in groupedNotifications" :key="group.label">
          <h2 class="px-1 mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
            {{ group.label }}
          </h2>
          <transition-group name="list" tag="div" class="space-y-3">
            <div
              v-for="{ notification, style } in group.items"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              role="link"
              tabindex="0"
              @keydown.enter.self="handleNotificationClick(notification)"
              class="relative p-5 overflow-hidden transition duration-300 cursor-pointer group ease-out-quart rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 md:p-6"
              :class="!notification.read_at ? 'ring-brand-500/30' : 'opacity-80 hover:opacity-100'"
            >
              <!-- Unread marker -->
              <span v-if="!notification.read_at" class="absolute w-2.5 h-2.5 rounded-full top-5 right-5 bg-brand-500" aria-label="Unread"></span>

              <div class="relative flex items-start gap-4 md:gap-5">

                <!-- Dynamic Icon Box -->
                <div
                  class="flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 ring-1 ring-gray-200/70 dark:ring-white/10"
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

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-4">
                    <h3
                      class="text-base font-semibold text-gray-900 dark:text-white"
                      :class="{ 'text-gray-700 dark:text-gray-200 font-medium': notification.read_at }"
                    >
                      {{ notification.data?.title || 'System Notification' }}
                    </h3>
                    <span
                      :title="formatDate(notification.created_at, 'MMM d, yyyy h:mm a')"
                      class="mr-6 text-xs text-gray-500 dark:text-gray-400 shrink-0"
                    >
                      {{ formatDate(notification.created_at, 'h:mm a') }}
                    </span>
                  </div>

                  <p class="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {{ notification.data?.body || 'You have a new update in your account.' }}
                  </p>

                  <!-- Status Pill -->
                  <StatusBadge
                    v-if="notification.data?.app_data?.status"
                    :status="notification.data.app_data.status"
                    size="sm"
                    show-dot
                    glow
                    class="mt-3"
                  />

                  <div class="flex items-center gap-3 mt-4">
                    <button
                      v-if="notification.data?.app_data?.type"
                      type="button"
                      class="px-4 py-1.5 text-sm font-medium transition duration-200 rounded-full text-brand-600 bg-brand-500/10 ease-out-quart hover:bg-brand-500 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-brand-300 dark:hover:text-white"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      @click.stop="deleteNotification(notification.id, $event)"
                      class="px-4 py-1.5 ml-auto text-sm font-medium text-red-600 transition duration-200 rounded-full dark:text-red-400 ease-out-quart hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
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
            type="button"
            @click="store.loadMoreNotifications()"
            :disabled="store.loadingMore"
            class="px-8 py-3 text-sm font-medium text-gray-700 transition duration-200 rounded-full bg-white/70 ring-1 ring-gray-200 backdrop-blur ease-out-quart dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 hover:ring-brand-500 hover:text-brand-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >
            {{ store.loadingMore ? 'Loading…' : 'Load more notifications' }}
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

@media (prefers-reduced-motion: reduce) {
  .list-enter-active,
  .list-leave-active {
    transition: none;
  }
}
</style>
