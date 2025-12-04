<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { Pharmacy } from '@/models/Pharmacy';
import LazyImage from '@/components/LazyImage.vue';
import RatingStars from '@/components/RatingStars.vue';
import { reviewService } from '@/services/reviewService';

interface Props {
  pharmacy: Pharmacy;
}

const props = defineProps<Props>();

const rating = ref<{ average: number; count: number }>({ average: 0, count: 0 });

const loadRating = async () => {
  try {
    const stats = await reviewService.getReviewStats('pharmacy', props.pharmacy.id);
    rating.value = {
      average: stats.average_rating || 0,
      count: stats.total_reviews || 0
    };
  } catch (err) {
    console.error('Error loading pharmacy rating:', err);
  }
};

const pharmacyRating = computed(() => rating.value);

onMounted(() => {
  loadRating();
});
</script>

<script lang="ts">
export default {
  name: 'PharmacyCard'
}
</script>

<template>
  <div class="h-full overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-2xl hover:-translate-y-2">
    <!-- Pharmacy Image -->
    <div class="relative h-48 overflow-hidden">
      <LazyImage
        :src="pharmacy.image"
        :alt="pharmacy.name"
        aspectRatio="landscape"
        className="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      <div class="absolute top-4 right-4">
        <span
          class="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-md backdrop-blur-sm"
          :class="pharmacy.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
        >
          <span class="w-2 h-2 mr-1.5 rounded-full animate-pulse bg-white"></span>
          {{ pharmacy.isOpen ? 'Open' : 'Closed' }}
        </span>
      </div>
    </div>

    <!-- Pharmacy Info -->
    <div class="p-6">
      <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">
        {{ pharmacy.name }}
      </h3>
      <p class="mb-4 text-gray-600 dark:text-gray-300">{{ pharmacy.address }}</p>
      
      <div class="flex items-center mb-4 space-x-4">
        <div class="flex items-center gap-1">
          <RatingStars 
            v-if="pharmacyRating.count > 0"
            :rating="pharmacyRating.average" 
            :count="pharmacyRating.count"
            :show-count="true"
            size="sm"
          />
          <span v-else class="text-sm text-gray-500 dark:text-gray-400">No reviews yet</span>
        </div>
        <div class="flex items-center">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span class="ml-1 text-gray-600 dark:text-gray-300">
            {{ pharmacy.distance }}
          </span>
        </div>
      </div>

      <!-- Services -->
      <div class="mb-4">
        <p class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Services</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="service in pharmacy.services.slice(0, 3)"
            :key="service"
            class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-[#246BFD] bg-[#246BFD]/10 rounded-full dark:text-[#5089FF] dark:bg-[#246BFD]/20"
          >
            {{ service }}
          </span>
          <span
            v-if="pharmacy.services.length > 3"
            class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-700"
          >
            +{{ pharmacy.services.length - 3 }} more
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-2">
        <router-link
          :to="'/pharmacy/' + pharmacy.id"
          class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors text-center"
        >
          View Details
        </router-link>
        <a
          :href="`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`"
          target="_blank"
          class="w-full px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 text-center"
        >
          Get Directions
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>

.hover-lift {
  transition: transform 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-4px);
}
</style> 