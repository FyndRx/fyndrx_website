<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';
import { useDarkMode } from '@/composables/useDarkMode';
import { brandMapStyles } from '@/utils/mapBrand';
import {
  createHtmlOverlayClass,
  buildPinElement,
  buildPopupElement,
  panPopupIntoView,
} from '@/utils/mapOverlays';
import MapControls from '@/components/MapControls.vue';
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
const loading = ref(true);

const { loadGoogleMapsScript, error } = useGoogleMaps();
const { isDark } = useDarkMode();

let HtmlOverlay: any = null;
let pinOverlay: any = null;
let popupOverlay: any = null;
let popupOpen = true;

const directionsUrl = (l: PharmacyLocation) =>
  `https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`;

function clearOverlays() {
  pinOverlay?.dispose();
  popupOverlay?.dispose();
  pinOverlay = popupOverlay = null;
}

function closePopup() {
  popupOverlay?.dispose();
  popupOverlay = null;
  popupOpen = false;
}

function openPopup() {
  if (!map.value || !HtmlOverlay) return;
  popupOverlay?.dispose();

  const popup = buildPopupElement(
    {
      id: 'single',
      name: props.pharmacyName,
      isOpen: props.isOpen,
      deliveryAvailable: props.deliveryAvailable,
      directionsHref: directionsUrl(props.location),
    },
    closePopup,
  );
  popupOverlay = new HtmlOverlay(props.location, popup.el, 'floatPane');
  popupOverlay.setMap(map.value);
  popup.animateIn();
  popupOpen = true;
  if (mapContainer.value) panPopupIntoView(map.value, popup.el, mapContainer.value);
}

/** The pharmacy pin, plus its popup (open by default so the name/status are visible at a glance). */
function renderMarker() {
  if (!map.value || !HtmlOverlay) return;
  clearOverlays();

  const pin = buildPinElement({
    label: props.pharmacyName,
    open: props.isOpen,
    zIndex: 1,
    onSelect: openPopup,
  });
  pinOverlay = new HtmlOverlay(props.location, pin.el);
  pinOverlay.setMap(map.value);

  if (popupOpen) openPopup();
}

/** A popup needs ~240px above the pin; in a shorter embedded map it would cover the whole thing. */
const hasRoomForPopup = () => (mapContainer.value?.clientHeight ?? 0) >= 380;

function initializeMap() {
  if (!mapContainer.value) return;

  HtmlOverlay = createHtmlOverlayClass();

  map.value = new (google.maps as any).Map(mapContainer.value, {
    center: props.location,
    zoom: 15,
    disableDefaultUI: true,
    clickableIcons: false,
    gestureHandling: 'cooperative', // an embedded map shouldn't hijack page scroll
    backgroundColor: isDark.value ? '#0f1a2e' : '#eef3fb',
    styles: brandMapStyles(isDark.value),
  });
  map.value.addListener('click', closePopup);

  popupOpen = hasRoomForPopup();
  renderMarker();
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

onBeforeUnmount(clearOverlays);

watch(() => props.location, (location) => {
  if (!map.value) return;
  map.value.setCenter(location);
  popupOpen = hasRoomForPopup();
  renderMarker();
});

watch(() => [props.pharmacyName, props.isOpen, props.deliveryAvailable], renderMarker);

watch(isDark, (dark) => {
  map.value?.setOptions({ styles: brandMapStyles(dark), backgroundColor: dark ? '#0f1a2e' : '#eef3fb' });
});

defineOptions({
  name: 'PharmacyMap'
});
</script>

<template>
  <div class="relative w-full h-full overflow-hidden rounded-2xl bg-brand-50 dark:bg-gray-900">
    <div ref="mapContainer" class="w-full h-full"></div>

    <MapControls
      v-if="!loading && !error"
      class="absolute right-3 bottom-3"
      @zoom-in="map?.setZoom((map.getZoom() ?? 15) + 1)"
      @zoom-out="map?.setZoom((map.getZoom() ?? 15) - 1)"
    />

    <div v-if="loading" class="flex absolute inset-0 justify-center items-center bg-brand-50 dark:bg-gray-900">
      <div class="text-center">
        <div class="mx-auto mb-2 w-8 h-8 rounded-full border-2 animate-spin border-brand-500 border-t-transparent"></div>
        <p class="text-xs text-gray-600 dark:text-gray-400">Loading map…</p>
      </div>
    </div>
    <div v-else-if="error" class="flex absolute inset-0 justify-center items-center p-4 text-center bg-red-50 dark:bg-red-900/20">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
  </div>
</template>
