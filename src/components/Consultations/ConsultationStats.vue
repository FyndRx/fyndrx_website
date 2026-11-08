<script setup lang="ts">
import type { ConsultationStats } from '@/types/consultation';

defineProps<{
  stats: ConsultationStats;
  loading?: boolean;
}>();
</script>

<template>
  <div class="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
    <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
      <div class="mb-1 text-sm text-gray-600 dark:text-gray-400">Total consultations</div>
      <div class="text-3xl font-semibold text-gray-900 dark:text-white">
        <span v-if="loading" class="animate-pulse">…</span>
        <span v-else>{{ stats.total }}</span>
      </div>
    </div>
    <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
      <div class="mb-1 text-sm text-gray-600 dark:text-gray-400">Pending</div>
      <div class="text-3xl font-semibold text-accent-600 dark:text-accent-400">
        <span v-if="loading" class="animate-pulse">…</span>
        <span v-else>{{ stats.pending }}</span>
      </div>
    </div>
    <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
      <div class="mb-1 text-sm text-gray-600 dark:text-gray-400">Completed</div>
      <div class="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
        <span v-if="loading" class="animate-pulse">…</span>
        <span v-else>{{ stats.completed }}</span>
      </div>
    </div>
    <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
      <div class="mb-1 text-sm text-gray-600 dark:text-gray-400">Response rate</div>
      <div class="text-3xl font-semibold text-brand-600 dark:text-brand-300">
        <span v-if="loading" class="animate-pulse">…</span>
        <span v-else>{{ stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0 }}%</span>
      </div>
    </div>
  </div>
</template>
