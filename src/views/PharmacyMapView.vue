<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { pharmacyService } from '@/services/pharmacyService';
import type { PharmacyMapPin, PharmacyServiceGroup } from '@/models/Pharmacy';
import PharmacyMapMulti from '@/components/PharmacyMapMulti.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import PharmacyMapList from '@/components/PharmacyMapList.vue';
import MapControls from '@/components/MapControls.vue';
import { useNotification } from '@/composables/useNotification';
import Dropdown from '@/components/Dropdown.vue';

useSeoMeta({
  title: 'Pharmacy Map | FyndRx',
  description: 'Find pharmacies near you on the map. See open/closed status, delivery availability, and contact details at a glance.',
  keywords: 'pharmacy map, pharmacy locator, pharmacies near me, FyndRx map',
  ogType: 'website',
});

const notification = useNotification();
const mapRef = ref<InstanceType<typeof PharmacyMapMulti> | null>(null);
const activeId = ref<string | null>(null);
const sheetOpen = ref(false); // phones: the results panel is a bottom sheet
const locating = ref(false);

const pins = ref<PharmacyMapPin[]>([]);
const loading = ref(true);
const firstLoad = ref(true);
const error = ref<string | null>(null);
const truncated = ref(false);
const userCenter = ref<{ lat: number; lng: number } | undefined>(undefined);

const searchQuery = ref('');
const isOpenNow = ref(false);
const deliveryOnly = ref(false);
const selectedServices = ref<string[]>([]);
const serviceGroups = ref<PharmacyServiceGroup[]>([]);
const servicesOpen = ref(false);

const serviceOptions = () => serviceGroups.value.flatMap(g => g.services).map(s => ({ label: s.name, value: s.slug }));

function serviceLabel(slug: string): string {
  return serviceGroups.value.flatMap(g => g.services).find(s => s.slug === slug)?.name ?? slug;
}

function removeService(slug: string) {
  selectedServices.value = selectedServices.value.filter(s => s !== slug);
  reloadCurrentView();
}

let lastBounds: { north: number; south: number; east: number; west: number } | null = null;

async function loadPins(bounds: { north: number; south: number; east: number; west: number }) {
  lastBounds = bounds;
  loading.value = true;
  error.value = null;

  try {
    const result = await pharmacyService.getMapPins(bounds, {
      q: searchQuery.value.trim() || undefined,
      services: selectedServices.value.length > 0 ? selectedServices.value : undefined,
      delivery: deliveryOnly.value || undefined,
      isOpen: isOpenNow.value || undefined,
    });
    pins.value = result.pins;
    truncated.value = result.truncated;
  } catch (err: any) {
    error.value = err?.message || 'Failed to load pharmacy locations';
  } finally {
    loading.value = false;
    firstLoad.value = false;
  }
}

function onBoundsChanged(bounds: { north: number; south: number; east: number; west: number; zoom: number }) {
  loadPins(bounds);
}

function reloadCurrentView() {
  if (lastBounds) loadPins(lastBounds);
}

function clearFilters() {
  searchQuery.value = '';
  isOpenNow.value = false;
  deliveryOnly.value = false;
  selectedServices.value = [];
  reloadCurrentView();
}

const activeFilterCount = () =>
  (isOpenNow.value ? 1 : 0) + (deliveryOnly.value ? 1 : 0) + selectedServices.value.length;

function toggleOpenNow() {
  isOpenNow.value = !isOpenNow.value;
  reloadCurrentView();
}

function toggleDelivery() {
  deliveryOnly.value = !deliveryOnly.value;
  reloadCurrentView();
}

function selectFromList(id: string) {
  mapRef.value?.focusPin(id);
  sheetOpen.value = false; // reveal the map and the popup it just opened
}

/** Ask for the user's position again (the first request runs on mount) and recentre on it. */
function locateMe() {
  if (!navigator.geolocation) {
    notification.warning('Location unavailable', 'Your browser does not support location.');
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    pos => {
      userCenter.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locating.value = false;
    },
    () => {
      locating.value = false;
      notification.warning('Location unavailable', 'Allow location access to see pharmacies near you.');
    },
    { timeout: 8000 },
  );
}

onMounted(() => {
  pharmacyService.getServicesCatalog()
    .then(groups => { serviceGroups.value = groups; })
    .catch(() => { /* filter sidebar degrades gracefully */ });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { userCenter.value = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      () => { /* map falls back to its default Accra-wide view */ }
    );
  }
});

// Filter chip styling shared by the quick filters
const chip =
  'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full border transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30';
const chipOn = 'bg-brand-500 border-transparent text-white shadow-glow-brand';
const chipOff =
  'bg-white/80 border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-200 dark:hover:text-brand-300';
</script>

<script lang="ts">
export default { name: 'PharmacyMapView' };
</script>

