<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useNotification } from '@/composables/useNotification';
import { formatCurrency } from '@/utils/currency';
import LazyImage from '@/components/LazyImage.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';
import OrderTrackingMap from '@/components/OrderTrackingMap.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const notification = useNotification();

const selectedBranches = ref<Set<number>>(new Set());
const activeMapBranchId = ref<number | null>(null);

// Cart Location Selector refs
const deliveryLat = ref<number | undefined>();
const deliveryLng = ref<number | undefined>();
const deliveryAddress = ref('');
const defaultUserAddress = ref('');
const showMapModal = ref(false);

onMounted(() => {
  if (authStore.user) {
    deliveryAddress.value = authStore.user.address || '';
    defaultUserAddress.value = authStore.user.address || '';
  }
});

const onCartLocationSelected = (payload: { lat: number; lng: number; address: string }) => {
  deliveryLat.value = payload.lat;
  deliveryLng.value = payload.lng;
  if (payload.address) {
    deliveryAddress.value = payload.address;
  }
};

const hasPrescriptionItems = computed(() => {
  return cartStore.items.some(item => item.requiresPrescription);
});

const allPharmaciesSelected = computed(() => {
  return cartStore.groupedByPharmacy.length > 0 && 
         selectedBranches.value.size === cartStore.groupedByPharmacy.length;
});

const selectedTotal = computed(() => {
  return cartStore.groupedByPharmacy
    .filter(group => selectedBranches.value.has(group.pharmacyBranchId))
    .reduce((total, group) => total + group.subtotal, 0);
});

const toggleMap = (branchId: number) => {
  if (activeMapBranchId.value === branchId) {
    activeMapBranchId.value = null;
  } else {
    activeMapBranchId.value = branchId;
  }
};

// Auto-select all pharmacies when cart data is available
watch(() => cartStore.groupedByPharmacy, (groups) => {
  if (groups.length > 0 && selectedBranches.value.size === 0) {
    groups.forEach(group => {
      selectedBranches.value.add(group.pharmacyBranchId);
    });
  }
}, { immediate: true, deep: true });

const togglePharmacySelection = (branchId: number) => {
  if (selectedBranches.value.has(branchId)) {
    selectedBranches.value.delete(branchId);
  } else {
    selectedBranches.value.add(branchId);
  }
};

const toggleSelectAll = () => {
  if (allPharmaciesSelected.value) {
    selectedBranches.value.clear();
  } else {
    cartStore.groupedByPharmacy.forEach(group => {
      selectedBranches.value.add(group.pharmacyBranchId);
    });
  }
};

const proceedToCheckout = () => {
  if (selectedBranches.value.size === 0) {
    notification.warning(
      'No Pharmacies Selected',
      'Please select at least one pharmacy branch to proceed to checkout.'
    );
    return;
  }
  
  const selectedBranchIds = Array.from(selectedBranches.value);
  router.push({ 
    name: 'checkout',
    query: { 
      pharmacies: selectedBranchIds.join(','),
      lat: deliveryLat.value,
      lng: deliveryLng.value,
      address: deliveryAddress.value
    }
  });
};

const continueShopping = () => {
  router.push({ name: 'pharmacies' });
};

