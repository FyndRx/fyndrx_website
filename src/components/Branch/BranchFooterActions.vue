<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;

const action =
  'flex-1 py-3.5 text-sm font-semibold text-center rounded-full transition duration-200 ease-out-quart hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4';
</script>

<template>
  <div v-if="branchState.branch.value" class="flex flex-col gap-3 pt-2 sm:flex-row">
    <a
      :href="`tel:${branchState.branch.value.phone}`"
      :class="[action, 'bg-brand-500 text-white shadow-glow-brand hover:bg-brand-600 focus-visible:ring-brand-500/30']"
    >Call branch</a>
    <a
      v-if="branchState.whatsappUrl.value"
      :href="branchState.whatsappUrl.value"
      target="_blank"
      rel="noopener noreferrer"
      :class="[action, 'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500/30']"
    >WhatsApp</a>
    <a
      v-if="branchState.mapsUrl.value"
      :href="branchState.mapsUrl.value"
      target="_blank"
      rel="noopener noreferrer"
      :class="[action, 'bg-white/80 text-gray-800 ring-1 ring-gray-200 backdrop-blur hover:text-brand-600 hover:ring-brand-500 dark:bg-white/5 dark:text-white dark:ring-white/10 focus-visible:ring-brand-500/30']"
    >Directions</a>
  </div>
</template>
