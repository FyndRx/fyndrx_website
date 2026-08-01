<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value?.deliveryInfo">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-7 bg-[#246BFD] rounded-full"></div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white">Delivery</h2>
    </div>
    <div v-if="!branchState.branch.value.deliveryInfo.available" class="flex items-center gap-4 p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div class="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></div>
      <div><p class="font-bold text-gray-700 dark:text-gray-300">Pickup Only</p><p class="text-sm text-gray-500">No home delivery from this branch.</p></div>
    </div>
    <div v-else class="grid grid-cols-3 gap-4">
      <div class="rounded-2xl bg-[#246BFD]/8 dark:bg-[#246BFD]/15 border border-[#246BFD]/15 p-5 text-center"><p class="text-[10px] font-black uppercase tracking-widest text-[#246BFD]/70 mb-1">Base Fee</p><p class="text-3xl font-black text-[#246BFD]">₵{{ branchState.branch.value.deliveryInfo.baseFee?.toFixed(2) ?? '–' }}</p></div>
      <div class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 text-center"><p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Per km</p><p class="text-3xl font-black text-gray-900 dark:text-white">₵{{ branchState.branch.value.deliveryInfo.feePerKm?.toFixed(2) ?? '–' }}</p></div>
      <div class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 text-center"><p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Radius</p><p class="text-3xl font-black text-gray-900 dark:text-white">{{ branchState.branch.value.deliveryInfo.radiusKm ?? '∞' }}<span class="text-base font-normal text-gray-400"> km</span></p></div>
    </div>
  </section>
</template>
