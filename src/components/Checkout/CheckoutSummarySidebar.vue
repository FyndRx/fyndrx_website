<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import { formatCurrency } from '@/utils/currency';
import type { useCheckout } from '@/composables/useCheckout';

defineProps<{
  checkout: ReturnType<typeof useCheckout>;
}>();

const settingsStore = useSettingsStore();
</script>

<template>
  <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
    <h2 class="mb-6 text-xl font-medium text-gray-900 dark:text-white">Order Summary</h2>
    
    <div class="space-y-4 mb-6">
      <div class="flex justify-between text-gray-600 dark:text-gray-300">
        <span>Subtotal</span>
        <span>{{ formatCurrency(checkout.totalAmount.value) }}</span>
      </div>
      <div class="flex justify-between text-gray-600 dark:text-gray-300">
        <span>Delivery Fee</span>
        <span v-if="checkout.deliveryFee.value > 0">{{ formatCurrency(checkout.deliveryFee.value) }}</span>
        <span v-else-if="checkout.showDeliveryAddressInput.value" class="text-xs text-gray-400 italic">Calculating…</span>
        <span v-else class="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
      </div>
      <div v-if="settingsStore.taxEnabled" class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Incl. {{ settingsStore.taxLabel }}</span>
        <span>~{{ formatCurrency(checkout.estimatedTaxFor()) }}</span>
      </div>
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
          <span>Total</span>
          <span class="text-[#246BFD]">{{ formatCurrency(checkout.grandTotal.value) }}</span>
        </div>
      </div>
    </div>

    <button
      @click="checkout.placeAllOrders()"
      :disabled="checkout.loading.value || checkout.pharmaciesCheckout.value.length === 0 || checkout.pharmaciesCheckout.value.some(p => checkout.effectivePaymentMethods(p).length === 0)"
      class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span v-if="checkout.loading.value" class="flex items-center justify-center">
        <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing Orders...
      </span>
      <span v-else>
        Place All Orders
      </span>
    </button>

    <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
      <p class="text-sm text-gray-600 dark:text-gray-300">
        <strong>Note:</strong> You can review and pay for each order separately after placing them.
      </p>
    </div>
  </div>
</template>
