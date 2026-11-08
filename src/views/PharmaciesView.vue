<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { usePullToRefresh } from '@/composables/useMobileGestures';
import { pharmacyService, type PharmacySearchParams } from '@/services/pharmacyService';
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

const pharmacies = ref<Pharmacy[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref<string | null>(null);

const searchQuery = ref('');
const searchBarQuery = ref('');
const selectedServices = ref<string[]>([]);
const sortBy = ref<string>('distance');
const isOpenNow = ref(false);

// ── Server-side pagination ──────────────────────────────────────────────────
const currentPage = ref(1);
const lastPage = ref(1);
const total = ref(0);
const hasMore = computed(() => currentPage.value < lastPage.value);

// ── User geolocation (for distance sort) ────────────────────────────────────
const userLat = ref<number | null>(null);
const userLng = ref<number | null>(null);

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


const fetchPharmacies = async (page: number, append = false) => {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
    error.value = null;
  }

  try {
    const { pharmacies: result, meta } = await pharmacyService.searchPharmacies({
      q: searchQuery.value.trim() || undefined,
      services: selectedServices.value.length > 0 ? selectedServices.value : undefined,
      isOpen: isOpenNow.value || undefined,
      sort: sortBy.value as PharmacySearchParams['sort'],
      lat: userLat.value ?? undefined,
      lng: userLng.value ?? undefined,
      page,
      per_page: 24,
    });

    pharmacies.value = append ? [...pharmacies.value, ...result] : result;
    dataCache.setPharmacies(pharmacies.value);

    currentPage.value = meta?.current_page ?? page;
    lastPage.value = meta?.last_page ?? currentPage.value;
    total.value = meta?.total ?? pharmacies.value.length;
  } catch (err) {
    error.value = 'Failed to load pharmacies. Please try again later.';
    console.error('[Pharmacies] Error loading pharmacies:', err);
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadPharmacies = () => fetchPharmacies(1, false);

const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return;
  fetchPharmacies(currentPage.value + 1, true);
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        userLat.value = pos.coords.latitude;
        userLng.value = pos.coords.longitude;
        if (sortBy.value === 'distance') loadPharmacies();
      },
      () => { /* distance sort degrades to default order without coords */ }
    );
  }

  // Load service catalog and pharmacies in parallel
  servicesLoading.value = true;
  pharmacyService.getServicesCatalog()
    .then(groups => { serviceGroups.value = groups; })
    .catch(() => { /* sidebar degrades gracefully */ })
    .finally(() => { servicesLoading.value = false; });

  await loadPharmacies();
});
</script>

