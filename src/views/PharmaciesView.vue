<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy, PharmacyFilters } from '@/types/pharmacy';

const { registerElement } = useScrollAnimation();
const pharmacies = ref<Pharmacy[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const searchQuery = ref('');
const selectedServices = ref<string[]>([]);
const sortBy = ref<'distance' | 'rating' | 'name'>('distance');
const isOpenNow = ref(false);

const availableServices = [
  'Prescription Delivery',
  '24/7 Service',
  'Online Ordering',
  'Vaccination',
  'Health Consultations',
  'Home Delivery',
  'Emergency Service'
];

const filters = computed<PharmacyFilters>(() => ({
  searchQuery: searchQuery.value,
  selectedServices: selectedServices.value,
  sortBy: sortBy.value,
  isOpenNow: isOpenNow.value
}));

const loadPharmacies = async () => {
  loading.value = true;
  error.value = null;
  try {
    pharmacies.value = await pharmacyService.getPharmacies(filters.value);
  } catch (err) {
    error.value = 'Failed to load pharmacies. Please try again later.';
    console.error('Error loading pharmacies:', err);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  loadPharmacies();
};

const handleSort = () => {
  loadPharmacies();
};

const handleServiceFilter = () => {
  loadPharmacies();
};

const handleOpenNowFilter = () => {
  isOpenNow.value = !isOpenNow.value;
  loadPharmacies();
};

onMounted(() => {
  loadPharmacies();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 dark:from-[#246BFD]/5 dark:to-[#FE9615]/5 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 scroll-animate slide-up">
          <h1 class="text-4xl font-medium text-gray-900 dark:text-white mb-4">
            Find Pharmacies Near You
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Compare prices and find the best deals at pharmacies in your area
          </p>
        </div>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto scroll-animate slide-up delay-200">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search pharmacies..."
              class="w-full px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              @keyup.enter="handleSearch"
            />
            <button 
              class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
              @click="handleSearch"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <div class="lg:w-64 flex-shrink-0 scroll-animate slide-up delay-300">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h3>
            
            <!-- Open Now Filter -->
            <div class="mb-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="isOpenNow"
                  @change="handleOpenNowFilter"
                  class="rounded border-gray-300 dark:border-gray-600 text-[#246BFD] focus:ring-[#246BFD]"
                />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">Open Now</span>
              </label>
            </div>

            <!-- Services Filter -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Services</h4>
              <div class="space-y-2">
                <label v-for="service in availableServices" :key="service" class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="selectedServices"
                    :value="service"
                    @change="handleServiceFilter"
                    class="rounded border-gray-300 dark:border-gray-600 text-[#246BFD] focus:ring-[#246BFD]"
                  />
                  <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">{{ service }}</span>
                </label>
              </div>
            </div>

            <!-- Sort By -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
              <select
                v-model="sortBy"
                @change="handleSort"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Pharmacy List -->
        <div class="flex-1">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
            <p class="mt-4 text-gray-600 dark:text-gray-300">Loading pharmacies...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-600 dark:text-red-400">{{ error }}</p>
            <button 
              @click="loadPharmacies"
              class="mt-4 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="pharmacies.length === 0" class="text-center py-12">
            <p class="text-gray-600 dark:text-gray-300">No pharmacies found matching your criteria.</p>
          </div>

          <!-- Pharmacy Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(pharmacy, index) in pharmacies"
              :key="pharmacy.id"
              class="scroll-animate slide-up"
              :class="`delay-${(index + 1) * 100}`"
            >
              <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover-lift">
                <!-- Pharmacy Image -->
                <div class="relative h-48">
                  <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20 dark:from-[#246BFD]/10 dark:to-[#FE9615]/10"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <p class="text-gray-400 dark:text-gray-500">Pharmacy Image</p>
                  </div>
                  <div class="absolute top-4 right-4">
                    <span
                      class="px-3 py-1 rounded-full text-sm font-medium"
                      :class="pharmacy.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                    >
                      {{ pharmacy.isOpen ? 'Open' : 'Closed' }}
                    </span>
                  </div>
                </div>

                <!-- Pharmacy Info -->
                <div class="p-6">
                  <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    {{ pharmacy.name }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">{{ pharmacy.address }}</p>
                  
                  <div class="flex items-center space-x-4 mb-4">
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
                        class="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {{ service }}
                      </span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <router-link
                      :to="'/pharmacy/' + pharmacy.id"
                      class="flex-1 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors text-center"
                    >
                      View Details
                    </router-link>
                    <a
                      :href="`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`"
                      target="_blank"
                      class="px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}

.hover-lift {
  transition: transform 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-4px);
}
</style> 