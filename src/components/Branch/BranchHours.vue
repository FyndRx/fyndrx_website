<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.hoursRows.value.length > 0">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-7 bg-violet-500 rounded-full"></div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white">Operating Hours</h2>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div v-for="row in branchState.hoursRows.value" :key="row.key"
        class="flex items-center px-6 py-3.5 border-b last:border-b-0 border-gray-100 dark:border-gray-700/60"
        :class="row.key === branchState.todayKey.value ? 'bg-[#246BFD]/5 dark:bg-[#246BFD]/10' : ''"
      >
        <div class="flex items-center gap-2.5 w-36 flex-shrink-0">
          <span class="text-sm font-semibold" :class="row.key === branchState.todayKey.value ? 'text-[#246BFD]' : 'text-gray-700 dark:text-gray-300'">{{ row.day }}</span>
          <span v-if="row.key === branchState.todayKey.value" class="text-[9px] font-black text-white bg-[#246BFD] px-1.5 py-0.5 rounded-full leading-none">TODAY</span>
        </div>
        <div class="flex-1 mx-4 border-t border-dashed border-gray-200 dark:border-gray-700/60"></div>
        <span class="text-sm font-bold" :class="[
          row.value.toLowerCase() === 'closed' ? 'text-red-500 dark:text-red-400' :
          row.value.toLowerCase().includes('24') ? 'text-emerald-600 dark:text-emerald-400' :
          row.key === branchState.todayKey.value ? 'text-[#246BFD]' : 'text-gray-900 dark:text-white'
        ]">{{ row.value }}</span>
      </div>
    </div>
  </section>
</template>
