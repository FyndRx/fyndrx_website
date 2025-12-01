<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMedicationsStore } from '@/store/medications';
import { usePullToRefresh } from '@/composables/useMobileGestures';
import LazyImage from '@/components/LazyImage.vue';
import Dropdown from '@/components/Dropdown.vue';
import ListSkeleton from '@/components/skeletons/ListSkeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import SearchAutocomplete from '@/components/SearchAutocomplete.vue';
import MedicationQuickViewModal from '@/components/MedicationQuickViewModal.vue';
import MedicationComparison from '@/components/MedicationComparison.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import Pagination from '@/components/Pagination.vue';

const router = useRouter();
const route = useRoute();
const medicationsStore = useMedicationsStore();
const {
  searchQuery,
  selectedCategory,
  selectedForm,
  selectedBrand,
  requiresPrescription,
  sortBy,
  showFilters,
  allMedications,
  loading,
  error,
  quickViewMedicationId,
  showQuickView,
  activeFiltersCount,
  pagination,
} = storeToRefs(medicationsStore);

const categories = computed(() => {
  const cats = new Set<string>(['all']);
  allMedications.value.forEach(med => {
    if (med.category) {
      if (Array.isArray(med.category)) {
        med.category.forEach(cat => cats.add(cat));
      } else {
        cats.add(med.category);
      }
    }
  });
  return Array.from(cats);
});

const baseFilteredMedications = computed(() => {
  return allMedications.value;
});

const categoryOptions = computed(() => {
  const cats = new Set<string>();
  baseFilteredMedications.value.forEach(med => {
    if (med.category) {
      if (Array.isArray(med.category)) {
        med.category.forEach(cat => cats.add(cat));
      } else {
        cats.add(med.category);
      }
    }
  });
  return [
    { label: 'All Categories', value: 'all' },
    ...Array.from(cats).sort().map(c => ({ label: c, value: c }))
  ];
});

const formOptions = computed(() => {
  const forms = new Set<string>();
  let meds = baseFilteredMedications.value;
  
  if (selectedCategory.value !== 'all') {
    meds = meds.filter(med => {
      if (Array.isArray(med.category)) {
        return med.category.includes(selectedCategory.value);
      }
      return med.category === selectedCategory.value;
    });
  }
  
  meds.forEach(med => {
    if (med.forms && Array.isArray(med.forms)) {
      med.forms.forEach((form: any) => {
        if (form.form_name) forms.add(form.form_name);
      });
    }
  });
  
  return [
    { label: 'All Forms', value: 'all' },
    ...Array.from(forms).sort().map(f => ({ label: f, value: f }))
  ];
});

const brandOptions = computed(() => {
  const brands = new Set<string>();
  let meds = baseFilteredMedications.value;
  
  if (selectedCategory.value !== 'all') {
    meds = meds.filter(med => {
      if (Array.isArray(med.category)) {
        return med.category.includes(selectedCategory.value);
      }
      return med.category === selectedCategory.value;
    });
  }
  
  if (selectedForm.value !== 'all') {
    meds = meds.filter(med => 
      med.forms && med.forms.some((form: any) => form.form_name === selectedForm.value)
    );
  }
  
  meds.forEach(med => {
    if (med.brands && Array.isArray(med.brands)) {
      med.brands.forEach((brand: any) => {
        if (brand.name) brands.add(brand.name);
      });
    }
  });
  
  return [
    { label: 'All Brands', value: 'all' },
    ...Array.from(brands).sort().map(b => ({ label: b, value: b }))
  ];
});

const prescriptionOptions = computed(() => {
  const hasRx = baseFilteredMedications.value.some(med => med.requiresPrescription);
  const hasNonRx = baseFilteredMedications.value.some(med => !med.requiresPrescription);
  
  const options = [{ label: 'All Medications', value: 'all' }];
  
  if (hasRx) {
    options.push({ label: 'Requires Prescription', value: 'yes' });
  }
  
  if (hasNonRx) {
    options.push({ label: 'No Prescription Needed', value: 'no' });
  }
  
  return options;
});

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Category', value: 'category' }
];

