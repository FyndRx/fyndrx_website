<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { priceAlertService } from '@/services/priceAlertService';
import { useNotification } from '@/composables/useNotification';

interface Props {
  productId: string | number;
  /** Omit to watch this product across any nearby pharmacy instead of one specific branch. */
  pharmacyId?: string | number | null;
  productName?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pharmacyId: null,
  size: 'medium',
  showLabel: false,
});

const emit = defineEmits<{ toggled: [watching: boolean] }>();

const notification = useNotification();
const isWatching = ref(false);
const isLoading = ref(false);

const sizeClasses = { small: 'w-8 h-8', medium: 'w-10 h-10', large: 'w-12 h-12' };
const iconSizes = { small: 'w-4 h-4', medium: 'w-5 h-5', large: 'w-6 h-6' };

const label = computed(() => (isLoading.value ? '…' : isWatching.value ? 'Watching' : 'Watch Price'));

// showLabel is the prominent CTA on the medication page — it needs to read as
// clickable at a glance (a solid, bold button in both states), not blend into
// the background. The icon-only variant (per-pharmacy row) stays a light,
// secondary affordance next to Add to Cart, same as FavoriteButton's treatment.
const buttonColorClass = computed(() => {
  if (props.showLabel) {
    return isWatching.value
      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-emerald-500/30'
      : 'bg-[#246BFD] text-white shadow-lg shadow-[#246BFD]/20 hover:bg-[#5089FF] hover:shadow-[#246BFD]/30';
  }
  return isWatching.value
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-500';
});

const toggle = async (e: Event) => {
  e.stopPropagation();
  if (isLoading.value) return;
  isLoading.value = true;

  const prev = isWatching.value;
  const name = props.productName || 'this medication';

  try {
    if (prev) {
      await priceAlertService.unwatch(props.productId, props.pharmacyId);
      isWatching.value = false;
      emit('toggled', false);
      notification.info('Alert Removed', `You'll no longer be notified about ${name}'s price.`);
    } else {
      await priceAlertService.watch(props.productId, props.pharmacyId);
      isWatching.value = true;
      emit('toggled', true);
      notification.success('Watching for Price Drops', `We'll notify you if ${name} gets cheaper.`);
    }
  } catch (err: any) {
    // 422 here is informative, not a generic failure (e.g. "set your location" for
    // any-pharmacy mode, or "not in stock at that pharmacy") — surface it as-is.
    const message = err?.data?.message || err?.message || 'Could not update this price alert. Please try again.';
    notification.error(prev ? "Couldn't remove alert" : "Couldn't watch this price", message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  isWatching.value = priceAlertService.isWatching(props.productId, props.pharmacyId);
});
</script>

<template>
  <button
    @click="toggle"
    :disabled="isLoading"
    :title="isWatching ? 'Stop watching this price' : 'Notify me if this price drops'"
    :aria-label="isWatching ? 'Stop watching this price' : 'Notify me if this price drops'"
    :class="[
      'flex items-center justify-center rounded-full transition-all duration-200',
      showLabel ? 'px-5 py-2.5 gap-2 w-auto font-bold' : sizeClasses[size],
      buttonColorClass,
      isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer',
    ]"
  >
    <svg v-if="isLoading" :class="[iconSizes[size], 'animate-spin']" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>

    <!-- Bell — filled + a little "ring" wobble hint when actively watching -->
    <svg
      v-else
      :class="[iconSizes[size], 'transition-transform duration-200', isWatching ? 'scale-110' : '']"
      :fill="isWatching ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>

    <span v-if="showLabel" class="text-sm font-bold whitespace-nowrap">{{ label }}</span>
  </button>
</template>
