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

const emit = defineEmits(['update:modelValue', 'address-components']);

const mapContainer = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const map = ref<any>(null);
const marker = ref<any>(null);
const autocomplete = ref<any>(null);
const loading = ref(true);

const { loadGoogleMapsScript, error } = useGoogleMaps();
const gettingLocation = ref(false);

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

  const lat = Number(props.modelValue.lat);
  const lng = Number(props.modelValue.lng);
  const hasCustomCoords = lat && lng && !(lat === 5.6037 && lng === -0.187);

  const initialLocation = {
    lat: lat || 5.6037,
    lng: lng || -0.187
  };

  map.value = new (google.maps as any).Map(mapContainer.value, {
    center: initialLocation,
    zoom: 15,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
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

  // Auto-center on user's location if no custom coords are set
  if (!hasCustomCoords && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        map.value?.setCenter({ lat: latitude, lng: longitude });
        map.value?.setZoom(17);
        await updateLocation(latitude, longitude);
      },
      () => { /* keep Accra default */ },
      { timeout: 8000 }
    );
  }
};

const initializeAutocomplete = () => {
  if (!searchInput.value) return;

  autocomplete.value = new (google.maps as any).places.Autocomplete(searchInput.value, {
    fields: ['formatted_address', 'geometry', 'address_components'],
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

      if (place.address_components) {
        emit('address-components', parseAddressComponents(place.address_components));
      }
    }
  });
};

function parseAddressComponents(components: any[]): Record<string, string> {
  const get = (type: string) =>
    components.find((c: any) => c.types.includes(type))?.long_name ?? '';
  return {
    street_number:  get('street_number'),
    route:          get('route'),
    area_suburb:    get('sublocality_level_1') || get('sublocality') || get('neighborhood'),
    city:           get('locality') || get('administrative_area_level_2'),
    region:         get('administrative_area_level_1'),
  };
}

const updateLocation = async (lat: number, lng: number, address?: string) => {
  let finalAddress = address;
  let components: any[] | null = null;

  if (!finalAddress) {
    const geocoder = new (google.maps as any).Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        finalAddress = response.results[0].formatted_address;
        components = response.results[0].address_components ?? null;
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  }

  marker.value?.setPosition({ lat, lng });

  emit('update:modelValue', { lat, lng, address: finalAddress || '' });

  if (components) {
    emit('address-components', parseAddressComponents(components));
  }
};

async function useMyLocation() {
  if (!navigator.geolocation) return;
  gettingLocation.value = true;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      map.value?.setCenter({ lat: latitude, lng: longitude });
      map.value?.setZoom(17);
      await updateLocation(latitude, longitude);
      gettingLocation.value = false;
    },
    () => { gettingLocation.value = false; },
    { timeout: 10000 }
  );
}

// Handle external value changes (e.g. when editing an address)
watch(() => props.modelValue, (newVal) => {
  if (!map.value || !marker.value) return;
  const lat = Number(newVal.lat);
  const lng = Number(newVal.lng);
  if (!lat || !lng) return;
  const currentPos = marker.value.getPosition();
  if (lat !== currentPos?.lat() || lng !== currentPos?.lng()) {
    const pos = { lat, lng };
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

      <!-- My Location button -->
      <button
        type="button"
        @click="useMyLocation"
        :disabled="gettingLocation"
        class="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-lg hover:border-[#246BFD] hover:text-[#246BFD] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg v-if="!gettingLocation" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" stroke-width="2" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ gettingLocation ? 'Locating...' : 'My Location' }}
      </button>

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

  </div>
</template>
