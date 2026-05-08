<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import type { Address } from '@/models/User';
import MapPicker from './MapPicker.vue';

const authStore = useAuthStore();
const showModal = ref(false);
const editingAddress = ref<Address | null>(null);
const loading = ref(false);

const form = ref({
  label: '',
  google_address: '',
  latitude: 5.6037,
  longitude: -0.1870,
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  is_default: false
});

// Map location object for MapPicker binding
const mapLocation = ref({
  lat: 5.6037,
  lng: -0.1870,
  address: ''
});

const openAddModal = () => {
  editingAddress.value = null;
  mapLocation.value = { lat: 5.6037, lng: -0.1870, address: '' };
  form.value = {
    label: '',
    google_address: '',
    latitude: 5.6037,
    longitude: -0.1870,
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false
  };
  showModal.value = true;
};

const openEditModal = (address: Address) => {
  editingAddress.value = address;
  mapLocation.value = { 
    lat: Number(address.latitude) || 5.6037, 
    lng: Number(address.longitude) || -0.1870, 
    address: address.google_address || '' 
  };
  form.value = {
    label: address.label || '',
    google_address: address.google_address || '',
    latitude: Number(address.latitude) || 5.6037,
    longitude: Number(address.longitude) || -0.1870,
    address_line_1: address.address_line_1 || '',
    address_line_2: address.address_line_2 || '',
    city: address.city || '',
    state: address.state || '',
    postal_code: address.postal_code || '',
    is_default: address.is_default
  };
  showModal.value = true;
};

const handleMapUpdate = (location: { lat: number; lng: number; address: string }) => {
  form.value.latitude = location.lat;
  form.value.longitude = location.lng;
  form.value.google_address = location.address;
  
  // Also try to extract city/state if possible from address
  if (location.address) {
    const parts = location.address.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      form.value.city = parts[parts.length - 3] || parts[parts.length - 2] || '';
    }
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    if (editingAddress.value) {
      await authStore.updateAddress(editingAddress.value.id, form.value);
    } else {
      await authStore.addAddress(form.value);
    }
    showModal.value = false;
  } catch (error) {
    console.error('Failed to save address:', error);
  } finally {
    loading.value = false;
  }
};

const deleteAddress = async (id: number) => {
  if (confirm('Are you sure you want to delete this address?')) {
    try {
      await authStore.deleteAddress(id);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  }
};

const setAsDefault = async (id: number) => {
  try {
    await authStore.setDefaultAddress(id);
  } catch (error) {
    console.error('Failed to set default address:', error);
  }
};

const getMapThumbnail = (lat: number | null, lng: number | null) => {
  if (!lat || !lng) return '';
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:0x246BFD%7C${lat},${lng}&key=${apiKey}&style=feature:poi%7Cvisibility:off`;
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
        <svg class="w-6 h-6 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Delivery Locations
      </h3>
      <button
        @click="openAddModal"
        class="text-sm font-black text-[#246BFD] hover:text-[#5089FF] transition-all flex items-center space-x-1 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800/20"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Add Location</span>
      </button>
    </div>

    <div v-if="authStore.user?.addresses?.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="address in authStore.user.addresses"
        :key="address.id"
        class="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-[#246BFD]/10"
        :class="address.is_default ? 'border-[#246BFD] ring-4 ring-[#246BFD]/5' : 'border-gray-50 dark:border-gray-700 hover:border-blue-200'"
      >
        <!-- Map Thumbnail -->
        <div class="h-32 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img 
            :src="getMapThumbnail(Number(address.latitude), Number(address.longitude))" 
            class="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            alt="Location Map"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div v-if="address.is_default" class="absolute top-4 right-4 z-10">
            <span class="bg-[#246BFD] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-[#246BFD]/30 uppercase tracking-widest flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              Default
            </span>
          </div>
          
          <div class="absolute bottom-3 left-4 text-white">
            <h4 class="font-black text-sm uppercase tracking-widest drop-shadow-md">{{ address.label || 'Saved Location' }}</h4>
          </div>
        </div>

        <!-- Address Details -->
        <div class="p-5 space-y-4">
          <div class="flex items-start space-x-3">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-[#246BFD]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-900 dark:text-white leading-relaxed line-clamp-2">
                {{ address.google_address || address.address_line_1 }}
              </p>
              <p v-if="address.city" class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{{ address.city }}</p>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <div class="flex space-x-2">
              <button
                @click="openEditModal(address)"
                class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-[#246BFD] hover:bg-blue-50 transition-all"
                title="Edit Location"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 01-2 2v11a2 2 0 012 2h11a2 2 0 012-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                v-if="!address.is_default"
                @click="deleteAddress(address.id)"
                class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Delete Location"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            
            <button
              v-if="!address.is_default"
              @click="setAsDefault(address.id)"
              class="text-[10px] font-black text-[#246BFD] bg-[#246BFD]/5 px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all uppercase tracking-tighter hover:bg-[#246BFD] hover:text-white"
            >
              Set as Default
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-600">
      <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </div>
      <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No Delivery Locations</h4>
      <p class="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">Add your home or office location on the map for faster checkout.</p>
      <button @click="openAddModal" class="px-8 py-3 rounded-2xl bg-[#246BFD] text-white font-bold hover:bg-[#5089FF] shadow-lg shadow-[#246BFD]/20 transition-all">
        Add My First Location
      </button>
    </div>

    <!-- Address Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
          <div>
            <h4 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {{ editingAddress ? 'Edit Location' : 'Add New Location' }}
            </h4>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Specify your exact delivery point</p>
          </div>
          <button @click="showModal = false" class="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-8 space-y-6 overflow-y-auto max-h-[80vh] no-scrollbar">
          <!-- Map Picker Component -->
          <MapPicker 
            v-model="mapLocation" 
            @update:modelValue="handleMapUpdate"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div class="col-span-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location Title (e.g. My Home, Dad's Office)</label>
              <input
                v-model="form.label"
                type="text"
                required
                class="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#246BFD]/10 focus:border-[#246BFD] outline-none transition-all shadow-sm font-bold"
                placeholder="Give this location a name"
              />
            </div>
            
            <div class="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 md:col-span-2">
              <input
                v-model="form.is_default"
                type="checkbox"
                id="is_default"
                class="w-6 h-6 text-[#246BFD] border-gray-300 rounded-lg focus:ring-[#246BFD] transition-all cursor-pointer"
              />
              <label for="is_default" class="text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer">Set as default delivery location</label>
            </div>
          </div>

          <!-- Extra Details (Optional / Collapsed) -->
          <details class="group bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-gray-100 dark:border-gray-700">
            <summary class="p-4 cursor-pointer font-bold text-xs uppercase tracking-widest text-gray-500 flex items-center justify-between list-none">
              <span>Additional Address Details (Optional)</span>
              <svg class="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <div class="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="form.address_line_1" placeholder="Building name / Floor" class="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
              <input v-model="form.city" placeholder="City" class="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
          </details>

          <div class="pt-6 flex space-x-4">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-8 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 text-gray-500 font-bold hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              :disabled="loading || !form.google_address"
              class="flex-[2] px-8 py-4 rounded-2xl bg-[#246BFD] text-white font-black hover:bg-[#5089FF] shadow-xl shadow-[#246BFD]/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs"
            >
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Saving...' : (editingAddress ? 'Update Location' : 'Save Location') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
