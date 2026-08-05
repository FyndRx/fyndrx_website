<script setup lang="ts">
import { inject } from 'vue';
import LazyImage from '@/components/LazyImage.vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <div v-if="branchState.branch.value" class="relative h-64 sm:h-80 overflow-hidden">
    <LazyImage
      :src="branchState.branch.value.bannerImage || ''"
      :alt="branchState.branch.value.branchName || ''"
      aspect-ratio="landscape"
      class-name="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>

    <!-- Back -->
    <button
      @click="branchState.router.push({ name: 'pharmacy', params: { id: branchState.pharmacyId }, query: { tab: 'branches' } })"
      class="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-bold hover:bg-black/50 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
      {{ branchState.pharmacyName.value }}
    </button>

    <!-- Identity strip -->
    <div class="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 pb-7 flex items-end gap-4">
      <div class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl ring-2 ring-white/30 shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
        <LazyImage :src="branchState.pharmacyLogo.value || ''" :alt="branchState.pharmacyName.value" aspect-ratio="square" class-name="w-full h-full object-cover" />
      </div>
      <div class="min-w-0 flex-1 pb-0.5">
        <p class="text-[11px] font-bold text-white/55 uppercase tracking-widest">{{ branchState.pharmacyName.value }}</p>
        <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">{{ branchState.branch.value.branchName }}</h1>
        <div class="flex items-center gap-2.5 mt-0.5 flex-wrap">
          <p v-if="branchState.locationLine.value" class="text-sm text-white/60">{{ branchState.locationLine.value }}</p>
          <span v-if="branchState.distanceLabel.value" class="inline-flex items-center gap-1 text-xs font-bold text-white/80 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
            {{ branchState.distanceLabel.value }}
          </span>
        </div>
      </div>
      <!-- Rating badge -->
      <div v-if="branchState.displayRating.value" class="flex-shrink-0 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/10">
        <span class="text-2xl font-black text-white leading-none">{{ branchState.displayRating.value.toFixed(1) }}</span>
        <div class="flex gap-0.5 mt-1">
          <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= Math.round(branchState.displayRating.value) ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/20'" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <span v-if="branchState.displayReviewCount.value" class="text-[10px] text-white/45 mt-0.5">{{ branchState.displayReviewCount.value }} review{{ branchState.displayReviewCount.value !== 1 ? 's' : '' }}</span>
      </div>
    </div>
  </div>
</template>
