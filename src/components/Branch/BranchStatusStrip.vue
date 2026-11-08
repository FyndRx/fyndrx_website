<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';
import { STORAGE_LABELS } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;

const chip = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full';
</script>

<template>
  <div v-if="branchState.branch.value" class="px-4 mx-auto mt-4 max-w-5xl sm:px-6">
    <div class="flex flex-wrap items-center gap-2 px-3 py-2.5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
      <span
        :class="[chip, branchState.isCurrentlyOpen.value ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400']"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="branchState.isCurrentlyOpen.value ? 'bg-emerald-500 motion-safe:animate-pulse' : 'bg-red-500'"></span>
        {{ branchState.isCurrentlyOpen.value ? 'Open now' : 'Closed' }}
      </span>
      <span v-if="branchState.branch.value.isActive === false" :class="[chip, 'bg-gray-500/10 text-gray-600 dark:text-gray-300']">Inactive</span>
      <span v-if="branchState.branch.value.acceptsOnlinePrescriptions" :class="[chip, 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400']">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        Online Rx
      </span>
      <span v-for="s in (branchState.branch.value.specialStorage ?? [])" :key="s" :class="[chip, 'bg-brand-500/10 text-brand-700 dark:text-brand-300']">{{ STORAGE_LABELS[s] ?? s }}</span>
      <span v-if="branchState.distanceLabel.value" :class="[chip, 'bg-brand-500/10 text-brand-700 dark:text-brand-300']">
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
        {{ branchState.distanceLabel.value }}
      </span>
    </div>
  </div>
</template>
