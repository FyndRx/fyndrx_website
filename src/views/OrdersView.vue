<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Order } from '@/models/Order';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import LazyImage from '@/components/LazyImage.vue';
import { formatCurrency } from '@/utils/currency';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import StatusBadge from '@/components/StatusBadge.vue';

const router = useRouter();

const columns: DataTableColumn[] = [
  { key: 'order', label: 'Order', primary: true, cellClass: 'whitespace-nowrap' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'items', label: 'Items', hideBelow: 1400 },
  { key: 'details', label: 'Fulfilment', hideBelow: 1280 },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total', align: 'right', cellClass: 'whitespace-nowrap' },
  { key: 'actions', label: '', align: 'right', cellClass: 'whitespace-nowrap' },
];

/** Catalog names read "DRUG • BRAND • FORM • STRENGTH"; a table cell only needs the drug. */
const shortName = (name: string) => (name.split('•')[0] || name).trim() || 'Medication';

const paymentLabel = (o: Order) =>
  o.paymentMethod === 'platform'
    ? (o.paymentStatus === 'paid' ? 'Paid online' : o.paymentStatus === 'failed' ? 'Payment failed' : 'Pay online')
    : 'Pay at pharmacy';

const paymentTextClass = (o: Order) =>
  o.paymentMethod === 'platform'
    ? (o.paymentStatus === 'paid'
        ? 'text-emerald-700 dark:text-emerald-400'
        : o.paymentStatus === 'failed'
          ? 'text-red-700 dark:text-red-400'
          : 'text-brand-700 dark:text-brand-300')
    : 'text-accent-700 dark:text-accent-300';
