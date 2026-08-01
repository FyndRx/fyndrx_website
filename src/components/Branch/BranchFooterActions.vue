<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <div v-if="branchState.branch.value" class="flex gap-3 pt-2 pb-4">
    <a :href="`tel:${branchState.branch.value.phone}`" class="flex-1 py-3.5 rounded-2xl bg-[#246BFD] text-white font-bold text-sm text-center hover:bg-[#1a56d6] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">Call Branch</a>
    <a v-if="branchState.whatsappUrl.value" :href="branchState.whatsappUrl.value" target="_blank" class="flex-1 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm text-center hover:bg-emerald-600 active:scale-[0.98] transition-all">WhatsApp</a>
    <a v-if="branchState.mapsUrl.value" :href="branchState.mapsUrl.value" target="_blank" class="flex-1 py-3.5 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm text-center border border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:text-[#246BFD] active:scale-[0.98] transition-all">Directions</a>
  </div>
</template>
