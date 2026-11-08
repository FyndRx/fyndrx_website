<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { priceAlertService, type PriceAlert } from '@/services/priceAlertService';
import { useNotification } from '@/composables/useNotification';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import LazyImage from '@/components/LazyImage.vue';
import EmptyState from '@/components/EmptyState.vue';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';

const router = useRouter();

const columns: DataTableColumn[] = [
  { key: 'product', label: 'Medication', primary: true },
  { key: 'scope', label: 'Watching' },
  { key: 'price', label: 'Price', align: 'right', cellClass: 'whitespace-nowrap' },
  { key: 'change', label: 'Change', cellClass: 'whitespace-nowrap' },
  { key: 'notified', label: 'Last notified', hideBelow: 1280, cellClass: 'whitespace-nowrap' },
  { key: 'actions', label: '', align: 'right', cellClass: 'whitespace-nowrap' },
];
const toast = useNotification();

const alerts = ref<PriceAlert[]>([]);
const loading = ref(true);
const removingId = ref<number | null>(null);

const loadAlerts = async () => {
  loading.value = true;
  try {
    const { data } = await priceAlertService.list(1, 50);
    alerts.value = data;
  } catch (err) {
    console.error('Failed to load price alerts:', err);
    toast.error('Failed to load', 'Could not load your price alerts. Please try again.');
  } finally {
    loading.value = false;
  }
};

const hasDropped = (alert: PriceAlert) => alert.current_price !== null && alert.current_price < alert.baseline_price;

const dropPercent = (alert: PriceAlert) => {
  if (!hasDropped(alert) || !alert.current_price) return 0;
  return Math.round(((alert.baseline_price - alert.current_price) / alert.baseline_price) * 100);
};

const scopeLabel = (alert: PriceAlert) =>
  alert.is_any_pharmacy ? 'Any pharmacy near you' : `At ${alert.pharmacy?.name ?? 'a specific pharmacy'}`;

const stopWatching = async (alert: PriceAlert) => {
  if (!alert.product) return;
  removingId.value = alert.id;
  try {
    await priceAlertService.unwatchById(alert.id, alert.product.id, alert.pharmacy?.id ?? null);
    alerts.value = alerts.value.filter((a) => a.id !== alert.id);
    toast.info('Alert Removed', `You'll no longer be notified about ${alert.product.name}'s price.`);
  } catch (err) {
    console.error('Failed to remove price alert:', err);
    toast.error("Couldn't remove alert", 'Please try again.');
  } finally {
    removingId.value = null;
  }
};

const viewProduct = (alert: PriceAlert) => {
  if (!alert.product) return;
  router.push({ name: 'MedicationDetail', params: { id: alert.product.id } });
};

onMounted(loadAlerts);
</script>

<template>
  <div class="pb-12">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">Price <span class="text-brand-500 dark:text-brand-400">Alerts</span></h1>
        <p class="text-gray-600 dark:text-gray-300">Medications you're watching for a price drop.</p>
      </div>

      <DataTable
        :columns="columns"
        :rows="alerts"
        :row-key="(a) => a.id"
        caption="Medications you are watching for a price drop"
        clickable
        :loading="loading"
        :skeleton-rows="3"
        @row-click="viewProduct"
      >
        <template #cell-product="{ row: a }">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 overflow-hidden rounded-xl shrink-0 bg-gray-100 dark:bg-gray-900/60">
              <LazyImage
                v-if="a.product?.image"
                :src="a.product.image"
                :alt="a.product.name"
                aspectRatio="square"
                className="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center w-full h-full">
                <svg class="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white md:max-w-[18rem] line-clamp-2">{{ a.product?.name || 'Medication' }}</p>
          </div>
        </template>

        <template #cell-scope="{ row: a }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ scopeLabel(a) }}</span>
        </template>

        <template #cell-price="{ row: a }">
          <div class="flex items-baseline justify-end gap-1.5">
            <span v-if="hasDropped(a)" class="text-xs text-gray-400 line-through">{{ formatCurrency(a.baseline_price) }}</span>
            <span class="text-base font-semibold" :class="hasDropped(a) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">
              {{ formatCurrency(a.current_price ?? a.baseline_price) }}
            </span>
          </div>
        </template>

        <template #cell-change="{ row: a }">
          <span
            v-if="hasDropped(a)"
            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 17h8m0 0V9m0 8L11 5l-4 4-6-6" /></svg>
            {{ dropPercent(a) }}% off
          </span>
          <span v-else class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-300">Watching</span>
        </template>

        <template #cell-notified="{ row: a }">
          <span v-if="a.last_notified_at" class="text-sm text-emerald-700 dark:text-emerald-400">{{ formatDate(a.last_notified_at, 'MMM d, yyyy') }}</span>
          <span v-else class="text-sm text-gray-400 dark:text-gray-500">Not yet</span>
        </template>

        <template #cell-actions="{ row: a }">
          <button
            type="button"
            @click.stop="stopWatching(a)"
            :disabled="removingId === a.id"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-red-600 transition duration-200 rounded-full dark:text-red-400 ease-out-quart hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
            :aria-label="`Stop watching ${a.product?.name || 'this medication'}`"
          >
            <svg v-if="removingId === a.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Stop watching
          </button>
        </template>

        <template #empty>
          <EmptyState
            type="noitems"
            message="Watch a medication's price from its product page, and we'll notify you the moment it drops."
            action-text="Browse Medications"
            @action="router.push({ name: 'medications' })"
          />
        </template>
      </DataTable>

    </div>
  </div>
</template>
