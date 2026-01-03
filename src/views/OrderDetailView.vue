<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { reviewService } from '@/services/reviewService';
import type { Order } from '@/models/Order';
import LazyImage from '@/components/LazyImage.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';
import { orderService } from '@/services/orderService';
import { paymentService, type Transaction } from '@/services/paymentService';

const route = useRoute();
const router = useRouter();
const notification = useNotification();

const payNow = async () => {
  if (!order.value || order.value.paymentStatus !== 'pending') return;
  
  try {
    loading.value = true;
    const response = await paymentService.initializePayment(order.value.id);
    if (response && response.authorization_url) {
      window.location.href = response.authorization_url;
    } else {
      notification.error('Payment Error', 'Could not initialize payment. Please try again.');
    }
  } catch (err) {
    console.error('Error initializing payment:', err);
    notification.error('Payment Error', 'Failed to initialize payment.');
  } finally {
    loading.value = false;
  }
};

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

const statusColors: Record<string, string> = {
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
  if (!order.value || !cancellationReason.value.trim()) return;

  try {
    await orderService.cancelOrder(order.value.id, cancellationReason.value);
    notification.success('Order Cancelled', 'Your order has been cancelled successfully.');
    showCancelModal.value = false;
    await loadOrder();
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
  if (!order.value) return;
  // If we have a transaction, use its ID (preferred). If not, pass the Order ID and let ReceiptView handle it.
  const routeId = transaction.value ? transaction.value.id : order.value.id;
  router.push({ name: 'receipt', params: { id: routeId } });
};

const handleAddReview = async (reviewData: { rating: number; title: string; comment: string }) => {
  if (!order.value) return;
  
  try {
    await reviewService.addReview({
      reviewable_type: 'pharmacy',
      reviewable_id: order.value.pharmacyId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      order_id: parseInt(order.value.id) || undefined,
    });
    
    showAddReviewModal.value = false;
    notification.success('Review Submitted', 'Thank you for your feedback!');
  } catch (error) {
    notification.error('Submission Failed', 'Failed to submit review. Please try again.');
  }
};



const loadOrder = async () => {
  loading.value = true;
  try {
    const orderId = route.params.id as string;
    order.value = await orderService.getOrder(orderId);
    
    if (order.value) {
      try {
        const transactions = await paymentService.getTransactions();
        // Use loose comparison to ensure match (api might return number vs string)
        const transactionData = transactions.find(t => String(t.order_id) === String(orderId));
        if (transactionData) {
          transaction.value = transactionData;
        } else {
          console.warn(`Transaction not found for order ${orderId} in ${transactions.length} transactions`);
        }
      } catch (err) {
        console.error('Error loading transaction:', err);
      }
    } else {
      router.push({ name: 'orders' });
    }
  } catch (err) {
    console.error('Error loading order:', err);
    notification.error('Error', 'Failed to load order details');
    router.push({ name: 'orders' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrder();
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

        <!-- Pharmacy & Order Header -->
        <div class="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
          <!-- Decorative Background -->
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/20 dark:to-purple-900/20"></div>
          <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div class="relative p-6 sm:p-8">
            <div class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div class="flex items-center gap-5">
                <!-- Pharmacy Logo/Image -->
                <div class="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-gray-700 bg-white">
                  <LazyImage 
                    :src="order.pharmacyImage || ''" 
                    alt="Pharmacy Logo"
                    class="w-full h-full object-cover"
                    fallback="https://ui-avatars.com/api/?name=Rx&background=246BFD&color=fff"
                  />
                </div>
                
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ order.pharmacyName }}</h1>
                    <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {{ order.branchName || 'Main Branch' }}
                    </span>
                  </div>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      {{ order.pharmacyAddress }}
                    </span>
                    <span class="hidden sm:inline w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      {{ order.pharmacyPhone }}
                    </span>
                  </div>
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-500 font-mono">Order #{{ order.orderNumber }}</p>
                </div>
              </div>

              <!-- Status Badge -->
               <div class="flex items-center gap-3">
                <span :class="['px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm border', statusColors[order.status]]">
                  {{ order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </span>
               </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Tracking Timeline -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Timeline Card -->
            <div class="p-8 bg-white shadow-lg dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <h2 class="mb-8 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Order Timeline
              </h2>

              <div class="relative pl-4">
                 <!-- Vertical Line -->
                <div class="absolute left-[27px] top-2 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                <!-- Iterate over status history (reversed to show latest first? No, usually oldest first for timeline). 
                     But providing descending often looks better for "What just happened".
                     Let's stick to chronological order (API likely provides chronological, but user showed chronological).
                -->
                <div v-if="order.statusHistory && order.statusHistory.length > 0" class="space-y-8">
                  <div v-for="(history, index) in order.statusHistory" :key="index" class="relative flex gap-6 group">
                     <!-- Dot -->
                    <div class="relative z-10 flex items-center justify-center w-14 h-14 rounded-2xl border-4 border-white dark:border-gray-800 shadow-md transition-transform group-hover:scale-110"
                      :class="statusColors[history.status]?.replace('bg-', 'bg-').replace('text-', 'text-') || 'bg-gray-100 text-gray-600'">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <!-- Simple mapping for icons based on status key -->
                        <path v-if="history.status === 'pending'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        <path v-else-if="history.status === 'confirmed'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        <path v-else-if="history.status === 'processing'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        <path v-else-if="history.status === 'ready'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                         <path v-else-if="history.status === 'out_for_delivery'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                        <path v-else-if="history.status === 'completed'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>

                    <div class="flex-1 py-1">
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white capitalize">
                          {{ history.status.replace(/_/g, ' ') }}
                        </h3>
                        <span class="text-xs font-semibold px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                           {{ formatDate(history.timestamp) }}
                        </span>
                      </div>
                      <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {{ history.note || 'Status updated' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Fallback to static steps if no history (should not happen with new API but for safety) -->
                <div v-else class="text-center py-8 text-gray-500">
                  No tracking history available.
                </div>
              </div>
            </div>


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
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Delivery Information</h2>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="order.deliveryMethod === 'pickup' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
                    : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  {{ order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery' }}
                </span>
              </div>
              
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
                  <div class="flex justify-between text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <span>Total</span>
                    <span class="text-[#246BFD]">GHS {{ order.total.toFixed(2) }}</span>
                  </div>
                  
                  <button 
                    v-if="order.paymentMethod === 'platform' && order.paymentStatus === 'pending'"
                    @click="payNow"
                    class="w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Secure Checkout</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</p>
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                    :class="order.paymentMethod === 'platform' && order.paymentStatus === 'paid'
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                      : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    {{ order.paymentMethod === 'platform' ? 'Paid Online' : 'Pay at Pharmacy' }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                    :class="{
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800': order.paymentStatus === 'paid',
                      'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800': order.paymentStatus === 'pending',
                      'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800': order.paymentStatus === 'failed',
                       'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600': order.paymentStatus === 'refunded'
                    }">
                     {{ order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pharmacy Details</h3>
              
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Pharmacy</p>
                  <p class="text-base font-medium text-gray-900 dark:text-white mb-2">{{ order.pharmacyName }}</p>
                  
                  <template v-if="order.branchName">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Branch</p>
                    <p class="text-base font-medium text-gray-900 dark:text-white mb-2">{{ order.branchName }}</p>
                  </template>

                  <p class="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p class="text-sm text-gray-900 dark:text-white mb-2">{{ order.pharmacyAddress }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Contact</p>
                  <a
                    :href="`tel:${order.pharmacyPhone}`"
                    class="flex items-center gap-2 text-sm font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors"
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

