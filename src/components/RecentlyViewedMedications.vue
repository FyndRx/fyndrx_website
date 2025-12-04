<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { recentlyViewedService } from '@/services/recentlyViewedService';
import { medicationService } from '@/services/medicationService';
import type { Medication } from '@/models/Medication';
import LazyImage from './LazyImage.vue';

interface Props {
  limit?: number;
  showTitle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 6,
  showTitle: true
});

const router = useRouter();
const recentlyViewed = ref<Medication[]>([]);
const loading = ref(false);

const loadRecentlyViewed = async () => {
  loading.value = true;
  try {
    // Get recently viewed drug IDs from API
    const viewedItems = await recentlyViewedService.getRecentlyViewed();
    
    if (viewedItems.length > 0) {
      // Get the drug IDs
      const drugIds = viewedItems.slice(0, props.limit).map(item => item.drug_id);
      
      // Fetch full medication details
      if (drugIds.length > 0) {
        const medications = await medicationService.getMultipleMedications(drugIds);
        recentlyViewed.value = medications;
      }
    }
  } catch (err) {
    console.error('Error loading recently viewed medications:', err);
    recentlyViewed.value = [];
  } finally {
    loading.value = false;
  }
};

const viewMedication = (id: number) => {
  router.push({ name: 'MedicationDetail', params: { id } });
};

onMounted(() => {
  loadRecentlyViewed();
});
</script>

<template>
  <div v-if="!loading && recentlyViewed.length > 0" class="mb-8">
    <div v-if="showTitle" class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
            Recently Viewed
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Quick access to medications you've viewed
          </p>
        </div>
      </div>
      <button
        @click="loadRecentlyViewed"
        class="text-sm text-gray-500 hover:text-[#246BFD] dark:text-gray-400 dark:hover:text-[#5089FF] transition-colors"
      >
        Refresh
      </button>
    </div>

    <div class="relative">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          v-for="medication in recentlyViewed"
          :key="medication.id"
          @click="viewMedication(medication.id)"
          class="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
        >
          <div class="relative mb-3">
            <div class="w-full h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <LazyImage
                :src="medication.image"
                :alt="medication.drug_name"
                aspectRatio="square"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div class="absolute top-1 right-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
              Recent
            </div>
          </div>
          
          <h3 class="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-[#246BFD] transition-colors">
            {{ medication.drug_name }}
          </h3>
          
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="(cat, index) in (Array.isArray(medication.category) ? medication.category.slice(0, 2) : [medication.category])"
              :key="index"
              class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
            >
              {{ cat }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

