<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useNotification } from '@/composables/useNotification';
import LazyImage from '@/components/LazyImage.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';

const router = useRouter();
const cartStore = useCartStore();
const notification = useNotification();

const selectedPharmacies = ref<Set<number>>(new Set());

const hasPrescriptionItems = computed(() => {
  return cartStore.items.some(item => item.requiresPrescription);
});

const allPharmaciesSelected = computed(() => {
  return cartStore.groupedByPharmacy.length > 0 && 
         selectedPharmacies.value.size === cartStore.groupedByPharmacy.length;
});

const selectedTotal = computed(() => {
  return cartStore.groupedByPharmacy
    .filter(group => selectedPharmacies.value.has(group.pharmacyId))
    .reduce((total, group) => total + group.subtotal, 0);
});

// Auto-select all pharmacies when cart data is available
watch(() => cartStore.groupedByPharmacy, (groups) => {
  if (groups.length > 0 && selectedPharmacies.value.size === 0) {
    groups.forEach(group => {
      selectedPharmacies.value.add(group.pharmacyId);
    });
  }
}, { immediate: true, deep: true });

const togglePharmacySelection = (pharmacyId: number) => {
  if (selectedPharmacies.value.has(pharmacyId)) {
    selectedPharmacies.value.delete(pharmacyId);
  } else {
    selectedPharmacies.value.add(pharmacyId);
  }
};

const toggleSelectAll = () => {
  if (allPharmaciesSelected.value) {
    selectedPharmacies.value.clear();
  } else {
    cartStore.groupedByPharmacy.forEach(group => {
      selectedPharmacies.value.add(group.pharmacyId);
    });
  }
};

const proceedToCheckout = () => {
  if (selectedPharmacies.value.size === 0) {
    notification.warning(
      'No Pharmacies Selected',
      'Please select at least one pharmacy to proceed to checkout.'
    );
    return;
  }
  
  const selectedPharmacyIds = Array.from(selectedPharmacies.value);
  router.push({ 
    name: 'checkout',
    query: { pharmacies: selectedPharmacyIds.join(',') }
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

      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl">
            <CustomCheckbox
              :model-value="allPharmaciesSelected"
              label="Select All Pharmacies"
              size="medium"
              variant="switch"
              @update:model-value="toggleSelectAll"
            />
          </div>

          <div
            v-for="pharmacy in cartStore.groupedByPharmacy"
            :key="pharmacy.pharmacyId"
            class="overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-2xl"
          >
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <CustomCheckbox
                    :model-value="selectedPharmacies.has(pharmacy.pharmacyId)"
                    size="medium"
                    @update:model-value="togglePharmacySelection(pharmacy.pharmacyId)"
                  />
                  <div v-if="pharmacy.pharmacyLogo" class="w-12 h-12 overflow-hidden bg-white rounded-lg">
                    <LazyImage
                      :src="pharmacy.pharmacyLogo"
                      :alt="pharmacy.pharmacyName"
                      aspectRatio="square"
                      className="w-full h-full object-contain"
                    />
                  </div>
                    <div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                        {{ pharmacy.pharmacyName }}
                      </h3>
                      <p v-if="pharmacy.items[0]?.branchName" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ pharmacy.items[0].branchName }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ pharmacy.items.length }} {{ pharmacy.items.length === 1 ? 'item' : 'items' }}
                      </p>
                    </div>
                </div>
                <button
                  @click="cartStore.clearPharmacyItems(pharmacy.pharmacyId)"
                  class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove all items from this pharmacy"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

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
                    <h4 class="mb-1 text-lg font-medium text-gray-900 dark:text-white truncate">
                      {{ item.medicationName }}
                    </h4>
                    <div class="mb-2 space-y-1">
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        <span v-if="item.brandName">{{ item.brandName }} • </span>
                        <span>{{ item.formName }}</span> • <span>{{ item.strength }} {{ item.uom }}</span>
                      </p>
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          v-if="item.requiresPrescription"
                          class="inline-flex items-center px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full dark:bg-orange-900 dark:text-orange-200"
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
                          GHS {{ ((item.discountPrice || item.price) * item.quantity).toFixed(2) }}
                        </div>
                        <div v-if="item.discountPrice && item.discountPrice < item.price" class="text-sm text-gray-500 line-through">
                          GHS {{ (item.price * item.quantity).toFixed(2) }}
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
                  GHS {{ pharmacy.subtotal.toFixed(2) }}
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
                <span>GHS {{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
              <div v-if="cartStore.discount > 0" class="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-GHS {{ cartStore.discount.toFixed(2) }}</span>
              </div>
              <div v-if="selectedPharmacies.size > 0" class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Selected Items</span>
                <span>GHS {{ selectedTotal.toFixed(2) }}</span>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span class="text-[#246BFD]">GHS {{ (selectedPharmacies.size > 0 ? selectedTotal : cartStore.total).toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <button
                @click="proceedToCheckout"
                :disabled="selectedPharmacies.size === 0"
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
  </div>
</template>

<style scoped>

</style>

