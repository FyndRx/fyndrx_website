<script setup lang="ts">
import { computed } from 'vue';
import OrderTrackingMap from '@/components/OrderTrackingMap.vue';
import type { useCheckout } from '@/composables/useCheckout';

const props = defineProps<{
  checkout: ReturnType<typeof useCheckout>;
}>();

// Helper to pass locations to map
const checkoutPharmacyLocations = computed(() => {
  return props.checkout.pharmaciesCheckout.value
    .filter(p => {
      const groupKey = p.pharmacyBranchId || p.pharmacyId;
      return p.latitude && p.longitude && props.checkout.deliveryMethods.value.get(groupKey) === 'delivery';
    })
    .map(p => ({
      lat: Number(p.latitude),
      lng: Number(p.longitude),
      name: p.branchName ? `${p.pharmacyName} - ${p.branchName}` : p.pharmacyName
    }));
});

const deliveryLocationObj = computed(() => {
  if (props.checkout.deliveryLat.value && props.checkout.deliveryLng.value) {
    return { lat: props.checkout.deliveryLat.value, lng: props.checkout.deliveryLng.value };
  }
  return undefined;
});
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="max-h-0 opacity-0 scale-95"
    enter-to-class="max-h-[1000px] opacity-100 scale-100"
    leave-from-class="max-h-[1000px] opacity-100 scale-100"
    leave-to-class="max-h-0 opacity-0 scale-95"
  >
    <div v-if="checkout.showDeliveryAddressInput.value" class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 space-y-5">
      <h3 class="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        Delivery Destination
      </h3>
      
      <div class="space-y-4">
        <!-- Geocoded Address Textarea -->
        <div class="text-left">
          <label class="block mb-2 text-xs font-black uppercase text-gray-500">
            Address Description <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="checkout.deliveryAddress.value"
            rows="2"
            readonly
            placeholder="Use the map to select a delivery location"
            class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed focus:outline-none select-none"
            required
          ></textarea>
          <span class="block text-[10px] text-gray-400 mt-1">
            💡 This address is automatically generated from your selected map location.
          </span>
        </div>

        <!-- Bookmark Presets Selector & Add Preset Widget -->
        <div class="space-y-2">
          <label class="block text-xs font-black uppercase text-gray-500 text-left">
            Address Bookmarks
          </label>
          <div class="flex flex-wrap gap-2 items-center">
            <button
              v-for="addr in checkout.userAddresses.value"
              :key="addr.id"
              type="button"
              @click="checkout.selectBookmarkedAddress(addr)"
              class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 focus:outline-none"
              :class="checkout.selectedAddressId.value === addr.id
                ? 'bg-[#246BFD]/10 border-[#246BFD] text-[#246BFD] font-bold shadow-sm'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#246BFD]/50'"
            >
              <span v-if="addr.label?.toLowerCase() === 'home'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </span>
              <span v-else-if="addr.label?.toLowerCase() === 'work'">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </span>
              <span v-else>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </span>
              {{ addr.label }}
            </button>

            <!-- Toggle for adding new bookmark -->
            <button 
              type="button"
              @click="checkout.isAddingAddress.value = !checkout.isAddingAddress.value"
              class="px-3 py-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-500 hover:text-[#246BFD] hover:border-[#246BFD] flex items-center gap-1 transition-all focus:outline-none"
            >
              <svg v-if="checkout.isAddingAddress.value" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              {{ checkout.isAddingAddress.value ? 'Cancel' : 'New Bookmark' }}
            </button>
          </div>

          <!-- Expansion Card for Saving New Preset Address -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="max-h-0 opacity-0 scale-95"
            enter-to-class="max-h-[150px] opacity-100 scale-100"
            leave-from-class="max-h-[150px] opacity-100 scale-100"
            leave-to-class="max-h-0 opacity-0 scale-95"
          >
            <div v-if="checkout.isAddingAddress.value" class="p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl space-y-2.5 text-left overflow-hidden">
              <div class="flex items-center gap-2">
                <input 
                  v-model="checkout.newAddressLabel.value"
                  type="text"
                  placeholder="E.g. Home, Office, Mom's House"
                  class="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                />
                <button
                  type="button"
                  @click="checkout.saveNewAddressBookmark()"
                  :disabled="checkout.isSavingAddress.value || !checkout.newAddressLabel.value.trim() || !checkout.deliveryAddress.value.trim()"
                  class="px-3 py-1.5 bg-[#246BFD] hover:bg-[#246BFD]/90 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold transition-all focus:outline-none"
                >
                  {{ checkout.isSavingAddress.value ? 'Saving...' : 'Save Preset' }}
                </button>
              </div>
              <span class="block text-[9px] text-gray-400">
                💡 This will bookmark the current geocoded spot & address text to your account.
              </span>
            </div>
          </transition>
        </div>

        <!-- Temporary Destination & Direct Recipient Details Widget -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-[#246BFD]/5 to-transparent border border-[#246BFD]/15 dark:border-[#246BFD]/10 backdrop-blur-md relative overflow-hidden transition-all duration-300">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-[#246BFD]/10 text-[#246BFD] flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-gray-900 dark:text-white text-left">Custom Recipient or Temporary Spot?</h4>
                <p class="text-xs text-gray-500 text-left">Deliver to someone else or a temporary location</p>
              </div>
            </div>
            <button 
              type="button"
              @click="checkout.isOrderingForSomeoneElse.value = !checkout.isOrderingForSomeoneElse.value"
              class="px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 focus:outline-none"
              :class="checkout.isOrderingForSomeoneElse.value 
                ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#246BFD]'"
            >
              {{ checkout.isOrderingForSomeoneElse.value ? 'Custom Details' : 'Use Default' }}
            </button>
          </div>

          <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="max-h-0 opacity-0 scale-95"
            enter-to-class="max-h-[200px] opacity-100 scale-100"
            leave-from-class="max-h-[200px] opacity-100 scale-100"
            leave-to-class="max-h-0 opacity-0 scale-95"
          >
            <div v-if="checkout.isOrderingForSomeoneElse.value" class="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 overflow-hidden text-left">
              <div>
                <label class="block mb-1 text-xs font-black uppercase text-gray-500">Contact Person Name</label>
                <input 
                  v-model="checkout.recipientName.value"
                  type="text"
                  placeholder="E.g. Parent, Friend, or My Temporary Name"
                  class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                />
              </div>
              <div>
                <label class="block mb-1 text-xs font-black uppercase text-gray-500">Delivery Contact Phone</label>
                <input 
                  v-model="checkout.recipientPhoneNumber.value"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                />
              </div>
            </div>
          </transition>
        </div>

        <!-- Google Map Picker Compact Preview -->
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-medium text-gray-500">Geocoded GPS Coordinates</span>
            <button 
              @click="checkout.fetchUserLocation()" 
              class="font-bold text-[#246BFD] flex items-center gap-1 hover:underline focus:outline-none"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Use My Location
            </button>
          </div>
          
          <div class="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900/10">
            <OrderTrackingMap 
              :pharmacyLocations="checkoutPharmacyLocations"
              :deliveryLocation="deliveryLocationObj"
              :enableLocationPicker="true"
              deliveryMethod="delivery"
              class="h-full w-full"
              @location-selected="checkout.onLocationSelected"
            />
          </div>
          <span class="flex gap-1.5 text-[10px] text-gray-400 leading-normal text-left items-start mt-2">
            <svg class="w-3.5 h-3.5 shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            Click map or drag red marker to update delivery GPS spot in real-time.
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>
