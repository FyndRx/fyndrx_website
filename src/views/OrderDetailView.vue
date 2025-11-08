<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { reviewService } from '@/services/reviewService';
import type { Order } from '@/models/Order';
import type { Transaction } from '@/models/Payment';
import LazyImage from '@/components/LazyImage.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';
import ordersDataJson from '@/data/orders.json';
import transactionsDataJson from '@/data/transactions.json';

const route = useRoute();
const router = useRouter();
const notification = useNotification();

const order = ref<Order | null>(null);
const transaction = ref<Transaction | null>(null);
const loading = ref(true);
const showCancelModal = ref(false);
const cancellationReason = ref('');
const showAddReviewModal = ref(false);

const hasReceipt = computed(() => {
  return order.value?.paymentMethod === 'platform' && order.value?.paymentStatus === 'paid';
});

const canReview = computed(() => {
  return order.value?.status === 'completed';
});

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'confirmed', label: 'Confirmed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'processing', label: 'Processing', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { key: 'ready', label: 'Ready', icon: 'M5 13l4 4L19 7' },
  { key: 'completed', label: 'Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
];

const deliveryStatusSteps = [
  { key: 'pending', label: 'Order Placed', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'confirmed', label: 'Confirmed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'processing', label: 'Processing', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  { key: 'completed', label: 'Delivered', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
];

const currentSteps = computed(() => {
  return order.value?.deliveryMethod === 'delivery' ? deliveryStatusSteps : statusSteps;
});

const currentStepIndex = computed(() => {
  if (!order.value) return 0;
  if (order.value.status === 'cancelled') return -1;
  return currentSteps.value.findIndex(step => step.key === order.value!.status);
});

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-200',
  confirmed: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-200',
  processing: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-200',
  ready: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-200',
  out_for_delivery: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-200',
  completed: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200',
  cancelled: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-200'
};

const canCancel = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status);
});

