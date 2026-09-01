<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { priceAlertService, type PriceAlert } from '@/services/priceAlertService';
import { useNotification } from '@/composables/useNotification';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import LazyImage from '@/components/LazyImage.vue';
import EmptyState from '@/components/EmptyState.vue';
import ListSkeleton from '@/components/skeletons/ListSkeleton.vue';

const router = useRouter();
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
  <div class="pb-20">
    <div class="container mx-auto px-4 max-w-4xl">

      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900 dark:text-white">Price Alerts</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Medications you're watching for a price drop.</p>
      </div>

      <div v-if="loading">
        <ListSkeleton type="medication" :count="3" :columns="1" />
      </div>

      <EmptyState
        v-else-if="alerts.length === 0"
        type="noitems"
        message="Watch a medication's price from its product page, and we'll notify you the moment it drops."
        action-text="Browse Medications"
        @action="router.push({ name: 'medications' })"
      />

      <div v-else class="space-y-4">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          @click="viewProduct(alert)"
          class="group flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <div class="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
            <LazyImage
              v-if="alert.product?.image"
              :src="alert.product.image"
              :alt="alert.product.name"
              aspectRatio="square"
              className="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors truncate">
              {{ alert.product?.name || 'Medication' }}
            </h3>
            <div class="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span class="truncate">{{ scopeLabel(alert) }}</span>
            </div>
            <p v-if="alert.last_notified_at" class="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Last notified {{ formatDate(alert.last_notified_at, 'MMM d, yyyy') }}
            </p>
          </div>

          <div class="text-right shrink-0">
            <div class="flex items-baseline gap-1.5 justify-end">
              <span v-if="hasDropped(alert)" class="text-xs text-gray-400 line-through">{{ formatCurrency(alert.baseline_price) }}</span>
              <span
                class="text-lg font-bold"
                :class="hasDropped(alert) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'"
              >
                {{ formatCurrency(alert.current_price ?? alert.baseline_price) }}
              </span>
            </div>
            <span
              v-if="hasDropped(alert)"
              class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 17h8m0 0V9m0 8L11 5l-4 4-6-6" /></svg>
              {{ dropPercent(alert) }}% off
            </span>
            <span v-else class="block text-[11px] text-gray-400 dark:text-gray-500 mt-1">watching</span>
          </div>

          <button
            @click.stop="stopWatching(alert)"
            :disabled="removingId === alert.id"
            title="Stop watching this price"
            class="shrink-0 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
          >
            <svg v-if="removingId === alert.id" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
