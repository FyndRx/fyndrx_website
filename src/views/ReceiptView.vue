<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchReceipt, type Receipt, type PosReceipt, type OnlineReceipt } from '@/services/receiptService';

const route = useRoute();
const reference = route.params.reference as string;

const receipt = ref<Receipt | null>(null);
const loading = ref(true);
const notFound = ref(false);
const fetchError = ref(false);
const copied = ref(false);

onMounted(async () => {
  try {
    receipt.value = await fetchReceipt(reference);
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status;
    if (status === 404) {
      notFound.value = true;
    } else {
      fetchError.value = true;
    }
  } finally {
    loading.value = false;
  }
});

const isPos   = computed(() => receipt.value?.type === 'pos');
const pos     = computed(() => receipt.value?.type === 'pos'    ? (receipt.value as PosReceipt)    : null);
const online  = computed(() => receipt.value?.type === 'online' ? (receipt.value as OnlineReceipt) : null);
const status  = computed(() => receipt.value?.status ?? '');
const total   = computed(() => receipt.value?.total ?? 0);
const items   = computed(() => receipt.value?.items ?? []);

interface StatusConfig {
  label: string;
  color: string;
  gradientTo: string;
  icon: 'check' | 'refresh' | 'x' | 'clock';
}

const statusConfig = computed((): StatusConfig => {
  const s = status.value;
  if (s === 'completed' || s === 'success') return {
    label: isPos.value ? 'Sale Completed' : 'Payment Successful',
    color: '#10b981', gradientTo: '#059669', icon: 'check',
  };
  if (s === 'refunded') return {
    label: 'Amount Refunded', color: '#f59e0b', gradientTo: '#d97706', icon: 'refresh',
  };
  if (s === 'voided' || s === 'failed') return {
    label: s === 'voided' ? 'Transaction Voided' : 'Payment Failed',
    color: '#ef4444', gradientTo: '#dc2626', icon: 'x',
  };
  return { label: 'Pending', color: '#3b82f6', gradientTo: '#2563eb', icon: 'clock' };
});

const paymentMethodLabel = computed(() => {
  const m = receipt.value?.payment_method;
  if (!m) return '—';
  return ({
    cash: 'Cash', mobile_money: 'Mobile Money', split: 'Cash + Mobile Money',
    paystack: 'Paystack', platform: 'Paystack (Online)', direct: 'Direct to Pharmacy',
  } as Record<string, string>)[m] ?? m;
});

const subtotal    = computed(() => receipt.value?.subtotal ?? total.value);
const discount    = computed(() => receipt.value?.discount ?? 0);
const deliveryFee = computed(() => (receipt.value?.type === 'online' ? (receipt.value as OnlineReceipt).delivery_fee : 0) ?? 0);
const taxAmount   = computed(() => receipt.value?.tax_amount ?? 0);
const taxRate     = computed(() => receipt.value?.tax_rate ?? null);

const dateStr = computed(() => {
  const raw = receipt.value?.date;
  if (!raw) return '';
  return new Date(raw).toLocaleDateString('en-GH', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
});

const paidAtStr = computed(() => {
  const raw = online.value?.paid_at;
  if (!raw) return null;
  return new Date(raw).toLocaleDateString('en-GH', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
});

const displayRef = computed(() => {
  if (online.value) return online.value.reference;
  if (pos.value?.reference) return pos.value.reference;
  return pos.value?.id?.substring(0, 16) ?? '—';
});

function fmt(amount: number): string {
  return `GH₵ ${Number(amount).toFixed(2)}`;
}

async function shareReceipt() {
  const url = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title: 'FyndRx Receipt', text: `Receipt – ${fmt(total.value)}`, url }); return; }
    catch { /* cancelled or unsupported */ }
  }
  try { await navigator.clipboard.writeText(url); } catch { /* silent */ }
  copied.value = true;
  setTimeout(() => (copied.value = false), 2500);
}

function retry() {
  loading.value = true;
  fetchError.value = false;
  fetchReceipt(reference)
    .then(r => { receipt.value = r; })
    .catch(() => { fetchError.value = true; })
    .finally(() => { loading.value = false; });
}

function printReceipt() {
  window.print();
}
</script>

