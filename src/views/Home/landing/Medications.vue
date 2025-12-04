<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { medicationService } from '@/services/medicationService';
import { recentlyViewedService } from '@/services/recentlyViewedService';
import MedicationCard from '@/components/MedicationCard.vue';
import type { Medication } from '@/models/Medication';

const searchQuery = ref('');
const searchResults = ref<Medication[]>([]);
const popularDrugs = ref<Medication[]>([]);
const loading = ref(true);

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  try {
    const { medications } = await medicationService.liveSearch({
      query: searchQuery.value.trim(),
      perPage: 6,
    });
    searchResults.value = medications.slice(0, 6);
  } catch (err) {
    console.error('Error searching medications:', err);
    searchResults.value = [];
  }
};

const isVisible = ref(false);

const loadPopularDrugs = async () => {
  loading.value = true;
  try {
    const topSearched = await recentlyViewedService.getTopSearched();
    if (topSearched && topSearched.length > 0) {
      const drugIds = topSearched.slice(0, 3).map((drug: any) => drug.drug_id || drug.id);
      if (drugIds.length > 0) {
        popularDrugs.value = await medicationService.getMultipleMedications(drugIds);
      }
    } else {
      const recentDrugs = await recentlyViewedService.getRecentDrugs();
      if (recentDrugs && recentDrugs.length > 0) {
        const drugIds = recentDrugs.slice(0, 3).map((drug: any) => drug.drug_id || drug.id);
        if (drugIds.length > 0) {
          popularDrugs.value = await medicationService.getMultipleMedications(drugIds);
        }
      }
    }
  } catch (err) {
    console.error('Error loading popular drugs:', err);
    popularDrugs.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  isVisible.value = true;
  loadPopularDrugs();
});
</script>

<script lang="ts">
export default {
  name: 'Medications'
};
</script>

<template>
  <section class="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Browse <span class="text-[#246BFD]">Medications</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Search for medications by name, brand, or condition and compare prices across verified pharmacies
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-16 delay-200 scroll-animate slide-up">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search medications..."
            class="w-full px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @keyup.enter="handleSearch"
          />
          <button 
            class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
            @click="handleSearch"
          >
            Find CARE
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-16">
        <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="flex flex-wrap gap-3">
            <MedicationCard
              v-for="medication in searchResults"
              :key="medication.id"
              :medication="medication"
              variant="simple"
            />
          </div>
        </div>
      </div>

      <!-- Latest Deals -->
      <!-- <div class="mb-16 delay-300 scroll-animate slide-up">
        <h3 class="mb-8 text-2xl font-medium text-center text-gray-900 dark:text-white">
          Latest Deals
        </h3>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <MedicationCard
            v-for="drug in popularDrugs"
            :key="drug.id"
            :medication="drug"
            variant="detailed"
          />
        </div>
      </div> -->

      <!-- Popular Prescription Coupons -->
      <!-- <div class="scroll-animate slide-up delay-400">
        <h3 class="mb-8 text-2xl font-medium text-center text-gray-900 dark:text-white">
          Popular Prescription Coupons
        </h3>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <MedicationCard
            v-for="drug in popularDrugs"
            :key="drug.id"
            :medication="drug"
            variant="coupon"
          />
        </div>
      </div> -->
    </div>
  </section>
</template>

<style scoped>

.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.scroll-animate.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.delay-200 {
  transition-delay: 200ms;
}

.delay-300 {
  transition-delay: 300ms;
}

.delay-400 {
  transition-delay: 400ms;
}
</style> 