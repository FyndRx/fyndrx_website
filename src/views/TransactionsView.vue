<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Transaction } from '@/services/paymentService';
import { paymentService } from '@/services/paymentService';
import { formatCurrency } from '@/utils/currency';
import StatusBadge from '@/components/StatusBadge.vue';

const router = useRouter();
const transactions = ref<Transaction[]>([]);
const selectedFilter = ref<'all' | 'success' | 'pending' | 'failed' | 'refunded'>('all');
const loading = ref(true);
const loadingMore = ref(false);
const counts = ref({ all: 0, success: 0, pending: 0, failed: 0, refunded: 0 });
const totals = ref({ paid: 0, pending: 0 });
const currentPage = ref(1);
const lastPage = ref(1);
const hasMore = computed(() => currentPage.value < lastPage.value);
const TRANSACTIONS_PER_PAGE = 15;

const viewReceipt = (transactionId: string) => {
  router.push({ name: 'receipt', params: { reference: transactionId } });
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

const loadTransactions = async (page = 1, append = false) => {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  try {
    const status = selectedFilter.value === 'all' ? undefined : selectedFilter.value;
    const { transactions: fetched, meta } = await paymentService.getTransactions({
      status,
      per_page: TRANSACTIONS_PER_PAGE,
      page,
    });

    transactions.value = append ? [...transactions.value, ...fetched] : fetched;
    currentPage.value = meta?.current_page ?? page;
    lastPage.value = meta?.last_page ?? 1;
    if (meta?.counts) counts.value = meta.counts;
    if (meta?.totals) totals.value = meta.totals;
  } catch (err) {
    console.error('Error loading transactions:', err);
    if (!append) transactions.value = [];
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMoreTransactions = () => {
  if (!hasMore.value || loadingMore.value) return;
  loadTransactions(currentPage.value + 1, true);
};

watch(selectedFilter, () => {
  loadTransactions(1);
});

onMounted(() => {
  loadTransactions();
});
</script>

<template>
  <div class="pb-12">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-medium text-gray-900 dark:text-white">Transactions</h1>
        <p class="text-gray-600 dark:text-gray-300">View your payment history and receipts</p>
      </div>

      <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              <p class="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(totals.paid) }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p class="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ formatCurrency(totals.pending) }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ counts.all }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>
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
            All ({{ counts.all }})
          </button>
          <button
            @click="selectedFilter = 'success'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'success'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Paid ({{ counts.success }})
          </button>
          <button
            @click="selectedFilter = 'pending'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'pending'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Pending ({{ counts.pending }})
          </button>
          <button
            @click="selectedFilter = 'failed'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'failed'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Failed ({{ counts.failed }})
          </button>
          <button
            @click="selectedFilter = 'refunded'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'refunded'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Refunded ({{ counts.refunded }})
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading transactions...</p>
      </div>

      <div v-else-if="transactions.length === 0" class="py-16 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No transactions found</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-300">You haven't made any {{ selectedFilter !== 'all' ? selectedFilter : '' }} transactions yet.</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="p-6 transition-all duration-300 bg-white cursor-pointer dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1"
          @click="viewOrder(transaction.order_id)"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex-1">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                      {{ transaction.reference || transaction.order_id }}
                    </h3>
                    <StatusBadge :status="transaction.status" size="sm" show-icon />
                  </div>
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-bold text-[#246BFD] uppercase tracking-tighter">
                      {{ transaction.order?.pharmacy_name || 'Generic Transaction' }}
                    </p>
                    <span v-if="transaction.metadata?.is_bulk" class="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded font-black uppercase">
                      Combined Payment
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ formatDate(transaction.created_at) }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span>{{ transaction.payment_method === 'platform' ? 'Online Payment' : 'Pay at Pharmacy' }}</span>
                </div>
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span class="font-mono text-xs">{{ transaction.reference }}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-3 md:text-right">
              <div>
                <p class="text-2xl font-bold text-[#246BFD]">{{ formatCurrency(transaction.amount) }}</p>
                <p v-if="transaction.paid_at" class="text-xs text-gray-500 dark:text-gray-400">
                  Paid {{ formatDate(transaction.paid_at) }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="transaction.status === 'success'"
                  @click.stop="viewReceipt(transaction.id)"
                  class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-[#246BFD] text-white hover:bg-[#5089FF] transition-all shadow-lg hover:shadow-[#246BFD]/30"
                  title="View Transaction Receipt"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  View Receipt
                </button>
                <button
                  @click.stop="viewOrder(transaction.order_id)"
                  class="px-4 py-2 text-sm font-medium rounded-full text-[#246BFD] bg-[#246BFD]/10 hover:bg-[#246BFD] hover:text-white transition-all"
                  title="View Associated Order"
                >
                  View Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="flex justify-center pt-2">
          <button
            @click="loadMoreTransactions"
            :disabled="loadingMore"
            class="px-6 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loadingMore ? 'Loading…' : 'Load More Transactions' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

