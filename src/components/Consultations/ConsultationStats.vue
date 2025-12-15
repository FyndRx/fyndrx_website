<script setup lang="ts">
import type { ConsultationStats } from '@/types/consultation';
import Card from '@/components/Card.vue';

defineProps<{
  stats: ConsultationStats;
  loading?: boolean;
}>();
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <Card class="p-4 bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30">
      <div class="text-blue-600 dark:text-blue-300 text-sm font-medium mb-1">Total Consultations</div>
      <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">
        <span v-if="loading" class="animate-pulse">...</span>
        <span v-else>{{ stats.total }}</span>
      </div>
    </Card>

    <Card class="p-4 bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-800/30">
      <div class="text-yellow-600 dark:text-yellow-300 text-sm font-medium mb-1">Pending</div>
      <div class="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
        <span v-if="loading" class="animate-pulse">...</span>
        <span v-else>{{ stats.pending }}</span>
      </div>
    </Card>

    <Card class="p-4 bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800/30">
      <div class="text-green-600 dark:text-green-300 text-sm font-medium mb-1">Completed</div>
      <div class="text-2xl font-bold text-green-900 dark:text-green-100">
        <span v-if="loading" class="animate-pulse">...</span>
        <span v-else>{{ stats.completed }}</span>
      </div>
    </Card>

    <Card class="p-4 bg-purple-50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800/30">
      <div class="text-purple-600 dark:text-purple-300 text-sm font-medium mb-1">Response Rate</div>
      <div class="text-2xl font-bold text-purple-900 dark:text-purple-100">
        <span v-if="loading" class="animate-pulse">...</span>
        <span v-else>{{ stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0 }}%</span>
      </div>
    </Card>
  </div>
</template>
