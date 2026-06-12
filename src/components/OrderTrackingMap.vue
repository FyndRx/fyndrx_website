<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';

const props = defineProps<{
  pharmacyLocations?: Array<{ lat: number; lng: number; name?: string }>;
  deliveryLocation?: { lat: number; lng: number };
  pharmacyName?: string;
  deliveryMethod: 'pickup' | 'delivery';
  enableLocationPicker?: boolean;
  defaultAddress?: string;
}>();

const emit = defineEmits<{
  (e: 'location-selected', payload: { lat: number; lng: number; address: string }): void;
  (e: 'address-resolved', address: string): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const map = ref<any>(null);
const deliveryMarker = ref<any>(null);
const loading = ref(true);
const resolvedAddress = ref('');
const directionsRenderers = ref<any[]>([]);
const pharmacyMarkers = ref<any[]>([]);

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

const handleLocationChange = (lat: number, lng: number, addressString?: string) => {
  if (addressString) {
    resolvedAddress.value = addressString;
    emit('location-selected', { lat, lng, address: addressString });
    emit('address-resolved', addressString);
    return;
  }

  const geocoder = new (window as any).google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
    let resolved = '';
    if (status === 'OK' && results[0]) {
      resolved = results[0].formatted_address;
    } else {
      resolved = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    resolvedAddress.value = resolved;
    emit('location-selected', { lat, lng, address: resolved });
    emit('address-resolved', resolved);
  });
};

const initializeMap = () => {
  if (!mapContainer.value) return;
  if (!(window as any).google || !(window as any).google.maps) {
    console.error('Google Maps API not available');
    return;
  }

  // Clear any existing directions layers or polyline fallbacks
  // Clear any existing directions layers or polyline fallbacks
  directionsRenderers.value.forEach(renderer => renderer.setMap(null));
  directionsRenderers.value = [];
  
  // Clear any existing pharmacy markers
  pharmacyMarkers.value.forEach(marker => marker.setMap(null));
  pharmacyMarkers.value = [];

  // Only create the map instance once
  if (!map.value) {
    map.value = new (window as any).google.maps.Map(mapContainer.value, {
      center: props.deliveryLocation || { lat: 5.6037, lng: -0.1870 }, // Default to Accra center
      zoom: props.deliveryLocation ? 15 : 12,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'administrative.land_parcel', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ]
    });
  }

  const locations = (props.pharmacyLocations || []).filter(loc => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number');

  const bounds = new (window as any).google.maps.LatLngBounds();

  // Pharmacy Markers
  locations.forEach(loc => {
    const pos = { lat: loc.lat, lng: loc.lng };
    bounds.extend(pos);

    const marker = new (window as any).google.maps.Marker({
      position: pos,
      map: map.value,
      title: loc.name || props.pharmacyName,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#246BFD',
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: '#FFFFFF',
        scale: 1.5,
        anchor: new (window as any).google.maps.Point(12, 22)
      },
      label: {
        text: loc.name || props.pharmacyName || 'Pharmacy',
        color: '#246BFD',
        className: 'relative bg-white px-3 py-1.5 rounded-lg shadow-[0_6px_16px_rgba(36,107,253,0.25)] font-bold text-[10px] text-[#246BFD] whitespace-nowrap -translate-y-[42px] after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-white'
      },
      animation: (window as any).google.maps.Animation.DROP
    });
    pharmacyMarkers.value.push(marker);
  });

  // Setup Delivery Marker (if active/enabled)
  const deliveryPos = props.deliveryLocation || { lat: 5.6037, lng: -0.1870 };
  
  // Only add delivery marker for delivery method or if picker mode is explicitly enabled
  if (props.deliveryMethod === 'delivery' || props.enableLocationPicker) {
    bounds.extend(deliveryPos);

    if (deliveryMarker.value) {
      deliveryMarker.value.setMap(null);
    }

    deliveryMarker.value = new (window as any).google.maps.Marker({
      position: deliveryPos,
      map: map.value,
      title: 'Delivery Location',
      draggable: !!props.enableLocationPicker,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#FF3B30',
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: '#FFFFFF',
        scale: 1.5,
        anchor: new (window as any).google.maps.Point(12, 22)
      },
      label: {
        text: 'Your Destination',
        color: '#FFFFFF',
        className: 'relative bg-gray-900 px-3 py-1.5 rounded-lg shadow-[0_6px_16px_rgba(0,0,0,0.3)] font-bold text-[10px] text-white whitespace-nowrap -translate-y-[42px] after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-gray-900'
      },
      animation: (window as any).google.maps.Animation.DROP
    });

    // Draw lines to each pharmacy from delivery location
    drawRoutes();

    if (props.enableLocationPicker) {
      // Clear any previous listeners to prevent multiple events
      (window as any).google.maps.event.clearListeners(deliveryMarker.value, 'dragend');
      (window as any).google.maps.event.clearListeners(map.value, 'click');
      
      // Add dragend listener to marker
      deliveryMarker.value.addListener('dragend', () => {
        const pos = deliveryMarker.value.getPosition();
        handleLocationChange(pos.lat(), pos.lng());
      });

      // Add map click listener
      map.value.addListener('click', (e: any) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        deliveryMarker.value.setPosition(e.latLng);
        handleLocationChange(clickedLat, clickedLng);
      });
    }
  }

  // Auto-fit Bounds only if there are locations/markers
  if (!bounds.isEmpty() && (!props.enableLocationPicker || locations.length > 0)) {
    map.value.fitBounds(bounds);
    const padding = { top: 60, right: 60, bottom: 100, left: 60 };
    map.value.panToBounds(bounds, padding);
  } else if (props.deliveryLocation) {
    map.value.setCenter(props.deliveryLocation);
    map.value.setZoom(15);
  }

  // Setup Autocomplete Search
  if (props.enableLocationPicker) {
    // Wait for ref availability
    setTimeout(() => {
      if (searchInput.value) {
        const autocomplete = new (window as any).google.maps.places.Autocomplete(searchInput.value, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'gh' }
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            return;
          }

          const loc = place.geometry.location;
          map.value.setCenter(loc);
          map.value.setZoom(16);

          if (deliveryMarker.value) {
            deliveryMarker.value.setPosition(loc);
          }

          handleLocationChange(loc.lat(), loc.lng(), place.formatted_address);
        });
      }
    }, 200);
  }
};

