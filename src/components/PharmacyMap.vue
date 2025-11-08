<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';
import type { PharmacyLocation } from '@/models/Pharmacy';

const props = defineProps<{
  location: PharmacyLocation;
  pharmacyName: string;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const marker = ref<google.maps.Marker | null>(null);
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

const initializeMap = () => {
  if (!mapContainer.value) return;

  const location: google.maps.LatLngLiteral = {
    lat: props.location.lat,
    lng: props.location.lng
  };

  map.value = new google.maps.Map(mapContainer.value, {
    center: location,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  marker.value = new google.maps.Marker({
    position: location,
    map: map.value,
    title: props.pharmacyName,
    animation: google.maps.Animation.DROP
  });

  const infoWindow = new google.maps.InfoWindow({
    content: `<div style="padding: 8px;">
      <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #246BFD;">${props.pharmacyName}</h3>
      <p style="margin: 0; font-size: 12px; color: #666;">Click for directions</p>
    </div>`
  });

  marker.value.addListener('click', () => {
    infoWindow.open(map.value!, marker.value!);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
  });
};

watch(() => props.location, (newLocation) => {
  if (!map.value || !marker.value) return;

  const position: google.maps.LatLngLiteral = {
    lat: newLocation.lat,
    lng: newLocation.lng
  };

  map.value.setCenter(position);
  marker.value.setPosition(position);
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
 