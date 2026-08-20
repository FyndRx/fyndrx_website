<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';
import { buildCardElement, createCardOverlayClass } from '@/utils/pharmacyMapCard';
import type { PharmacyLocation } from '@/models/Pharmacy';

const props = withDefaults(defineProps<{
  location: PharmacyLocation;
  pharmacyName: string;
  isOpen?: boolean;
  deliveryAvailable?: boolean;
}>(), {
  isOpen: true,
  deliveryAvailable: false,
});

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any>(null);
const overlay = ref<any>(null);
const loading = ref(true);

const { loadGoogleMapsScript, error } = useGoogleMaps();

onMounted(async () => {
  try {
    await loadGoogleMapsScript();
    initializeMap();
  } catch (err) {
    console.error('Failed to load Google Maps:', err);
  } finally {
    loading.value = false;
  }
});

function directionsUrl(location: PharmacyLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}

function initializeMap() {
  if (!mapContainer.value) return;

  const CardOverlayClass = createCardOverlayClass();

  map.value = new google.maps.Map(mapContainer.value, {
    center: props.location,
    zoom: 15,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  const element = buildCardElement({
    id: 'single',
    name: props.pharmacyName,
    isOpen: props.isOpen,
    deliveryAvailable: props.deliveryAvailable,
    externalHref: directionsUrl(props.location),
  });
  overlay.value = new CardOverlayClass(props.location, element);
  overlay.value.setMap(map.value);
}

watch(() => props.location, (newLocation) => {
  if (!map.value || !overlay.value) return;
  map.value.setCenter(newLocation);
  overlay.value.setMap(null);

  const CardOverlayClass = createCardOverlayClass();
  const element = buildCardElement({
    id: 'single',
    name: props.pharmacyName,
    isOpen: props.isOpen,
    deliveryAvailable: props.deliveryAvailable,
    externalHref: directionsUrl(newLocation),
  });
  overlay.value = new CardOverlayClass(newLocation, element);
  overlay.value.setMap(map.value);
});

defineOptions({
  name: 'PharmacyMap'
});
</script>

<template>
  <div class="relative w-full h-full">
    <div v-if="loading" class="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-700 rounded-xl">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#246BFD] mx-auto mb-2"></div>
        <p class="text-xs text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
    <div v-else-if="error" class="flex items-center justify-center w-full h-full bg-red-50 dark:bg-red-900/20 rounded-xl">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
    <div ref="mapContainer" class="w-full h-full rounded-xl"></div>
  </div>
</template>

<style scoped>
</style>
