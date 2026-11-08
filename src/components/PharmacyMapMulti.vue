<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';
import { useDarkMode } from '@/composables/useDarkMode';
import { brandMapStyles } from '@/utils/mapBrand';
import {
  createHtmlOverlayClass,
  buildPinElement,
  buildClusterElement,
  buildUserDotElement,
  buildPopupElement,
  panPopupIntoView,
  type PinElement,
  type PharmacyPopupData,
} from '@/utils/mapOverlays';
import type { PharmacyMapPin } from '@/models/Pharmacy';

const props = defineProps<{
  pins: PharmacyMapPin[];
  center?: { lat: number; lng: number };
}>();

const emit = defineEmits<{
  (e: 'bounds-changed', bounds: { north: number; south: number; east: number; west: number; zoom: number }): void;
  /** The pin whose popup is open, or null when it closes. */
  (e: 'select', id: string | null): void;
}>();

const DEFAULT_CENTER = { lat: 5.6037, lng: -0.1870 }; // Accra
/** Below this zoom, nearby pins collapse into count bubbles. */
const CLUSTER_BELOW_ZOOM = 15;
const CLUSTER_PIXELS = 56;

// The bundled ambient google.maps types (src/types/google*.d.ts) are a hand-rolled subset
// that doesn't cover everything the map needs (OverlayView, getBounds, ...), so map/overlay
// instances are kept loosely typed here rather than fighting the ambient types.
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any>(null);
const loading = ref(true);

const { loadGoogleMapsScript, error } = useGoogleMaps();
const { isDark } = useDarkMode();

let HtmlOverlay: any = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

let overlays: any[] = [];
let userOverlay: any = null;
let popupOverlay: any = null;
const pinEls = new Map<string, PinElement>();
let activeId: string | null = null;
let hoverId: string | null = null;

// ── Pins, clusters, popup ────────────────────────────────────────────────────

function popupData(pin: PharmacyMapPin): PharmacyPopupData {
  return {
    id: pin.id,
    name: pin.name,
    subtitle: pin.type === 'branch' ? pin.pharmacyName : undefined,
    logo: pin.logo,
    rating: pin.rating,
    isOpen: pin.isOpen,
    deliveryAvailable: pin.deliveryAvailable,
    phone: pin.phone,
    viewHref: pin.type === 'hq' ? `/pharmacy/${pin.pharmacyId}` : `/pharmacy/${pin.pharmacyId}/branch/${pin.id}`,
    directionsHref: pin.location
      ? `https://www.google.com/maps/dir/?api=1&destination=${pin.location.lat},${pin.location.lng}`
      : undefined,
  };
}

function closePopup() {
  if (popupOverlay) {
    popupOverlay.dispose();
    popupOverlay = null;
  }
  if (activeId) {
    const was = activeId;
    activeId = null;
    pinEls.get(was)?.setActive(hoverId === was);
    emit('select', null);
  }
}

function openPopup(pin: PharmacyMapPin, nudgeIntoView = true) {
  if (!map.value || !HtmlOverlay || !pin.location) return;
  // Swap without emitting a spurious "closed" in between
  if (popupOverlay) {
    popupOverlay.dispose();
    popupOverlay = null;
    if (activeId) pinEls.get(activeId)?.setActive(hoverId === activeId);
  }

  const popup = buildPopupElement(popupData(pin), closePopup);
  popupOverlay = new HtmlOverlay({ lat: pin.location.lat, lng: pin.location.lng }, popup.el, 'floatPane');
  popupOverlay.setMap(map.value);
  popup.animateIn();
  if (nudgeIntoView && mapContainer.value) panPopupIntoView(map.value, popup.el, mapContainer.value);

  activeId = pin.id;
  pinEls.get(pin.id)?.setActive(true);
  emit('select', pin.id);
}

interface Group { pins: PharmacyMapPin[]; lat: number; lng: number }

/** Grid clustering sized in screen pixels, so bubbles stay a consistent size at any zoom. */
function groupPins(pins: PharmacyMapPin[], zoom: number): Group[] {
  if (zoom >= CLUSTER_BELOW_ZOOM) {
    return pins.map(p => ({ pins: [p], lat: p.location!.lat, lng: p.location!.lng }));
  }
  const cell = (360 / Math.pow(2, zoom)) * (CLUSTER_PIXELS / 256);
  const cells = new Map<string, PharmacyMapPin[]>();
  for (const pin of pins) {
    const key = `${Math.floor(pin.location!.lat / cell)}:${Math.floor(pin.location!.lng / cell)}`;
    (cells.get(key) ?? cells.set(key, []).get(key)!).push(pin);
  }
  const groups: Group[] = [...cells.values()].map(group => ({
    pins: group,
    lat: group.reduce((s, p) => s + p.location!.lat, 0) / group.length,
    lng: group.reduce((s, p) => s + p.location!.lng, 0) / group.length,
  }));

  // Neighbouring cells can still leave two bubbles overlapping; merge anything closer than one bubble.
  const reach = cell * 0.9;
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (Math.abs(groups[i].lat - groups[j].lat) < reach && Math.abs(groups[i].lng - groups[j].lng) < reach) {
          const all = [...groups[i].pins, ...groups[j].pins];
          groups[i] = {
            pins: all,
            lat: all.reduce((s, p) => s + p.location!.lat, 0) / all.length,
            lng: all.reduce((s, p) => s + p.location!.lng, 0) / all.length,
          };
          groups.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  return groups;
}

function zoomIntoGroup(group: Group) {
  const maps = (window as any).google.maps;
  const bounds = new maps.LatLngBounds();
  group.pins.forEach(p => bounds.extend({ lat: p.location!.lat, lng: p.location!.lng }));
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
    map.value.panTo({ lat: group.lat, lng: group.lng });
    map.value.setZoom(Math.max(map.value.getZoom() + 3, CLUSTER_BELOW_ZOOM + 1));
  } else {
    map.value.fitBounds(bounds, 72);
  }
}

