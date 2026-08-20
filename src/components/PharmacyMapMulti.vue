<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';
import { buildCardElement, createCardOverlayClass, type PharmacyCardPin } from '@/utils/pharmacyMapCard';
import type { PharmacyMapPin } from '@/models/Pharmacy';

const props = defineProps<{
  pins: PharmacyMapPin[];
  center?: { lat: number; lng: number };
}>();

const emit = defineEmits<{
  (e: 'bounds-changed', bounds: { north: number; south: number; east: number; west: number; zoom: number }): void;
}>();

const DEFAULT_CENTER = { lat: 5.6037, lng: -0.1870 }; // Accra

// The bundled ambient google.maps types (src/types/google*.d.ts) are a hand-rolled subset
// that doesn't cover everything the map needs (OverlayView, getBounds, ...), so map/overlay
// instances are kept loosely typed here rather than fighting the ambient types.
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any>(null);
const overlays = ref<any[]>([]);
const loading = ref(true);

const { loadGoogleMapsScript, error } = useGoogleMaps();

let CardOverlayClass: any = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function toCardPin(pin: PharmacyMapPin): PharmacyCardPin {
  return {
    id: pin.id,
    name: pin.name,
    subtitle: pin.type === 'branch' ? pin.pharmacyName : undefined,
    isOpen: pin.isOpen,
    deliveryAvailable: pin.deliveryAvailable,
    navigateHref: pin.type === 'hq' ? `/pharmacy/${pin.pharmacyId}` : `/pharmacy/${pin.pharmacyId}/branch/${pin.id}`,
  };
}

function emitBounds() {
  if (!map.value) return;
  const bounds = map.value.getBounds();
  if (!bounds) return;
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  emit('bounds-changed', {
    north: ne.lat(),
    south: sw.lat(),
    east: ne.lng(),
    west: sw.lng(),
    zoom: map.value.getZoom() ?? 12,
  });
}

function initializeMap() {
  if (!mapContainer.value) return;

  CardOverlayClass = createCardOverlayClass();

  map.value = new google.maps.Map(mapContainer.value, {
    center: props.center ?? DEFAULT_CENTER,
    zoom: 12,
    styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
  });

  // Debounced, but never suppressed — every settle (initial load, geolocation pan, or a
  // user drag/zoom) is a real viewport change and should load pins for it.
  (map.value as any).addListener('idle', () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(emitBounds, 400);
  });

  renderOverlays();
}

function clearOverlays() {
  overlays.value.forEach(o => o.setMap(null));
  overlays.value = [];
}

function renderOverlays() {
  if (!map.value || !CardOverlayClass) return;

  clearOverlays();

  overlays.value = props.pins
    .filter(pin => pin.location)
    .map(pin => {
      const element = buildCardElement(toCardPin(pin));
      const overlay = new CardOverlayClass({ lat: pin.location!.lat, lng: pin.location!.lng }, element);
      overlay.setMap(map.value);
      return overlay;
    });
}

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

onBeforeUnmount(() => {
  if (idleTimer) clearTimeout(idleTimer);
  clearOverlays();
});

watch(() => props.pins, renderOverlays, { deep: false });

watch(() => props.center, (center) => {
  if (!map.value || !center) return;
  map.value.panTo(center);
  map.value.setZoom(14);
});

defineExpose({ refreshBounds: emitBounds });

defineOptions({ name: 'PharmacyMapMulti' });
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
