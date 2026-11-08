<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Transaction } from '@/services/paymentService';
import { paymentService } from '@/services/paymentService';
import { formatCurrency } from '@/utils/currency';
import StatusBadge from '@/components/StatusBadge.vue';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import TableSearch from '@/components/TableSearch.vue';
import Pagination from '@/components/Pagination.vue';
import { useServerTable } from '@/composables/useServerTable';

const router = useRouter();

const columns: DataTableColumn[] = [
  { key: 'reference', label: 'Reference', primary: true, cellClass: 'whitespace-nowrap' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'method', label: 'Method', hideBelow: 1280, cellClass: 'whitespace-nowrap' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount', align: 'right', cellClass: 'whitespace-nowrap' },
  { key: 'actions', label: '', align: 'right', cellClass: 'whitespace-nowrap' },
];

const filterList = [
  { key: 'all', label: 'All' },
  { key: 'success', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
] as const;
type TxFilter = 'all' | 'success' | 'pending' | 'failed' | 'refunded';

const counts = ref({ all: 0, success: 0, pending: 0, failed: 0, refunded: 0 });
const totals = ref({ paid: 0, pending: 0 });
const tableTop = ref<HTMLElement | null>(null);

// Search, filter, page and per-page are all handled server-side
const {
  rows: transactions,
  loading,
  q: search,
  filter: selectedFilter,
  page,
  perPage,
  total,
  lastPage,
  setPage,
  setPerPage,
} = useServerTable<Transaction, TxFilter>({
  initialFilter: 'all',
  scrollTarget: tableTop,
  fetcher: async ({ page, perPage, q, filter }) => {
    const { transactions: rows, meta } = await paymentService.getTransactions({
      status: filter === 'all' ? undefined : filter,
      q: q || undefined,
      per_page: perPage,
      page,
    });
    if (meta?.counts) counts.value = meta.counts;
    if (meta?.totals) totals.value = meta.totals;
    return { rows, meta };
  },
});

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
</script>

<template>
  <div class="pb-24">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">Transactions</h1>
        <p class="text-gray-600 dark:text-gray-300">View your payment history and receipts</p>
      </div>

      <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div class="flex items-center justify-between p-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total paid</p>
            <p class="mt-2 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(totals.paid) }}</p>
          </div>
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15">
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div class="flex items-center justify-between p-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p class="mt-2 text-3xl font-semibold text-accent-600 dark:text-accent-400">{{ formatCurrency(totals.pending) }}</p>
          </div>
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-accent-500/15">
            <svg class="w-6 h-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <div class="flex items-center justify-between p-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
            <p class="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{{ counts.all }}</p>
          </div>
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-brand-500/10">
            <svg class="w-6 h-6 text-brand-600 dark:text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div ref="tableTop" class="flex flex-col gap-3 mb-4 scroll-mt-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="w-full lg:max-w-sm">
          <TableSearch v-model="search" placeholder="Search reference, order or pharmacy…" label="Search transactions" />
        </div>
        <div class="flex gap-2 px-1 py-2 -mx-1 overflow-x-auto" role="group" aria-label="Filter transactions">
          <button
            v-for="f in filterList"
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
        :rows="transactions"
        :row-key="(t) => t.id"
        caption="Your transactions"
        clickable
        :loading="loading"
        @row-click="(t) => viewOrder(t.order_id)"
      >
        <template #cell-reference="{ row: t }">
          <p class="font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ t.reference || t.order_id }}</p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ formatDate(t.created_at) }}</p>
          <span v-if="t.metadata?.is_bulk" class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300">Combined payment</span>
        </template>

        <template #cell-pharmacy="{ row: t }">
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{ t.order?.pharmacy_name || '—' }}</span>
        </template>

        <template #cell-method="{ row: t }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ t.payment_method === 'platform' ? 'Online payment' : 'Pay at pharmacy' }}</span>
        </template>

        <template #cell-status="{ row: t }">
          <StatusBadge :status="t.status" size="sm" show-icon />
        </template>

        <template #cell-amount="{ row: t }">
          <p class="text-base font-semibold text-brand-600 dark:text-brand-300">{{ formatCurrency(t.amount) }}</p>
          <p v-if="t.paid_at" class="text-xs text-gray-500 dark:text-gray-400">Paid {{ formatDate(t.paid_at) }}</p>
        </template>

        <template #cell-actions="{ row: t }">
          <div class="flex items-center justify-end gap-2">
            <button
              v-if="t.status === 'success'"
              type="button"
              class="px-4 py-1.5 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              @click.stop="viewReceipt(t.id)"
            >Receipt</button>
            <button
              type="button"
              class="flex items-center justify-center text-gray-500 transition duration-200 rounded-full w-9 h-9 ease-out-quart hover:bg-brand-500 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-gray-300"
              :aria-label="`View order for ${t.reference || 'this transaction'}`"
              @click.stop="viewOrder(t.order_id)"
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
            <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No transactions found</h3>
            <p class="mb-6 text-gray-600 dark:text-gray-300">
              <template v-if="search">Nothing matches “{{ search }}”<template v-if="selectedFilter !== 'all'"> in {{ selectedFilter }} transactions</template>.</template>
              <template v-else>You haven't made any {{ selectedFilter !== 'all' ? selectedFilter : '' }} transactions yet.</template>
            </p>
            <button
              v-if="search"
              type="button"
              class="px-6 py-3 font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              @click="search = ''"
            >Clear search</button>
          </div>
        </template>

        <template #footer>
          <Pagination
            embedded
            :current-page="page"
            :total-pages="lastPage"
            :total-items="total"
            :per-page="perPage"
            :per-page-options="[10, 25, 50, 100]"
            @update:page="setPage"
            @update:per-page="setPerPage"
          />
        </template>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
</style>

