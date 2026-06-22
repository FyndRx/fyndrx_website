<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { usePullToRefresh } from '@/composables/useMobileGestures';
import { reviewService } from '@/services/reviewService';
import { pharmacyService } from '@/services/pharmacyService';
import { useDataCacheStore } from '@/store/dataCache';
import type { Pharmacy, PharmacyServiceGroup } from '@/models/Pharmacy';
import * as HeroIconsOutline from '@heroicons/vue/24/outline';
import PharmacyCard from '@/components/PharmacyCard.vue';
import Dropdown from '@/components/Dropdown.vue';
import ListSkeleton from '@/components/skeletons/ListSkeleton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import SearchAutocomplete from '@/components/SearchAutocomplete.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';
import NativeCardAd from '@/components/ads/formats/NativeCardAd.vue';
import { useAds } from '@/composables/useAds';
import { useAdsStore } from '@/store/ads';

const route = useRoute();
const dataCache = useDataCacheStore();

const adsStore = useAdsStore();
onMounted(() => adsStore.load());
const { resolved: pharmaInlineAd } = useAds({ zone: 'Z4-pharma-inline', route: 'pharmacies', isAuthed: false });

useSeoMeta({
  title: 'Find Pharmacies Near You | FyndRx',
  description: 'Locate verified pharmacies near you. Compare prices, check services and operating hours. Find the best pharmacy for your medications with FyndRx.',
  keywords: 'find pharmacy, pharmacy near me, compare pharmacy prices, verified pharmacies, pharmacy services, FyndRx pharmacies',
  ogType: 'website',
});

const { registerElement, triggerCheck } = useScrollAnimation();
const pharmacies = ref<Pharmacy[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const searchQuery = ref('');
const searchBarQuery = ref('');
const selectedServices = ref<string[]>([]);
const sortBy = ref<string>('distance');
const isOpenNow = ref(false);

// ── Service catalog (loaded from API) ───────────────────────────────────────
const serviceGroups = ref<PharmacyServiceGroup[]>([]);
const servicesLoading = ref(false);

const allServices = computed(() => serviceGroups.value.flatMap(g => g.services));

// Slug → display name, used for active-filter tags
const serviceNameBySlug = computed(() => {
  const map: Record<string, string> = {};
  allServices.value.forEach(s => { map[s.slug] = s.name; });
  return map;
});

// Convert "heroicon-o-shopping-bag" → the matching @heroicons/vue component (or null)
function resolveHeroicon(slug: string | undefined) {
  if (!slug?.startsWith('heroicon-')) return null;
  const bare = slug.replace(/^heroicon-[os]-/, '');
  const componentName = bare.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Icon';
  return (HeroIconsOutline as Record<string, any>)[componentName] ?? null;
}

// Toggle a service slug in the selected list and reload
function toggleService(slug: string) {
  const idx = selectedServices.value.indexOf(slug);
  if (idx > -1) {
    selectedServices.value.splice(idx, 1);
  } else {
    selectedServices.value.push(slug);
  }
  loadPharmacies();
}

const sortOptions = [
  { label: 'Distance', value: 'distance' },
  { label: 'Rating (High to Low)', value: 'rating' },
  { label: 'Name (A-Z)', value: 'name' }
];


const loadPharmacies = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Get all pharmacies directly from /pharmacies endpoint (without drugs param)
    // Note: We don't need pharmacy prices here - those are only needed on the pharmacy detail page
    let result = await pharmacyService.getAllPharmacies();
    
    // Cache the pharmacies for later use
    dataCache.setPharmacies(result);
    
    // Apply search filter if provided
    if (searchQuery.value && searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      result = result.filter((pharmacy: Pharmacy) =>
        pharmacy.name?.toLowerCase()?.includes(query) ||
        pharmacy.address?.toLowerCase()?.includes(query)
      );
    }

    if (selectedServices.value.length > 0) {
      result = result.filter((pharmacy: Pharmacy) =>
        pharmacy.services && selectedServices.value.every(slug =>
          pharmacy.services.some(s => s.slug === slug || s.name === slug)
        )
      );
    }

    if (isOpenNow.value) {
      result = result.filter((pharmacy: Pharmacy) => pharmacy.isOpen);
    }

    if (sortBy.value === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy.value === 'rating') {
      const ratings = await Promise.all(
        result.map(async (pharmacy: Pharmacy) => {
          try {
            const stats = await reviewService.getReviewStats('pharmacy', pharmacy.id);
            return { pharmacy, rating: stats.averageRating || 0 };
          } catch {
            return { pharmacy, rating: 0 };
          }
        })
      );
      ratings.sort((a, b) => b.rating - a.rating);
      result = ratings.map(r => r.pharmacy);
    }

    pharmacies.value = result;
    if (result.length === 0) {
      console.warn('[Pharmacies] API returned 0 pharmacies after filters. Check is_active flag or DB seed.');
    } else {
      console.info(`[Pharmacies] Loaded ${result.length} pharmacies.`);
    }
  } catch (err) {
    error.value = 'Failed to load pharmacies. Please try again later.';
    console.error('[Pharmacies] Error loading pharmacies:', err);
  } finally {
    loading.value = false;
  }
};

