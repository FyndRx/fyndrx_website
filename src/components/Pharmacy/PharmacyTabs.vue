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
  <div class="bg-white shadow-xl dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
    <div class="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 px-6 sm:px-8">
      <nav class="flex overflow-x-auto no-scrollbar gap-8">
        <button
          v-for="tab in ['overview', 'services', 'branches', 'reviews']"
          :key="tab"
          v-show="tab !== 'branches' || (pharmacyState.pharmacy.value?.branchesCount || 0) > 0"
          @click="pharmacyState.switchTab(tab)"
          class="px-1 py-4 text-sm font-semibold capitalize transition-all border-b-2 whitespace-nowrap relative group"
          :class="[
            pharmacyState.activeTab.value === tab
              ? 'border-[#246BFD] text-[#246BFD]'
              : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'
          ]"
        >
          <span class="relative z-10">{{ tab }}</span>
          <div v-if="pharmacyState.activeTab.value === tab" class="absolute inset-0 bg-[#246BFD]/5 blur-xl -z-0"></div>
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