const handleCancelOrder = async () => {
  if (!order.value) return;

  try {
    notification.success('Order Cancelled', 'Your order has been cancelled successfully.');
    showCancelModal.value = false;
    router.push({ name: 'orders' });
  } catch (error) {
    notification.error('Cancellation Failed', 'Failed to cancel order. Please try again.');
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const viewReceipt = () => {
  if (!transaction.value) return;
  router.push({ name: 'receipt', params: { id: transaction.value.id } });
};

const handleAddReview = async (reviewData: { rating: number; title: string; comment: string }) => {
  if (!order.value) return;
  
  try {
    await reviewService.addReview({
      targetType: 'pharmacy',
      targetId: String(order.value.pharmacyId),
      targetName: order.value.pharmacyName,
      orderId: order.value.id,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
    });
    
    notification.success('Review Submitted', 'Thank you for your feedback!');
  } catch (error) {
    notification.error('Submission Failed', 'Failed to submit review. Please try again.');
  }
};

onMounted(() => {
  const orderId = route.params.id as string;
  const ordersData = ordersDataJson as unknown as Order[];
  const transactionsData = transactionsDataJson as unknown as Transaction[];
  
  console.log('Order ID:', orderId);
  console.log('Orders Data:', ordersData);
  console.log('Found Order:', ordersData.find(o => o.id === orderId));
  
  const orderData = ordersData.find(o => o.id === orderId);
  
  if (orderData) {
    order.value = orderData;
    
    const transactionData = transactionsData.find(t => t.orderId === orderId);
    if (transactionData) {
      transaction.value = transactionData;
    }
  } else {
    router.push({ name: 'orders' });
  }
  
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading order details...</p>
      </div>

      <div v-else-if="order" class="space-y-6">
        <div class="flex items-center justify-between">
          <button
            @click="router.push({ name: 'orders' })"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#246BFD] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Orders
          </button>
        </div>

        <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {{ order.orderNumber }}
              </h1>
              <p class="text-gray-600 dark:text-gray-400">Placed on {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'px-4 py-2 text-sm font-semibold rounded-full',
                  statusColors[order.status]
                ]"
              >
                {{ order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="order.status !== 'cancelled'" class="p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <h2 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Order Tracking</h2>
          
          <div class="relative">
            <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            <div class="space-y-8">
              <div
                v-for="(step, index) in currentSteps"
                :key="step.key"
                class="relative flex items-start gap-4"
              >
                <div
                  :class="[
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    index <= currentStepIndex
                      ? 'bg-[#246BFD] border-[#246BFD]'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  ]"
                >
                  <svg
                    class="w-4 h-4"
                    :class="index <= currentStepIndex ? 'text-white' : 'text-gray-400'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    v-html="step.icon"
                  ></svg>
                </div>
                
                <div class="flex-1 pb-8">
                  <p
                    :class="[
                      'font-medium',
                      index <= currentStepIndex ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    {{ step.label }}
                  </p>
                  <p v-if="index <= currentStepIndex" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ index === currentStepIndex ? 'In Progress' : 'Completed' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="font-semibold text-red-800 dark:text-red-200">Order Cancelled</p>
              <p class="text-sm text-red-700 dark:text-red-300 mt-1">
                This order was cancelled on {{ formatDate(order.cancelledAt || order.updatedAt) }}
              </p>
              <p v-if="order.cancellationReason" class="text-sm text-red-600 dark:text-red-400 mt-2">
                Reason: {{ order.cancellationReason }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-6">
            <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Order Items</h2>
              
              <div class="space-y-4">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div class="flex-shrink-0 w-20 h-20 overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
                    <LazyImage
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.medicationName"
                      aspectRatio="square"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div class="flex-1">
                    <h4 class="mb-1 font-medium text-gray-900 dark:text-white">
                      {{ item.medicationName }}
                    </h4>
                    <div class="mb-2 space-y-1">
                      <p v-if="item.brandName" class="text-sm text-gray-600 dark:text-gray-400">
                        Brand: {{ item.brandName }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ item.formName }} • {{ item.strength }} • {{ item.uom }}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {{ item.quantity }}
                      </p>
                    </div>
                  </div>

                  <div class="text-right">
                    <p class="font-medium text-gray-900 dark:text-white">
                      GHS {{ ((item.discountPrice || item.price) * item.quantity).toFixed(2) }}
                    </p>
                    <p v-if="item.discountPrice" class="text-sm text-gray-500 line-through">
                      GHS {{ (item.price * item.quantity).toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <h2 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Delivery Information</h2>
              
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ order.deliveryMethod === 'pickup' ? 'Pickup Location' : 'Delivery Address' }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ order.deliveryMethod === 'pickup' ? order.pharmacyAddress : order.deliveryAddress }}
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ order.phoneNumber }}</p>
                  </div>
                </div>

                <div v-if="order.notes" class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ order.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Order Summary</h3>
              
              <div class="space-y-3 mb-4">
                <div class="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>GHS {{ order.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span>GHS {{ order.deliveryFee.toFixed(2) }}</span>
                </div>
                <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span class="text-[#246BFD]">GHS {{ order.total.toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ order.paymentMethod === 'platform' ? 'Paid Online' : 'Pay at Pharmacy' }}
                </p>
                <p class="mt-1 text-xs" :class="order.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
                  {{ order.paymentStatus === 'paid' ? '✓ Paid' : 'Payment Pending' }}
                </p>
              </div>
            </div>

            <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pharmacy Details</h3>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ order.pharmacyName }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ order.pharmacyAddress }}</p>
                </div>
                <div>
                  <a
                    :href="`tel:${order.pharmacyPhone}`"
                    class="flex items-center gap-2 text-sm text-[#246BFD] hover:text-[#5089FF] transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    {{ order.pharmacyPhone }}
                  </a>
                </div>
              </div>
            </div>

            <div v-if="hasReceipt" class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <button
                @click="viewReceipt"
                class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                View Receipt
              </button>
            </div>

            <div v-if="canReview" class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <button
                @click="showAddReviewModal = true"
                class="w-full px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] border-2 border-[#246BFD] font-medium hover:bg-[#246BFD] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                Leave a Review
              </button>
            </div>

            <div v-if="canCancel" class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <button
                @click="showCancelModal = true"
                class="w-full px-6 py-3 rounded-full border-2 border-red-500 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showCancelModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="showCancelModal = false"
    >
      <div class="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl">
        <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Cancel Order</h3>
        
        <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to cancel this order? This action cannot be undone.
        </p>

        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason for Cancellation (Optional)
          </label>
          <textarea
            v-model="cancellationReason"
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
            placeholder="Let us know why you're cancelling..."
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            @click="showCancelModal = false"
            class="flex-1 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Keep Order
          </button>
          <button
            @click="handleCancelOrder"
            class="flex-1 px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>

    <AddReviewModal
      :show="showAddReviewModal"
      :target-type="'pharmacy'"
      :target-id="order ? String(order.pharmacyId) : ''"
      :target-name="order ? order.pharmacyName : ''"
      :order-id="order ? order.id : undefined"
      @close="showAddReviewModal = false"
      @submit="handleAddReview"
    />
  </div>
</template>

<style scoped>

</style>

