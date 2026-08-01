<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';
import { STORAGE_LABELS } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <div v-if="branchState.branch.value" class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-20 shadow-sm">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
        :class="branchState.isCurrentlyOpen.value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="branchState.isCurrentlyOpen.value ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
        {{ branchState.isCurrentlyOpen.value ? 'Open Now' : 'Closed' }}
      </span>
      <span v-if="branchState.branch.value.isActive === false" class="px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Inactive</span>
      <span v-if="branchState.branch.value.acceptsOnlinePrescriptions" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        Online Rx
      </span>
      <span v-for="s in (branchState.branch.value.specialStorage ?? [])" :key="s" class="px-2.5 py-1.5 text-xs font-semibold rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">{{ STORAGE_LABELS[s] ?? s }}</span>
      <!-- Distance chip in strip -->
      <span v-if="branchState.distanceLabel.value" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-full bg-[#246BFD]/10 text-[#246BFD]">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
        {{ branchState.distanceLabel.value }}
      </span>
    </div>
  </div>
</template>
