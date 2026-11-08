<script setup lang="ts">
import { inject } from 'vue';
import LazyImage from '@/components/LazyImage.vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <div v-if="branchState.branch.value" class="px-4 mx-auto max-w-5xl sm:px-6">
    <div class="relative h-72 overflow-hidden rounded-3xl shadow-float ring-1 ring-white/70 sm:h-96 dark:ring-white/10 detail-rise">
      <LazyImage
        :src="branchState.branch.value.bannerImage || ''"
        :alt="branchState.branch.value.branchName || ''"
        aspect-ratio="landscape"
        class-name="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/30 to-gray-950/5"></div>

      <!-- Back to the parent pharmacy -->
      <button
        type="button"
        @click="branchState.router.push({ name: 'pharmacy', params: { id: branchState.pharmacyId }, query: { tab: 'branches' } })"
        class="absolute flex items-center gap-2 py-2 pl-3 pr-4 text-sm font-medium transition duration-200 rounded-full top-4 left-4 bg-white/85 text-gray-800 shadow-card backdrop-blur ease-out-quart hover:bg-white hover:text-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 max-w-[calc(100%-2rem)]"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
        <span class="truncate">{{ branchState.pharmacyName.value }}</span>
      </button>

      <!-- Identity -->
      <div class="absolute bottom-0 left-0 right-0 flex flex-wrap items-end gap-4 p-5 sm:p-8">
        <div class="w-16 h-16 overflow-hidden bg-white shadow-float rounded-2xl ring-2 ring-white/40 sm:w-20 sm:h-20 shrink-0">
          <LazyImage :src="branchState.pharmacyLogo.value || ''" :alt="branchState.pharmacyName.value" aspect-ratio="square" class-name="w-full h-full object-cover" />
        </div>
        <div class="flex-1 min-w-0 pb-0.5">
          <p class="text-sm font-medium text-white/70">{{ branchState.pharmacyName.value }}</p>
          <h1 class="mt-0.5 text-2xl font-semibold leading-tight text-white sm:text-4xl">{{ branchState.branch.value.branchName }}</h1>
          <div class="flex flex-wrap items-center gap-2.5 mt-1">
            <p v-if="branchState.locationLine.value" class="text-sm text-white/80">{{ branchState.locationLine.value }}</p>
            <span v-if="branchState.distanceLabel.value" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white rounded-full bg-white/15 backdrop-blur-sm">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              {{ branchState.distanceLabel.value }}
            </span>
          </div>
        </div>

        <!-- Rating -->
        <div v-if="branchState.displayRating.value" class="flex flex-col items-center px-4 py-2.5 border rounded-2xl shrink-0 bg-white/10 backdrop-blur-md border-white/15">
          <span class="text-2xl font-semibold leading-none text-white">{{ branchState.displayRating.value.toFixed(1) }}</span>
          <div class="flex gap-0.5 mt-1.5" aria-hidden="true">
            <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= Math.round(branchState.displayRating.value) ? 'text-accent-400 fill-accent-400' : 'text-white/25 fill-white/25'" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <span v-if="branchState.displayReviewCount.value" class="mt-1 text-xs text-white/70">{{ branchState.displayReviewCount.value }} review{{ branchState.displayReviewCount.value !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-rise {
  animation: detail-rise 0.6s cubic-bezier(0.25, 1, 0.5, 1) backwards;
}

@keyframes detail-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .detail-rise {
    animation: none;
  }
}
</style>
