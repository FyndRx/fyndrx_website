<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Order } from '@/models/Order';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const orders = ref<Order[]>([]);
const loading = ref(true);
const selectedFilter = ref<'all' | 'active' | 'completed' | 'cancelled'>('all');

const payNow = async (order: Order) => {
  if (!order || order.paymentStatus !== 'pending') return;
  
  try {
    loading.value = true;
    const response = await paymentService.initializePayment(order.id);
    if (response && response.authorization_url) {
      window.location.href = response.authorization_url;
    } else {
      console.error('No authorization URL in response');
    }
  } catch (err) {
    console.error('Error initializing payment:', err);
  } finally {
    loading.value = false;
  }
};

const statusColors = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-800' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800' },
  processing: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800' },
  ready: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800' },
  out_for_delivery: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-200 dark:border-indigo-800' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-600' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-800' }
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') return orders.value;
  if (selectedFilter.value === 'active') {
    return orders.value.filter(o => !['completed', 'cancelled'].includes(o.status));
  }
  if (selectedFilter.value === 'completed') {
    return orders.value.filter(o => o.status === 'completed');
  }
  if (selectedFilter.value === 'cancelled') {
    return orders.value.filter(o => o.status === 'cancelled');
  }
  return orders.value;
});

const viewOrder = (orderId: string) => {
  router.push({ name: 'order-detail', params: { id: orderId } });
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

const loadOrders = async () => {
  loading.value = true;
  try {
    const statusMap: Record<string, string | undefined> = {
      'all': undefined,
      'active': undefined,
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    
    const status = statusMap[selectedFilter.value];
    const allOrders = await orderService.getOrders({ status, per_page: 100 });
    
    if (selectedFilter.value === 'active') {
      orders.value = allOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
    } else {
      orders.value = allOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (err) {
    console.error('Error loading orders:', err);
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

watch(selectedFilter, () => {
  loadOrders();
});

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-medium text-gray-900 dark:text-white">Order History</h1>
        <p class="text-gray-600 dark:text-gray-300">Track and manage your orders</p>
      </div>

      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            @click="selectedFilter = 'all'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'all'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            All Orders ({{ orders.length }})
          </button>
          <button
            @click="selectedFilter = 'active'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'active'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Active ({{ orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length }})
          </button>
          <button
            @click="selectedFilter = 'completed'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'completed'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Completed ({{ orders.filter(o => o.status === 'completed').length }})
          </button>
          <button
            @click="selectedFilter = 'cancelled'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'cancelled'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Cancelled ({{ orders.filter(o => o.status === 'cancelled').length }})
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading orders...</p>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="py-16 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No orders found</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-300">You haven't placed any {{ selectedFilter !== 'all' ? selectedFilter : '' }} orders yet.</p>
        <router-link
          to="/medications"
          class="inline-block px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
        >
          Start Shopping
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          @click="viewOrder(order.id)"
          class="p-6 transition-all duration-300 bg-white cursor-pointer dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="flex-1">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ order.orderNumber }}
                    </h3>
                    <span
                      :class="[
                        'px-3 py-1 text-xs font-semibold rounded-full',
                        (statusColors[order.status] || statusColors.pending).bg,
                        (statusColors[order.status] || statusColors.pending).text
                      ]"
                    >
                      {{ statusLabels[order.status] || order.status }}
                    </span>
                  </div>
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ order.pharmacyName }}
                    <span v-if="order.branchName" class="text-gray-500">• {{ order.branchName }}</span>
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 mb-4">
                <div
                  v-for="item in order.items.slice(0, 3)"
                  :key="item.id"
                  class="flex items-center gap-2"
                >
                  <div class="w-10 h-10 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <LazyImage
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.medicationName"
                      aspectRatio="square"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-white">
                        {{ item.medicationName }}
                      </h4>
                      <div class="mt-1 space-y-0.5">
                        <p v-if="item.brandName" class="text-sm text-gray-600 dark:text-gray-400">
                          Brand: {{ item.brandName }}
                        </p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ item.formName }} • {{ item.strength }} • {{ item.uom }}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-500">
                        {{ item.quantity }} x GHS {{ item.price.toFixed(2) }}
                      </p>
                    </div>
                  </div>
                </div>
                <span v-if="order.items.length > 3" class="text-sm text-gray-500 dark:text-gray-400">
                  +{{ order.items.length - 3 }} more
                </span>
              </div>

              <div class="flex flex-wrap gap-2 text-sm mt-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="order.deliveryMethod === 'pickup' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
                    : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                  {{ order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery' }}
                </span>

                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="order.paymentMethod === 'platform' && order.paymentStatus === 'paid'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                    : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  {{ order.paymentMethod === 'platform' ? 'Paid Online' : 'Pay at Pharmacy' }}
                </span>

                <span v-if="order.prescriptionUploaded" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  Rx Uploaded
                </span>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2 md:text-right">
              <div>
                <p class="text-2xl font-bold text-[#246BFD]">GHS {{ order.total.toFixed(2) }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}</p>
              </div>
              <div class="flex gap-2">
                <button 
                  v-if="order.paymentMethod === 'platform' && order.paymentStatus === 'pending'"
                  @click.stop="payNow(order)"
                  class="px-4 py-2 text-sm font-medium rounded-full text-white bg-green-600 hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  Pay Now
                </button>
                <button class="px-4 py-2 text-sm font-medium rounded-full text-[#246BFD] bg-[#246BFD]/10 hover:bg-[#246BFD] hover:text-white transition-all" title="View Order Details">
                  View Details →
                </button>
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

