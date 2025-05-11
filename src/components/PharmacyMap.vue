<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Location } from '@/types/pharmacy';

const props = defineProps<{
  location: Location;
  pharmacyName: string;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const marker = ref<google.maps.Marker | null>(null);

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

onMounted(async () => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not set');
    return;
  }

  // Load Google Maps script
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  script.onload = initializeMap;
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
  <div ref="mapContainer" class="w-full h-full rounded-xl"></div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style> 