<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { medicationService } from '@/services/medicationService';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy } from '@/models/Pharmacy';
import type { SmartSearchResponse, SmartSearchMatch } from '@/models/api/SmartSearchResponse';


interface Props {
  modelValue?: string;
  placeholder?: string;
  searchType?: 'medications' | 'pharmacies' | 'all';
  autoFocus?: boolean;
  inputClass?: string;
  iconsRightOffset?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search medications, pharmacies...',
  searchType: 'all',
  autoFocus: false,
  inputClass: 'bg-white dark:bg-gray-800 pr-12',
  iconsRightOffset: 'right-4'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
}>();

const router = useRouter();
const searchQuery = ref(props.modelValue ?? '');
const showResults = ref(false);
const selectedIndex = ref(-1);
const searchInput = ref<HTMLInputElement | null>(null);

const smartResponse = ref<SmartSearchResponse | null>(null);
const pharmacies = ref<Pharmacy[]>([]);
const searching = ref(false);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const recentSearches = ref<any[]>([]);
const topSearches = ref<any[]>([]);
const isFocused = ref(false);
const validationError = ref('');

const validateQuery = (query: string): string => {
  const trimmed = query.trim();
  if (trimmed.length === 0) return '';
  if (trimmed.length === 1) return 'Please enter at least 2 characters';
  
  // Check for 3+ consecutive identical characters
  if (/(.)\1\1/.test(trimmed)) {
    return 'Please avoid repetitive characters';
  }
  
  // Check for only special characters
  if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
    return 'Please enter a valid search term';
  }
  
  return '';
};

const fetchHistory = async () => {
    if (props.searchType === 'medications' || props.searchType === 'all') {
      const [recent, top] = await Promise.all([
        medicationService.getRecentSearches(),
        medicationService.getTopSearches()
      ]);
      recentSearches.value = recent;
      topSearches.value = top;
    }
};

const handleFocus = () => {
  isFocused.value = true;
  showResults.value = true;
  if (searchQuery.value.trim().length === 0) {
    fetchHistory();
  } else {
    performSearch(searchQuery.value);
  }
};

const performSearch = async (query: string) => {
  const trimmed = query?.trim() || '';
  
  // Run validation
  validationError.value = validateQuery(trimmed);
  if (validationError.value) {
    smartResponse.value = null;
    pharmacies.value = [];
    searching.value = false;
    showResults.value = false; // Add this
    return;
  }

  if (trimmed.length === 0) {
     smartResponse.value = null;
     pharmacies.value = [];
     searching.value = false;
     showResults.value = false;
     return;
  }
  
  console.log('performSearch called with:', trimmed);

  searching.value = true;
  try {
    const searchPromises: Promise<any>[] = [];

    if (props.searchType === 'medications' || props.searchType === 'all') {
      searchPromises.push(
        medicationService.smartSearch(trimmed, true).then(response => {
           smartResponse.value = response;
        }).catch(() => {
           smartResponse.value = null;
        })
      );
    }

    if (props.searchType === 'pharmacies' || props.searchType === 'all') {
      searchPromises.push(
        pharmacyService.searchPharmaciesByDrugs([]).then(results => {
          const filtered = results.filter((p: Pharmacy) => 
            p.name?.toLowerCase().includes(query.toLowerCase())
          );
          pharmacies.value = filtered.slice(0, 3);
        }).catch(() => {
          pharmacies.value = [];
        })
      );
    }

    await Promise.all(searchPromises);
  } catch (err) {
    console.error('Search error:', err);
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
  
  const query = newQuery.trim();
  if (query.length === 0) {
    showResults.value = false;
    smartResponse.value = null;
    pharmacies.value = [];
    selectedIndex.value = -1;
    validationError.value = '';
    return;
  }

  // Instant validation check
  const error = validateQuery(newQuery);
  if (error) {
    validationError.value = error;
    showResults.value = false;
  } else {
    validationError.value = '';
    showResults.value = true;
    selectedIndex.value = -1;
    searchTimeout = setTimeout(() => {
      performSearch(newQuery);
    }, 300);
  }
});

const allResults = computed(() => {
  const results: Array<{ type: 'top_match' | 'product' | 'suggestion' | 'pharmacy' | 'recent' | 'top'; item: any }> = [];
  
  if (smartResponse.value?.top_match) {
    results.push({ type: 'top_match', item: smartResponse.value.top_match });
  }
  
  smartResponse.value?.results.products.slice(0, 5).forEach(prod => {
    results.push({ type: 'product', item: prod });
  });

  smartResponse.value?.suggestions.slice(0, 3).forEach(sugg => {
    results.push({ type: 'suggestion', item: sugg });
  });
  
  pharmacies.value.forEach(pharm => {
    results.push({ type: 'pharmacy', item: pharm });
  });
  
  if (searchQuery.value.length === 0) {
    recentSearches.value.forEach(item => {
      results.push({ type: 'recent', item });
    });
    topSearches.value.forEach(item => {
      results.push({ type: 'top', item });
    });
  }
  
  return results;
});

