<script setup lang="ts">
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';
import PharmacyOverviewTab from './PharmacyOverviewTab.vue';
import PharmacyServicesTab from './PharmacyServicesTab.vue';
import PharmacyBranchesTab from './PharmacyBranchesTab.vue';
import PharmacyReviewsTab from './PharmacyReviewsTab.vue';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div class="overflow-hidden rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
    <div class="border-b border-gray-200/70 dark:border-white/10 bg-white/40 dark:bg-white/5 px-6 sm:px-8">
      <nav class="flex overflow-x-auto no-scrollbar gap-8" role="tablist">
        <button
          v-for="tab in ['overview', 'services', 'branches', 'reviews']"
          :key="tab"
          v-show="tab !== 'branches' || (pharmacyState.pharmacy.value?.branchesCount || 0) > 0"
          type="button"
          role="tab"
          :aria-selected="pharmacyState.activeTab.value === tab"
          @click="pharmacyState.switchTab(tab)"
          class="relative px-1 py-4 -mb-px text-sm font-semibold capitalize transition duration-200 border-b-2 ease-out-quart whitespace-nowrap focus-visible:outline-none focus-visible:text-brand-600"
          :class="[
            pharmacyState.activeTab.value === tab
              ? 'border-brand-500 text-brand-600 dark:text-brand-300'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          ]"
        >
          {{ tab }}
        </button>
      </nav>
    </div>
    
    <div class="p-6 sm:p-8 tab-content-container">
      <PharmacyOverviewTab v-if="pharmacyState.activeTab.value === 'overview'" />
      <PharmacyServicesTab v-if="pharmacyState.activeTab.value === 'services'" />
      <PharmacyBranchesTab v-if="pharmacyState.activeTab.value === 'branches'" />
      <PharmacyReviewsTab v-if="pharmacyState.activeTab.value === 'reviews'" />
    </div>
  </div>
</template>
