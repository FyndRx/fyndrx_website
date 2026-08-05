<script setup lang="ts">
import RatingStars from '@/components/RatingStars.vue';
import ReviewCard from '@/components/ReviewCard.vue';
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div v-if="pharmacyState.pharmacy.value" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Reviews loading skeleton -->
    <div v-if="pharmacyState.reviewsLoading.value" class="space-y-6 animate-pulse">
      <!-- Rating summary skeleton -->
      <div class="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-700/50">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div class="space-y-3 text-center lg:text-left">
            <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto lg:mx-0"></div>
            <div class="h-14 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto lg:mx-0"></div>
            <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto lg:mx-0"></div>
          </div>
          <div class="flex-1 space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center gap-3">
              <div class="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div class="h-3 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Review cards -->
      <div v-for="i in 3" :key="i" class="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 shrink-0"></div>
        </div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-10">
       <!-- Statistics Summary -->
       <div v-if="pharmacyState.reviewStats.value" class="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-700/50">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div class="text-center lg:text-left">
            <p class="text-xs font-semibold text-[#246BFD] mb-1">Aggregate Rating</p>
            <div class="flex items-center justify-center lg:justify-start gap-4">
              <span class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                {{ (pharmacyState.reviewStats.value.averageRating || 0).toFixed(1) }}
              </span>
              <div class="text-left">
                <RatingStars :rating="pharmacyState.reviewStats.value.averageRating || 0" size="lg" />
                <p class="text-xs font-semibold text-gray-400 mt-1">
                  From {{ pharmacyState.reviewStats.value.totalReviews || 0 }} Experience{{ (pharmacyState.reviewStats.value.totalReviews || 0) !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex-1 space-y-2">
            <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-3">
              <span class="text-xs font-semibold text-gray-400 w-3">{{ rating }}</span>
              <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-400 rounded-full transition-all duration-1000" :style="{ width: `${pharmacyState.reviewStats.value.totalReviews ? (((pharmacyState.reviewStats.value.ratingDistribution as any)?.[rating] || 0) / pharmacyState.reviewStats.value.totalReviews) * 100 : 0}%` }"></div>
              </div>
              <span class="text-xs font-semibold text-gray-400 w-6 text-right">{{ (pharmacyState.reviewStats.value.ratingDistribution as any)?.[rating] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-2.5">
          <div class="w-1 h-6 bg-[#246BFD] rounded-full"></div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Verified Testimonials</h3>
        </div>
        <button @click="pharmacyState.showAddReviewModal.value = true" class="px-5 py-2.5 bg-[#246BFD] hover:bg-[#1a56d6] text-white text-sm font-bold rounded-full shadow-md transition-all active:scale-95">Submit Review</button>
      </div>

      <div v-if="pharmacyState.reviews.value.length > 0" class="grid grid-cols-1 gap-6">
        <ReviewCard
          v-for="review in pharmacyState.reviews.value"
          :key="review.id"
          :review="review"
          class="!rounded-2xl !bg-white dark:!bg-gray-800 !p-6 sm:!p-8 !shadow-md !border !border-gray-50 dark:!border-gray-700/50"
          @helpful="pharmacyState.handleReviewHelpful"
          @not-helpful="pharmacyState.handleReviewNotHelpful"
        />
      </div>
    </div>
  </div>
</template>
