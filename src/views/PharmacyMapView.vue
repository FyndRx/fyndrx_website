<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { pharmacyService } from '@/services/pharmacyService';
import type { PharmacyMapPin, PharmacyServiceGroup } from '@/models/Pharmacy';
import PharmacyMapMulti from '@/components/PharmacyMapMulti.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';
import Dropdown from '@/components/Dropdown.vue';

useSeoMeta({
  title: 'Pharmacy Map | FyndRx',
  description: 'Find pharmacies near you on the map. See open/closed status, delivery availability, and contact details at a glance.',
  keywords: 'pharmacy map, pharmacy locator, pharmacies near me, FyndRx map',
  ogType: 'website',
});

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
const filtersOpen = ref(false);

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
</script>

<script lang="ts">
export default { name: 'PharmacyMapView' };
</script>

<template>
  <div class="pt-20 h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <div class="relative flex-1 min-h-0">
      <PharmacyMapMulti :pins="pins" :center="userCenter" class="absolute inset-0" @bounds-changed="onBoundsChanged" />

      <!-- Floating search + filter panel -->
      <div class="absolute top-4 left-4 right-4 sm:right-auto sm:w-[380px] z-40 space-y-2">
        <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
          <div class="flex items-center justify-between px-4 pt-3.5 pb-2">
            <div>
              <h1 class="text-base font-bold text-gray-900 dark:text-white leading-tight">Pharmacy Map</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span v-if="!firstLoad">{{ pins.length }}{{ truncated ? '+' : '' }} shown here</span>
                <span v-else>Locating pharmacies…</span>
              </p>
            </div>
            <router-link
              to="/pharmacies"
              class="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              List
            </router-link>
          </div>

          <div class="px-4 pb-3 flex items-center gap-2">
            <div class="relative flex-1">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name or address..."
                class="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD]"
                @keyup.enter="reloadCurrentView"
              />
            </div>
            <button
              class="relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors"
              title="Filters"
              @click="filtersOpen = !filtersOpen"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 9h12M9 14h6M11 19h2"/></svg>
              <span
                v-if="activeFilterCount() > 0"
                class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#246BFD] text-white text-[9px] font-bold flex items-center justify-center"
              >{{ activeFilterCount() }}</span>
            </button>
          </div>

          <!-- Expandable filters -->
          <div v-if="filtersOpen" class="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
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
                class="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-[11px] font-medium text-[#246BFD] bg-[#246BFD]/10 border border-[#246BFD]/20 rounded-md"
              >
                {{ serviceLabel(slug) }}
                <button
                  class="p-0.5 rounded-full hover:bg-[#246BFD]/20 hover:text-[#1a56d6]"
                  title="Remove"
                  @click="removeService(slug)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </span>
            </div>
            <div class="flex items-center gap-4">
              <CustomCheckbox v-model="isOpenNow" label="Open Now" variant="switch" size="medium" color="success" @change="reloadCurrentView" />
              <CustomCheckbox v-model="deliveryOnly" label="Delivers" variant="switch" size="medium" color="primary" @change="reloadCurrentView" />
            </div>
            <button
              v-if="activeFilterCount() > 0 || searchQuery"
              class="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              @click="clearFilters"
            >
              Clear all filters
            </button>
          </div>
        </div>

        <!-- Fetching indicator -->
        <div
          v-if="loading && !firstLoad"
          class="inline-flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg ring-1 ring-black/5 dark:ring-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300"
        >
          <span class="w-3 h-3 rounded-full border-2 border-[#246BFD] border-t-transparent animate-spin"></span>
          Searching this area…
        </div>
      </div>

      <!-- Zoom-in hint when results are capped -->
      <div
        v-if="truncated"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
      >
        Showing top-rated pharmacies here — zoom in to see more
      </div>

      <!-- Error / empty overlays -->
      <div v-if="error" class="absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
        <ErrorState type="network" :message="error" @retry="reloadCurrentView" />
      </div>
      <div v-else-if="!loading && !firstLoad && pins.length === 0" class="absolute inset-0 z-30 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm pointer-events-none">
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
</template>