const filteredMedications = computed(() => {
  return [...allMedications.value];
});

const isCategoryActive = (category: string): boolean => {
  return selectedCategory.value === category;
};

const handleCategoryClick = (category: string) => {
  selectedCategory.value = category;
};

const viewMedication = (id: number, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  router.push({ name: 'MedicationDetail', params: { id: String(id) } });
};

const openQuickView = (id: number, event: Event) => {
  event.stopPropagation();
  medicationsStore.openQuickView(id);
};

const toggleComparison = async (id: number, event: Event) => {
  event.stopPropagation();
  await medicationsStore.toggleComparison(id);
};

const isInComparison = (id: number): boolean => {
  return medicationsStore.isInComparison(id);
};



const clearFilters = () => {
  medicationsStore.clearFilters();
};

const { handleTouchStart, handleTouchMove, handleTouchEnd, pullDistance, isRefreshing } = usePullToRefresh(async () => {
  await medicationsStore.refreshMedications();
});

onMounted(async () => {
  const querySearch = route.query.search as string;
  await medicationsStore.initializeMedications(querySearch);
});
</script>

<template>
  <div 
    class="pt-20 pb-12 min-h-screen bg-gray-50 dark:bg-gray-900"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Pull to Refresh Indicator -->
    <div 
      v-if="pullDistance > 0"
      class="fixed top-20 left-1/2 z-50 transition-all transform -translate-x-1/2"
      :style="{ transform: `translate(-50%, ${Math.min(pullDistance, 80)}px)` }"
    >
      <div class="p-3 bg-white rounded-full shadow-lg dark:bg-gray-800">
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

    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Browse Medications
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Find and compare prices for your medications across pharmacies
        </p>
      </div>

      <!-- Search Bar with Autocomplete -->
      <div class="mb-6">
        <SearchAutocomplete
          v-model="searchQuery"
          placeholder="Search by name, category, generic name, or condition..."
          search-type="medications"
        />
      </div>

      <!-- Filter & Sort Bar -->
      <div class="p-4 mb-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
        <div class="flex justify-between items-center mb-4">
          <div class="flex gap-3 items-center">
            <button
              @click="medicationsStore.toggleShowFilters()"
              class="flex gap-2 items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
              <span class="font-medium">Filters</span>
              <span v-if="activeFiltersCount > 0" class="px-2 py-0.5 text-xs font-bold bg-[#246BFD] text-white rounded-full">
                {{ activeFiltersCount }}
              </span>
            </button>

            <button
              v-if="activeFiltersCount > 0"
              @click="clearFilters"
              class="flex gap-2 items-center px-4 py-2 text-red-600 rounded-lg transition-all dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="text-sm font-medium">Clear All</span>
            </button>
          </div>

          <div class="flex gap-2 items-center">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
            <div class="w-48">
              <Dropdown
                :model-value="sortBy"
                @update:model-value="(val) => { sortBy = val as string; }"
                :options="sortOptions"
                placeholder="Select sort order"
                size="small"
              />
            </div>
          </div>
        </div>

        <!-- Expandable Filters -->
        <div v-if="showFilters" class="pt-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <!-- Form Filter -->
            <Dropdown
              :model-value="selectedForm"
              @update:model-value="(val) => { selectedForm = val as string; }"
              :options="formOptions"
              label="Form"
              placeholder="Select form"
              searchable
            />

            <!-- Brand Filter -->
            <Dropdown
              :model-value="selectedBrand"
              @update:model-value="(val) => { selectedBrand = val as string; }"
              :options="brandOptions"
              label="Brand"
              placeholder="Select brand"
              searchable
            />

            <!-- Prescription Filter -->
            <Dropdown
              :model-value="requiresPrescription"
              @update:model-value="(val) => { requiresPrescription = val as 'all' | 'yes' | 'no'; }"
              :options="prescriptionOptions"
              label="Prescription"
              placeholder="Select option"
            />

            <!-- Category Filter -->
            <Dropdown
              :model-value="selectedCategory"
              @update:model-value="(val) => { selectedCategory = val as string; }"
              :options="categoryOptions"
              label="Category"
              placeholder="Select category"
              searchable
            />
          </div>
        </div>
      </div>

      <!-- Category Pills (Quick Filter) -->
      <div class="mb-6">
        <div class="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          <button
            v-for="category in categories"
            :key="`category-${category}`"
            @click="handleCategoryClick(category)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
              isCategoryActive(category)
                ? 'bg-[#246BFD] text-white shadow-lg shadow-[#246BFD]/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ category === 'all' ? 'All Categories' : category }}
          </button>
        </div>
      </div>

      <!-- Recently Viewed - Temporarily hidden -->
      <!-- <RecentlyViewedMedications v-if="!loading" :limit="6" /> -->

      <!-- Results Count -->
      <div v-if="!loading && !error" class="flex justify-between items-center mb-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Showing <span class="font-semibold text-gray-900 dark:text-white">{{ filteredMedications.length }}</span> medications
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading">
        <ListSkeleton type="medication" :count="9" :columns="3" />
      </div>

      <!-- Error State -->
      <ErrorState
        v-else-if="error"
        type="network"
        :message="error"
        @retry="medicationsStore.refreshMedications"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="filteredMedications.length === 0"
        type="search"
        @action="clearFilters"
      />

      <!-- Medications Grid -->
      <div v-else :key="`medications-grid-${filteredMedications.length}-${loading}`" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="medication in filteredMedications"
          :key="`med-${medication.id}-${selectedCategory}-${selectedForm}-${selectedBrand}`"
          @click="viewMedication(medication.id)"
          class="relative p-6 bg-white rounded-2xl shadow-lg transition-all duration-300 cursor-pointer dark:bg-gray-800 hover:shadow-2xl hover:-translate-y-2 group"
        >
          <!-- Action Buttons Overlay -->
          <div class="flex absolute top-4 right-4 z-10 gap-2">
            <FavoriteButton
              type="medication"
              :item-id="medication.id"
              size="small"
            />
            <button
              @click="toggleComparison(medication.id, $event)"
              :class="[
                'w-8 h-8 flex items-center justify-center rounded-full transition-all',
                isInComparison(medication.id)
                  ? 'bg-[#246BFD] text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-[#246BFD] hover:text-white'
              ]"
              title="Add to comparison"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </button>
          </div>

          <div class="overflow-hidden mb-4 rounded-xl aspect-w-16 aspect-h-9">
            <LazyImage
              :src="medication.image"
              :alt="medication.drug_name"
              aspectRatio="landscape"
              className="w-full h-48 object-cover"
            />
          </div>

          <div class="flex flex-wrap gap-2 items-center mb-2">
            <span 
              v-for="(cat, index) in (Array.isArray(medication.category) ? medication.category : [medication.category])"
              :key="index"
              class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#246BFD]/10 text-[#246BFD]"
            >
              {{ cat }}
            </span>
            <span v-if="medication.requiresPrescription" class="inline-flex items-center px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full dark:bg-orange-900 dark:text-orange-200">
              <svg class="mr-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              Rx
            </span>
          </div>

          <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">
            {{ medication.drug_name }}
          </h3>

          <p class="mb-4 text-sm text-gray-600 line-clamp-2 dark:text-gray-300">
            {{ medication.description }}
          </p>

          <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Available in</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ medication.forms.length }} {{ medication.forms.length === 1 ? 'form' : 'forms' }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="openQuickView(medication.id, $event)"
                class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full transition-colors dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Quick view"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <button
                @click="viewMedication(medication.id, $event)"
                class="px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error && filteredMedications.length > 0" class="mt-8">
        <Pagination
          :current-page="pagination.page"
          :total-pages="pagination.lastPage"
          :total-items="pagination.total"
          :per-page="pagination.perPage"
          @update:page="medicationsStore.setPage"
          @update:per-page="medicationsStore.setPerPage"
        />
      </div>
    </div>

    <!-- Quick View Modal -->
    <MedicationQuickViewModal
      :show="showQuickView"
      :medication-id="quickViewMedicationId"
      @close="medicationsStore.closeQuickView()"
    />

    <!-- Comparison Widget -->
    <MedicationComparison />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%;
}

.aspect-w-16 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

