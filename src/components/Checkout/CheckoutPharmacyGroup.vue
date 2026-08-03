<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/store/settings';
import LazyImage from '@/components/LazyImage.vue';
import type { useCheckout } from '@/composables/useCheckout';
import type { CartPharmacyGroup } from '@/models/Cart';
import { formatCurrency } from '@/utils/currency';

const props = defineProps<{
  checkout: ReturnType<typeof useCheckout>;
  pharmacy: CartPharmacyGroup;
}>();

const settingsStore = useSettingsStore();

const groupKey = computed(() => props.pharmacy.pharmacyBranchId || props.pharmacy.pharmacyId);
const pharmacyId = computed(() => props.pharmacy.pharmacyId);
</script>

<template>
  <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700/50 gap-4">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 p-1.5 overflow-hidden bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600">
          <LazyImage
            :src="pharmacy.pharmacyLogo || '/images/pharmacies/default-pharmacy.jpg'"
            :alt="pharmacy.pharmacyName"
            aspectRatio="square"
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white">{{ pharmacy.pharmacyName }}</h3>
          <p v-if="pharmacy.branchName" class="text-sm font-semibold text-[#246BFD] mt-0.5">{{ pharmacy.branchName }}</p>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Processing {{ pharmacy.items.length }} {{ pharmacy.items.length === 1 ? 'Product' : 'Products' }}
          </p>
        </div>
      </div>
      <div class="w-full sm:w-auto p-4 sm:p-0 bg-blue-50/50 dark:bg-[#246BFD]/5 rounded-2xl sm:bg-transparent border border-blue-100/50 sm:border-0 text-center sm:text-right">
        <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Order Subtotal</p>
        <p class="text-2xl font-black text-[#246BFD]">{{ formatCurrency(pharmacy.subtotal) }}</p>
      </div>
    </div>

    <div class="mb-6 space-y-3">
      <div
        v-for="item in pharmacy.items"
        :key="item.id"
        class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
      >
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
            <LazyImage
              v-if="item.image"
              :src="item.image"
              :alt="item.medicationName"
              aspectRatio="square"
              className="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">{{ item.medicationName }}</p>
            <div class="flex items-center gap-3">
              <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                QTY: {{ item.quantity }}
              </span>
              <span class="text-xs font-medium text-gray-500">
                @ {{ formatCurrency(item.discountPrice || item.price) }}
              </span>
            </div>
          </div>
        </div>
        <span class="text-sm font-medium text-gray-900 dark:text-white">
          {{ formatCurrency((item.discountPrice || item.price) * item.quantity) }}
        </span>
      </div>
    </div>

    <!-- Delivery Option Selector -->
    <div class="mb-6">
      <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        Delivery Option
      </label>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
        <button
          @click="checkout.deliveryMethods.value.set(groupKey, 'pickup')"
          :class="[
            'p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
            checkout.deliveryMethods.value.get(groupKey) === 'pickup'
              ? 'border-[#246BFD] bg-[#246BFD]/5 text-[#246BFD]'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Store Pickup
        </button>
        <div class="relative group">
          <button
            :disabled="!checkout.branchSupportsDelivery(pharmacy)"
            @click="() => { if (checkout.branchSupportsDelivery(pharmacy)) { checkout.deliveryMethods.value.set(groupKey, 'delivery'); checkout.fetchDeliveryOptions(pharmacyId); } }"
            :class="[
              'w-full p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
              !checkout.branchSupportsDelivery(pharmacy)
                ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400'
                : checkout.deliveryMethods.value.get(groupKey) === 'delivery'
                  ? 'border-[#246BFD] bg-[#246BFD]/5 text-[#246BFD]'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
            Home Delivery
          </button>
          <div v-if="!checkout.branchSupportsDelivery(pharmacy)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
            Delivery requires online payment. This branch only accepts cash/POS.
            <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        </div>
      </div>

      <!-- Delivery Provider Sub-selection -->
      <div
        v-if="checkout.deliveryMethods.value.get(groupKey) === 'delivery'"
        class="mt-1"
      >
        <label class="block mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Delivered by
        </label>

        <!-- Loading skeleton -->
        <div v-if="checkout.loadingDeliveryOptions.value.get(pharmacyId)" class="flex gap-3">
          <div class="flex-1 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
          <div class="flex-1 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
        </div>

        <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <!-- FyndRx Platform Delivery -->
          <button
            :disabled="!checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.available"
            @click="checkout.deliveryProviders.value.set(groupKey, 'fyndrx')"
            :class="[
              'p-4 rounded-xl border-2 text-left transition-all relative',
              !checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.available
                ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
                : checkout.deliveryProviders.value.get(groupKey) === 'fyndrx'
                  ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40 dark:hover:border-[#246BFD]/40'
            ]"
          >
            <div class="flex items-start gap-3">
              <div class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-[#246BFD]/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">FyndRx Delivery</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform logistics</p>
                <template v-if="checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.available">
                  <p class="text-sm font-bold text-[#246BFD] mt-1">
                    GHS {{ checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.fee?.toFixed(2) ?? '—' }}
                  </p>
                </template>
                <template v-else>
                  <p class="text-xs text-red-500 dark:text-red-400 mt-1">
                    {{ checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.unavailableReason ?? 'Not available' }}
                  </p>
                </template>
              </div>
              <div
                v-if="checkout.deliveryProviders.value.get(groupKey) === 'fyndrx'"
                class="flex-shrink-0 w-5 h-5 rounded-full bg-[#246BFD] flex items-center justify-center"
              >
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
            </div>
          </button>

          <!-- Pharmacy Self-delivery -->
          <button
            :disabled="!checkout.deliveryOptionsCache.value.get(pharmacyId)?.pharmacyDelivery.available"
            @click="checkout.deliveryProviders.value.set(groupKey, 'pharmacy')"
            :class="[
              'p-4 rounded-xl border-2 text-left transition-all relative',
              !checkout.deliveryOptionsCache.value.get(pharmacyId)?.pharmacyDelivery.available
                ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
                : checkout.deliveryProviders.value.get(groupKey) === 'pharmacy'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
            ]"
          >
            <div class="flex items-start gap-3">
              <div class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">Pharmacy Delivery</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Delivered by pharmacy staff</p>
                <template v-if="checkout.deliveryOptionsCache.value.get(pharmacyId)?.pharmacyDelivery.available">
                  <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    GHS {{ checkout.deliveryOptionsCache.value.get(pharmacyId)?.pharmacyDelivery.fee?.toFixed(2) ?? '—' }}
                  </p>
                </template>
                <template v-else>
                  <p class="text-xs text-red-500 dark:text-red-400 mt-1">
                    {{ checkout.deliveryOptionsCache.value.get(pharmacyId)?.pharmacyDelivery.unavailableReason ?? 'Not available' }}
                  </p>
                </template>
              </div>
              <div
                v-if="checkout.deliveryProviders.value.get(groupKey) === 'pharmacy'"
                class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Distance info -->
        <p
          v-if="checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.distanceKm !== null && checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.distanceKm !== undefined"
          class="mt-2 text-xs text-gray-400 dark:text-gray-500"
        >
          ~{{ checkout.deliveryOptionsCache.value.get(pharmacyId)?.fyndrxDelivery.distanceKm?.toFixed(1) }} km from pharmacy
        </p>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="mb-6">
      <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        Payment Method
      </label>

      <!-- Global payment method disabled notices -->
      <div v-if="!settingsStore.onlinePaymentEnabled" class="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 text-xs text-amber-800 dark:text-amber-300">
        <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span v-if="!settingsStore.offlinePaymentEnabled">
          All payment methods are currently suspended platform-wide. Please try again later.
        </span>
        <span v-else>
          Online payment is temporarily unavailable platform-wide. Only cash/POS accepted at this time.
        </span>
      </div>
      <div v-else-if="settingsStore.paystackGatewayDown" class="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 text-xs text-amber-800 dark:text-amber-300">
        <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>Online payments (Paystack) are temporarily unavailable. Please choose Pay at Pharmacy instead.</span>
      </div>

      <!-- Selectable methods -->
      <template v-if="checkout.effectivePaymentMethods(pharmacy).length > 1">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            @click="checkout.paymentMethods.value.set(groupKey, 'platform')"
            :class="[
              'p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
              checkout.paymentMethods.value.get(groupKey) === 'platform'
                ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">Pay Online</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Secure payment through our platform</p>
              </div>
              <div v-if="checkout.paymentMethods.value.get(groupKey) === 'platform'" class="flex-shrink-0 w-5 h-5 rounded-full bg-[#246BFD] flex items-center justify-center mt-0.5">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
            </div>
          </button>

          <button
            @click="checkout.paymentMethods.value.set(groupKey, 'direct')"
            :class="[
              'p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
              checkout.paymentMethods.value.get(groupKey) === 'direct'
                ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">Pay at Pharmacy</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Pay when you {{ checkout.deliveryMethods.value.get(groupKey) === 'pickup' ? 'pick up' : 'receive' }} your order</p>
              </div>
              <div v-if="checkout.paymentMethods.value.get(groupKey) === 'direct'" class="flex-shrink-0 w-5 h-5 rounded-full bg-[#246BFD] flex items-center justify-center mt-0.5">
                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- Only online available -->
      <template v-else-if="checkout.effectivePaymentMethods(pharmacy)[0] === 'platform'">
        <div class="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-700/40">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-blue-900 dark:text-blue-200">Online Payment Only</p>
            <p class="text-xs text-blue-700 dark:text-blue-400">Processed securely online</p>
          </div>
        </div>
      </template>

      <!-- Only offline available -->
      <template v-else-if="checkout.effectivePaymentMethods(pharmacy)[0] === 'direct'">
        <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
          <div class="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 dark:text-white">Pay at Pharmacy Only</p>
            <p class="text-xs text-gray-600 dark:text-gray-400">Payment collected at the counter</p>
          </div>
        </div>
      </template>

      <!-- No payment methods available (all disabled) -->
      <template v-else>
        <div class="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="text-sm font-bold text-red-800 dark:text-red-300">Checkout Unavailable</p>
            <p class="text-xs text-red-600 dark:text-red-400">No payment methods are currently available for this branch.</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Prescription Upload -->
    <div v-if="checkout.needsPrescription(pharmacyId)" class="mb-6 p-5 rounded-xl border-2 transition-all"
      :class="[
        checkout.deliveryMethods.value.get(groupKey) === 'delivery' 
          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
      ]">
      <div class="flex items-start space-x-3 mb-4">
        <svg v-if="checkout.deliveryMethods.value.get(groupKey) === 'delivery'" class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <svg v-else class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-semibold" :class="checkout.deliveryMethods.value.get(groupKey) === 'delivery' ? 'text-orange-800 dark:text-orange-200' : 'text-blue-800 dark:text-blue-200'">
              Prescription {{ checkout.deliveryMethods.value.get(groupKey) === 'delivery' ? 'Required' : 'Optional' }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="!checkout.prescriptionFiles.value.has(pharmacyId)" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Prescription (PDF, JPG, PNG - Max 5MB)
        </label>
        <div class="relative">
          <input
            :id="`prescription-${pharmacyId}`"
            type="file"
            @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if(f) checkout.handlePrescriptionUpload(pharmacyId, f); }"
            accept=".pdf,.jpg,.jpeg,.png"
            class="hidden"
          />
          <label
            :for="`prescription-${pharmacyId}`"
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
            :class="checkout.deliveryMethods.value.get(groupKey) === 'delivery' 
              ? 'border-orange-300 dark:border-orange-600' 
              : 'border-blue-300 dark:border-blue-600'"
          >
            <svg class="w-10 h-10 mb-2" :class="checkout.deliveryMethods.value.get(groupKey) === 'delivery' ? 'text-orange-400' : 'text-blue-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click to upload or drag and drop
            </p>
          </label>
        </div>
      </div>

      <div v-else class="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3 flex-1">
            <div v-if="checkout.prescriptionPreviews.value.get(pharmacyId) !== 'pdf'" class="flex-shrink-0">
              <img 
                :src="checkout.prescriptionPreviews.value.get(pharmacyId)" 
                alt="Prescription preview" 
                class="w-20 h-20 rounded-lg object-cover border-2 border-green-500"
              />
            </div>
            <div v-else class="flex-shrink-0 w-20 h-20 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center border-2 border-green-500">
              <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <p class="text-sm font-semibold text-green-700 dark:text-green-400">Prescription Uploaded</p>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ checkout.prescriptionFiles.value.get(pharmacyId)?.name }}</p>
            </div>
          </div>
          <button @click="checkout.removePrescription(pharmacyId)" class="flex-shrink-0 ml-3 text-red-600">
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
