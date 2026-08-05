<script setup lang="ts">
import { inject } from 'vue';
import ReviewCard from '@/components/ReviewCard.vue';
import RatingStars from '@/components/RatingStars.vue';
import { useAuthStore } from '@/store/auth';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
const authStore = useAuthStore();
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-7 bg-yellow-500 rounded-full"></div>
        <h2 class="text-xl font-black text-gray-900 dark:text-white">Ratings & Reviews</h2>
      </div>
      <button v-if="authStore.isAuthenticated" @click="branchState.showReviewModal.value = true"
        class="px-5 py-2.5 bg-[#246BFD] hover:bg-[#1a56d6] text-white text-sm font-bold rounded-full shadow-md active:scale-95 transition-all"
      >Write a Review</button>
    </div>

    <!-- Loading -->
    <div v-if="branchState.reviewsLoading.value" class="py-12 text-center">
      <div class="w-8 h-8 border-t-2 border-b-2 border-[#246BFD] rounded-full animate-spin mx-auto"></div>
    </div>

    <template v-else>
      <!-- Stats block -->
      <div v-if="branchState.reviewStats.value && branchState.reviewStats.value.totalReviews > 0" class="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mb-6">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div class="text-center lg:text-left flex-shrink-0">
            <span class="text-6xl font-black text-gray-900 dark:text-white">{{ (branchState.reviewStats.value.averageRating || 0).toFixed(1) }}</span>
            <div class="mt-2"><RatingStars :rating="branchState.reviewStats.value.averageRating || 0" size="lg" /></div>
            <p class="text-xs font-semibold text-gray-400 mt-1">{{ branchState.reviewStats.value.totalReviews }} review{{ branchState.reviewStats.value.totalReviews !== 1 ? 's' : '' }}</p>
          </div>
          <div class="flex-1 space-y-2">
            <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-500 w-3 text-right">{{ star }}</span>
              <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <div class="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-amber-400 rounded-full transition-all duration-700"
                  :style="{ width: `${branchState.reviewStats.value.totalReviews ? (((branchState.reviewStats.value.ratingDistribution as any)?.[star] || 0) / branchState.reviewStats.value.totalReviews) * 100 : 0}%` }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-gray-400 w-6 text-right">{{ (branchState.reviewStats.value.ratingDistribution as any)?.[star] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No reviews yet -->
      <div v-if="branchState.reviews.value.length === 0" class="py-16 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
        <div class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
        </div>
        <p class="font-bold text-gray-900 dark:text-white mb-1">No reviews yet</p>
        <p class="text-sm text-gray-400 mb-4">Be the first to share your experience.</p>
        <button v-if="authStore.isAuthenticated" @click="branchState.showReviewModal.value = true" class="px-5 py-2.5 bg-[#246BFD] text-white text-sm font-bold rounded-full hover:bg-[#1a56d6] active:scale-95 transition-all">Write a Review</button>
      </div>

      <!-- Review list -->
      <div v-else class="space-y-4">
        <ReviewCard
          v-for="review in branchState.reviews.value"
          :key="review.id"
          :review="review"
          class="!rounded-2xl !bg-white dark:!bg-gray-800 !shadow-sm !border !border-gray-100 dark:!border-gray-700/50"
          @helpful="branchState.handleReviewHelpful"
          @not-helpful="branchState.handleReviewNotHelpful"
        />
      </div>
    </template>
  </section>
</template>
