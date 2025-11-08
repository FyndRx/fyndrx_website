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

// Smart Search State
const smartResponse = ref<SmartSearchResponse | null>(null);
const pharmacies = ref<Pharmacy[]>([]);
const searching = ref(false);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const performSearch = async (query: string) => {
  if (!query || query.trim().length < 2) {
    smartResponse.value = null;
    pharmacies.value = [];
    return;
  }

  searching.value = true;
  try {
    const searchPromises: Promise<any>[] = [];

    if (props.searchType === 'medications' || props.searchType === 'all') {
      searchPromises.push(
        medicationService.smartSearch(query.trim()).then(response => {
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
  
  searchTimeout = setTimeout(() => {
    performSearch(newQuery);
  }, 300);
});

// Computed flatten list for keyboard navigation
const allResults = computed(() => {
  const results: Array<{ type: 'top_match' | 'product' | 'suggestion' | 'pharmacy'; item: any }> = [];
  
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
  
  return results;
});

const handleSelection = (result: { type: string; item: any }) => {
  if (result.type === 'top_match') {
    const match = result.item as SmartSearchMatch;
    if (match.action === 'navigate') {
       router.push(match.target);
    } else {
       // fallback if top match is just info
       if (match.type === 'product') {
         // Should have a link in data or construct it
         const link = match.data?.url || `/medication/${match.data?.id}`;
         router.push(link);
       }
    }
  } else if (result.type === 'product') {
    const item = result.item;
    const link = item.url || `/medication/${item.id}`;
    router.push(link);
  } else if (result.type === 'pharmacy') {
     router.push({ name: 'pharmacy', params: { id: result.item.id } });
  } else if (result.type === 'suggestion') {
     // If suggestion is clicked, maybe just update search or search for it?
     // Usually specific suggestions map to products or brands
     searchQuery.value = result.item.text;
     performSearch(result.item.text);
     return; // Don't clear search yet
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
      <!-- Icons -->
      <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <div v-if="searching" class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#246BFD]"></div>
        <button
          v-if="searchQuery && !searching"
          @click="clearSearch"
          class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <svg v-if="!searching" class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>

    <Transition name="dropdown">
      <div
        v-if="showResults && allResults.length > 0"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
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
</style>

