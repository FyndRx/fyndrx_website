<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { usePullToRefresh } from '@/composables/useMobileGestures';
import { dataService } from '@/services/dataService';
import type { Pharmacy } from '@/models/Pharmacy';
import PharmacyCard from '@/components/PharmacyCard.vue';
import Dropdown from '@/components/Dropdown.vue';
import ListSkeleton from '@/components/skeletons/ListSkeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import SearchAutocomplete from '@/components/SearchAutocomplete.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';

const route = useRoute();

const { registerElement } = useScrollAnimation();
const pharmacies = ref<Pharmacy[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref('');
const selectedServices = ref<string[]>([]);
const sortBy = ref<string>('distance');
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

const sortOptions = [
  { label: 'Distance', value: 'distance' },
  { label: 'Rating (High to Low)', value: 'rating' },
  { label: 'Name (A-Z)', value: 'name' }
];


const loadPharmacies = async () => {
  loading.value = true;
  error.value = null;
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    let result = dataService.getAllPharmacies();

    if (searchQuery.value) {
      result = dataService.searchPharmacies(searchQuery.value);
    }

    if (selectedServices.value.length > 0) {
      result = result.filter(pharmacy =>
        selectedServices.value.every(service => pharmacy.services.includes(service))
      );
    }

    if (isOpenNow.value) {
      result = result.filter(pharmacy => pharmacy.isOpen);
    }

    if (sortBy.value === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy.value === 'rating') {
      result.sort((a, b) => {
        const ratingA = dataService.getPharmacyRating(a.id).average;
        const ratingB = dataService.getPharmacyRating(b.id).average;
        return ratingB - ratingA;
      });
    }

    pharmacies.value = result;
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

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedServices.value = [];
  isOpenNow.value = false;
  sortBy.value = 'distance';
  loadPharmacies();
};

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
         selectedServices.value.length > 0 || 
         isOpenNow.value || 
         sortBy.value !== 'distance';
});

const { handleTouchStart, handleTouchMove, handleTouchEnd, pullDistance, isRefreshing } = usePullToRefresh(async () => {
  await loadPharmacies();
});

onMounted(async () => {
  const querySearch = route.query.search as string;
  const queryPharmacy = route.query.pharmacy as string;
  
  if (querySearch) {
    searchQuery.value = querySearch;
  }
  if (queryPharmacy) {
    searchQuery.value = queryPharmacy;
  }
  
  await loadPharmacies();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<template>
  <div 
    class="min-h-screen bg-gray-50 dark:bg-gray-900"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Pull to Refresh Indicator -->
    <div 
      v-if="pullDistance > 0"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all"
      :style="{ transform: `translate(-50%, ${Math.min(pullDistance, 80)}px)` }"
    >
      <div class="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
        <svg 
          class="w-6 h-6 text-[#246BFD] transition-transform"
          :class="{ 'animate-spin': isRefreshing }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
    </div>

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
        <div class="delay-200 scroll-animate slide-up">
          <SearchAutocomplete
            placeholder="Search pharmacies by name, location, or services..."
            search-type="pharmacies"
          />
          <div class="flex flex-col gap-4 md:flex-row mt-4">
            <div class="flex gap-2">
              <button
                @click="handleOpenNowFilter"
                :class="[
                  'px-6 py-3 rounded-full font-medium transition-all border-2',
                  isOpenNow
                    ? 'bg-[#246BFD] text-white border-[#246BFD]'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#246BFD]'
                ]"
              >
                Open Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Filters Sidebar -->
        <div class="flex-shrink-0 delay-300 lg:w-64 scroll-animate slide-up">
          <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="text-xs font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <!-- Open Now Filter -->
            <div class="mb-6">
              <CustomCheckbox
                v-model="isOpenNow"
                label="Open Now"
                variant="switch"
                size="medium"
                color="success"
                @update:model-value="handleOpenNowFilter"
              />
            </div>

            <!-- Services Filter -->
            <div class="mb-6">
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Services</h4>
              <div class="space-y-3">
                <CustomCheckbox
                  v-for="service in availableServices"
                  :key="service"
                  v-model="selectedServices"
                  :value="service"
                  :label="service"
                  size="small"
                  @update:model-value="handleServiceFilter"
                />
              </div>
            </div>

            <!-- Sort By -->
            <div>
              <Dropdown
                v-model="sortBy"
                :options="sortOptions"
                label="Sort By"
                placeholder="Select sort order"
                @change="handleSort"
              />
            </div>

            <!-- Active Filters Summary -->
            <div v-if="hasActiveFilters" class="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
              <p class="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">Active Filters</p>
              <div class="flex flex-wrap gap-1">
                <span v-if="searchQuery" class="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                  Search: "{{ searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery }}"
                </span>
                <span v-if="isOpenNow" class="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                  Open Now
                </span>
                <span v-for="service in selectedServices" :key="service" class="inline-flex items-center px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">
                  {{ service }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pharmacy List -->
        <div class="flex-1">
          <!-- Results Header -->
          <div v-if="!loading && !error" class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ pharmacies.length }} {{ pharmacies.length === 1 ? 'pharmacy' : 'pharmacies' }} found
              </p>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="sortBy === 'rating'">Sorted by Rating</span>
                <span v-else-if="sortBy === 'name'">Sorted by Name</span>
                <span v-else>Sorted by Distance</span>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading">
            <ListSkeleton type="pharmacy" :count="9" :columns="3" />
          </div>

          <!-- Error State -->
          <ErrorState
            v-else-if="error"
            type="network"
            :message="error"
            @retry="loadPharmacies"
          />

          <!-- Empty State -->
          <EmptyState
            v-else-if="pharmacies.length === 0"
            type="search"
            message="We couldn't find any pharmacies matching your search criteria."
            @action="clearAllFilters"
          />

          <!-- Pharmacy Grid -->
          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <PharmacyCard 
              v-for="(pharmacy, index) in pharmacies" 
              :key="pharmacy.id" 
              :pharmacy="pharmacy" 
              class="scroll-animate slide-up"
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