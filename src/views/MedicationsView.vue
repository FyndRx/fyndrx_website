<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { dataService } from '@/services/dataService';
import { usePullToRefresh } from '@/composables/useMobileGestures';
import LazyImage from '@/components/LazyImage.vue';
import Dropdown from '@/components/Dropdown.vue';
import ListSkeleton from '@/components/skeletons/ListSkeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import RecentlyViewedMedications from '@/components/RecentlyViewedMedications.vue';
import SearchAutocomplete from '@/components/SearchAutocomplete.vue';
import MedicationQuickViewModal from '@/components/MedicationQuickViewModal.vue';
import MedicationComparison from '@/components/MedicationComparison.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';

const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const selectedCategory = ref<string>('all');
const selectedForm = ref<string>('all');
const selectedBrand = ref<string>('all');
const requiresPrescription = ref<string>('all');
const sortBy = ref<string>('name');
const showFilters = ref(false);
const loading = ref(true);
const error = ref<string | null>(null);
const quickViewMedicationId = ref<number | null>(null);
const showQuickView = ref(false);
const comparisonRef = ref<InstanceType<typeof MedicationComparison> | null>(null);

const allMedications = dataService.getAllMedications();

const categories = computed(() => {
  const cats = new Set<string>(['all']);
  allMedications.forEach(med => cats.add(med.category));
  return Array.from(cats);
});

const baseFilteredMedications = computed(() => {
  let meds = allMedications;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    meds = meds.filter(med =>
      med.drug_name.toLowerCase().includes(query) ||
      med.description.toLowerCase().includes(query) ||
      med.category.toLowerCase().includes(query) ||
      med.genericName?.toLowerCase().includes(query)
    );
  }

  return meds;
});

const categoryOptions = computed(() => {
  const cats = new Set<string>();
  baseFilteredMedications.value.forEach(med => cats.add(med.category));
  return [
    { label: 'All Categories', value: 'all' },
    ...Array.from(cats).sort().map(c => ({ label: c, value: c }))
  ];
});

