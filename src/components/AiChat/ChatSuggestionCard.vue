<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { cartService } from '@/services/cartService';
import { useNotification } from '@/composables/useNotification';
import { formatCurrency } from '@/utils/currency';
import type { ChatSuggestion } from '@/types/chat';

const props = defineProps<{ suggestion: ChatSuggestion }>();

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { success, error: notifyError } = useNotification();

const adding = ref(false);
const added = ref(false);

const hasDiscount = computed(
  () => props.suggestion.effective_price < props.suggestion.price
);

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' });
    return;
  }
  if (!props.suggestion.in_stock || adding.value) return;

  adding.value = true;
  try {
    await cartService.addToCart({
      pharmacy_drug_price_id: props.suggestion.pharmacy_drug_price_id,
      quantity: props.suggestion.quantity || 1,
    });
    await cartStore.syncWithAPI();
    added.value = true;
    success('Added to cart', `${props.suggestion.product_name} is in your cart.`);
  } catch (err: any) {
    notifyError('Could not add item', err?.message || 'Please try again.');
  } finally {
    adding.value = false;
  }
};
</script>

<script lang="ts">
export default { name: 'ChatSuggestionCard' };
</script>

<template>
  <div
    class="shrink-0 w-56 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/70 dark:border-gray-700/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
  >
    <div class="p-3.5">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div
          class="w-9 h-9 shrink-0 rounded-xl bg-[#246BFD]/10 dark:bg-[#246BFD]/20 flex items-center justify-center text-[#246BFD] dark:text-[#5089FF]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3 3m0 0l-3-3m3 3V9" />
          </svg>
        </div>
        <span
          v-if="suggestion.requires_prescription"
          class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 whitespace-nowrap"
        >
          Rx needed
        </span>
      </div>

      <p class="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
        {{ suggestion.product_name }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
        {{ suggestion.pharmacy_name }}<span v-if="suggestion.branch_name"> · {{ suggestion.branch_name }}</span>
      </p>

      <div class="flex items-baseline gap-1.5 mb-3">
        <span class="text-sm font-extrabold text-[#246BFD] dark:text-[#5089FF]">
          {{ formatCurrency(suggestion.effective_price) }}
        </span>
        <span v-if="hasDiscount" class="text-xs text-gray-400 line-through">
          {{ formatCurrency(suggestion.price) }}
        </span>
      </div>

      <button
        v-if="!suggestion.in_stock"
        disabled
        class="w-full py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
      >
        Out of stock
      </button>
      <button
        v-else-if="added"
        disabled
        class="w-full py-2 rounded-xl text-xs font-bold bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center gap-1"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        Added
      </button>
      <button
        v-else
        @click="addToCart"
        :disabled="adding"
        class="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#246BFD] hover:bg-[#5089FF] shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-60"
      >
        {{ adding ? 'Adding…' : authStore.isAuthenticated ? 'Add to cart' : 'Sign in to add' }}
      </button>
    </div>
  </div>
</template>
