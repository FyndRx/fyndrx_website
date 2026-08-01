<script setup lang="ts">
import { inject } from 'vue';
import PharmacyMap from '@/components/PharmacyMap.vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-7 bg-orange-500 rounded-full"></div>
        <h2 class="text-xl font-black text-gray-900 dark:text-white">Location</h2>
      </div>
      <a v-if="branchState.mapsUrl.value" :href="branchState.mapsUrl.value" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#246BFD] hover:underline">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        Open in Maps
      </a>
    </div>
    <!-- Address + distance -->
    <div class="mb-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      </div>
      <div>
        <p class="font-bold text-gray-900 dark:text-white text-base leading-snug">{{ branchState.branch.value.address }}</p>
        <p v-if="branchState.locationLine.value" class="text-sm font-semibold text-[#246BFD] mt-0.5">{{ branchState.locationLine.value }}</p>
        <p v-if="branchState.branch.value.digitalAddress" class="text-xs font-mono text-gray-400 mt-0.5">{{ branchState.branch.value.digitalAddress }}</p>
        <p v-if="branchState.distanceLabel.value" class="inline-flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
          <svg class="w-3.5 h-3.5 text-[#246BFD]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          {{ branchState.distanceLabel.value }} from your location
        </p>
      </div>
    </div>
    <div class="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm h-72 sm:h-96">
      <PharmacyMap v-if="branchState.mapLocation.value" :location="branchState.mapLocation.value" :pharmacy-name="branchState.branch.value.branchName || branchState.pharmacyName.value" class="w-full h-full" />
      <div v-else class="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3 text-gray-400">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        <p class="text-sm font-medium">Location coordinates not available</p>
      </div>
    </div>
  </section>
</template>