const handleSort = () => {
  loadPharmacies();
};

const clearAllFilters = () => {
  searchQuery.value = '';
  searchBarQuery.value = '';
  selectedServices.value = [];
  isOpenNow.value = false;
  sortBy.value = 'distance';
  loadPharmacies();
};

const commitSearch = (query: string) => {
  searchQuery.value = query;
};

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
         selectedServices.value.length > 0 || 
         isOpenNow.value || 
         sortBy.value !== 'distance';
});

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchDebounce) {
    clearTimeout(searchDebounce);
  }
  searchDebounce = setTimeout(() => {
    loadPharmacies();
  }, 300);
});

watch(isOpenNow, () => loadPharmacies());

const { handleTouchStart, handleTouchMove, handleTouchEnd, pullDistance, isRefreshing } = usePullToRefresh(async () => {
  await loadPharmacies();
});

onMounted(async () => {
  const querySearch = route.query.search as string;
  const queryPharmacy = route.query.pharmacy as string;

  if (querySearch) searchQuery.value = querySearch;
  if (queryPharmacy) searchQuery.value = queryPharmacy;

  // Load service catalog and pharmacies in parallel
  servicesLoading.value = true;
  pharmacyService.getServicesCatalog()
    .then(groups => { serviceGroups.value = groups; })
    .catch(() => { /* sidebar degrades gracefully */ })
    .finally(() => { servicesLoading.value = false; });

  // Register static scroll-animate elements (hero, sidebar) immediately on mount.
  // Pharmacy cards use CSS keyframe animation instead and need no JS trigger.
  await nextTick();
  document.querySelectorAll('.scroll-animate').forEach(el => registerElement(el as HTMLElement));
  triggerCheck();

  await loadPharmacies();
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
    <div class="relative overflow-hidden bg-gradient-to-br from-[#246BFD]/10 via-white to-[#FE9615]/8 dark:from-[#246BFD]/10 dark:via-gray-900 dark:to-[#FE9615]/5 py-16 sm:py-20">
      <!-- Decorative blobs -->
      <div class="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#246BFD]/8 blur-3xl dark:bg-[#246BFD]/5"></div>
      <div class="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#FE9615]/8 blur-3xl dark:bg-[#FE9615]/5"></div>

      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Heading -->
        <div class="mb-10 text-center scroll-animate slide-up">
          <h1 class="mb-3 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            Find Pharmacies Near You
          </h1>
          <p class="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Browse licensed pharmacies, compare medication prices, and get your prescriptions filled — all in one place.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="delay-200 scroll-animate slide-up max-w-2xl mx-auto">
          <SearchAutocomplete
            v-model="searchBarQuery"
            placeholder="Search pharmacies by name, location, or services..."
            search-type="pharmacies"
            @search="commitSearch"
          />
        </div>

        <!-- Feature highlights -->
        <div class="delay-300 scroll-animate slide-up mt-8 flex flex-wrap justify-center gap-3">
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4 text-[#246BFD] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span class="font-medium">Licensed &amp; verified</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4 text-[#246BFD] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
            <span class="font-medium">Compare prices</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4 text-[#246BFD] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span class="font-medium">Online prescriptions</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 shadow-sm text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4 text-[#246BFD] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
            <span class="font-medium">Home delivery</span>
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
              />
            </div>

            <!-- Services Filter -->
            <div class="mb-6">
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Services</h4>

              <!-- Skeleton while loading -->
              <div v-if="servicesLoading" class="space-y-2">
                <div
                  v-for="i in 6" :key="i"
                  class="h-7 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"
                  :style="{ width: `${60 + (i % 3) * 13}%` }"
                />
              </div>

              <!-- Grouped service rows -->
              <template v-else-if="serviceGroups.length > 0">
                <div
                  v-for="group in serviceGroups"
                  :key="group.category"
                  class="mb-4 last:mb-0"
                >
                  <!-- Category header (only when multiple groups exist) -->
                  <p
                    v-if="serviceGroups.length > 1"
                    class="mb-1.5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest"
                  >{{ group.label }}</p>

                  <div class="space-y-0.5">
                    <button
                      v-for="service in group.services"
                      :key="service.slug"
                      type="button"
                      @click="toggleService(service.slug)"
                      class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left transition-all duration-150 -mx-2"
                      :class="selectedServices.includes(service.slug)
                        ? 'bg-[#246BFD]/8 text-[#246BFD] dark:bg-[#246BFD]/15 dark:text-[#5089FF]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                    >
                      <!-- Checkbox indicator -->
                      <span class="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                        <span
                          v-if="selectedServices.includes(service.slug)"
                          class="w-4 h-4 rounded bg-[#246BFD] flex items-center justify-center"
                        >
                          <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span
                          v-else
                          class="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600"
                        />
                      </span>

                      <!-- Heroicon -->
                      <component
                        :is="resolveHeroicon(service.icon)"
                        v-if="resolveHeroicon(service.icon)"
                        class="w-3.5 h-3.5 flex-shrink-0 opacity-70"
                      />

                      <!-- Name -->
                      <span class="text-sm font-medium line-clamp-2 leading-snug">{{ service.name }}</span>
                    </button>
                  </div>
                </div>
              </template>

              <!-- No services could be loaded -->
              <p v-else class="text-xs text-gray-400 dark:text-gray-500 italic">No services available.</p>
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
                  {{ serviceNameBySlug[service] || service }}
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
            :message="searchQuery || selectedServices.length > 0 || isOpenNow ? 'No pharmacies match your current filters. Try adjusting or clearing your filters.' : 'No pharmacies are available yet. Check back soon as we onboard pharmacies to the platform.'"
            @action="clearAllFilters"
          />

          <!-- Pharmacy Grid -->
          <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <!-- Z4: Featured partner ad at top of grid -->
            <NativeCardAd
              v-if="pharmaInlineAd"
              :ad="pharmaInlineAd"
              zone="Z4-pharma-inline"
            />
            <PharmacyCard
              v-for="(pharmacy, index) in pharmacies"
              :key="pharmacy.id"
              :pharmacy="pharmacy"
              class="pharmacy-card-enter"
              :style="{ animationDelay: `${index * 60}ms` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Static page chrome (hero, sidebar) fades in via JS-triggered .visible */
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Pharmacy cards animate in via CSS keyframe the moment they enter the DOM.
   No JS timing dependency — they are always visible. */
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pharmacy-card-enter {
  animation: cardEnter 0.45s ease-out backwards;
}

/* Ensure cards are always visible after animation completes or if animation fails */
@media (prefers-reduced-motion: reduce) {
  .pharmacy-card-enter {
    animation: none;
    opacity: 1;
  }
}

.hover-lift {
  transition: transform 0.2s ease-out;
}
.hover-lift:hover {
  transform: translateY(-4px);
}
</style> 