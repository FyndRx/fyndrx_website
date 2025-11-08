<script setup lang="ts">
import { ref } from 'vue';
import type { Review } from '@/models/Review';
import RatingStars from './RatingStars.vue';

interface Props {
  review: Review;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'helpful', reviewId: string): void;
  (e: 'notHelpful', reviewId: string): void;
}>();

const showFullComment = ref(false);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
</script>

<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
    <div class="flex items-start gap-4">
      <div v-if="review.userAvatar" class="flex-shrink-0">
        <img 
          :src="review.userAvatar" 
          :alt="review.userName"
          class="w-12 h-12 rounded-full object-cover"
        />
      </div>
      <div v-else class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#246BFD] to-[#5089FF] flex items-center justify-center">
        <span class="text-white font-semibold text-sm">{{ getInitials(review.userName) }}</span>
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-semibold text-gray-900 dark:text-white">{{ review.userName }}</h4>
              <span 
                v-if="review.verified"
                class="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-full"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                Verified Purchase
              </span>
            </div>
            <RatingStars :rating="review.rating" size="sm" />
          </div>
          
          <span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {{ formatDate(review.createdAt) }}
          </span>
        </div>
        
        <h5 class="font-semibold text-gray-900 dark:text-white mb-2">{{ review.title }}</h5>
        
        <p 
          class="text-gray-600 dark:text-gray-300 mb-3"
          :class="{ 'line-clamp-3': !showFullComment }"
        >
          {{ review.comment }}
        </p>
        
        <button
          v-if="review.comment.length > 150"
          @click="showFullComment = !showFullComment"
          class="text-sm text-[#246BFD] hover:text-[#5089FF] font-medium mb-3"
        >
          {{ showFullComment ? 'Show less' : 'Read more' }}
        </button>
        
        <div v-if="review.pharmacyResponse" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border-l-4 border-[#246BFD]">
          <div class="flex items-start gap-2 mb-2">
            <svg class="w-5 h-5 text-[#246BFD] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Response from {{ review.pharmacyResponse.respondedBy }}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ review.pharmacyResponse.message }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(review.pharmacyResponse.respondedAt) }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            @click="emit('helpful', review.id)"
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#246BFD] dark:hover:text-[#246BFD] transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
            </svg>
            Helpful ({{ review.helpful }})
          </button>
          
          <button
            @click="emit('notHelpful', review.id)"
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path>
            </svg>
            ({{ review.notHelpful }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

