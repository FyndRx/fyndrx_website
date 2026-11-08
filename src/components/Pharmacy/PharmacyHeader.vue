<script setup lang="ts">
import LazyImage from '@/components/LazyImage.vue';
import { inject, computed } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;

const is24_7 = computed(() =>
  (pharmacyState.pharmacy.value?.services ?? []).some(s => s.slug === '24/7' || s.slug === '24-7' || s.name === '24/7'),
);
const locationLine = computed(() => {
  const p = pharmacyState.pharmacy.value;
  return p ? [p.city, p.region].filter(Boolean).join(', ') : '';
});
</script>

<template>
  <div
    v-if="pharmacyState.pharmacy.value"
    class="mb-10 overflow-hidden rounded-3xl bg-white/70 shadow-float ring-1 ring-white/70 dark:bg-gray-800/60 dark:ring-white/10 detail-rise"
  >
    <div class="relative h-[360px] sm:h-[420px]">
      <div class="absolute inset-0">
        <LazyImage
          :src="pharmacyState.pharmacy.value.image"
          :alt="pharmacyState.pharmacy.value.name"
          aspectRatio="landscape"
          className="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/35 to-transparent"></div>
      </div>

      <!-- Status -->
      <div class="absolute flex flex-wrap justify-end gap-2 top-4 right-4 sm:top-6 sm:right-6">
        <span
          class="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-white rounded-full shadow-card backdrop-blur-sm"
          :class="pharmacyState.pharmacy.value.isOpen ? 'bg-emerald-600' : 'bg-red-600'"
        >
          <span class="w-2 h-2 rounded-full bg-white" :class="pharmacyState.pharmacy.value.isOpen ? 'motion-safe:animate-pulse' : ''" aria-hidden="true"></span>
          {{ pharmacyState.pharmacy.value.isOpen ? 'Open now' : 'Closed' }}
        </span>
        <span v-if="is24_7" class="px-3.5 py-1.5 text-sm font-semibold text-white rounded-full shadow-card bg-accent-600">
          24/7 service
        </span>
      </div>

      <!-- Name, place, rating -->
      <div class="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8 lg:p-10">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div class="flex-1 min-w-0 space-y-4">
            <div class="flex items-center gap-4">
              <div class="flex items-center justify-center w-14 h-14 overflow-hidden bg-white shadow-float rounded-2xl sm:w-16 sm:h-16 shrink-0">
                <LazyImage
                  v-if="pharmacyState.pharmacy.value.logo"
                  :src="pharmacyState.pharmacy.value.logo"
                  :alt="pharmacyState.pharmacy.value.name"
                  aspectRatio="square"
                  className="w-full h-full object-contain"
                />
                <svg v-else class="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
                </svg>
              </div>
              <h1 class="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                {{ pharmacyState.pharmacy.value.name }}
              </h1>
            </div>

            <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div class="flex items-center gap-2 text-gray-100">
                <svg class="w-5 h-5 text-brand-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span class="font-medium">{{ pharmacyState.pharmacy.value.address }}<span v-if="locationLine" class="text-gray-300"> · {{ locationLine }}</span></span>
              </div>

              <div class="flex items-center gap-3 px-4 py-2 border rounded-full bg-white/10 backdrop-blur-md border-white/15">
                <div class="flex items-center gap-0.5" aria-hidden="true">
                  <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.round(pharmacyState.pharmacy.value.rating) ? 'text-accent-400' : 'text-gray-400/50'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <span class="text-lg font-semibold">{{ pharmacyState.pharmacy.value.rating.toFixed(1) }}</span>
                <span class="pl-3 text-sm text-gray-200 border-l border-white/20">{{ pharmacyState.pharmacy.value.totalReviews || pharmacyState.pharmacy.value.reviews?.length || 0 }} reviews</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="pharmacyState.showAddReviewModal.value = true"
            class="px-6 py-3 text-sm font-semibold transition duration-200 bg-white rounded-full shadow-card shrink-0 text-brand-600 ease-out-quart hover:bg-brand-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            Rate this pharmacy
          </button>
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
