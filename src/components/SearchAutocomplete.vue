<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { medicationService } from '@/services/medicationService';
import { pharmacyService } from '@/services/pharmacyService';
import type { Medication } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';
import LazyImage from './LazyImage.vue';

interface Props {
  modelValue?: string;
  placeholder?: string;
  searchType?: 'medications' | 'pharmacies' | 'all';
  autoFocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search medications, pharmacies...',
  searchType: 'all',
  autoFocus: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const router = useRouter();
const searchQuery = ref(props.modelValue ?? '');
const showResults = ref(false);
const selectedIndex = ref(-1);
const searchInput = ref<HTMLInputElement | null>(null);
const medications = ref<Medication[]>([]);
const pharmacies = ref<Pharmacy[]>([]);
const searching = ref(false);

const searchResults = computed(() => {
  return { medications: medications.value, pharmacies: pharmacies.value };
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const performSearch = async (query: string) => {
  if (!query || query.trim().length < 2) {
    medications.value = [];
    pharmacies.value = [];
    return;
  }

  searching.value = true;
  try {
    const searchPromises: Promise<any>[] = [];

    if (props.searchType === 'medications' || props.searchType === 'all') {
      searchPromises.push(
        medicationService.liveSearch({ query: query.trim(), perPage: 5 }).then(result => {
          medications.value = result.medications.slice(0, 5);
        }).catch(() => {
          medications.value = [];
        })
      );
    } else {
      medications.value = [];
    }

    if (props.searchType === 'pharmacies' || props.searchType === 'all') {
      searchPromises.push(
        pharmacyService.searchPharmaciesByDrugs([]).then(results => {
          const filtered = results.filter((p: Pharmacy) => 
            p.name?.toLowerCase().includes(query.toLowerCase())
          );
          pharmacies.value = filtered.slice(0, 5);
        }).catch(() => {
          pharmacies.value = [];
        })
      );
    } else {
      pharmacies.value = [];
    }

    await Promise.all(searchPromises);
  } catch (err) {
    console.error('Search error:', err);
    medications.value = [];
    pharmacies.value = [];
  } finally {
    searching.value = false;
  }
};

watch(() => props.modelValue, value => {
  if (value !== undefined && value !== searchQuery.value) {
    searchQuery.value = value;
  }
});

watch(searchQuery, (newQuery) => {
  emit('update:modelValue', newQuery);
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    performSearch(newQuery);
  }, 300);
});

const totalResults = computed(() => {
  return searchResults.value.medications.length + searchResults.value.pharmacies.length;
});

const allResults = computed(() => {
  const results: Array<{ type: 'medication' | 'pharmacy'; item: Medication | Pharmacy }> = [];
  
  searchResults.value.medications.forEach(med => {
    results.push({ type: 'medication', item: med });
  });
  
  searchResults.value.pharmacies.forEach(pharm => {
    results.push({ type: 'pharmacy', item: pharm });
  });
  
  return results;
});

const selectResult = (type: 'medication' | 'pharmacy', id: number) => {
  if (type === 'medication') {
    router.push({ name: 'MedicationDetail', params: { id } });
  } else {
    router.push({ name: 'pharmacy', params: { id } });
  }
  clearSearch();
};

const clearSearch = () => {
  searchQuery.value = '';
  showResults.value = false;
  selectedIndex.value = -1;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!showResults.value) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value = Math.min(selectedIndex.value + 1, totalResults.value - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      break;
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value < allResults.value.length) {
        const selected = allResults.value[selectedIndex.value];
        selectResult(selected.type, selected.item.id);
      }
      break;
    case 'Escape':
      clearSearch();
      break;
  }
};

const handlePointerDownOutside = (event: PointerEvent) => {
  const target = event.target as HTMLElement;
  if (searchInput.value && !searchInput.value.contains(target)) {
    showResults.value = false;
  }
};

watch(searchQuery, () => {
  showResults.value = searchQuery.value.length >= 2;
  selectedIndex.value = -1;
});

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDownOutside);
  if (props.autoFocus && searchInput.value) {
    searchInput.value.focus();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDownOutside);
});
</script>

<template>
  <div class="relative w-full" ref="searchInput">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        @keydown="handleKeydown"
        @focus="showResults = searchQuery.length >= 2"
        class="w-full px-6 py-4 pr-12 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#246BFD] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
      />
      <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>

    <Transition name="dropdown">
      <div
        v-if="showResults && totalResults > 0"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
      >
        <div v-if="searchResults.medications.length > 0" class="p-2">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Medications
          </div>
          <button
            v-for="(medication, index) in searchResults.medications"
            :key="`med-${medication.id}`"
            @click="selectResult('medication', medication.id)"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left',
              selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
            ]"
          >
            <LazyImage
              :src="medication.image"
              :alt="medication.drug_name"
              aspectRatio="square"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white truncate">
                {{ medication.drug_name }}
              </div>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(cat, index) in (Array.isArray(medication.category) ? medication.category.slice(0, 1) : [medication.category])"
                  :key="index"
                  class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                >
                  {{ cat }}
                </span>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        <div v-if="searchResults.pharmacies.length > 0" class="p-2">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Pharmacies
          </div>
          <button
            v-for="(pharmacy, index) in searchResults.pharmacies"
            :key="`pharm-${pharmacy.id}`"
            @click="selectResult('pharmacy', pharmacy.id)"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left',
              selectedIndex === (searchResults.medications.length + index) ? 'bg-gray-50 dark:bg-gray-700' : ''
            ]"
          >
            <LazyImage
              :src="pharmacy.image"
              :alt="pharmacy.name"
              aspectRatio="square"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white truncate">
                {{ pharmacy.name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ pharmacy.address }}
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="dropdown">
      <div
        v-if="showResults && searchQuery.length >= 2 && totalResults === 0"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center"
      >
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-600 dark:text-gray-400 mb-1 font-medium">No results found</p>
        <p class="text-sm text-gray-500 dark:text-gray-500">Try a different search term</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

