<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy, PharmacyFilters } from '@/types/pharmacy';
import PharmacySearchBar from '@/components/PharmacySearchBar.vue';
import PharmacyCard from '@/components/PharmacyCard.vue';

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
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-12 text-center scroll-animate slide-up">
          <h1 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
            Find Pharmacies Near You
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Compare prices and find the best deals at pharmacies in your area
          </p>
        </div>

        <!-- Search Bar -->
        <PharmacySearchBar />
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Filters Sidebar -->
        <div class="flex-shrink-0 delay-300 lg:w-64 scroll-animate slide-up">
          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
            
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
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Services</h4>
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
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</h4>
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
          <div v-if="loading" class="py-12 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
            <p class="mt-4 text-gray-600 dark:text-gray-300">Loading pharmacies...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="py-12 text-center">
            <p class="text-red-600 dark:text-red-400">{{ error }}</p>
            <button 
              @click="loadPharmacies"
              class="mt-4 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
            >
              Try Again
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="pharmacies.length === 0" class="py-12 text-center">
            <p class="text-gray-600 dark:text-gray-300">No pharmacies found matching your criteria.</p>
          </div>

          <!-- Pharmacy Grid -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PharmacyCard 
            v-for="(pharmacy, index) in pharmacies" 
            :key="index" 
            :pharmacy="pharmacy" 
            class="flex-none w-[360px] md:w-[385px] scroll-animate slide-up snap-center"
            :class="`delay-${(index + 1) * 100}`"
            />
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