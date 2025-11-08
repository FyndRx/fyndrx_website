<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { dataService } from '@/services/dataService';
import type { Medication } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';

interface Props {
  placeholder?: string;
  searchType?: 'medications' | 'pharmacies' | 'all';
  autoFocus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search medications, pharmacies...',
  searchType: 'all',
  autoFocus: false
});

const router = useRouter();
const searchQuery = ref('');
const showResults = ref(false);
const selectedIndex = ref(-1);
const searchInput = ref<HTMLInputElement | null>(null);

const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    return { medications: [], pharmacies: [] };
  }

  const query = searchQuery.value.toLowerCase();
  let medications: Medication[] = [];
  let pharmacies: Pharmacy[] = [];

  if (props.searchType === 'medications' || props.searchType === 'all') {
    medications = dataService.searchMedications(query).slice(0, 5);
  }

  if (props.searchType === 'pharmacies' || props.searchType === 'all') {
    pharmacies = dataService.searchPharmacies(query).slice(0, 5);
  }

  return { medications, pharmacies };
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

const handleClickOutside = (event: MouseEvent) => {
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
  document.addEventListener('click', handleClickOutside);
  if (props.autoFocus && searchInput.value) {
    searchInput.value.focus();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
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
            <img
              :src="medication.image"
              :alt="medication.drug_name"
              class="w-12 h-12 rounded-lg object-cover"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 dark:text-white truncate">
                {{ medication.drug_name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ medication.category }}
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
            <img
              :src="pharmacy.image"
              :alt="pharmacy.name"
              class="w-12 h-12 rounded-lg object-cover"
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