function clearOverlays() {
  overlays.forEach(o => o.dispose());
  overlays = [];
  pinEls.clear();
}

function renderOverlays() {
  if (!map.value || !HtmlOverlay) return;
  clearOverlays();

  const zoom = map.value.getZoom() ?? 12;
  const located = props.pins.filter(p => p.location);

  // The open pin is never swallowed by a cluster
  const active = activeId ? located.find(p => p.id === activeId) : undefined;
  const groups = groupPins(located.filter(p => p !== active), zoom);
  if (active) groups.push({ pins: [active], lat: active.location!.lat, lng: active.location!.lng });

  for (const group of groups) {
    let overlay: any;
    if (group.pins.length > 1) {
      overlay = new HtmlOverlay({ lat: group.lat, lng: group.lng }, buildClusterElement(group.pins.length, () => zoomIntoGroup(group)));
    } else {
      const pin = group.pins[0];
      const pinEl = buildPinElement({
        label: pin.name,
        open: pin.isOpen,
        // Southern pins in front of northern ones, like real objects on a map
        zIndex: Math.round((90 - pin.location!.lat) * 1000),
        onSelect: () => openPopup(pin),
      });
      pinEls.set(pin.id, pinEl);
      overlay = new HtmlOverlay({ lat: pin.location!.lat, lng: pin.location!.lng }, pinEl.el);
    }
    overlay.setMap(map.value);
    overlays.push(overlay);
  }

  // Re-apply highlight state to the fresh elements
  if (activeId) pinEls.get(activeId)?.setActive(true);
  if (hoverId) pinEls.get(hoverId)?.setActive(true);
}

function renderUser() {
  if (!map.value || !HtmlOverlay) return;
  if (!props.center) {
    userOverlay?.dispose();
    userOverlay = null;
    return;
  }
  if (userOverlay) {
    userOverlay.setPosition(props.center);
  } else {
    userOverlay = new HtmlOverlay(props.center, buildUserDotElement(), 'overlayLayer');
    userOverlay.setMap(map.value);
  }
}

// ── Map lifecycle ────────────────────────────────────────────────────────────

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

  HtmlOverlay = createHtmlOverlayClass();

  map.value = new (google.maps as any).Map(mapContainer.value, {
    center: props.center ?? DEFAULT_CENTER,
    zoom: props.center ? 14 : 12,
    minZoom: 6,
    // Our own branded controls (MapControls) replace Google's
    disableDefaultUI: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
    backgroundColor: isDark.value ? '#0f1a2e' : '#eef3fb',
    styles: brandMapStyles(isDark.value),
  });

  // Debounced, but never suppressed — every settle (initial load, geolocation pan, or a
  // user drag/zoom) is a real viewport change and should load pins for it.
  map.value.addListener('idle', () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(emitBounds, 400);
  });
  map.value.addListener('zoom_changed', renderOverlays);
  map.value.addListener('click', closePopup);

  renderOverlays();
  renderUser();
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
  popupOverlay?.dispose();
  userOverlay?.dispose();
});

watch(() => props.pins, renderOverlays, { deep: false });

watch(() => props.center, (center) => {
  renderUser();
  if (!map.value || !center) return;
  map.value.panTo(center);
  map.value.setZoom(14);
});

watch(isDark, (dark) => {
  map.value?.setOptions({ styles: brandMapStyles(dark), backgroundColor: dark ? '#0f1a2e' : '#eef3fb' });
});

// ── API for the page ─────────────────────────────────────────────────────────

/** Pan to a pin and open its popup (used when a result is picked from the list). */
function focusPin(id: string) {
  const pin = props.pins.find(p => p.id === id);
  if (!map.value || !pin?.location) return;
  map.value.panTo({ lat: pin.location.lat, lng: pin.location.lng });
  if ((map.value.getZoom() ?? 0) < CLUSTER_BELOW_ZOOM) map.value.setZoom(CLUSTER_BELOW_ZOOM);
  openPopup(pin, false); // the map is centring on the pin, so no edge-nudge needed
  renderOverlays(); // gives the now-active pin its own marker even while the map is still zooming
}

/** Emphasise a pin without opening it (hovering a result in the list). */
function highlightPin(id: string | null) {
  if (hoverId && hoverId !== activeId) pinEls.get(hoverId)?.setActive(false);
  hoverId = id;
  if (id) pinEls.get(id)?.setActive(true);
}

const zoomIn = () => map.value?.setZoom((map.value.getZoom() ?? 12) + 1);
const zoomOut = () => map.value?.setZoom((map.value.getZoom() ?? 12) - 1);

defineExpose({ refreshBounds: emitBounds, focusPin, highlightPin, zoomIn, zoomOut, closePopup });

defineOptions({ name: 'PharmacyMapMulti' });
</script>

<template>
  <div class="relative w-full h-full bg-brand-50 dark:bg-gray-900">
    <div ref="mapContainer" class="w-full h-full"></div>

    <div v-if="loading" class="flex absolute inset-0 justify-center items-center bg-brand-50 dark:bg-gray-900">
      <div class="text-center">
        <div class="mx-auto mb-3 w-8 h-8 rounded-full border-2 animate-spin border-brand-500 border-t-transparent"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading map…</p>
      </div>
    </div>
    <div v-else-if="error" class="flex absolute inset-0 justify-center items-center p-6 text-center bg-brand-50 dark:bg-gray-900">
      <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ error }}</p>
    </div>
  </div>
</template>