<template>
  <!-- pt-20 clears the fixed 80px site nav, no custom header here -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
    <div class="w-full max-w-2xl mx-auto">

      <!-- ── LOADING ── -->
      <div v-if="loading">
        <!-- skeleton hero -->
        <div class="h-56 w-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse rounded-b-3xl"></div>
        <div class="px-5 py-6 space-y-4">
          <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full animate-pulse"></div>
          <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5 animate-pulse" style="animation-delay:.08s"></div>
          <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/5 animate-pulse" style="animation-delay:.16s"></div>
          <div class="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" style="animation-delay:.1s"></div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5 animate-pulse" style="animation-delay:.2s"></div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/5 animate-pulse" style="animation-delay:.3s"></div>
            </div>
            <div class="space-y-3">
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" style="animation-delay:.15s"></div>
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5 animate-pulse" style="animation-delay:.25s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── NOT FOUND ── -->
      <div v-else-if="notFound" class="px-4 py-16">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center max-w-sm mx-auto">
          <div class="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/40 flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" class="text-red-500 dark:text-red-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Receipt Not Found</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">This receipt link is invalid or no longer available on our platform.</p>
          <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-[#246BFD] hover:bg-[#1d5cdb] text-white rounded-xl font-semibold text-sm transition-colors">
            Go to FyndRx
          </a>
        </div>
      </div>

      <!-- ── FETCH ERROR ── -->
      <div v-else-if="fetchError" class="px-4 py-16">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center max-w-sm mx-auto">
          <div class="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-800/40 flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" class="text-amber-500 dark:text-amber-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Couldn't Load Receipt</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Something went wrong connecting to our server. Please check your connection and try again.</p>
          <button @click="retry" class="inline-flex items-center justify-center px-6 py-3 bg-[#246BFD] hover:bg-[#1d5cdb] text-white rounded-xl font-semibold text-sm transition-colors">
            Try Again
          </button>
        </div>
      </div>

      <!-- ── RECEIPT ── -->
      <div v-else-if="receipt" class="pb-12">

        <!-- ════════════════ HERO ════════════════ -->
        <div
          class="relative overflow-hidden rounded-b-3xl shadow-2xl"
          :style="`background: linear-gradient(150deg, #1A2233 0%, #1e3a5f 45%, ${statusConfig.gradientTo} 100%)`"
        >
          <!-- Decorative blobs -->
          <div class="absolute w-72 h-72 rounded-full -top-20 -right-16 bg-white/[0.04] pointer-events-none"></div>
          <div class="absolute w-52 h-52 rounded-full -bottom-16 -left-12 bg-white/[0.04] pointer-events-none"></div>
          <div class="absolute w-32 h-32 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/[0.03] pointer-events-none"></div>

          <div class="relative px-6 sm:px-8 pt-7 pb-8 text-white">

            <!-- ── Top bar: pharmacy + type badge ── -->
            <div class="flex items-center justify-between mb-8 gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  v-if="receipt.pharmacy.logo_url"
                  class="w-12 h-12 rounded-2xl overflow-hidden bg-white/15 flex-shrink-0 border border-white/20 shadow-md"
                >
                  <img :src="receipt.pharmacy.logo_url" :alt="receipt.pharmacy.name" class="w-full h-full object-contain" />
                </div>
                <div
                  v-else
                  class="w-12 h-12 rounded-2xl bg-white/15 flex-shrink-0 flex items-center justify-center text-xl font-extrabold text-white/80 border border-white/20 shadow-md"
                >
                  {{ receipt.pharmacy.name.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <div class="text-[0.92rem] font-bold leading-snug truncate">{{ receipt.pharmacy.name }}</div>
                  <div v-if="receipt.pharmacy.address" class="text-[0.7rem] opacity-55 mt-0.5 truncate">{{ receipt.pharmacy.address }}</div>
                </div>
              </div>
              <!-- POS / Online badge -->
              <div class="inline-flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full bg-white/10 border border-white/[0.18] text-[0.68rem] font-bold tracking-wide">
                <svg v-if="isPos" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                {{ isPos ? 'POS Terminal' : 'Online Order' }}
              </div>
            </div>

            <!-- ── Main hero content: split on sm+ ── -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:gap-10">

              <!-- Left: status icon + label + date -->
              <div class="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2 mb-6 sm:mb-0 sm:flex-shrink-0">
                <div
                  class="w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 rp-status-ring"
                  :style="`border-color: ${statusConfig.color}; background: ${statusConfig.color}1a`"
                >
                  <svg v-if="statusConfig.icon === 'check'" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path class="rp-check-draw" d="M5 12l5 5 9-9"/>
                  </svg>
                  <svg v-else-if="statusConfig.icon === 'refresh'" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  <svg v-else-if="statusConfig.icon === 'x'" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                  <svg v-else class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div class="text-[0.85rem] font-bold" :style="`color: ${statusConfig.color}`">{{ statusConfig.label }}</div>
                  <div class="text-[0.68rem] opacity-50 mt-0.5">{{ dateStr }}</div>
                </div>
              </div>

              <!-- Divider (desktop only) -->
              <div class="hidden sm:block w-px self-stretch bg-white/15 flex-shrink-0"></div>

              <!-- Right: amount (large) -->
              <div class="flex-1 sm:pl-2">
                <div class="text-[0.65rem] font-bold opacity-40 uppercase tracking-[0.15em] mb-1">Total Amount</div>
                <div class="text-[2.8rem] sm:text-[3.2rem] font-black tracking-tight leading-none">{{ fmt(total) }}</div>
                <div class="text-[0.68rem] opacity-45 uppercase tracking-widest mt-1.5">Ghana Cedis · GHS</div>
              </div>
            </div>

            <!-- ── Reference band (inside hero, frosted) ── -->
            <div class="mt-7 flex items-center gap-3 bg-white/[0.08] border border-white/[0.12] rounded-2xl px-4 py-3 backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-50 flex-shrink-0">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h1M17 14h1M14 17h4"/>
              </svg>
              <div class="flex-1 min-w-0">
                <div class="text-[0.55rem] font-bold opacity-45 uppercase tracking-widest mb-0.5">Transaction Reference</div>
                <div class="font-mono font-bold text-[0.8rem] tracking-wider opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">{{ displayRef }}</div>
              </div>
              <div v-if="online?.order_number" class="hidden sm:flex flex-col items-end flex-shrink-0">
                <div class="text-[0.55rem] font-bold opacity-45 uppercase tracking-widest mb-0.5">Order</div>
                <div class="font-mono font-bold text-[0.8rem] tracking-wider opacity-90">{{ online.order_number }}</div>
              </div>
            </div>

          </div>
        </div>
        <!-- /hero -->

        <!-- ════════════════ BODY ════════════════ -->
        <div class="px-4 sm:px-6 pt-5 space-y-4">

          <!-- Order number row (mobile only, when not shown in hero) -->
          <div
            v-if="online?.order_number"
            class="sm:hidden flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3"
          >
            <span class="text-sm text-gray-500 dark:text-gray-400">Order Number</span>
            <span class="font-mono font-bold text-[#246BFD] text-sm">{{ online.order_number }}</span>
          </div>

          <!-- Two-column grid: items (left) / payment + actions (right) -->
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 items-start">

            <!-- ── Items card (wider column) ── -->
            <div class="sm:col-span-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-50 dark:border-gray-700/50">
                <h3 class="text-[0.58rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Items</h3>
              </div>

              <div
                v-for="(item, i) in items"
                :key="i"
                class="flex justify-between items-start px-4 py-3 border-b border-gray-50 dark:border-gray-700/30 last:border-0"
              >
                <div class="flex-1 min-w-0 mr-3">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-0.5">{{ item.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.quantity }} × {{ fmt(item.unit_price) }}</div>
                </div>
                <div class="text-sm font-bold text-[#246BFD] flex-shrink-0">{{ fmt(item.total) }}</div>
              </div>

              <div v-if="!items.length" class="px-4 py-5 text-sm text-gray-400 dark:text-gray-500 italic text-center">
                No item details available.
              </div>

              <!-- Totals -->
              <div class="border-t border-dashed border-gray-200 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/40">
                <div class="flex justify-between px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span><span>{{ fmt(subtotal) }}</span>
                </div>
                <div v-if="discount > 0" class="flex justify-between px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
                  <span>Discount</span><span>− {{ fmt(discount) }}</span>
                </div>
                <div v-if="deliveryFee > 0" class="flex justify-between px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <span>Delivery</span><span>{{ fmt(deliveryFee) }}</span>
                </div>
                <div v-if="taxAmount && taxAmount > 0" class="flex justify-between px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500">
                  <span>Incl. Tax{{ taxRate ? ` (${(taxRate * 100).toFixed(0)}%)` : '' }}</span>
                  <span>{{ fmt(taxAmount) }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center px-4 py-4 bg-gray-50 dark:bg-gray-700/30 border-t-2 border-gray-100 dark:border-gray-700">
                <span class="text-sm font-bold text-gray-900 dark:text-white">Total Paid</span>
                <span class="text-base font-black text-[#246BFD]">{{ fmt(total) }}</span>
              </div>
            </div>

            <!-- ── Right column: payment details + actions ── -->
            <div class="sm:col-span-2 space-y-4">

              <!-- Payment details card -->
              <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-50 dark:border-gray-700/50">
                  <h3 class="text-[0.58rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Payment Details</h3>
                </div>
                <div class="divide-y divide-gray-50 dark:divide-gray-700/40">
                  <div class="flex justify-between items-center px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Method</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ paymentMethodLabel }}</span>
                  </div>
                  <div v-if="pos?.cashier" class="flex justify-between items-center px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Cashier</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ pos.cashier }}</span>
                  </div>
                  <div v-if="pos?.register" class="flex justify-between items-center px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Register</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ pos.register }}</span>
                  </div>
                  <div v-if="online?.customer" class="flex justify-between items-center px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Customer</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ online.customer.name }}</span>
                  </div>
                  <div v-if="online?.customer?.email" class="flex justify-between items-start px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Email</span>
                    <span class="text-xs font-semibold text-gray-900 dark:text-white text-right ml-2 break-all">{{ online.customer.email }}</span>
                  </div>
                  <div v-if="paidAtStr" class="flex justify-between items-center px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Paid At</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ paidAtStr }}</span>
                  </div>
                  <div v-if="online?.delivery_method" class="flex justify-between items-center px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Delivery</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2 capitalize">{{ online.delivery_method }}</span>
                  </div>
                  <div v-if="online?.delivery_address" class="flex justify-between items-start px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Address</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ online.delivery_address }}</span>
                  </div>
                  <div v-if="pos?.notes" class="flex justify-between items-start px-4 py-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Notes</span>
                    <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2 italic">{{ pos.notes }}</span>
                  </div>
                  <div v-if="online?.refund_reason" class="flex justify-between items-start px-4 py-3">
                    <span class="text-sm text-red-500 flex-shrink-0">Refund Reason</span>
                    <span class="text-sm font-semibold text-red-600 dark:text-red-400 text-right ml-2">{{ online.refund_reason }}</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex gap-3 no-print">
                <button
                  @click="shareReceipt"
                  class="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#246BFD] hover:bg-[#1d5cdb] text-white text-sm font-semibold transition-colors active:scale-[0.97]"
                >
                  <svg v-if="!copied" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12l5 5 9-9"/>
                  </svg>
                  {{ copied ? 'Copied!' : 'Share' }}
                </button>
                <button
                  @click="printReceipt"
                  class="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-semibold transition-colors active:scale-[0.97]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Print
                </button>
              </div>

            </div><!-- /right column -->
          </div><!-- /grid -->

          <!-- Footer -->
          <div class="border-t border-dashed border-gray-200 dark:border-gray-700 pt-5 pb-6 text-center">
            <div class="flex items-center justify-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white mb-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#246BFD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              FyndRx Healthcare Platform
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">This is a computer-generated digital receipt.</div>
            <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">www.fyndrx.com · support@fyndrx.com</div>
          </div>

        </div><!-- /body -->
      </div><!-- /receipt -->

    </div><!-- /max-w-2xl -->
  </div>
</template>

<style scoped>
/* Pulsing ring on status icon */
.rp-status-ring {
  animation: rp-ring-pulse 2.8s ease-in-out infinite;
}
@keyframes rp-ring-pulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50%       { box-shadow: 0 0 0 10px transparent; }
}

/* Animated checkmark draw */
.rp-check-draw {
  stroke-dasharray: 28;
  stroke-dashoffset: 28;
  animation: rp-draw 0.45s ease-out 0.25s forwards;
}
@keyframes rp-draw { to { stroke-dashoffset: 0; } }

/* Print */
@media print {
  .no-print { display: none !important; }
}
</style>