const startShopping = () => {
  router.push({ name: 'pharmacies' });
};
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-medium text-gray-900 dark:text-white">Shopping Cart</h1>
        <p class="text-gray-600 dark:text-gray-300">
          {{ cartStore.cartItemsCount }} {{ cartStore.cartItemsCount === 1 ? 'item' : 'items' }} in your cart
        </p>
      </div>

      <div v-if="cartStore.items.length === 0" class="py-16 text-center">
        <div class="mx-auto mb-6 w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h2 class="mb-2 text-2xl font-medium text-gray-900 dark:text-white">Your cart is empty</h2>
        <p class="mb-6 text-gray-600 dark:text-gray-300">Add medications to your cart to get started</p>
        <button
          @click="startShopping"
          class="px-8 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
        >
          Browse Pharmacies
        </button>
      </div>

      <div v-else class="space-y-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Main Content Column -->
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
              <div class="flex items-center gap-4">
                <CustomCheckbox
                  :model-value="allPharmaciesSelected"
                  size="medium"
                  variant="switch"
                  @update:model-value="toggleSelectAll"
                />
                <span class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Select All Pharmacies</span>
              </div>
              <div v-if="selectedBranches.size > 0" class="hidden sm:block">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {{ selectedBranches.size }} {{ selectedBranches.size === 1 ? 'Pharmacy' : 'Pharmacies' }} selected
                </span>
              </div>
            </div>

            <div
              v-for="pharmacy in cartStore.groupedByPharmacy"
              :key="pharmacy.pharmacyBranchId"
              class="overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-2xl"
            >
            <div class="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-5">
                  <div class="relative group">
                    <CustomCheckbox
                      :model-value="selectedBranches.has(pharmacy.pharmacyBranchId)"
                      size="medium"
                      @update:model-value="togglePharmacySelection(pharmacy.pharmacyBranchId)"
                      class="z-10"
                    />
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 p-1 overflow-hidden bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 group-hover:scale-105 transition-transform">
                      <LazyImage
                        :src="pharmacy.pharmacyLogo || '/images/pharmacies/default-pharmacy.jpg'"
                        :alt="pharmacy.pharmacyName"
                        aspectRatio="square"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                    
                    <div class="min-w-0">
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        {{ pharmacy.pharmacyName }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <svg class="w-3.5 h-3.5 text-[#246BFD] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p class="text-xs font-bold text-gray-500 dark:text-gray-400 truncate uppercase tracking-tight">
                          {{ pharmacy.branchName || 'Main Branch' }}
                        </p>
                        <span class="mx-2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {{ pharmacy.items.length }} {{ pharmacy.items.length === 1 ? 'Product' : 'Products' }}
                        </span>
                        <span class="mx-2 w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        <button 
                          @click="toggleMap(pharmacy.pharmacyBranchId)"
                          class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border focus:outline-none"
                          :class="activeMapBranchId === pharmacy.pharmacyBranchId 
                            ? 'bg-[#246BFD]/10 border-[#246BFD] text-[#246BFD] shadow-sm scale-105' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] hover:scale-105'"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {{ activeMapBranchId === pharmacy.pharmacyBranchId ? 'Hide Map' : 'View Location' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-4">
                  <div class="hidden sm:block text-right pr-4 border-r border-gray-200 dark:border-gray-700">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pharmacy Subtotal</p>
                    <p class="text-lg font-black text-[#246BFD]">{{ formatCurrency(pharmacy.subtotal) }}</p>
                  </div>
                  
                  <button
                    @click="cartStore.clearPharmacyItems(pharmacy.pharmacyId)"
                    class="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    title="Remove all items from this pharmacy"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Dynamic Map Accordion (Lazy-Loaded, Singleton Active) -->
            <transition
              enter-active-class="transition-all duration-500 ease-out"
              enter-from-class="transform -translate-y-2 opacity-0 max-h-0"
              enter-to-class="transform translate-y-0 opacity-100 max-h-[450px]"
              leave-active-class="transition-all duration-400 ease-in"
              leave-from-class="transform translate-y-0 opacity-100 max-h-[450px]"
              leave-to-class="transform -translate-y-2 opacity-0 max-h-0"
            >
              <div 
                v-if="activeMapBranchId === pharmacy.pharmacyBranchId" 
                class="overflow-hidden border-b border-gray-150 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/10"
              >
                <div class="p-4 sm:p-6">
                  <div class="relative h-[350px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-700">
                    <OrderTrackingMap 
                      :pharmacyLocations="[{ lat: Number(pharmacy.latitude || 5.6037), lng: Number(pharmacy.longitude || -0.1870), name: pharmacy.branchName ? `${pharmacy.pharmacyName} - ${pharmacy.branchName}` : pharmacy.pharmacyName }]"
                      deliveryMethod="pickup"
                      class="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </transition>

            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="item in pharmacy.items"
                :key="item.id"
                class="p-6"
              >
                <div class="flex gap-4">
                  <div class="flex-shrink-0 w-24 h-24 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <LazyImage
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.medicationName"
                      aspectRatio="square"
                      className="w-full h-full object-cover"
                    />
                    <div v-else class="flex items-center justify-center w-full h-full">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                      </svg>
                    </div>
                  </div>

                  <div class="flex-1 min-w-0">
                    <h4 class="mb-1 text-lg font-bold text-gray-900 dark:text-white truncate">
                      {{ item.medicationName }}
                    </h4>
                    <div class="mb-2">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          v-if="item.requiresPrescription"
                          class="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 rounded-lg dark:bg-orange-900/30 dark:text-orange-200"
                        >
                          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                          </svg>
                          Prescription Required
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between mt-4">
                      <div class="flex items-center space-x-2">
                        <button
                          @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                          class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span class="w-12 text-center text-gray-900 dark:text-white font-medium">
                          {{ item.quantity }}
                        </span>
                        <button
                          @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                          class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <div class="text-right">
                        <div class="text-lg font-medium text-[#246BFD]">
                          {{ formatCurrency((item.discountPrice || item.price) * item.quantity) }}
                        </div>
                        <div v-if="item.discountPrice && item.discountPrice < item.price" class="text-sm text-gray-500 line-through">
                          {{ formatCurrency(item.price * item.quantity) }}
                        </div>
                      </div>

                      <button
                        @click="cartStore.removeItem(item.id)"
                        class="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove item"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6 border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Pharmacy Subtotal</span>
                <span class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ formatCurrency(pharmacy.subtotal) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h2 class="mb-6 text-xl font-medium text-gray-900 dark:text-white">Order Summary</h2>
            
            <div class="space-y-4 mb-6">
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>{{ formatCurrency(cartStore.subtotal) }}</span>
              </div>
              <div v-if="cartStore.discount > 0" class="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{{ formatCurrency(cartStore.discount) }}</span>
              </div>
              <div v-if="selectedBranches.size > 0" class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Selected Items</span>
                <span>{{ formatCurrency(selectedTotal) }}</span>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span class="text-[#246BFD]">{{ formatCurrency(selectedBranches.size > 0 ? selectedTotal : cartStore.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Creative Delivery Destination Widget inside Sidebar -->
            <div class="mb-6 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-800 border border-gray-150 dark:border-gray-700/60 shadow-sm relative overflow-hidden transition-all duration-300">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-[#246BFD]/10 text-[#246BFD] flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Delivery Destination</span>
                </div>
                
                <button 
                  @click="showMapModal = true"
                  class="text-xs font-bold text-[#246BFD] hover:underline flex items-center gap-1 focus:outline-none"
                >
                  Change
                </button>
              </div>
              
              <div class="space-y-1 text-left">
                <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {{ deliveryAddress || 'No location selected yet' }}
                </p>
                <p v-if="deliveryLat && deliveryLng" class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black">
                  Coordinates: {{ deliveryLat.toFixed(4) }}°, {{ deliveryLng.toFixed(4) }}°
                </p>
                <p v-else class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
                  Uses default profile address
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <button
                @click="proceedToCheckout"
                :disabled="selectedBranches.size === 0"
                class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
              <button
                @click="continueShopping"
                class="w-full px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>

            <div class="mt-6 space-y-3">
              <div class="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-[#246BFD] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    You can choose to pay through our platform or directly at the pharmacy during checkout.
                  </p>
                </div>
              </div>

              <div v-if="hasPrescriptionItems" class="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <div class="text-sm text-orange-700 dark:text-orange-300">
                    <p class="font-semibold mb-1">Prescription Required</p>
                    <p>Some items in your cart require a prescription. You'll be asked to upload it during checkout if choosing delivery.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modern Full-Screen Blur Location Picker Modal -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="showMapModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-gray-900/60 dark:bg-black/70 backdrop-blur-md">
        <div class="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-white/10 dark:border-gray-800 overflow-hidden flex flex-col transition-transform duration-500 animate-in fade-in zoom-in-95">
          <!-- Modal Header -->
          <div class="p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-20 relative">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">Choose Delivery Destination</h3>
              <p class="text-xs text-gray-500 mt-1">Search or drag the red marker to pin your exact location</p>
            </div>
            
            <button 
              @click="showMapModal = false"
              class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 flex items-center justify-center transition-all duration-300 focus:outline-none"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Map Canvas Wrapper -->
          <div class="flex-1 w-full relative min-h-[300px]">
            <OrderTrackingMap 
              :deliveryLocation="deliveryLat && deliveryLng ? { lat: deliveryLat, lng: deliveryLng } : undefined"
              :enableLocationPicker="true"
              deliveryMethod="delivery"
              class="w-full h-full"
              @location-selected="onCartLocationSelected"
            />
          </div>
          
          <!-- Modal Footer / Confirm -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 relative">
            <div class="text-left w-full sm:max-w-md">
              <span class="text-[9px] font-black uppercase tracking-widest text-[#246BFD]">Selected Address</span>
              <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate mt-0.5">
                {{ deliveryAddress || 'Loading resolved address...' }}
              </p>
            </div>
            
            <button 
              @click="showMapModal = false"
              class="w-full sm:w-auto px-8 py-3 rounded-full bg-[#246BFD] hover:bg-[#5089FF] text-white text-sm font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</div>
</template>

<style scoped>

</style>

