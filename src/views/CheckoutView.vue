<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCheckout } from '@/composables/useCheckout';
import { formatCurrency } from '@/utils/currency';
import LazyImage from '@/components/LazyImage.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';

// Sub-components
import CheckoutAddressDetails from '@/components/Checkout/CheckoutAddressDetails.vue';
import CheckoutPharmacyGroup from '@/components/Checkout/CheckoutPharmacyGroup.vue';
import CheckoutSummarySidebar from '@/components/Checkout/CheckoutSummarySidebar.vue';

const router = useRouter();
const checkout = useCheckout();

onMounted(async () => {
  await checkout.initializeData();
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Success State -->
      <div v-if="checkout.showSuccess.value" class="max-w-3xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Orders Placed Successfully!</h1>
          <p class="text-gray-600 dark:text-gray-300">
            We have received your orders. Detailed tracking information is available on your dashboard.
          </p>
        </div>

        <div class="space-y-6 text-left">
          <div v-if="checkout.selectableOrders.value.length > 1" class="flex justify-between items-center mb-6 px-2">
            <CustomCheckbox 
              :modelValue="checkout.isAllSelected.value" 
              @update:modelValue="checkout.toggleSelectAll()"
              label="Select all for online payment"
              size="medium"
              color="primary"
            />
          </div>

          <div v-for="order in checkout.createdOrders.value" :key="order.id" class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg relative overflow-hidden group">
            <!-- Selection Checkbox -->
            <div v-if="order.paymentMethod === 'platform' && order.paymentStatus === 'pending'" class="absolute top-6 right-6 z-10">
              <CustomCheckbox 
                v-model="checkout.selectedOrderIds.value"
                :value="order.id"
                size="large"
              />
            </div>

            <div class="flex items-start gap-4 mb-4 pr-10">
              <!-- Pharmacy Logo -->
              <div class="w-12 h-12 flex-shrink-0 bg-white rounded-full border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <LazyImage
                  :src="order.pharmacy?.logo || '/images/pharmacies/default-pharmacy.jpg'"
                  :alt="order.pharmacyName"
                  aspectRatio="square"
                  className="w-full h-full object-contain p-1 rounded-full"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-1">Order #{{ order.orderNumber }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {{ order.pharmacyName }}
                      <span v-if="order.branchName" class="text-gray-400">• {{ order.branchName }}</span>
                    </p>
                  </div>
                  <span :class="[
                    'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap',
                    order.paymentMethod === 'platform' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  ]">
                    {{ order.paymentMethod === 'platform' ? 'Pay Online' : 'Pay at Pharmacy' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-5 mt-2">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Total Amount</span>
              <span class="text-2xl font-black text-[#246BFD]">{{ formatCurrency(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Bulk Payment Summary -->
        <div v-if="checkout.selectedOrderIds.value.length > 1" class="mt-8 p-8 bg-gradient-to-br from-[#246BFD]/5 to-[#246BFD]/10 dark:from-[#246BFD]/10 dark:to-transparent rounded-3xl border-2 border-[#246BFD] border-dashed text-center shadow-xl shadow-blue-500/5">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-[#246BFD] text-white rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Pay for {{ checkout.selectedOrderIds.value.length }} Orders</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Process a single combined payment for all selected items</p>
          
          <div class="flex items-center justify-center gap-2 mb-8">
            <span class="text-gray-500 text-sm font-medium">Total:</span>
            <span class="text-4xl font-black text-[#246BFD]">{{ formatCurrency(checkout.selectedTotal.value) }}</span>
          </div>

          <button 
            @click="checkout.payNow(checkout.selectedOrderIds.value)"
            :disabled="checkout.bulkPaymentLoading.value"
            class="w-full sm:w-auto px-16 py-4 bg-[#246BFD] hover:bg-[#1a5ce5] text-white rounded-full font-bold shadow-2xl shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center mx-auto"
          >
            <span v-if="checkout.bulkPaymentLoading.value" class="flex items-center">
              <svg class="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
            <span v-else>Securely Pay All Selected</span>
          </button>
        </div>

        <!-- Individual Pay Now Button if only one selected or no selection -->
        <div v-else-if="checkout.selectedOrderIds.value.length === 1" class="mt-8">
           <button 
             @click="checkout.payNow(checkout.selectedOrderIds.value[0])"
             class="w-full sm:w-auto px-16 py-4 bg-[#246BFD] hover:bg-[#1a5ce5] text-white rounded-full font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center mx-auto"
           >
             Pay for Order #{{ checkout.createdOrders.value.find(o => o.id === checkout.selectedOrderIds.value[0])?.orderNumber }}
           </button>
        </div>

        <!-- Action Links -->
        <div class="mt-12 flex justify-center space-x-6">
          <button @click="router.push({ name: 'orders' })" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
            View My Orders
          </button>
          <button @click="router.push('/')" class="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-full hover:bg-gray-800 dark:hover:bg-gray-600 font-medium">
            Back to Home
          </button>
        </div>
      </div>

      <!-- Checkout Form -->
      <div v-else>
        <div class="mb-8">
          <h1 class="mb-2 text-3xl font-medium text-gray-900 dark:text-white">Checkout</h1>
          <p class="text-gray-600 dark:text-gray-300">Complete your order</p>
        </div>
  
        <div v-if="checkout.error.value" class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-red-800 dark:text-red-300">{{ checkout.error.value }}</span>
          </div>
        </div>
  
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-6">
            
            <CheckoutAddressDetails :checkout="checkout" />

            <!-- Pharmacies List -->
            <CheckoutPharmacyGroup
              v-for="pharmacy in checkout.pharmaciesCheckout.value"
              :key="pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId"
              :checkout="checkout"
              :pharmacy="pharmacy"
            />

          </div>
  
          <div class="lg:col-span-1 space-y-6">
            <CheckoutSummarySidebar :checkout="checkout" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