<template>
  <div 
    class="relative pt-24 pb-16 min-h-screen isolate overflow-x-clip"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Same pastel canvas as the home page -->
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-accent-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"></div>
      <div class="absolute top-[4%] -right-72 h-[40rem] w-[40rem] rounded-full bg-brand-200/40 blur-[130px] dark:bg-brand-500/10"></div>
      <div class="absolute top-[38%] -left-72 h-[40rem] w-[40rem] rounded-full bg-accent-200/40 blur-[130px] dark:bg-transparent"></div>
      <div class="absolute top-[72%] -right-72 h-[40rem] w-[40rem] rounded-full bg-brand-200/35 blur-[130px] dark:bg-brand-500/8"></div>
    </div>

    <!-- Pull to Refresh Indicator -->
    <div 
      v-if="pullDistance > 0"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all"
      :style="{ transform: `translate(-50%, ${Math.min(pullDistance, 80)}px)` }"
    >
      <div class="p-3 bg-white rounded-full shadow-lg dark:bg-gray-800">
        <svg 
          class="w-6 h-6 text-brand-500 transition-transform"
          :class="{ 'animate-spin': isRefreshing }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
    </div>

    <!-- Heading + search -->
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8 text-center pharm-rise">
        <h1 class="mb-3 text-4xl font-medium text-gray-900 sm:text-5xl dark:text-white">
          Find <span class="text-brand-500 dark:text-brand-400">Pharmacies</span> Near You
        </h1>
        <p class="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl dark:text-gray-300">
          Browse licensed pharmacies, compare medication prices, and get your prescriptions filled — all in one place.
        </p>
      </div>

      <div class="relative z-30 mx-auto max-w-3xl pharm-rise" style="--d: 0.08s">
        <SearchAutocomplete
          v-model="searchBarQuery"
          placeholder="Search pharmacies by name, location, or services..."
          search-type="pharmacies"
          input-class="pr-12 bg-white/80 shadow-card backdrop-blur-md dark:bg-gray-800/70"
          @search="commitSearch"
        />
        <div class="flex justify-center mt-4">
          <div class="inline-flex gap-1 items-center p-1 rounded-full ring-1 backdrop-blur-md bg-white/70 ring-gray-200/80 dark:bg-white/5 dark:ring-white/10">
            <span class="inline-flex gap-1.5 items-center px-4 py-1.5 text-sm font-medium text-white rounded-full bg-brand-500 shadow-glow-brand" aria-current="page">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              List
            </span>
            <router-link
              to="/pharmacies/map"
              class="inline-flex gap-1.5 items-center px-4 py-1.5 text-sm font-medium text-gray-600 rounded-full transition duration-200 ease-out-quart dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              Map
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 pt-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col gap-8 lg:flex-row">
        <!-- Filters Sidebar -->
        <div class="flex-shrink-0 lg:w-64 pharm-rise" style="--d: 0.14s">
          <div class="sticky top-24 p-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="text-sm font-medium transition-colors text-brand-600 hover:text-brand-500 dark:text-brand-300 focus-visible:outline-none focus-visible:underline"
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
                  class="h-7 rounded-full bg-gray-200/70 dark:bg-white/10 animate-pulse"
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
                    class="mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >{{ group.label }}</p>

                  <div class="space-y-0.5">
                    <button
                      v-for="service in group.services"
                      :key="service.slug"
                      type="button"
                      @click="toggleService(service.slug)"
                      class="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-full text-left transition duration-200 ease-out-quart -mx-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                      :class="selectedServices.includes(service.slug)
                        ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-900/5 dark:hover:bg-white/5'"
                    >
                      <!-- Checkbox indicator -->
                      <span class="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                        <span
                          v-if="selectedServices.includes(service.slug)"
                          class="w-4 h-4 rounded bg-brand-500 flex items-center justify-center"
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
            <div v-if="hasActiveFilters" class="p-3 mt-6 rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/20">
              <p class="mb-2 text-xs font-semibold text-brand-700 dark:text-brand-300">Active Filters</p>
              <div class="flex flex-wrap gap-1">
                <span v-if="searchQuery" class="inline-flex items-center px-2 py-1 text-xs bg-white/80 dark:bg-white/10 rounded-full text-gray-700 dark:text-gray-300">
                  Search: "{{ searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery }}"
                </span>
                <span v-if="isOpenNow" class="inline-flex items-center px-2 py-1 text-xs bg-white/80 dark:bg-white/10 rounded-full text-gray-700 dark:text-gray-300">
                  Open Now
                </span>
                <span v-for="service in selectedServices" :key="service" class="inline-flex items-center px-2 py-1 text-xs bg-white/80 dark:bg-white/10 rounded-full text-gray-700 dark:text-gray-300">
                  {{ serviceNameBySlug[service] || service }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pharmacy List -->
        <div class="flex-1">
          <!-- Results Header -->
          <div v-if="!loading && !error" class="p-4 mb-6 rounded-2xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ total }} {{ total === 1 ? 'pharmacy' : 'pharmacies' }} found
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
              class="pharm-card"
              :style="{ '--i': index % 9 }"
            />
          </div>

          <!-- Load More -->
          <div v-if="!loading && !error && hasMore" class="flex justify-center mt-8">
            <button
              @click="loadMore"
              :disabled="loadingMore"
              class="px-8 py-3 text-sm font-medium text-gray-700 rounded-full border transition duration-200 bg-white/70 backdrop-blur border-gray-200 ease-out-quart dark:bg-white/5 dark:border-white/10 dark:text-gray-200 hover:border-brand-500 hover:text-brand-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >
              {{ loadingMore ? 'Loading…' : 'Load More Pharmacies' }}
            </button>
          </div>

          <!-- Pharmacy Partner CTA — the highest-intent spot for this: anyone
               scrolling this list to check if their own pharmacy is listed. -->
          <div class="relative px-6 py-10 mt-16 text-center rounded-3xl shadow-float overflow-hidden bg-gradient-to-br from-brand-500 to-brand-400 sm:px-12 sm:py-14">
            <div class="pointer-events-none absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
            <div class="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-accent-500/25 blur-2xl"></div>
            <div class="relative">
              <h2 class="mb-3 text-2xl font-semibold text-white sm:text-3xl">
                Don't see your pharmacy listed?
              </h2>
              <p class="mx-auto mb-8 max-w-xl text-brand-50">
                Join FyndRx and reach thousands of patients searching for medicines near them. Onboarding takes minutes.
              </p>
              <router-link
                to="/pharmacy/onboard"
                class="inline-flex gap-2 items-center px-8 py-3.5 font-semibold rounded-full shadow-lg transition duration-200 bg-white text-brand-600 ease-out-quart hover:bg-brand-50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              >
                Partner With FyndRx
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Entrance on the same easing as the home page. `backwards` so hover transforms still apply afterwards. */
.pharm-rise {
  animation: pharm-rise 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s) backwards;
}

.pharm-card {
  animation: pharm-rise 0.5s cubic-bezier(0.25, 1, 0.5, 1) calc(var(--i, 0) * 60ms) backwards;
}

@keyframes pharm-rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pharm-rise,
  .pharm-card {
    animation: none;
  }
}
</style>
