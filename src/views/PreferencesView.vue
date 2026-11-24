<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsService, type SettingGroup, type SettingDefinition, type SettingValue } from '@/services/settingsService';
import { useNotification } from '@/composables/useNotification';
import Switch from '@/components/Switch.vue';

const toast = useNotification();

const loading = ref(true);
const groups = ref<SettingGroup[]>([]);
const savingKey = ref<string | null>(null);

const load = async () => {
  loading.value = true;
  try {
    groups.value = await settingsService.getMine();
  } catch (error) {
    console.error('Failed to load settings:', error);
    toast.error('Failed to load', 'Could not load your preferences. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Auto-saves each change on its own, like the notification grid, and rolls back on failure.
const change = async (setting: SettingDefinition, value: SettingValue) => {
  const previous = setting.value;
  setting.value = value;
  savingKey.value = setting.key;
  try {
    groups.value = await settingsService.update({ [setting.key]: value });
  } catch (error) {
    console.error('Failed to save setting:', error);
    setting.value = previous;
    toast.error('Failed to save', 'Could not update this setting. Please try again.');
  } finally {
    savingKey.value = null;
  }
};

const onSelect = (setting: SettingDefinition, event: Event) =>
  change(setting, (event.target as HTMLSelectElement).value);

const resetAll = async () => {
  try {
    groups.value = await settingsService.reset();
    toast.success('Preferences reset', 'Your preferences are back to their defaults.');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    toast.error('Failed to reset', 'Could not reset your preferences. Please try again.');
  }
};

onMounted(load);
</script>

<template>
  <div class="pb-20">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-semibold text-gray-900 dark:text-white">Preferences</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Language, quiet hours, privacy and more.</p>
        </div>
        <button
          v-if="!loading && groups.length"
          @click="resetAll"
          class="shrink-0 text-sm font-bold text-gray-500 hover:text-brand-500 transition-colors"
        >
          Reset to defaults
        </button>
      </div>

      <div v-if="loading" class="py-12 text-center text-gray-400 text-sm font-medium">Loading your preferences…</div>

      <div
        v-for="group in groups"
        :key="group.key"
        class="rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 p-6 md:p-8 mb-6"
      >
        <h2 class="font-bold text-gray-900 dark:text-white mb-4">{{ group.label }}</h2>

        <div
          v-for="setting in group.settings"
          :key="setting.key"
          class="flex items-center justify-between gap-4 py-4 border-b border-gray-200/70 dark:border-white/10 last:border-0"
        >
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-900 dark:text-white text-sm">{{ setting.label }}</p>
            <p v-if="setting.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ setting.description }}</p>
          </div>

          <Switch
            v-if="setting.type === 'toggle'"
            :model-value="Boolean(setting.value)"
            :disabled="savingKey === setting.key"
            @update:model-value="change(setting, $event)"
          />

          <select
            v-else
            :value="setting.value ?? ''"
            :disabled="savingKey === setting.key"
            class="shrink-0 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
            @change="onSelect(setting, $event)"
          >
            <option v-for="(label, value) in setting.options ?? {}" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
