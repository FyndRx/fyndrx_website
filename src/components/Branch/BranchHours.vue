<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.hoursRows.value.length > 0" class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md sm:p-8 dark:bg-gray-800/60 dark:ring-white/10">
    <div class="flex items-center gap-3 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Operating Hours</h2>
    </div>
    <div class="bg-white/80 dark:bg-gray-800/70 rounded-2xl ring-1 ring-gray-200/70 dark:ring-white/10 overflow-hidden shadow-sm">
      <div v-for="row in branchState.hoursRows.value" :key="row.key"
        class="flex items-center px-6 py-3.5 border-b last:border-b-0 border-gray-200/70 dark:border-white/10"
        :class="row.key === branchState.todayKey.value ? 'bg-brand-500/5 dark:bg-brand-500/10' : ''"
      >
        <div class="flex items-center gap-2.5 w-36 flex-shrink-0">
          <span class="text-sm font-semibold" :class="row.key === branchState.todayKey.value ? 'text-brand-500' : 'text-gray-700 dark:text-gray-300'">{{ row.day }}</span>
          <span v-if="row.key === branchState.todayKey.value" class="text-xs font-medium text-white bg-brand-500 px-2 py-0.5 rounded-full leading-none">Today</span>
        </div>
        <div class="flex-1 mx-4 border-t border-dashed border-gray-200/70 dark:border-white/10"></div>
        <span class="text-sm font-semibold" :class="[
          !row.value ? 'text-gray-400 dark:text-gray-500 font-normal italic' :
          row.value.toLowerCase() === 'closed' ? 'text-red-500 dark:text-red-400' :
          row.value.toLowerCase().includes('24') ? 'text-emerald-600 dark:text-emerald-400' :
          row.key === branchState.todayKey.value ? 'text-brand-500' : 'text-gray-900 dark:text-white'
        ]">{{ row.value || 'Not listed' }}</span>
      </div>
    </div>
  </section>
</template>