const formOptions = computed(() => {
  const forms = new Set<string>();
  let meds = baseFilteredMedications.value;
  
  if (selectedCategory.value !== 'all') {
    meds = meds.filter(med => med.category === selectedCategory.value);
  }
  
  meds.forEach(med => {
    med.forms.forEach(form => forms.add(form.name));
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
    meds = meds.filter(med => med.category === selectedCategory.value);
  }
  
  if (selectedForm.value !== 'all') {
    meds = meds.filter(med => med.forms.some(form => form.name === selectedForm.value));
  }
  
  meds.forEach(med => {
    if (med.brands) {
      med.brands.forEach(brand => brands.add(brand.name));
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

const activeFiltersCount = computed(() => {
  let count = 0;
  if (selectedCategory.value !== 'all') count++;
  if (selectedForm.value !== 'all') count++;
  if (selectedBrand.value !== 'all') count++;
  if (requiresPrescription.value !== 'all') count++;
  if (sortBy.value !== 'name') count++;
  return count;
});

const filteredMedications = computed(() => {
  let meds = baseFilteredMedications.value;

  // Category filter
  if (selectedCategory.value !== 'all') {
    meds = meds.filter(med => med.category === selectedCategory.value);
  }

  // Form filter
  if (selectedForm.value !== 'all') {
    meds = meds.filter(med =>
      med.forms.some(form => form.name === selectedForm.value)
    );
  }

  // Brand filter
  if (selectedBrand.value !== 'all') {
    meds = meds.filter(med =>
      med.brands && med.brands.some(brand => brand.name === selectedBrand.value)
    );
  }

  // Prescription filter
  if (requiresPrescription.value !== 'all') {
    const needsRx = requiresPrescription.value === 'yes';
    meds = meds.filter(med => med.requiresPrescription === needsRx);
  }

  // Sort
  if (sortBy.value === 'name') {
    meds = [...meds].sort((a, b) => a.drug_name.localeCompare(b.drug_name));
  } else if (sortBy.value === 'name-desc') {
    meds = [...meds].sort((a, b) => b.drug_name.localeCompare(a.drug_name));
  } else if (sortBy.value === 'category') {
    meds = [...meds].sort((a, b) => a.category.localeCompare(b.category));
  }

  return meds;
});

const clearFilters = () => {
  selectedCategory.value = 'all';
  selectedForm.value = 'all';
  selectedBrand.value = 'all';
  requiresPrescription.value = 'all';
  sortBy.value = 'name';
  searchQuery.value = '';
};

const viewMedication = (id: number) => {
  router.push({ name: 'MedicationDetail', params: { id } });
};

const openQuickView = (id: number, event: Event) => {
  event.stopPropagation();
  quickViewMedicationId.value = id;
  showQuickView.value = true;
};

const toggleComparison = (id: number, event: Event) => {
  event.stopPropagation();
  if (comparisonRef.value) {
    if (comparisonRef.value.isInComparison(id)) {
      comparisonRef.value.removeFromComparison(id);
    } else {
      comparisonRef.value.addToComparison(id);
    }
  }
};

const isInComparison = (id: number): boolean => {
  return comparisonRef.value?.isInComparison(id) || false;
};

const loadMedications = async () => {
  loading.value = true;
  error.value = null;
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
  } catch (err) {
    error.value = 'Failed to load medications';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const { handleTouchStart, handleTouchMove, handleTouchEnd, pullDistance, isRefreshing } = usePullToRefresh(async () => {
  await loadMedications();
});

onMounted(async () => {
  const querySearch = route.query.search as string;
  if (querySearch) {
    searchQuery.value = querySearch;
  }
  await loadMedications();
});
</script>

<template>
  <div 
    class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900"
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
          placeholder="Search by name, category, generic name, or condition..."
          search-type="medications"
        />
      </div>

      <!-- Filter & Sort Bar -->
      <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <button
              @click="showFilters = !showFilters"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
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
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span class="text-sm font-medium">Clear All</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
            <div class="w-48">
              <Dropdown
                v-model="sortBy"
                :options="sortOptions"
                placeholder="Select sort order"
                size="small"
              />
            </div>
          </div>
        </div>

        <!-- Expandable Filters -->
        <div v-if="showFilters" class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <!-- Form Filter -->
            <Dropdown
              v-model="selectedForm"
              :options="formOptions"
              label="Form"
              placeholder="Select form"
              searchable
            />

            <!-- Brand Filter -->
            <Dropdown
              v-model="selectedBrand"
              :options="brandOptions"
              label="Brand"
              placeholder="Select brand"
              searchable
            />

            <!-- Prescription Filter -->
            <Dropdown
              v-model="requiresPrescription"
              :options="prescriptionOptions"
              label="Prescription"
              placeholder="Select option"
            />

            <!-- Category Filter -->
            <Dropdown
              v-model="selectedCategory"
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
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              selectedCategory === category
                ? 'bg-[#246BFD] text-white shadow-lg shadow-[#246BFD]/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ category === 'all' ? 'All Categories' : category }}
          </button>
        </div>
      </div>

      <!-- Recently Viewed -->
      <RecentlyViewedMedications v-if="!loading" :limit="6" />

      <!-- Results Count -->
      <div v-if="!loading && !error" class="mb-6 flex items-center justify-between">
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
        @retry="loadMedications"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="filteredMedications.length === 0"
        type="search"
        @action="clearFilters"
      />

      <!-- Medications Grid -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="medication in filteredMedications"
          :key="medication.id"
          @click="viewMedication(medication.id)"
          class="relative p-6 transition-all duration-300 bg-white shadow-lg cursor-pointer dark:bg-gray-800 rounded-2xl hover:shadow-2xl hover:-translate-y-2 group"
        >
          <!-- Action Buttons Overlay -->
          <div class="absolute top-4 right-4 flex gap-2 z-10">
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

          <div class="mb-4 overflow-hidden aspect-w-16 aspect-h-9 rounded-xl">
            <LazyImage
              :src="medication.image"
              :alt="medication.drug_name"
              aspectRatio="landscape"
              className="w-full h-48 object-cover"
            />
          </div>

          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-[#246BFD]/10 text-[#246BFD]">
              {{ medication.category }}
            </span>
            <span v-if="medication.requiresPrescription" class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
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

          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Available in</p>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ medication.forms.length }} {{ medication.forms.length === 1 ? 'form' : 'forms' }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="openQuickView(medication.id, $event)"
                class="px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Quick view"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              <button class="px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick View Modal -->
    <MedicationQuickViewModal
      :show="showQuickView"
      :medication-id="quickViewMedicationId"
      @close="showQuickView = false"
    />

    <!-- Comparison Widget -->
    <MedicationComparison ref="comparisonRef" />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
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
</style>

