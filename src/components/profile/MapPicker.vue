<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';

const props = defineProps<{
  modelValue: {
    lat: number;
    lng: number;
    address: string;
  };
}>();

const emit = defineEmits(['update:modelValue']);

const mapContainer = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const map = ref<any>(null);
const marker = ref<any>(null);
const autocomplete = ref<any>(null);
const loading = ref(true);

const { loadGoogleMapsScript, error } = useGoogleMaps();

onMounted(async () => {
  try {
    await loadGoogleMapsScript();
    initializeMap();
    initializeAutocomplete();
  } catch (err) {
    console.error('Failed to load Google Maps:', err);
  } finally {
    loading.value = false;
  }
});

const initializeMap = () => {
  if (!mapContainer.value) return;

  const initialLocation = {
    lat: props.modelValue.lat || 5.6037, // Default to Accra
    lng: props.modelValue.lng || -0.1870
  };

  map.value = new (google.maps as any).Map(mapContainer.value, {
    center: initialLocation,
    zoom: 15,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  marker.value = new (google.maps as any).Marker({
    position: initialLocation,
    map: map.value,
    draggable: true,
    animation: google.maps.Animation.DROP,
    icon: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: '#246BFD',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 2,
      anchor: new google.maps.Point(12, 22)
    }
  });

  // Listen for clicks on the map
  map.value.addListener('click', (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      updateLocation(e.latLng.lat(), e.latLng.lng());
    }
  });

  // Listen for marker drag end
  marker.value.addListener('dragend', () => {
    const pos = marker.value?.getPosition();
    if (pos) {
      updateLocation(pos.lat(), pos.lng());
    }
  });
};

const initializeAutocomplete = () => {
  if (!searchInput.value) return;

  autocomplete.value = new (google.maps as any).places.Autocomplete(searchInput.value, {
    fields: ['formatted_address', 'geometry'],
    componentRestrictions: { country: 'GH' }
  });

  autocomplete.value.addListener('place_changed', () => {
    const place = autocomplete.value?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || '';
      
      updateLocation(lat, lng, address);
      
      if (map.value) {
        map.value.setCenter({ lat, lng });
        map.value.setZoom(17);
      }
    }
  });
};

const updateLocation = async (lat: number, lng: number, address?: string) => {
  let finalAddress = address;
  
  if (!finalAddress) {
    // Reverse geocode to get address if not provided
    const geocoder = new (google.maps as any).Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        finalAddress = response.results[0].formatted_address;
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }

  marker.value?.setPosition({ lat, lng });
  
  emit('update:modelValue', {
    lat,
    lng,
    address: finalAddress || ''
  });
};

// Handle external value changes (e.g. when editing an address)
watch(() => props.modelValue, (newVal) => {
  if (!map.value || !marker.value) return;
  
  // Only update map if coordinates actually changed and are different from current marker
  const currentPos = marker.value.getPosition();
  if (newVal.lat !== currentPos?.lat() || newVal.lng !== currentPos?.lng()) {
    const pos = { lat: newVal.lat, lng: newVal.lng };
    marker.value.setPosition(pos);
    map.value.setCenter(pos);
  }
}, { deep: true });

</script>

<template>
  <div class="space-y-4">
    <!-- Search Bar -->
    <div class="relative group">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-400 group-focus-within:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input
        ref="searchInput"
        type="text"
        placeholder="Search for a location or street..."
        class="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#246BFD]/10 focus:border-[#246BFD] outline-none transition-all shadow-sm font-medium"
      />
    </div>

    <!-- Map Container -->
    <div class="relative">
      <div v-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
        <div class="text-center">
          <svg class="w-10 h-10 animate-spin text-[#246BFD] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-bold text-gray-500 uppercase tracking-widest">Initializing Map...</p>
        </div>
      </div>
      
      <div v-if="error" class="absolute inset-0 z-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center">
        <p class="text-sm font-bold text-red-600">{{ error }}</p>
      </div>

      <div ref="mapContainer" class="w-full h-[350px] rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700"></div>
      
      <!-- Overlay Tip -->
      <div class="absolute bottom-4 left-4 right-4 pointer-events-none">
        <div class="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2">
          <svg class="w-3 h-3 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Click on the map or drag the pin to adjust location</span>
        </div>
      </div>
    </div>

    <!-- Selected Address Display -->
    <div v-if="modelValue.address" class="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/20 animate-in fade-in slide-in-from-top-2">
      <div class="flex items-start space-x-3">
        <div class="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-[#246BFD]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-[10px] font-black text-[#246BFD] uppercase tracking-widest mb-0.5">Verified Address</p>
          <p class="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{{ modelValue.address }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