<template>
  <div class="flex overflow-hidden relative flex-col pt-24 pb-4 isolate h-[100dvh]">
    <!-- Same pastel canvas as the rest of the site, visible around the framed map -->
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-accent-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"></div>
      <div class="absolute top-[4%] -right-72 h-[36rem] w-[36rem] rounded-full bg-brand-200/40 blur-[130px] dark:bg-brand-500/10"></div>
      <div class="absolute bottom-0 -left-72 h-[36rem] w-[36rem] rounded-full bg-accent-200/40 blur-[130px] dark:bg-transparent"></div>
    </div>

    <div class="relative flex-1 px-3 mx-auto w-full min-h-0 sm:px-6 lg:px-8 max-w-[1600px] lg:flex lg:gap-4">
      <!-- Results panel: a sidebar on desktop, a bottom sheet on phones -->
      <aside
        class="flex z-40 flex-col rounded-3xl ring-1 backdrop-blur-xl shadow-float bg-white/85 ring-white/70 dark:bg-gray-800/80 dark:ring-white/10 max-lg:absolute max-lg:inset-x-3 max-lg:bottom-[4.5rem] sm:max-lg:inset-x-6 lg:relative lg:h-full lg:w-[400px] lg:shrink-0 lg:shadow-card map-rise"
        aria-label="Pharmacy search and results"
      >
        <!-- Title, count, view switch -->
        <div class="flex gap-3 justify-between items-center px-4 pt-4 pb-3">
          <button
            type="button"
            class="min-w-0 text-left rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 lg:pointer-events-none"
            :aria-expanded="sheetOpen"
            aria-controls="map-results"
            @click="sheetOpen = !sheetOpen"
          >
            <h1 class="text-lg font-semibold leading-tight text-gray-900 dark:text-white">Pharmacy map</h1>
            <p class="flex gap-1.5 items-center text-sm text-gray-500 dark:text-gray-400">
              <template v-if="firstLoad">Locating pharmacies…</template>
              <template v-else>{{ pins.length }}{{ truncated ? '+' : '' }} {{ pins.length === 1 ? 'pharmacy' : 'pharmacies' }} in view</template>
              <svg
                class="w-4 h-4 transition-transform duration-200 lg:hidden"
                :class="sheetOpen ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"
              ><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>
            </p>
          </button>

          <div class="inline-flex gap-0.5 items-center p-1 rounded-full ring-1 shrink-0 bg-white/70 ring-gray-200/80 dark:bg-white/5 dark:ring-white/10">
            <router-link
              to="/pharmacies"
              class="inline-flex gap-1.5 items-center px-3 py-1 text-sm font-medium text-gray-600 rounded-full transition duration-200 dark:text-gray-300 ease-out-quart hover:text-brand-600 dark:hover:text-brand-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              List
            </router-link>
            <span class="inline-flex gap-1.5 items-center px-3 py-1 text-sm font-medium text-white rounded-full bg-brand-500 shadow-glow-brand" aria-current="page">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              Map
            </span>
          </div>
        </div>

        <!-- Search -->
        <div class="px-4">
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search by name or address…"
              aria-label="Search pharmacies"
              class="py-2.5 pr-4 pl-10 w-full text-sm text-gray-900 bg-white rounded-full border border-gray-200 placeholder-gray-400 dark:text-white dark:bg-gray-900/60 dark:border-white/10 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
              @keyup.enter="reloadCurrentView"
            />
          </div>
        </div>

        <!-- Quick filters -->
        <div class="flex overflow-x-auto gap-2 px-4 pt-3 pb-1 no-scrollbar" role="group" aria-label="Filters">
          <button
            type="button"
            :aria-pressed="isOpenNow"
            :class="[chip, isOpenNow ? chipOn : chipOff]"
            @click="toggleOpenNow"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="isOpenNow ? 'bg-white' : 'bg-emerald-500'"></span>
            Open now
          </button>
          <button
            type="button"
            :aria-pressed="deliveryOnly"
            :class="[chip, deliveryOnly ? chipOn : chipOff]"
            @click="toggleDelivery"
          >
            Delivers
          </button>
          <button
            type="button"
            :aria-expanded="servicesOpen"
            :class="[chip, selectedServices.length > 0 ? chipOn : chipOff]"
            @click="servicesOpen = !servicesOpen"
          >
            Services
            <span v-if="selectedServices.length > 0" class="px-1.5 text-xs font-semibold rounded-full bg-white/25">{{ selectedServices.length }}</span>
            <svg class="w-3.5 h-3.5 transition-transform duration-200" :class="servicesOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            v-if="activeFilterCount() > 0 || searchQuery"
            type="button"
            class="px-3 py-2 text-sm font-medium text-gray-500 whitespace-nowrap rounded-full hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>

        <!-- Services picker -->
        <div v-if="servicesOpen" class="px-4 pt-3 space-y-3">
          <Dropdown
            v-model="selectedServices"
            :options="serviceOptions()"
            label="Services"
            placeholder="Any service"
            multiple
            @change="reloadCurrentView"
          />
          <div v-if="selectedServices.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="slug in selectedServices"
              :key="slug"
              class="inline-flex gap-1 items-center py-1 pr-1 pl-2.5 text-xs font-medium rounded-full text-brand-700 bg-brand-500/10 dark:text-brand-300"
            >
              {{ serviceLabel(slug) }}
              <button
                type="button"
                class="p-0.5 rounded-full hover:bg-brand-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                :aria-label="`Remove ${serviceLabel(slug)}`"
                @click="removeService(slug)"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </span>
          </div>
        </div>

        <!-- Results (always on desktop; expands on phones) -->
        <div
          id="map-results"
          class="overflow-y-auto flex-1 mt-3 min-h-0 border-t border-gray-200/70 dark:border-white/10 max-lg:max-h-[38dvh]"
          :class="sheetOpen ? '' : 'max-lg:hidden'"
        >
          <div v-if="firstLoad" class="p-4 space-y-3" aria-hidden="true">
            <div v-for="i in 5" :key="i" class="flex gap-3 items-center animate-pulse">
              <div class="w-12 h-12 bg-gray-200 rounded-xl dark:bg-white/10"></div>
              <div class="flex-1 space-y-2">
                <div class="w-2/3 h-3.5 bg-gray-200 rounded dark:bg-white/10"></div>
                <div class="w-1/3 h-3 bg-gray-200 rounded dark:bg-white/10"></div>
              </div>
            </div>
          </div>
          <PharmacyMapList
            v-else-if="pins.length > 0"
            :pins="pins"
            :active-id="activeId"
            @select="selectFromList"
            @hover="mapRef?.highlightPin($event)"
          />
          <p v-else-if="!loading" class="p-6 text-sm text-center text-gray-500 dark:text-gray-400">
            No pharmacies in this part of the map.
          </p>
        </div>
      </aside>

      <!-- Map -->
      <div class="overflow-hidden relative rounded-3xl ring-1 shadow-card h-full ring-white/70 dark:ring-white/10 lg:flex-1 map-rise" style="--d: 0.08s">
        <PharmacyMapMulti
          ref="mapRef"
          :pins="pins"
          :center="userCenter"
          class="absolute inset-0"
          @bounds-changed="onBoundsChanged"
          @select="activeId = $event"
        />

        <!-- Status chips -->
        <div class="flex absolute top-3 right-16 left-3 z-20 flex-col gap-2 items-start pointer-events-none">
          <div
            v-if="loading && !firstLoad"
            class="inline-flex gap-2 items-center px-3 py-1.5 text-xs font-semibold text-gray-600 rounded-full ring-1 backdrop-blur-md shadow-card bg-white/90 ring-black/5 dark:bg-gray-800/90 dark:text-gray-300 dark:ring-white/10"
            role="status"
          >
            <span class="w-3 h-3 rounded-full border-2 animate-spin border-brand-500 border-t-transparent"></span>
            Searching this area…
          </div>
          <div
            v-if="truncated"
            class="inline-flex gap-2 items-center px-3 py-1.5 text-xs font-semibold text-gray-700 rounded-full ring-1 backdrop-blur-md shadow-card bg-white/90 ring-black/5 dark:bg-gray-800/90 dark:text-gray-200 dark:ring-white/10"
          >
            <span class="w-2 h-2 rounded-full bg-accent-500"></span>
            Showing top-rated here — zoom in to see more
          </div>
        </div>

        <MapControls
          class="absolute top-3 right-3 z-20"
          show-locate
          :locating="locating"
          @zoom-in="mapRef?.zoomIn()"
          @zoom-out="mapRef?.zoomOut()"
          @locate="locateMe"
        />

        <!-- Error / empty overlays -->
        <div v-if="error" class="flex absolute inset-0 z-30 justify-center items-center backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
          <ErrorState type="network" :message="error" @retry="reloadCurrentView" />
        </div>
        <div v-else-if="!loading && !firstLoad && pins.length === 0" class="flex absolute inset-0 z-30 justify-center items-center backdrop-blur-sm pointer-events-none bg-white/60 dark:bg-gray-900/60">
          <div class="pointer-events-auto">
            <EmptyState
              type="search"
              message="No pharmacies found in this area. Try zooming out or adjusting your filters."
              @action="clearFilters"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Entrance on the same easing as the rest of the site; `backwards` so later transforms still apply */
.map-rise {
  animation: map-rise 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s) backwards;
}

@keyframes map-rise {
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
  .map-rise {
    animation: none;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