const orders = ref<Order[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const selectedFilter = ref<'all' | 'active' | 'completed' | 'cancelled'>('all');
const counts = ref({ all: 0, active: 0, completed: 0, cancelled: 0 });
const currentPage = ref(1);
const lastPage = ref(1);
const hasMore = computed(() => currentPage.value < lastPage.value);
const ORDERS_PER_PAGE = 15;

const payNow = async (order: Order) => {
  if (!order || order.paymentStatus !== 'pending') return;
  
  try {
    loading.value = true;
    const response = await paymentService.initializePayment(order.id);
    if (response?.authorization_url?.startsWith('https://checkout.paystack.com')) {
      window.location.href = response.authorization_url;
    } else {
      console.error('Invalid or missing payment authorization URL');
    }
  } catch (err) {
    console.error('Error initializing payment:', err);
  } finally {
    loading.value = false;
  }
};

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

const loadOrders = async (page = 1, append = false) => {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  try {
    const status = selectedFilter.value === 'all' ? undefined : selectedFilter.value;
    const { orders: fetchedOrders, meta } = await orderService.getOrders({
      status,
      per_page: ORDERS_PER_PAGE,
      page,
    });

    orders.value = append ? [...orders.value, ...fetchedOrders] : fetchedOrders;
    currentPage.value = meta?.current_page ?? page;
    lastPage.value = meta?.last_page ?? 1;
    if (meta?.counts) counts.value = meta.counts;
  } catch (err) {
    console.error('Error loading orders:', err);
    if (!append) orders.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMoreOrders = () => {
  if (!hasMore.value || loadingMore.value) return;
  loadOrders(currentPage.value + 1, true);
};

watch(selectedFilter, () => {
  loadOrders(1);
});

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="pb-12">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">Order <span class="text-brand-500 dark:text-brand-400">History</span></h1>
        <p class="text-gray-600 dark:text-gray-300">Track and manage your orders</p>
      </div>

      <div class="mb-6">
        <div class="flex gap-2 px-1 py-2 -mx-1 overflow-x-auto" role="group" aria-label="Filter orders">
          <button
            v-for="f in ([
              { key: 'all', label: 'All Orders' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ] as const)"
            :key="f.key"
            type="button"
            :aria-pressed="selectedFilter === f.key"
            @click="selectedFilter = f.key"
            :class="[
              'px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
              selectedFilter === f.key
                ? 'bg-brand-500 text-white shadow-glow-brand'
                : 'bg-white/80 text-gray-700 ring-1 ring-gray-200 backdrop-blur hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300'
            ]"
          >
            {{ f.label }} ({{ counts[f.key] }})
          </button>
        </div>
      </div>

      <DataTable
        :columns="columns"
        :rows="orders"
        :row-key="(o) => o.id"
        caption="Your orders"
        clickable
        :loading="loading"
        @row-click="(o) => viewOrder(o.id)"
      >
        <template #cell-order="{ row: order }">
          <p class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ order.orderNumber }}</p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ formatDate(order.createdAt) }}</p>
          <span v-if="order.prescriptionUploaded" class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Rx uploaded</span>
        </template>

        <template #cell-pharmacy="{ row: order }">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 overflow-hidden bg-white rounded-full shrink-0 ring-1 ring-gray-200/70 dark:bg-gray-700 dark:ring-white/10">
              <LazyImage :src="order.pharmacyImage || ''" :alt="order.pharmacyName" aspectRatio="square" className="w-full h-full object-cover" />
            </div>
            <div class="min-w-0 text-left">
              <button
                type="button"
                class="block max-w-full text-sm font-semibold text-gray-900 truncate transition-colors rounded md:max-w-[7.5rem] dark:text-white hover:text-brand-500 focus-visible:outline-none focus-visible:text-brand-500"
                @click.stop="router.push({ name: 'pharmacy', params: { id: order.pharmacyId } })"
              >{{ order.pharmacyName }}</button>
              <p v-if="order.branchName" class="text-xs text-gray-500 truncate md:max-w-[7.5rem] dark:text-gray-400">{{ order.branchName }}</p>
            </div>
          </div>
        </template>

        <template #cell-items="{ row: order }">
          <div class="text-left md:max-w-[9rem]">
            <p class="text-sm font-medium text-gray-900 capitalize truncate dark:text-white">
              {{ shortName((order.items[0]?.medicationName || '').toLowerCase()) }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}<template v-if="order.items.length > 1"> · +{{ order.items.length - 1 }} more</template>
            </p>
          </div>
        </template>

        <template #cell-details="{ row: order }">
          <div class="text-left md:text-left">
            <p class="text-sm text-gray-800 dark:text-gray-100">{{ order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery' }}</p>
            <p class="text-xs font-medium whitespace-nowrap" :class="paymentTextClass(order)">{{ paymentLabel(order) }}</p>
          </div>
        </template>

        <template #cell-status="{ row: order }">
          <StatusBadge :status="order.status" size="sm" show-dot />
        </template>

        <template #cell-total="{ row: order }">
          <span class="text-base font-semibold text-brand-600 dark:text-brand-300">{{ formatCurrency(order.total) }}</span>
        </template>

        <template #cell-actions="{ row: order }">
          <div class="flex items-center justify-end gap-2">
            <button
              v-if="order.paymentMethod === 'platform' && order.paymentStatus === 'pending'"
              type="button"
              class="px-4 py-1.5 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              @click.stop="payNow(order)"
            >Pay now</button>
            <button
              type="button"
              class="flex items-center justify-center text-gray-500 transition duration-200 rounded-full w-9 h-9 ease-out-quart hover:bg-brand-500 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-gray-300"
              :aria-label="`View order ${order.orderNumber}`"
              @click.stop="viewOrder(order.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </template>

        <template #empty>
          <div class="px-6 py-16 text-center">
            <svg class="w-16 h-16 p-4 mx-auto mb-4 rounded-full text-brand-500 bg-brand-500/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No orders found</h3>
            <p class="mb-6 text-gray-600 dark:text-gray-300">You haven't placed any {{ selectedFilter !== 'all' ? selectedFilter : '' }} orders yet.</p>
            <router-link
              to="/medications"
              class="inline-block px-6 py-3 font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >Start Shopping</router-link>
          </div>
        </template>

        <template v-if="hasMore" #footer>
          <button
            type="button"
            @click="loadMoreOrders"
            :disabled="loadingMore"
            class="px-8 py-2.5 text-sm font-medium text-gray-700 transition duration-200 rounded-full bg-white/70 ring-1 ring-gray-200 ease-out-quart dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 hover:ring-brand-500 hover:text-brand-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >{{ loadingMore ? 'Loading…' : 'Load more orders' }}</button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>

</style>