const selectQuery = (query: string) => {
  searchQuery.value = query;
  performSearch(query);
  emit('search', query);
};

const handleSelection = (result: { type: string; item: any }) => {
  if (result.type === 'top_match') {
    const match = result.item as SmartSearchMatch;
    // We ignore match.action and match.target and always use match.data 
    // to ensure all required variant IDs are passed correctly.
    if (match.type === 'product' && match.data) {
      router.push({
        path: `/medication/${match.data.id || match.data.drug_id}`,
        query: {
          brand_id: match.data.brand_id,
          form_id: match.data.form_id,
          strength_id: match.data.strength_id,
          uom_id: match.data.uom_id
        }
      });
    } else if (match.type === 'drug' && match.data) {
      router.push(`/medication/${match.data.id || match.data.drug_id}`);
    } else if (match.action === 'navigate' && match.target) {
       // Fallback for non-medication types if still using target
       router.push(match.target);
    }
  } else if (result.type === 'product') {
    const item = result.item;
    router.push({
      path: `/medication/${item.id || item.drug_id}`,
      query: {
        brand_id: item.brand_id,
        form_id: item.form_id,
        strength_id: item.strength_id,
        uom_id: item.uom_id
      }
    });
  } else if (result.type === 'pharmacy') {
     router.push({ name: 'pharmacy', params: { id: result.item.id } });
  } else if (result.type === 'suggestion') {
     searchQuery.value = result.item.text;
     emit('search', result.item.text);
     return;
  } else if (result.type === 'recent' || result.type === 'top') {
     selectQuery(result.item.query);
     return;
  }
  
  // Track selection if it's a specific product/brand/category
  if (result.type === 'product' || result.type === 'top_match' || result.type === 'pharmacy') {
    const item = result.type === 'top_match' ? result.item.data : result.item;
    const type = result.type === 'top_match' ? result.item.type : result.type;
    
    // Determine the most specific name to track
    let trackName = searchQuery.value;
    if (item && item.name) {
      trackName = item.name;
    } else if (item && item.text) { // for suggestions
      trackName = item.text;
    }

    if (item && (item.id || item.drug_id)) {
      medicationService.trackSearch(trackName, type, item.id || item.drug_id);
    }
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
      selectedIndex.value = Math.min(selectedIndex.value + 1, allResults.value.length - 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
      break;
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value < allResults.value.length) {
        handleSelection(allResults.value[selectedIndex.value]);
      } else if (allResults.value.length > 0 && selectedIndex.value === -1) {
         // If nothing selected but Top Match exists, select it
         handleSelection(allResults.value[0]);
      } else {
         // No specific selection, just emit the current query
         emit('search', searchQuery.value);
         showResults.value = false;
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
    isFocused.value = false;
  }
};



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
        @focus="handleFocus"
        :class="[
          'w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-2 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
          validationError 
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-200 dark:border-gray-700 focus:ring-[#246BFD] focus:border-transparent',
          inputClass
        ]"
      />
      <!-- Validation Error Message -->
      <Transition name="fade">
        <div v-if="validationError" class="absolute left-1 -bottom-5 text-[10px] font-bold text-red-500 flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm border border-red-100 dark:border-red-900/30 z-20 uppercase tracking-wider">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          {{ validationError }}
        </div>
      </Transition>
      <!-- Icons -->
      <div :class="['absolute top-1/2 transform -translate-y-1/2 flex items-center gap-2', iconsRightOffset]">
        <div v-if="searching" class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#246BFD]"></div>
        <button
          v-if="searchQuery && !searching"
          @click="clearSearch"
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
        >
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <svg v-if="!searching" class="w-6 h-6 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <slot name="append"></slot>
    </div>

    <Transition name="dropdown">
      <div
        v-if="showResults && allResults.length > 0"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[min(480px,70vh)] overflow-y-auto"
      >
        <!-- Top Match -->
        <div v-if="smartResponse?.top_match" class="p-2 border-b border-gray-100 dark:border-gray-700">
          <div class="px-3 py-2 text-xs font-semibold text-[#246BFD] uppercase flex items-center gap-2">
             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
             Top Match
          </div>
          <div
            @click="handleSelection({ type: 'top_match', item: smartResponse.top_match })"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-left cursor-pointer',
              selectedIndex === 0 ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
            ]"
          >
             <div class="flex-1">
               <div class="font-bold text-gray-900 dark:text-white">
                 {{ smartResponse.top_match.data?.name || smartResponse.top_match.target }}
               </div>
               <div class="text-sm text-blue-600 dark:text-blue-400">
                 {{ smartResponse.top_match.type === 'category' ? 'Browse Category' : (smartResponse.top_match.type === 'brand' ? 'Browse Brand' : 'View Product') }} &rarr;
               </div>
             </div>
          </div>
        </div>

        <!-- Products -->
        <div v-if="smartResponse?.results?.products?.length" class="p-2">
           <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Products
          </div>
          <div
            v-for="(product, idx) in smartResponse.results.products"
            :key="`prod-${product.id}`"
            @click="handleSelection({ type: 'product', item: product })"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer',
              selectedIndex === (smartResponse.top_match ? 1 : 0) + idx ? 'bg-gray-50 dark:bg-gray-700' : ''
            ]"
          >
            <img 
               v-if="product.image" 
               :src="product.image" 
               class="w-10 h-10 rounded object-cover bg-gray-100" 
               alt=""
            />
            <div class="flex-1 min-w-0">
               <div class="font-medium text-gray-900 dark:text-white truncate">
                 {{ product.name }}
               </div>
               <div class="text-xs text-gray-500 truncate">
                 {{ product.detail }}
                 <span v-if="product.pharmacy_count" class="ml-1 text-[#246BFD] font-medium">
                   ({{ product.pharmacy_count }} {{ product.pharmacy_count === 1 ? 'pharmacy' : 'pharmacies' }})
                 </span>
               </div>
            </div>
          </div>
        </div>
        
        <!-- Suggestions -->
        <div v-if="smartResponse?.suggestions?.length" class="p-2 border-t border-gray-100 dark:border-gray-700">
           <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Suggestions
          </div>
           <div
            v-for="(sugg, idx) in smartResponse.suggestions"
            :key="`sugg-${idx}`"
            @click="handleSelection({ type: 'suggestion', item: sugg })"
             :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer',
               // calc index offset based on top match + products count
              selectedIndex === (smartResponse.top_match ? 1 : 0) + (smartResponse.results.products?.length || 0) + idx ? 'bg-gray-50 dark:bg-gray-700' : ''
            ]"
           >
             <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <span class="text-gray-700 dark:text-gray-300">{{ sugg.text }}</span>
           </div>
        </div>

        <!-- Pharmacies -->
        <div v-if="pharmacies.length > 0" class="p-2 border-t border-gray-100 dark:border-gray-700">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Pharmacies
          </div>
          <div
            v-for="(pharmacy, index) in pharmacies"
            :key="`pharm-${pharmacy.id}`"
            @click="handleSelection({ type: 'pharmacy', item: pharmacy })"
            :class="[
              'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer',
               // last group index calc
              selectedIndex === allResults.length - pharmacies.length + index ? 'bg-gray-50 dark:bg-gray-700' : ''
            ]"
          >
             <!-- Pharmacy Item Content -->
             <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">{{ pharmacy.name }}</div>
             </div>
          </div>
        </div>

        <!-- Recent & Top Searches (Empty query state) -->
        <div v-if="searchQuery.length === 0" class="p-2">
          <div v-if="recentSearches.length > 0" class="mb-4">
            <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Recent Searches
              </div>
              <button 
                @click.stop="recentSearches = []" 
                class="text-[#246BFD] hover:underline normal-case font-medium"
              >
                Clear
              </button>
            </div>
            <div
              v-for="(item, idx) in recentSearches"
              :key="`recent-${idx}`"
              @click="handleSelection({ type: 'recent', item })"
              :class="[
                'w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer group',
                selectedIndex === idx ? 'bg-gray-50 dark:bg-gray-700' : ''
              ]"
            >
              <div class="flex items-center gap-3">
                <span class="text-gray-700 dark:text-gray-300">{{ item.query }}</span>
                <span v-if="item.match_type" class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 uppercase tracking-wider font-bold">
                  {{ item.match_type }}
                </span>
              </div>
              <svg class="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
            </div>
          </div>

          <!-- Trending / Top Searches -->
          <div v-if="topSearches.length > 0" :class="recentSearches.length > 0 ? 'mt-4 border-t border-gray-100 dark:border-gray-700 pt-2' : ''">
            <div class="px-3 py-2 text-xs font-semibold text-[#FE9615] uppercase flex items-center gap-2">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd"></path></svg>
              Trending Now
            </div>
            <div
              v-for="(item, idx) in topSearches"
              :key="`top-${idx}`"
              @click="handleSelection({ type: 'top', item })"
              :class="[
                'w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer group',
                selectedIndex === (recentSearches.length + idx) ? 'bg-gray-50 dark:bg-gray-700' : ''
              ]"
            >
              <div class="flex items-center gap-3">
                <span class="text-gray-700 dark:text-gray-300">{{ item.query }}</span>
                <span v-if="item.total_searches" class="text-[10px] text-gray-400">
                  {{ item.total_searches.toLocaleString() }} searches
                </span>
              </div>
              <svg class="w-4 h-4 text-[#FE9615] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Empty State -->
    <Transition name="dropdown">
      <div
        v-if="showResults && searchQuery.length >= 2 && allResults.length === 0 && !searching"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center"
      >
        <p class="text-gray-600 dark:text-gray-400">No results found for "{{ searchQuery }}"</p>
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
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>

