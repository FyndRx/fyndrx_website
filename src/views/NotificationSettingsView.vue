<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationsStore } from '@/store/notifications';
import {
  notificationService,
  type CategoryPreference,
  type NotificationCategory,
  type NotificationChannel,
} from '@/services/notificationService';
import { useNotification } from '@/composables/useNotification';
import Switch from '@/components/Switch.vue';

const store = useNotificationsStore();
const toast = useNotification();

const loading = ref(true);
const categories = ref<CategoryPreference[]>([]);
const savingKey = ref<string | null>(null);

const CHANNELS: { key: NotificationChannel; label: string }[] = [
  { key: 'push', label: 'Push' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
];

const HINTS: Record<string, string> = {
  no_email: 'Add an email address to your profile to get emails.',
  no_phone: 'Add a phone number to your profile to get SMS.',
  no_device: 'Enable push below to get push notifications on this device.',
};

// Reasons worth surfacing once, above the grid, rather than on every row.
const unreachable = computed(() => {
  const reasons = new Set<string>();
  for (const cat of categories.value) {
    for (const ch of CHANNELS) {
      const state = cat.channels[ch.key];
      if (state.supported && !state.reachable && state.unreachable_reason) reasons.add(state.unreachable_reason);
    }
  }
  return [...reasons].filter((r) => r !== 'no_device');
});

const loadPreferences = async () => {
  loading.value = true;
  try {
    categories.value = await notificationService.getPreferenceCategories();
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    toast.error('Failed to load', 'Could not load your notification preferences. Please try again.');
  } finally {
    loading.value = false;
  }
};

const toggle = async (category: CategoryPreference, channel: NotificationChannel) => {
  const state = category.channels[channel];
  if (!state.supported || state.locked) return;

  const key = `${category.key}.${channel}`;
  const previous = state.enabled;
  state.enabled = !previous;
  savingKey.value = key;
  try {
    categories.value = await notificationService.updatePreferenceCategories({
      [category.key as NotificationCategory]: { [channel]: !previous },
    });
  } catch (error) {
    console.error('Failed to update notification preference:', error);
    state.enabled = previous;
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
        <h1 class="text-3xl font-semibold text-gray-900 dark:text-white">Notification Settings</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Choose how and when FyndRx contacts you.</p>
      </div>

      <!-- Push Notifications status -->
      <div class="rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 p-6 md:p-8 mb-6">
        <div class="flex items-start gap-4">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :class="store.pushPermission === 'granted' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-brand-500/10 text-brand-500'"
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
            class="shrink-0 px-4 py-2 rounded-full bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-all disabled:opacity-60"
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
      <div class="rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 p-6 md:p-8">
        <h2 class="font-bold text-gray-900 dark:text-white mb-1">Notify me about</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Pick which channels you want for each type of update.</p>

        <div v-if="loading" class="py-12 text-center text-gray-400 text-sm font-medium">Loading your preferences…</div>

        <div v-else>
          <!-- Column headers -->
          <div class="hidden sm:flex items-center gap-2 pb-3 border-b border-gray-200/70 dark:border-white/10">
            <span class="flex-1"></span>
            <span
              v-for="ch in CHANNELS"
              :key="ch.key"
              class="w-16 shrink-0 text-xs font-bold text-gray-400 dark:text-gray-500 text-center"
            >
              {{ ch.label }}
            </span>
          </div>

          <div
            v-if="unreachable.length"
            class="mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
          >
            <p v-for="reason in unreachable" :key="reason">{{ HINTS[reason] }}</p>
            <router-link to="/profile/edit" class="font-bold underline">Update your profile</router-link>
          </div>

          <div
            v-for="cat in categories"
            :key="cat.key"
            class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 py-4 border-b border-gray-200/70 dark:border-white/10 last:border-0"
          >
            <div class="flex-1">
              <p class="font-bold text-gray-900 dark:text-white text-sm">{{ cat.label }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ cat.description }}</p>
            </div>
            <div class="flex sm:contents gap-3 sm:gap-2">
              <div v-for="ch in CHANNELS" :key="ch.key" class="flex sm:w-16 sm:shrink-0 sm:justify-center items-center gap-2">
                <span class="sm:hidden text-xs font-bold text-gray-400 dark:text-gray-500 w-10">{{ ch.label }}</span>
                <Switch
                  v-if="cat.channels[ch.key].supported"
                  :model-value="cat.channels[ch.key].enabled"
                  :disabled="cat.channels[ch.key].locked || savingKey === `${cat.key}.${ch.key}`"
                  @update:model-value="toggle(cat, ch.key)"
                />
                <span v-else class="text-gray-300 dark:text-gray-600 text-sm w-11 text-center" title="Not sent on this channel">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
