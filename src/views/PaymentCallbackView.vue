<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { paymentService } from '@/services/paymentService';
import { formatCurrency } from '@/utils/currency';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const loading = ref(true);
const paymentStatus = ref<'success' | 'failed' | 'cancelled'>('success');
const transactionReference = ref('');
const orderId = ref('');
const orders = ref<any[]>([]);
const isBulk = ref(false);
const message = ref('');

const statusConfig = computed(() => {
  if (paymentStatus.value === 'success') {
    return {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      title: 'Payment Successful!',
      subtitle: 'Your order has been confirmed',
      buttonText: isBulk.value ? 'View All Paid Orders' : 'View Order Detail',
      buttonAction: () => {
        if (isBulk.value) {
          // Stay here or scroll to list
        } else {
          router.push({ name: 'order-detail', params: { id: orderId.value } });
        }
      }
    };
  } else if (paymentStatus.value === 'failed') {
    return {
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      title: 'Payment Failed',
      subtitle: 'We couldn\'t process your payment',
      buttonText: 'Try Again',
      buttonAction: () => router.push({ name: 'checkout' })
    };
  } else {
    return {
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      title: 'Payment Cancelled',
      subtitle: 'You cancelled the payment',
      buttonText: 'Return to Cart',
      buttonAction: () => router.push({ name: 'cart' })
    };
  }
});

const verifyPayment = async (ref: string) => {
  try {
    const response = await paymentService.verifyPayment(ref);
    // Flexible check: verify status is success or response is valid
    // If response is null/undefined (e.g. 204), we might need to handle it or retry
    if (response && (response.status === 'success' || (response as any).message === 'Verification successful')) {
      paymentStatus.value = 'success';
      message.value = 'Your payment was processed successfully. We\'ve sent a confirmation email.';
      
      orders.value = (response as any).orders || [];
      isBulk.value = (response as any).is_bulk || false;
      
      if (orders.value.length > 0) {
        orderId.value = orders.value[0].id;
      } else {
        orderId.value = (response as any).order_id || (response as any).orderId || (response as any).order?.id || ref;
      }
      
      cartStore.clearCart();
    } else if (!response) {
      paymentStatus.value = 'success';
      message.value = 'Payment confirmed. Your order is being processed.';
      orderId.value = ref;
      cartStore.clearCart();
    } else {
      paymentStatus.value = 'failed';
      message.value = 'Payment verification failed. Please check your transaction details.';
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    paymentStatus.value = 'failed';
    message.value = 'Unable to verify payment status. Please contact support if you were debited.';
  }
};

onMounted(async () => {
  const reference = route.query.reference as string;
  const status = route.query.status as string; // Sometimes explicitly passed
  // const orderIdParam = route.query.orderId as string; // Redundant if we verify

  if (reference) {
    transactionReference.value = reference;
    await verifyPayment(reference);
  } else if (status === 'failed') {
    paymentStatus.value = 'failed';
    message.value = 'Payment processing failed. Please try again.';
  } else {
    // Fallback if no ref and no explicit status (e.g. manual nav)
    // But usually paystack sends reference
    if (route.query.trxref) { // Paystack legacy param
       transactionReference.value = route.query.trxref as string;
       await verifyPayment(route.query.trxref as string);
    } else {
      loading.value = false; // Stop loading if nothing to do
      paymentStatus.value = 'failed'; 
      message.value = 'Invalid payment callback details.';
    }
  }
  
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8">
      <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-[#246BFD] mx-auto mb-4"></div>
          <p class="text-lg font-medium text-gray-900 dark:text-white">Verifying payment...</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait while we confirm your transaction</p>
        </div>
      </div>

      <div v-else class="text-center">
        <div class="mb-8">
          <div :class="[
            'w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6',
            statusConfig.iconBg
          ]">
            <svg :class="['w-12 h-12', statusConfig.iconColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusConfig.icon"></path>
            </svg>
          </div>

          <h1 class="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
            {{ statusConfig.title }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-2">
            {{ statusConfig.subtitle }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ message }}
          </p>
        </div>

        <div v-if="transactionReference" class="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div class="grid grid-cols-1 gap-4" :class="orderId && !isBulk ? 'md:grid-cols-2' : ''">
            <div class="text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction Reference</p>
              <p class="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">
                {{ transactionReference }}
              </p>
            </div>
            <div v-if="orderId && !isBulk" class="text-left">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Order ID</p>
              <p class="font-mono text-sm font-medium text-gray-900 dark:text-white">
                {{ orderId }}
              </p>
            </div>
          </div>
        </div>

        <!-- Orders List for Bulk Payment -->
        <div v-if="isBulk && orders.length > 0" class="mb-10 text-left">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2 uppercase tracking-wider">Paid Orders</h2>
          <div class="space-y-4">
            <div v-for="order in orders" :key="order.id" 
                 @click="router.push({ name: 'order-detail', params: { id: order.id } })"
                 class="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#246BFD] transition-all cursor-pointer flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div v-if="order.pharmacy?.logo" class="w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white p-1">
                  <img :src="order.pharmacy.logo" :alt="order.pharmacy.name" class="w-full h-full object-contain" />
                </div>
                <div v-else class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#246BFD]">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-gray-900 dark:text-white">Order #{{ order.order_number }}</p>
                  <p class="text-sm text-gray-500">{{ order.pharmacy?.name }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-lg font-bold text-[#246BFD]">{{ formatCurrency(order.total) }}</span>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-[#246BFD] transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            @click="statusConfig.buttonAction"
            class="px-8 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
          >
            {{ statusConfig.buttonText }}
          </button>
          <button
            v-if="paymentStatus === 'success'"
            @click="router.push({ name: 'orders' })"
            class="px-8 py-3 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
          >
            View All Orders
          </button>
          <button
            v-else
            @click="router.push({ name: 'home' })"
            class="px-8 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-[#246BFD] hover:text-[#246BFD] transition-all duration-300"
          >
            Go Home
          </button>
        </div>

        <div v-if="paymentStatus === 'success'" class="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-sm text-blue-800 dark:text-blue-200">
              <p class="font-medium mb-1">What's next?</p>
              <ul class="space-y-1 list-disc list-inside">
                <li>The pharmacy will process your order</li>
                <li>You'll receive updates via email and SMS</li>
                <li>Track your order status in "My Orders"</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-else-if="paymentStatus === 'failed'" class="mt-12 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
            <div class="text-sm text-red-800 dark:text-red-200">
              <p class="font-medium mb-1">Need help?</p>
              <ul class="space-y-1 list-disc list-inside">
                <li>Check if you have sufficient funds</li>
                <li>Try a different payment method</li>
                <li>Contact your bank if issue persists</li>
                <li>Reach out to our support team</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