const drawRoutes = () => {
  if (!map.value || !props.deliveryLocation) return;
  const locations = (props.pharmacyLocations || []).filter(loc => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number');
  
  // Clear old routes
  directionsRenderers.value.forEach(renderer => renderer.setMap(null));
  directionsRenderers.value = [];

  locations.forEach(loc => {
    const destPos = { lat: loc.lat, lng: loc.lng };
    const directionsService = new (window as any).google.maps.DirectionsService();
    const directionsRenderer = new (window as any).google.maps.DirectionsRenderer({
      map: map.value,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#246BFD',
        strokeOpacity: 0.8,
        strokeWeight: 4
      }
    });
    directionsRenderers.value.push(directionsRenderer);

    directionsService.route(
      {
        origin: props.deliveryLocation,
        destination: destPos,
        travelMode: (window as any).google.maps.TravelMode.DRIVING
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
        } else {
          const fallbackPolyline = new (window as any).google.maps.Polyline({
            path: [props.deliveryLocation, destPos],
            geodesic: true,
            strokeColor: '#246BFD',
            strokeOpacity: 0.6,
            strokeWeight: 3,
            icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 }, offset: '0', repeat: '20px' }],
            map: map.value
          });
          directionsRenderers.value.push(fallbackPolyline);
        }
      }
    );
  });
};

watch(() => props.pharmacyLocations, () => {
  initializeMap();
}, { deep: true });

watch(() => props.deliveryLocation, (newLoc) => {
  if (map.value && newLoc && deliveryMarker.value) {
    deliveryMarker.value.setPosition(newLoc);
    map.value.panTo(newLoc);
    drawRoutes();
  } else {
    initializeMap();
  }
}, { deep: true });

