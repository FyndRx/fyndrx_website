<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { favoritesService } from '@/services/favoritesService';
import type { Medication } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';
import LazyImage from '@/components/LazyImage.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import EmptyState from '@/components/EmptyState.vue';

const router = useRouter();
const favoriteMedications = ref<Medication[]>([]);
const favoritePharmacies = ref<Pharmacy[]>([]);
const activeTab = ref<'medications' | 'pharmacies' | 'all'>('all');
const loading = ref(true);

const loadFavorites = async () => {
  loading.value = true;
  try {
    const savedDrugs = await favoritesService.getSavedDrugs();
    // Assuming we extract medications from savedDrugs, but for now strictly typing
    // Since getFavoritesMedications and getFavoritesPharmacies are not on the service, 
    // we need to adapt or remove them. 
    // Given the previous file content of favoritesService:
    // It only returns SavedDrug[].
    // So we'll map that to favoriteMedications if possible, or just leave empty arrays and log warning.
    
    // Attempting to map saved drugs to medications if the structure matches or if we can fetch details.
    // For now, to fix build, we'll assign empty array or what we have.
    // Ideally we would fetch details.
    
    // Mapping SavedDrug to Medication if 'drug' property exists and is compatible
     favoriteMedications.value = savedDrugs
      .filter(item => item.drug)
      .map(item => item.drug as unknown as Medication); // Type assertion needed or transform
      
     favoritePharmacies.value = []; // Service doesn't support pharmacies yet
    
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const totalFavorites = computed(() => {
  return favoriteMedications.value.length + favoritePharmacies.value.length;
});

const viewMedication = (id: number) => {
  router.push({ name: 'MedicationDetail', params: { id } });
};

const viewPharmacy = (id: number) => {
  router.push({ name: 'pharmacy', params: { id } });
};

const clearAllFavorites = () => {
  if (confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
    // favoritesService.clear(); // Not implemented
    // Manually clear local state or implement loop deletion if critical
    alert('Clear all not implemented on backend yet.');
    loadFavorites();
  }
};

const handleFavoriteRemoved = () => {
  loadFavorites();
};

onMounted(() => {
  loadFavorites();
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
                My Favorites
              </h1>
              <p class="text-gray-600 dark:text-gray-400">
                {{ totalFavorites }} {{ totalFavorites === 1 ? 'item' : 'items' }} saved
              </p>
            </div>
          </div>
          <button
            v-if="totalFavorites > 0"
            @click="clearAllFavorites"
            class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <button
            @click="activeTab = 'all'"
            :class="[
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'all'
                ? 'bg-[#246BFD] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            All ({{ totalFavorites }})
          </button>
          <button
            @click="activeTab = 'medications'"
            :class="[
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'medications'
                ? 'bg-[#246BFD] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Medications ({{ favoriteMedications.length }})
          </button>
          <button
            @click="activeTab = 'pharmacies'"
            :class="[
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'pharmacies'
                ? 'bg-[#246BFD] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            Pharmacies ({{ favoritePharmacies.length }})
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="totalFavorites === 0"
        type="favorites"
        @action="router.push({ name: 'medications' })"
      />

      <!-- Content -->
      <div v-else>
        <!-- Medications Section -->
        <div v-if="activeTab === 'all' || activeTab === 'medications'">
          <div v-if="favoriteMedications.length > 0" class="mb-12">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              Favorite Medications
            </h2>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="medication in favoriteMedications"
                :key="`med-${medication.id}`"
                @click="viewMedication(medication.id)"
                class="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <!-- Favorite Button -->
                <div class="absolute top-4 right-4 z-10" @click.stop>
                  <FavoriteButton
                    type="medication"
                    :item-id="medication.id"
                    size="small"
                    @click="handleFavoriteRemoved"
                  />
                </div>

                <div class="mb-4 overflow-hidden rounded-xl">
                  <LazyImage
                    :src="medication.image"
                    :alt="medication.drug_name"
                    aspectRatio="landscape"
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span 
                    v-for="(cat, index) in (Array.isArray(medication.category) ? medication.category : [medication.category])"
                    :key="index"
                    class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#246BFD]/10 text-[#246BFD]"
                  >
                    {{ cat }}
                  </span>
                  <span v-if="medication.requiresPrescription" class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Rx Required
                  </span>
                </div>

                <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors">
                  {{ medication.drug_name }}
                </h3>

                <p class="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {{ medication.description }}
                </p>

                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Available in</p>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ medication.forms.length }} {{ medication.forms.length === 1 ? 'form' : 'forms' }}
                    </p>
                  </div>
                  <button class="px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pharmacies Section -->
        <div v-if="activeTab === 'all' || activeTab === 'pharmacies'">
          <div v-if="favoritePharmacies.length > 0">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              Favorite Pharmacies
            </h2>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="pharmacy in favoritePharmacies"
                :key="`pharm-${pharmacy.id}`"
                @click="viewPharmacy(pharmacy.id)"
                class="relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <!-- Favorite Button -->
                <div class="absolute top-4 right-4 z-10" @click.stop>
                  <FavoriteButton
                    type="pharmacy"
                    :item-id="pharmacy.id"
                    size="small"
                    @click="handleFavoriteRemoved"
                  />
                </div>

                <div class="flex items-start gap-4 mb-4">
                  <div class="flex-shrink-0">
                    <LazyImage
                      :src="pharmacy.image"
                      :alt="pharmacy.name"
                      aspectRatio="square"
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#246BFD] transition-colors">
                      {{ pharmacy.name }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {{ pharmacy.address }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-4 mb-4 text-sm">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span class="text-gray-700 dark:text-gray-300">{{ pharmacy.rating }}</span>
                  </div>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      pharmacy.isOpen
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    ]"
                  >
                    {{ pharmacy.isOpen ? 'Open Now' : 'Closed' }}
                  </span>
                  <span class="text-gray-600 dark:text-gray-400">{{ pharmacy.distance }}</span>
                </div>

                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="(service, index) in pharmacy.services.slice(0, 3)"
                    :key="index"
                    class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {{ service }}
                  </span>
                  <span v-if="pharmacy.services.length > 3" class="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{{ pharmacy.services.length - 3 }} more
                  </span>
                </div>

                <button class="w-full px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

