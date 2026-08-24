<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { fetchReceipt, type Receipt, type PosReceipt, type OnlineReceipt } from '@/services/receiptService';
import SpotlightCardAd from '@/components/ads/formats/SpotlightCardAd.vue';
import { useAds } from '@/composables/useAds';
import { useAdsStore } from '@/store/ads';
import LazyImage from '@/components/LazyImage.vue';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';

const route = useRoute();
const reference = route.params.reference as string;

const adsStore = useAdsStore();
const { resolved: receiptAd } = useAds({ zone: 'Z7-post-checkout', route: 'receipt', isAuthed: false });

const receipt = ref<Receipt | null>(null);
const loading = ref(true);
const notFound = ref(false);
const fetchError = ref(false);
const copied = ref(false);
const printedAt = ref<string | null>(null);

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
  icon: 'check' | 'refresh' | 'x' | 'clock';
  bg: string;
  text: string;
}

const statusConfig = computed((): StatusConfig => {
  const s = status.value;
  if (s === 'completed' || s === 'success') return {
    label: isPos.value ? 'Sale Completed' : 'Payment Successful',
    icon: 'check',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  };
  if (s === 'refunded') return {
    label: 'Amount Refunded',
    icon: 'refresh',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  };
  if (s === 'voided' || s === 'failed') return {
    label: s === 'voided' ? 'Transaction Voided' : 'Payment Failed',
    icon: 'x',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  };
  return {
    label: 'Pending',
    icon: 'clock',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-[#246BFD] dark:text-[#5089FF]',
  };
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
  // Stamped fresh on every print — distinct from the transaction date, since a printed/PDF
  // copy is often filed away and re-printed later (expense claims, insurance, disputes).
  printedAt.value = new Date().toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' });

  // The receipt should always print in light mode, regardless of the app's current theme.
  const root = document.documentElement;
  const wasDark = root.classList.contains('dark');
  if (wasDark) root.classList.remove('dark');

  const restore = () => {
    if (wasDark) root.classList.add('dark');
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  window.print();
}

onMounted(() => adsStore.load());
</script>

<template>
  <!-- pt-20 clears the fixed 80px site nav (print:min-h-0/pt-0 since the nav is print:hidden) -->
  <div class="min-h-screen print:min-h-0 bg-gray-50 dark:bg-gray-900 print:bg-white pt-20 print:pt-0 pb-12 print:pb-2">
    <div class="w-full max-w-2xl mx-auto px-4 sm:px-6">

      <!-- ── LOADING ── -->
      <!-- Mirrors the real receipt card's section order exactly: status → pharmacy row →
           reference band → items/total → payment details → actions. -->
      <div v-if="loading" class="pt-2">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">

          <!-- Letterhead -->
          <div class="flex items-center justify-between px-6 sm:px-8 py-4">
            <div class="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="h-2.5 w-32 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Status -->
          <div class="px-6 sm:px-8 pt-8 pb-6 flex flex-col items-center">
            <div class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
            <div class="h-2.5 w-28 bg-gray-200 dark:bg-gray-700 rounded-full mb-3"></div>
            <div class="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
            <div class="h-2.5 w-24 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Sold By -->
          <div class="px-6 sm:px-8 py-6">
            <div class="flex items-center justify-between mb-3">
              <div class="h-2.5 w-14 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
              <div class="h-6 w-24 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
            </div>
            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
              <div class="space-y-2">
                <div class="h-3.5 w-36 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="h-2.5 w-24 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Reference band -->
          <div class="mx-6 sm:mx-8 mb-6 h-14 bg-gray-50 dark:bg-gray-700/30 rounded-2xl"></div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Items -->
          <div class="px-6 sm:px-8 py-5">
            <div class="h-2.5 w-14 bg-gray-100 dark:bg-gray-700/60 rounded-full mb-4"></div>
            <div v-for="n in 2" :key="n" class="flex justify-between items-center py-2">
              <div class="space-y-2">
                <div class="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="h-2.5 w-20 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
              </div>
              <div class="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div class="h-11 -mx-6 sm:-mx-8 mt-3 bg-gray-50 dark:bg-gray-700/30"></div>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Payment details -->
          <div class="px-6 sm:px-8 py-5 space-y-3">
            <div class="h-2.5 w-28 bg-gray-100 dark:bg-gray-700/60 rounded-full mb-2"></div>
            <div v-for="n in 3" :key="n" class="flex justify-between">
              <div class="h-3 w-16 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
              <div class="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 sm:px-8 pb-6 flex gap-3">
            <div class="flex-1 h-11 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="flex-1 h-11 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- ── NOT FOUND ── -->
      <div v-else-if="notFound" class="pt-8 pb-16">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center max-w-sm mx-auto">
          <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75" class="text-red-600 dark:text-red-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Receipt Not Found</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">This receipt link is invalid or no longer available on our platform.</p>
          <a href="/" class="inline-flex items-center justify-center px-6 py-3 bg-[#246BFD] hover:bg-[#1d5cdb] text-white rounded-full font-semibold text-sm transition-colors">
            Go to FyndRx
          </a>
        </div>
      </div>

      <!-- ── FETCH ERROR ── -->
      <div v-else-if="fetchError" class="pt-8 pb-16">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-10 text-center max-w-sm mx-auto">
          <div class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75" class="text-amber-600 dark:text-amber-400">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Couldn't Load Receipt</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Something went wrong connecting to our server. Please check your connection and try again.</p>
          <button @click="retry" class="inline-flex items-center justify-center px-6 py-3 bg-[#246BFD] hover:bg-[#1d5cdb] text-white rounded-full font-semibold text-sm transition-colors">
            Try Again
          </button>
        </div>
      </div>

      <!-- ── RECEIPT ── -->
      <div v-else-if="receipt" class="pt-2">

        <!-- Utility row -->
        <div class="flex items-center justify-between mb-4 no-print">
          <router-link to="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#246BFD] dark:hover:text-[#5089FF] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to FyndRx
          </router-link>
          <span class="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Digital Receipt</span>
        </div>

        <!-- ════════════════ THE RECEIPT ════════════════ -->
        <div class="receipt-card bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden print:shadow-none print:border-gray-200">

          <!-- Letterhead: establishes FyndRx as the document's issuer at a glance —
               matters most on a shared link or a printed page found later. -->
          <div class="print:break-inside-avoid flex items-center justify-between px-6 sm:px-8 py-4 print:py-3">
            <img :src="logoBlueOrange" alt="FyndRx" class="h-5 w-auto object-contain dark:hidden" />
            <img :src="logoWhiteOrange" alt="FyndRx" class="h-5 w-auto object-contain hidden dark:block" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Verified Transaction Record</span>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Status -->
          <div class="print:break-inside-avoid px-6 sm:px-8 pt-8 pb-6 print:pt-4 print:pb-3 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" :class="statusConfig.bg">
              <svg v-if="statusConfig.icon === 'check'" class="w-7 h-7" :class="statusConfig.text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12l5 5 9-9"/>
              </svg>
              <svg v-else-if="statusConfig.icon === 'refresh'" class="w-7 h-7" :class="statusConfig.text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              <svg v-else-if="statusConfig.icon === 'x'" class="w-7 h-7" :class="statusConfig.text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
              <svg v-else class="w-7 h-7" :class="statusConfig.text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <p class="text-xs font-bold uppercase tracking-widest mb-2" :class="statusConfig.text">{{ statusConfig.label }}</p>
            <p class="text-4xl sm:text-[2.75rem] font-black text-gray-900 dark:text-white tracking-tight leading-none">{{ fmt(total) }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ dateStr }}</p>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Sold By: the pharmacy is the actual merchant of record for this order, so it
               gets the same section-header treatment (and comparable visual weight) as
               Items/Payment Details below — not just a metadata line. -->
          <div class="print:break-inside-avoid px-6 sm:px-8 py-6 print:py-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Sold By</span>
              <div class="inline-flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wide">
                <svg v-if="isPos" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
                {{ isPos ? 'POS Terminal' : 'Online Order' }}
              </div>
            </div>
            <div class="flex items-center gap-3.5">
              <LazyImage
                :src="receipt.pharmacy.logo_url || ''"
                :alt="receipt.pharmacy.name"
                aspect-ratio="square"
                class="w-14 h-14 rounded-2xl flex-shrink-0"
              />
              <div class="min-w-0">
                <p class="text-base font-bold text-gray-900 dark:text-white truncate">{{ receipt.pharmacy.name }}</p>
                <p v-if="receipt.pharmacy.address" class="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{{ receipt.pharmacy.address }}</p>
              </div>
            </div>
          </div>

          <!-- Reference band -->
          <div class="print:break-inside-avoid mx-6 sm:mx-8 mb-6 flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-2xl px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 dark:text-gray-500 flex-shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h1M17 14h1M14 17h4"/>
            </svg>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Transaction Reference</div>
              <div class="font-mono font-bold text-sm text-gray-700 dark:text-gray-200 tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">{{ displayRef }}</div>
            </div>
            <div v-if="online?.order_number" class="flex flex-col items-end flex-shrink-0">
              <div class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Order</div>
              <div class="font-mono font-bold text-sm text-gray-700 dark:text-gray-200 tracking-wider">{{ online.order_number }}</div>
            </div>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Items -->
          <div class="px-6 sm:px-8 py-5 print:py-3">
            <h3 class="print:break-after-avoid text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Items</h3>

            <!-- A real <table> so the browser can natively repeat <thead> at the top of
                 every printed page — the only reliable cross-browser way to keep "which
                 receipt is this" context on page 2+ when there are enough items to split. -->
            <table class="w-full border-collapse">
              <thead class="hidden print:table-header-group">
                <tr>
                  <th colspan="2" class="text-left pb-2 font-normal border-b border-gray-100">
                    <div class="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-gray-400">
                      <span>{{ receipt.pharmacy.name }} · Ref {{ displayRef }} (cont'd)</span>
                      <span>FyndRx</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, i) in items"
                  :key="i"
                  class="print:break-inside-avoid border-b border-gray-50 dark:border-gray-700/30"
                >
                  <td class="py-2.5 print:py-1 align-top">
                    <div class="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-0.5">{{ item.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.quantity }} × {{ fmt(item.unit_price) }}</div>
                  </td>
                  <td class="py-2.5 print:py-1 align-top text-right whitespace-nowrap">
                    <span class="text-sm font-bold text-[#246BFD] dark:text-[#5089FF]">{{ fmt(item.total) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-if="!items.length" class="py-5 text-sm text-gray-400 dark:text-gray-500 italic text-center">
              No item details available.
            </div>

            <!-- Totals: kept together as one unit so "Total Paid" never lands on a
                 different page than the line items that make it up. -->
            <div class="print:break-inside-avoid">
              <div class="mt-2 pt-2 space-y-1.5">
                <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span><span>{{ fmt(subtotal) }}</span>
                </div>
                <div v-if="discount > 0" class="flex justify-between text-sm text-red-600 dark:text-red-400">
                  <span>Discount</span><span>− {{ fmt(discount) }}</span>
                </div>
                <div v-if="deliveryFee > 0" class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Delivery</span><span>{{ fmt(deliveryFee) }}</span>
                </div>
                <div v-if="taxAmount && taxAmount > 0" class="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>Incl. Tax{{ taxRate ? ` (${(taxRate * 100).toFixed(0)}%)` : '' }}</span>
                  <span>{{ fmt(taxAmount) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center mt-4 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                <span class="text-sm font-bold text-gray-900 dark:text-white">Total Paid</span>
                <span class="text-base font-black text-[#246BFD] dark:text-[#5089FF]">{{ fmt(total) }}</span>
              </div>
            </div>
          </div>

          <div class="border-t border-dashed border-gray-200 dark:border-gray-700"></div>

          <!-- Payment details -->
          <div class="print:break-inside-avoid px-6 sm:px-8 py-5 print:py-3">
            <h3 class="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Payment Details</h3>
            <div class="space-y-2.5">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Method</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ paymentMethodLabel }}</span>
              </div>
              <div v-if="pos?.cashier" class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Cashier</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ pos.cashier }}</span>
              </div>
              <div v-if="pos?.register" class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Register</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ pos.register }}</span>
              </div>
              <div v-if="online?.customer" class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Customer</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ online.customer.name }}</span>
              </div>
              <div v-if="online?.customer?.email" class="flex justify-between items-start">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Email</span>
                <span class="text-xs font-semibold text-gray-900 dark:text-white text-right ml-2 break-all">{{ online.customer.email }}</span>
              </div>
              <div v-if="paidAtStr" class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Paid At</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ paidAtStr }}</span>
              </div>
              <div v-if="online?.delivery_method" class="flex justify-between items-center">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Delivery</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2 capitalize">{{ online.delivery_method }}</span>
              </div>
              <div v-if="online?.delivery_address" class="flex justify-between items-start">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Address</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2">{{ online.delivery_address }}</span>
              </div>
              <div v-if="pos?.notes" class="flex justify-between items-start">
                <span class="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Notes</span>
                <span class="text-sm font-semibold text-gray-900 dark:text-white text-right ml-2 italic">{{ pos.notes }}</span>
              </div>
              <div v-if="online?.refund_reason" class="flex justify-between items-start">
                <span class="text-sm text-red-500 flex-shrink-0">Refund Reason</span>
                <span class="text-sm font-semibold text-red-600 dark:text-red-400 text-right ml-2">{{ online.refund_reason }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 sm:px-8 pb-6 flex gap-3 no-print">
            <button
              @click="shareReceipt"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-[#246BFD] hover:bg-[#1d5cdb] text-white text-sm font-semibold transition-colors active:scale-[0.97]"
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
              class="flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white text-sm font-semibold transition-colors active:scale-[0.97]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
          </div>
        </div>
        <!-- /receipt card -->

        <!-- Footer -->
        <div class="print:break-inside-avoid text-center pt-6 pb-2 print:pt-3">
          <div class="flex items-center justify-center mb-3 print:mb-2">
            <img :src="logoBlueOrange" alt="FyndRx" class="h-6 print:h-8 w-auto object-contain dark:hidden" />
            <img :src="logoWhiteOrange" alt="FyndRx" class="h-6 print:h-8 w-auto object-contain hidden dark:block" />
          </div>
          <div class="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">This is a computer-generated digital receipt.</div>
          <div class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">www.fyndrx.com · support@fyndrx.com</div>
          <div v-if="printedAt" class="hidden print:block text-[10px] text-gray-400 mt-2">Printed on {{ printedAt }}</div>
        </div>

        <!-- Z7: Post-checkout contextual spotlight ad -->
        <div v-if="receiptAd" class="pb-4 no-print">
          <SpotlightCardAd :ad="receiptAd" zone="Z7-post-checkout" />
        </div>

      </div><!-- /receipt -->
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print { display: none !important; }
  /* Belt-and-suspenders: guarantee the card prints flat on white paper, no drop
     shadow, regardless of any browser quirk with the print: Tailwind variant. */
  .receipt-card { box-shadow: none !important; }
}
</style>