const openInGoogleMaps = () => {
  if (props.pharmacyLocations && props.pharmacyLocations.length > 0) {
    const loc = props.pharmacyLocations[0];
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
  }
};

const recenterMap = () => {
  if (!map.value) return;
  const bounds = new (window as any).google.maps.LatLngBounds();
  const locations = (props.pharmacyLocations || []).filter(loc => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number');
  
  locations.forEach(loc => {
    bounds.extend({ lat: loc.lat, lng: loc.lng });
  });

  if (props.deliveryLocation) {
    bounds.extend({ lat: props.deliveryLocation.lat, lng: props.deliveryLocation.lng });
  }

  if (!bounds.isEmpty()) {
    map.value.fitBounds(bounds);
    const padding = { top: 60, right: 60, bottom: 60, left: 60 };
    map.value.panToBounds(bounds, padding);
  }
};

defineOptions({
  name: 'OrderTrackingMap'
});
</script>

<template>
  <div class="relative w-full h-full min-h-[250px] rounded-2xl overflow-hidden shadow-inner bg-gray-100 dark:bg-gray-800">
    <div v-show="loading" class="absolute inset-0 flex items-center justify-center z-10 bg-gray-100 dark:bg-gray-800">
      <div class="text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#246BFD] mx-auto mb-3"></div>
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Initializing Tracking Map...</p>
      </div>
    </div>
    
    <div v-show="error" class="absolute inset-0 flex items-center justify-center z-10 bg-red-50 dark:bg-red-900/10">
      <div class="text-center px-6">
        <svg class="w-10 h-10 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm font-semibold text-red-600 dark:text-red-400">{{ error }}</p>
      </div>
    </div>
    
    <!-- Beautiful Google Autocomplete Search Bar inside the Map -->
    <div v-if="enableLocationPicker && !loading && !error" class="absolute top-4 left-4 right-16 z-10">
      <div class="relative w-full max-w-md">
        <input 
          ref="searchInput" 
          type="text" 
          placeholder="Search delivery location or address..." 
          class="w-full pl-10 pr-4 py-2.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#246BFD] transition-all duration-300"
        />
        <svg class="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
    </div>

    <div ref="mapContainer" class="w-full h-full min-h-[250px]"></div>

    <!-- Creative Glassmorphic Action Dock on the Map (Right) -->
    <div v-if="!loading && !error" class="absolute top-16 right-4 flex flex-col gap-2 z-10">
      <!-- Directions / Open in Google Maps -->
      <button 
        v-if="pharmacyLocations && pharmacyLocations.length > 0"
        @click="openInGoogleMaps"
        class="w-9 h-9 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-800/30 rounded-xl shadow-lg text-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 group relative focus:outline-none"
        title="Get Directions"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <!-- Tooltip -->
        <span class="absolute right-12 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-gray-900/90 text-white text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
          Directions
        </span>
      </button>

      <!-- Recenter Map -->
      <button 
        @click="recenterMap"
        class="w-9 h-9 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-800/30 rounded-xl shadow-lg text-gray-700 dark:text-gray-200 hover:bg-[#246BFD] hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 group relative focus:outline-none"
        title="Recenter Map"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <!-- Tooltip -->
        <span class="absolute right-12 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-gray-900/90 text-white text-[9px] font-black uppercase tracking-wider py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md">
          Recenter
        </span>
      </button>
    </div>

    <!-- Small Sleek Info Tag (Bottom Left) -->
    <div v-if="!loading && !error" class="absolute bottom-4 left-4 max-w-[220px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 dark:border-gray-800/30 shadow-md z-10">
      <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Destination</p>
      <p class="text-xs font-black text-gray-800 dark:text-white truncate">
        {{ deliveryMethod === 'pickup' ? (pharmacyName || pharmacyLocations?.[0]?.name || 'Pharmacy Branch') : 'Your Delivery Location' }}
      </p>
    </div>
  </div>
</template>
