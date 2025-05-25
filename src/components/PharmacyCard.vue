<script setup lang="ts">
import type { Pharmacy } from '@/types/pharmacy';

interface Props {
  pharmacy: Pharmacy;
}

defineProps<Props>();
</script>

<script lang="ts">
    export default {
    name: 'PharmacyCard'
    }
</script>

<template>
  <div class="overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover-lift">
    <!-- Pharmacy Image -->
    <div class="relative h-48">
      <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20 dark:from-[#246BFD]/10 dark:to-[#FE9615]/10"></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <p class="text-gray-400 dark:text-gray-500">Pharmacy Image</p>
      </div>
      <div class="absolute top-4 right-4">
        <span
          class="px-3 py-1 text-sm font-medium rounded-full"
          :class="pharmacy.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
        >
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
        <div class="flex items-center">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
          <span class="ml-1 text-gray-600 dark:text-gray-300">
            {{ pharmacy.rating }} ({{ pharmacy.reviews.length }} reviews)
          </span>
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
        <div class="flex flex-wrap gap-2">
          <span
            v-for="service in pharmacy.services"
            :key="service"
            class="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300"
          >
            {{ service }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <router-link
          :to="'/pharmacy/' + pharmacy.id"
          class="flex-1 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors text-center"
        >
          View Details
        </router-link>
        <a
          :href="`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`"
          target="_blank"
          class="px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 text-center"
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