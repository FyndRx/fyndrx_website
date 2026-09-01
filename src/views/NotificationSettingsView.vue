<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotificationsStore } from '@/store/notifications';
import {
  notificationService,
  type NotificationPreferences,
  type NotificationCategory,
  type NotificationChannel,
} from '@/services/notificationService';
import { useNotification } from '@/composables/useNotification';
import Switch from '@/components/Switch.vue';

const store = useNotificationsStore();
const toast = useNotification();

const loading = ref(true);
const preferences = ref<NotificationPreferences | null>(null);
const savingKey = ref<string | null>(null);

const CATEGORIES: { key: NotificationCategory; label: string; description: string }[] = [
  { key: 'order_updates', label: 'Order Updates', description: "Status changes on orders you've placed." },
  { key: 'clinical', label: 'Clinical', description: 'Prescription and consultation updates from your care team.' },
  { key: 'promotions', label: 'Promotions', description: 'Discounts, deals, and limited-time offers.' },
  { key: 'news', label: 'News', description: 'Product updates and announcements from FyndRx.' },
  { key: 'reminders', label: 'Reminders', description: 'Medication refill and appointment reminders.' },
  { key: 'price_alerts', label: 'Price Alerts', description: 'When a medication you\'re watching drops in price.' },
];

const CHANNELS: { key: NotificationChannel; label: string }[] = [
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
];

const loadPreferences = async () => {
  loading.value = true;
  try {
    preferences.value = await notificationService.getPreferences();
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    toast.error('Failed to load', 'Could not load your notification preferences. Please try again.');
  } finally {
    loading.value = false;
  }
};

const toggle = async (category: NotificationCategory, channel: NotificationChannel) => {
  if (!preferences.value) return;
  const key = `${category}.${channel}`;
  const previous = preferences.value[category][channel];
  const next = !previous;

  preferences.value[category][channel] = next;
  savingKey.value = key;
  try {
    await notificationService.updatePreferences({ [category]: { [channel]: next } });
  } catch (error) {
    console.error('Failed to update notification preference:', error);
    preferences.value[category][channel] = previous;
    toast.error('Failed to save', 'Could not update this preference. Please try again.');
  } finally {
    savingKey.value = null;
  }
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

onMounted(loadPreferences);
</script>

<template>
  <div class="pb-20">
    <div class="container mx-auto px-4 max-w-2xl">

      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900 dark:text-white">Notification Settings</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Choose how and when FyndRx contacts you.</p>
      </div>

      <!-- Push Notifications status -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 mb-6">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :class="store.pushPermission === 'granted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-[#246BFD]/10 text-[#246BFD]'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-gray-900 dark:text-white">Browser Push Notifications</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <template v-if="store.pushPermission === 'granted'">You'll get real-time alerts in this browser.</template>
              <template v-else-if="store.pushPermission === 'denied'">Blocked in your browser settings. Allow notifications for this site to turn it back on.</template>
              <template v-else-if="store.pushPermission === 'unsupported'">Not supported in this browser.</template>
              <template v-else>Turn this on to get instant alerts for orders, prescriptions, and more.</template>
            </p>
          </div>
          <button
            v-if="store.pushPermission === 'default'"
            @click="enablePush"
            :disabled="enablingPush"
            class="shrink-0 px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-bold hover:bg-[#5089FF] transition-all disabled:opacity-60"
          >
            {{ enablingPush ? 'Enabling…' : 'Enable' }}
          </button>
          <span
            v-else-if="store.pushPermission === 'granted'"
            class="shrink-0 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
          >
            Enabled
          </span>
        </div>
      </div>

      <!-- Preference grid -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8">
        <h2 class="font-bold text-gray-900 dark:text-white mb-1">Notify me about</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Pick which channels you want for each type of update.</p>

        <div v-if="loading" class="py-12 text-center text-gray-400 text-sm font-medium">Loading your preferences…</div>

        <div v-else-if="preferences">
          <!-- Column headers -->
          <div class="hidden sm:flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <span class="flex-1"></span>
            <span
              v-for="ch in CHANNELS"
              :key="ch.key"
              class="w-16 shrink-0 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center"
            >
              {{ ch.label }}
            </span>
          </div>

          <div
            v-for="cat in CATEGORIES"
            :key="cat.key"
            class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 py-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
          >
            <div class="flex-1">
              <p class="font-bold text-gray-900 dark:text-white text-sm">{{ cat.label }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ cat.description }}</p>
            </div>
            <div class="flex sm:contents gap-3 sm:gap-2">
              <div v-for="ch in CHANNELS" :key="ch.key" class="flex sm:w-16 sm:shrink-0 sm:justify-center items-center gap-2">
                <span class="sm:hidden text-xs font-bold text-gray-400 dark:text-gray-500 w-10">{{ ch.label }}</span>
                <Switch
                  :model-value="preferences[cat.key][ch.key]"
                  :disabled="savingKey === `${cat.key}.${ch.key}`"
                  @update:model-value="toggle(cat.key, ch.key)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
