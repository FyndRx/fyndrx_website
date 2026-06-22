<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sanitizeHtml } from '@/utils/sanitize';
import { pharmacyService, type PharmacyPrice } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import type { PharmacyBranch } from '@/models/Pharmacy';
import type { Review, ReviewStats } from '@/models/Review';
import { isPharmacyOpenNow } from '@/utils/responseTransformers';
import { formatCurrency } from '@/utils/currency';
import { useNotification } from '@/composables/useNotification';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import LazyImage from '@/components/LazyImage.vue';
import PharmacyMap from '@/components/PharmacyMap.vue';
import ReviewCard from '@/components/ReviewCard.vue';
import RatingStars from '@/components/RatingStars.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';

const route = useRoute();
const router = useRouter();
const notification = useNotification();
const authStore = useAuthStore();
const cartStore = useCartStore();

const pharmacyId = route.params.pharmacyId as string;
const branchId = route.params.branchId as string;

const branch = ref<PharmacyBranch | null>(null);
const pharmacyName = ref('');
const pharmacyLogo = ref<string | undefined>(undefined);
const loading = ref(true);
const error = ref<string | null>(null);

// ── Drugs ──
const drugs = ref<PharmacyPrice[]>([]);
const drugsLoading = ref(false);
const drugSearch = ref('');
const formFilter = ref<string[]>([]);
const stockFilter = ref<'all' | 'in_stock' | 'out_of_stock'>('all');
const sortBy = ref<'default' | 'name_asc' | 'price_asc' | 'price_desc'>('default');
const showFilters = ref(false);
const currentDrugPage = ref(1);
const DRUGS_PER_PAGE = 12;

// ── Reviews ──
const reviews = ref<Review[]>([]);
const reviewStats = ref<ReviewStats | null>(null);
const reviewsLoading = ref(false);
const showReviewModal = ref(false);

// ── Geolocation ──
const userLat = ref<number | null>(null);
const userLng = ref<number | null>(null);

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

onMounted(async () => {
  try {
    const [ph, br] = await Promise.all([
      pharmacyService.getPharmacy(pharmacyId),
      pharmacyService.getPharmacyBranch(pharmacyId, branchId),
    ]);
    pharmacyName.value = ph.name;
    pharmacyLogo.value = ph.logo || ph.image || undefined;
    branch.value = br;
    loadDrugs();
    loadReviews();
  } catch {
    error.value = 'Failed to load branch details.';
  } finally {
    loading.value = false;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { userLat.value = pos.coords.latitude; userLng.value = pos.coords.longitude; },
      () => {}
    );
  }
});

async function loadDrugs() {
  drugsLoading.value = true;
  try {
    drugs.value = await pharmacyService.getPricesByPharmacy(pharmacyId, { branch_id: branchId, per_page: 100 });
  } catch {
    drugs.value = [];
  } finally {
    drugsLoading.value = false;
  }
}

function addToCart(price: PharmacyPrice) {
  if (!price.in_stock) {
    notification.error('Out of Stock', 'This medication is not currently available.');
    return;
  }
  if (price.stock_quantity != null && price.stock_quantity < 1) {
    notification.error('Out of Stock', 'This medication is not currently available.');
    return;
  }
  cartStore.addItem({
    medicationId: price.drug_id,
    medicationName: price.name || '',
    pharmacyId,
    pharmacyName: pharmacyName.value,
    pharmacyLogo: pharmacyLogo.value,
    pharmacyBranchId: branchId,
    branchName: branch.value?.branchName || '',
    brandId: price.brand_id,
    brandName: price.brand_name || '',
    formId: price.form_id || 0,
    formName: price.form_name || '',
    strengthId: price.strength_id || 0,
    strength: price.strength || '',
    uomId: price.uom_id || 0,
    uom: price.uom || '',
    quantity: 1,
    price: price.price,
    discountPrice: price.discount_price ?? undefined,
    image: price.image,
    inStock: price.in_stock ?? true,
    requiresPrescription: price.requires_prescription,
    pharmacyDrugPriceId: price.id,
    acceptedPaymentMethods: branch.value?.acceptedPaymentMethods as ('platform' | 'direct')[],
    latitude: price.latitude,
    longitude: price.longitude,
  });
  notification.success('Added to cart', `${price.name} has been added to your cart.`);
}

async function loadReviews() {
  reviewsLoading.value = true;
  try {
    const raw = await reviewService.getReviewsByTarget('pharmacy', pharmacyId) as any;
    const arr: any[] = Array.isArray(raw) ? raw : (raw?.data ?? raw?.reviews ?? []);
    reviews.value = arr.map((r: any) => ({
      id: r.id?.toString(),
      userId: r.user_id?.toString() ?? '',
      userName: r.user_name ?? r.userName ?? '',
      userAvatar: r.user_avatar ?? r.userAvatar,
      targetType: r.target_type ?? 'pharmacy',
      targetId: r.target_id?.toString() ?? '',
      targetName: r.target_name,
      orderId: r.order_id?.toString(),
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      images: r.images,
      verified: r.verified ?? false,
      helpful: r.helpful ?? r.helpful_count ?? 0,
      notHelpful: r.not_helpful ?? r.notHelpful ?? 0,
      pharmacyResponse: r.pharmacy_response ?? r.pharmacyResponse,
      createdAt: r.created_at ?? r.createdAt,
      updatedAt: r.updated_at ?? r.updatedAt,
    }));
    reviewStats.value = await reviewService.getReviewStats('pharmacy', pharmacyId);
  } catch {
    reviews.value = [];
    reviewStats.value = null;
  } finally {
    reviewsLoading.value = false;
  }
}

async function handleAddReview(data: { rating: number; title: string; comment: string }) {
  try {
    await reviewService.addReview({
      reviewable_type: 'pharmacy',
      reviewable_id: Number(pharmacyId),
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    });
    await loadReviews();
    showReviewModal.value = false;
    notification.success('Review submitted', 'Thank you for your feedback!');
  } catch {
    notification.error('Submission failed', 'Please try again.');
  }
}

async function handleReviewHelpful(reviewId: string | number) {
  try {
    await reviewService.markHelpful(reviewId, true);
    const r = reviews.value.find(x => x.id === reviewId);
    if (r) (r as any).helpful = ((r as any).helpful || 0) + 1;
  } catch { /* optimistic update — ignore API errors */ }
}

async function handleReviewNotHelpful(reviewId: string | number) {
  try {
    await reviewService.markHelpful(reviewId, false);
    const r = reviews.value.find(x => x.id === reviewId);
    if (r) (r as any).notHelpful = ((r as any).notHelpful || 0) + 1;
  } catch { /* optimistic update — ignore API errors */ }
}

// ── Branch distance ──
const lat = computed(() => branch.value?.location?.lat ?? (branch.value?.latitude ? Number(branch.value.latitude) : null));
const lng = computed(() => branch.value?.location?.lng ?? (branch.value?.longitude ? Number(branch.value.longitude) : null));
const distanceKm = computed(() => {
  if (userLat.value == null || userLng.value == null || lat.value == null || lng.value == null) return null;
  return haversineKm(userLat.value, userLng.value, lat.value, lng.value);
});
const distanceLabel = computed(() => {
  if (distanceKm.value == null) return null;
  return distanceKm.value < 1
    ? `${Math.round(distanceKm.value * 1000)} m away`
    : `${distanceKm.value.toFixed(1)} km away`;
});

const mapLocation = computed(() => lat.value && lng.value ? { lat: lat.value, lng: lng.value } : null);
const mapsUrl = computed(() =>
  lat.value && lng.value ? `https://www.google.com/maps/dir/?api=1&destination=${lat.value},${lng.value}` : null
);
const whatsappUrl = computed(() =>
  branch.value?.whatsappNumber ? `https://wa.me/${branch.value.whatsappNumber.replace(/\D/g, '')}` : null
);
const locationLine = computed(() => {
  const parts = [branch.value?.city, branch.value?.region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
});

// ── Drug filters ──
const availableForms = computed(() => {
  const s = new Set<string>();
  drugs.value.forEach(p => { if (p.form_name) s.add(p.form_name); });
  return [...s].sort();
});

const hasActiveDrugFilters = computed(() =>
  formFilter.value.length > 0 || stockFilter.value !== 'all' || sortBy.value !== 'default' || drugSearch.value.trim() !== ''
);

function toggleForm(f: string) {
  formFilter.value = formFilter.value.includes(f)
    ? formFilter.value.filter(x => x !== f)
    : [...formFilter.value, f];
}

function clearDrugFilters() {
  formFilter.value = [];
  stockFilter.value = 'all';
  sortBy.value = 'default';
  drugSearch.value = '';
}


const filteredDrugs = computed(() => {
  let list = drugs.value;
  if (drugSearch.value.trim()) {
    const q = drugSearch.value.toLowerCase();
    list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.brand_name || '').toLowerCase().includes(q));
  }
  if (formFilter.value.length) list = list.filter(p => formFilter.value.includes(p.form_name || ''));
  if (stockFilter.value === 'in_stock') list = list.filter(p => p.in_stock);
  if (stockFilter.value === 'out_of_stock') list = list.filter(p => !p.in_stock);
  if (sortBy.value === 'name_asc') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  if (sortBy.value === 'price_asc') list = [...list].sort((a, b) => (a.discount_price || a.price || 0) - (b.discount_price || b.price || 0));
  if (sortBy.value === 'price_desc') list = [...list].sort((a, b) => (b.discount_price || b.price || 0) - (a.discount_price || a.price || 0));
  return list;
});

const totalDrugPages = computed(() => Math.ceil(filteredDrugs.value.length / DRUGS_PER_PAGE));
const paginatedDrugs = computed(() => {
  const start = (currentDrugPage.value - 1) * DRUGS_PER_PAGE;
  return filteredDrugs.value.slice(start, start + DRUGS_PER_PAGE);
});

watch(filteredDrugs, () => { currentDrugPage.value = 1; });

// ── Constants ──
const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const todayKey = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());

const hoursRows = computed(() => {
  const wh = branch.value?.workingHours;
  if (!wh) return [];
  return DAYS_ORDER.map(day => ({
    day: day.charAt(0).toUpperCase() + day.slice(1),
    key: day,
    value: (wh as any)[day] ?? '–',
  }));
});

const isCurrentlyOpen = computed(() => {
  const wh = branch.value?.workingHours;
  if (wh && Object.values(wh).some(v => v !== '')) return isPharmacyOpenNow(wh);
  return branch.value?.isOpen ?? false;
});

const SERVICE_CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  dispensing:  { bg: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400',   icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  clinical:    { bg: 'bg-teal-500',   text: 'text-teal-600 dark:text-teal-400',   icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  diagnostic:  { bg: 'bg-amber-500',  text: 'text-amber-600 dark:text-amber-400', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  lab:         { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  delivery:    { bg: 'bg-[#246BFD]',  text: 'text-[#246BFD]',                     icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  wellness:    { bg: 'bg-pink-500',   text: 'text-pink-600 dark:text-pink-400',   icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  specialized: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  operational: { bg: 'bg-gray-500',   text: 'text-gray-600 dark:text-gray-400',   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
};

const STORAGE_LABELS: Record<string, string> = {
  cold_chain: 'Cold Chain', controlled_vault: 'Controlled Vault', refrigeration: 'Refrigerated', ambient: 'Ambient',
};

const hasOnlinePay = computed(() => (branch.value?.acceptedPaymentMethods ?? []).includes('platform'));
const hasCashPOS = computed(() => (branch.value?.acceptedPaymentMethods ?? []).some(m => m !== 'platform'));

const displayRating = computed(() => {
  const stored = branch.value?.rating ?? 0;
  const live = reviewStats.value?.averageRating ?? 0;
  return stored > 0 ? stored : live > 0 ? live : null;
});
const displayReviewCount = computed(() => {
  const stored = branch.value?.totalReviews ?? 0;
  const live = reviewStats.value?.totalReviews ?? 0;
  return stored > 0 ? stored : live > 0 ? live : null;
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-t-2 border-b-2 border-[#246BFD] rounded-full animate-spin"></div>
      <p class="text-sm font-semibold text-gray-500">Loading branch details…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-2xl mx-auto px-4 py-24 text-center">
      <p class="text-red-500 font-semibold mb-4">{{ error }}</p>
      <button @click="router.back()" class="px-6 py-2.5 rounded-xl bg-[#246BFD] text-white text-sm font-bold">Go back</button>
    </div>

    <template v-else-if="branch">

      <!-- ═══ HERO BANNER ═══ -->
      <div class="relative h-64 sm:h-80 overflow-hidden">
        <LazyImage
          :src="branch.bannerImage || ''"
          :alt="branch.branchName || ''"
          aspect-ratio="landscape"
          class-name="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10"></div>

        <!-- Back -->
        <button
          @click="router.push({ name: 'pharmacy', params: { id: pharmacyId }, query: { tab: 'branches' } })"
          class="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/30 backdrop-blur-sm text-white text-xs font-bold hover:bg-black/50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          {{ pharmacyName }}
        </button>

        <!-- Identity strip -->
        <div class="absolute bottom-0 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 pb-7 flex items-end gap-4">
          <div class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl ring-2 ring-white/30 shadow-2xl overflow-hidden bg-white dark:bg-gray-800">
            <LazyImage :src="pharmacyLogo || ''" :alt="pharmacyName" aspect-ratio="square" class-name="w-full h-full object-cover" />
          </div>
          <div class="min-w-0 flex-1 pb-0.5">
            <p class="text-[11px] font-bold text-white/55 uppercase tracking-widest">{{ pharmacyName }}</p>
            <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight mt-0.5">{{ branch.branchName }}</h1>
            <div class="flex items-center gap-2.5 mt-0.5 flex-wrap">
              <p v-if="locationLine" class="text-sm text-white/60">{{ locationLine }}</p>
              <span v-if="distanceLabel" class="inline-flex items-center gap-1 text-xs font-bold text-white/80 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                {{ distanceLabel }}
              </span>
            </div>
          </div>
          <!-- Rating badge -->
          <div v-if="displayRating" class="flex-shrink-0 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/10">
            <span class="text-2xl font-black text-white leading-none">{{ displayRating.toFixed(1) }}</span>
            <div class="flex gap-0.5 mt-1">
              <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= Math.round(displayRating) ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/20'" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span v-if="displayReviewCount" class="text-[10px] text-white/45 mt-0.5">{{ displayReviewCount }} review{{ displayReviewCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ STATUS STRIP ═══ -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-16 z-20 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
            :class="isCurrentlyOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="isCurrentlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
            {{ isCurrentlyOpen ? 'Open Now' : 'Closed' }}
          </span>
          <span v-if="branch.isActive === false" class="px-3 py-1.5 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Inactive</span>
          <span v-if="branch.acceptsOnlinePrescriptions" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Online Rx
          </span>
          <span v-for="s in (branch.specialStorage ?? [])" :key="s" class="px-2.5 py-1.5 text-xs font-semibold rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">{{ STORAGE_LABELS[s] ?? s }}</span>
          <!-- Distance chip in strip -->
          <span v-if="distanceLabel" class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-full bg-[#246BFD]/10 text-[#246BFD]">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
            {{ distanceLabel }}
          </span>
        </div>
      </div>

      <!-- ═══ MAIN CONTENT ═══ -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-14 mt-10">

        <!-- ─── About ─── -->
        <section v-if="branch.description">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-7 bg-[#246BFD] rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">About This Branch</h2>
          </div>
          <div
            v-html="sanitizeHtml(branch.description)"
            class="prose prose-sm dark:prose-invert max-w-3xl prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-[#246BFD] prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
          ></div>
        </section>

        <!-- ─── Contact & Info ─── -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-7 bg-emerald-500 rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Contact & Info</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div class="space-y-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</p>
              <a :href="`tel:${branch.phone}`" class="block text-lg font-black text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors">{{ branch.phone }}</a>
              <a v-if="branch.whatsappNumber" :href="whatsappUrl!" target="_blank" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
            </div>
            <div v-if="branch.email || branch.website" class="space-y-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Online</p>
              <a v-if="branch.email" :href="`mailto:${branch.email}`" class="block text-sm font-semibold text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors truncate">{{ branch.email }}</a>
              <a v-if="branch.website" :href="branch.website" target="_blank" class="inline-flex items-center gap-1 text-sm font-semibold text-[#246BFD] hover:underline">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Visit website
              </a>
            </div>
            <div v-if="branch.managerName" class="space-y-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Manager</p>
              <p class="text-base font-black text-gray-900 dark:text-white">{{ branch.managerName }}</p>
              <a v-if="branch.managerPhone" :href="`tel:${branch.managerPhone}`" class="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">{{ branch.managerPhone }}</a>
              <a v-if="branch.managerEmail" :href="`mailto:${branch.managerEmail}`" class="block text-sm text-gray-500 hover:text-[#246BFD] truncate">{{ branch.managerEmail }}</a>
            </div>
            <div v-if="(branch.languages ?? []).length > 0" class="space-y-2">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Languages Spoken</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="lang in branch.languages" :key="lang" class="px-3 py-1 text-xs font-bold rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/30">{{ lang }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── Payment Methods ─── -->
        <section v-if="(branch.acceptedPaymentMethods ?? []).length > 0">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-7 bg-amber-500 rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Payment Methods</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-if="hasOnlinePay" class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#246BFD] to-[#5089FF] p-6 shadow-lg shadow-blue-500/20">
              <div class="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10"></div>
              <div class="absolute top-8 -right-2 w-16 h-16 rounded-full bg-white/8"></div>
              <div class="relative z-10 flex items-start justify-between mb-8">
                <div><p class="text-[10px] font-black uppercase tracking-widest text-white/60">Accepted</p><p class="text-xl font-black text-white">Online Payment</p></div>
                <div class="flex flex-col items-center gap-1.5">
                  <div class="w-10 h-7 rounded-md bg-white/20 border border-white/30 relative overflow-hidden"><div class="absolute inset-y-0 left-1/2 w-px bg-white/30"></div><div class="absolute inset-x-0 top-1/2 h-px bg-white/30"></div></div>
                  <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
                </div>
              </div>
              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center gap-2"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2v-8a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2zm0-10V9a4 4 0 118 0v2"/></svg><span class="text-sm font-semibold text-white/80">Secure · Instant</span></div>
                <div class="flex gap-1"><div class="w-8 h-5 rounded bg-white/20 border border-white/30"></div><div class="w-8 h-5 rounded bg-white/10 border border-white/20"></div></div>
              </div>
            </div>
            <div v-if="hasCashPOS" class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 p-6 shadow-lg">
              <div class="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5"></div>
              <div class="absolute -bottom-2 right-10 w-16 h-16 rounded-full bg-white/4"></div>
              <div class="relative z-10 flex items-start justify-between mb-8">
                <div><p class="text-[10px] font-black uppercase tracking-widest text-white/50">Accepted</p><p class="text-xl font-black text-white">Cash & POS</p></div>
                <div class="flex gap-2 items-center">
                  <div class="w-9 h-12 rounded-lg bg-white/15 border border-white/20 flex flex-col items-center justify-between py-1.5 px-1"><div class="w-full h-2 rounded-sm bg-white/30"></div><div class="space-y-0.5 w-full px-0.5"><div class="h-px bg-white/20 rounded"></div><div class="h-px bg-white/20 rounded"></div><div class="h-px bg-white/20 rounded w-2/3"></div></div><div class="w-4 h-3 rounded-sm bg-emerald-500/70"></div></div>
                  <div class="w-12 h-7 rounded-md bg-emerald-600/40 border border-emerald-500/30 flex items-center justify-center"><div class="w-4 h-4 rounded-full border border-emerald-400/50 flex items-center justify-center"><span class="text-[8px] font-black text-emerald-300">₵</span></div></div>
                </div>
              </div>
              <div class="relative z-10 flex items-center gap-2"><svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg><span class="text-sm font-semibold text-white/70">Cash · Debit · Credit</span></div>
            </div>
          </div>
        </section>

        <!-- ─── Delivery ─── -->
        <section v-if="branch.deliveryInfo">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-7 bg-[#246BFD] rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Delivery</h2>
          </div>
          <div v-if="!branch.deliveryInfo.available" class="flex items-center gap-4 p-5 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg></div>
            <div><p class="font-bold text-gray-700 dark:text-gray-300">Pickup Only</p><p class="text-sm text-gray-500">No home delivery from this branch.</p></div>
          </div>
          <div v-else class="grid grid-cols-3 gap-4">
            <div class="rounded-2xl bg-[#246BFD]/8 dark:bg-[#246BFD]/15 border border-[#246BFD]/15 p-5 text-center"><p class="text-[10px] font-black uppercase tracking-widest text-[#246BFD]/70 mb-1">Base Fee</p><p class="text-3xl font-black text-[#246BFD]">₵{{ branch.deliveryInfo.baseFee?.toFixed(2) ?? '–' }}</p></div>
            <div class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 text-center"><p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Per km</p><p class="text-3xl font-black text-gray-900 dark:text-white">₵{{ branch.deliveryInfo.feePerKm?.toFixed(2) ?? '–' }}</p></div>
            <div class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 text-center"><p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Radius</p><p class="text-3xl font-black text-gray-900 dark:text-white">{{ branch.deliveryInfo.radiusKm ?? '∞' }}<span class="text-base font-normal text-gray-400"> km</span></p></div>
          </div>
        </section>

        <!-- ─── Services ─── -->
        <section v-if="(branch.services ?? []).length > 0">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-7 bg-teal-500 rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Services</h2>
            <span class="text-sm font-bold text-gray-400">{{ branch.services!.length }}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="service in branch.services" :key="service.slug || service.id"
              class="group relative flex items-start gap-4 p-5 rounded-2xl border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
            >
              <div class="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.bg ?? 'bg-gray-300 dark:bg-gray-600'"></div>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700/60 transition-transform duration-300 group-hover:scale-110">
                <svg class="w-5 h-5" :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500 dark:text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="SERVICE_CATEGORY_STYLES[service.category ?? '']?.icon ?? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">{{ service.name }}</h4>
                  <span v-if="service.category" class="flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700" :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500'">{{ service.category }}</span>
                </div>
                <p v-if="service.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{{ service.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ─── Operating Hours ─── -->
        <section v-if="hoursRows.length > 0">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-1 h-7 bg-violet-500 rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Operating Hours</h2>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div v-for="row in hoursRows" :key="row.key"
              class="flex items-center px-6 py-3.5 border-b last:border-b-0 border-gray-100 dark:border-gray-700/60"
              :class="row.key === todayKey ? 'bg-[#246BFD]/5 dark:bg-[#246BFD]/10' : ''"
            >
              <div class="flex items-center gap-2.5 w-36 flex-shrink-0">
                <span class="text-sm font-semibold" :class="row.key === todayKey ? 'text-[#246BFD]' : 'text-gray-700 dark:text-gray-300'">{{ row.day }}</span>
                <span v-if="row.key === todayKey" class="text-[9px] font-black text-white bg-[#246BFD] px-1.5 py-0.5 rounded-full leading-none">TODAY</span>
              </div>
              <div class="flex-1 mx-4 border-t border-dashed border-gray-200 dark:border-gray-700/60"></div>
              <span class="text-sm font-bold" :class="[
                row.value.toLowerCase() === 'closed' ? 'text-red-500 dark:text-red-400' :
                row.value.toLowerCase().includes('24') ? 'text-emerald-600 dark:text-emerald-400' :
                row.key === todayKey ? 'text-[#246BFD]' : 'text-gray-900 dark:text-white'
              ]">{{ row.value }}</span>
            </div>
          </div>
        </section>

        <!-- ─── Location ─── -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-1 h-7 bg-orange-500 rounded-full"></div>
              <h2 class="text-xl font-black text-gray-900 dark:text-white">Location</h2>
            </div>
            <a v-if="mapsUrl" :href="mapsUrl" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#246BFD] hover:underline">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Open in Maps
            </a>
          </div>
          <!-- Address + distance -->
          <div class="mb-4 flex items-start gap-3">
            <div class="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <p class="font-bold text-gray-900 dark:text-white text-base leading-snug">{{ branch.address }}</p>
              <p v-if="locationLine" class="text-sm font-semibold text-[#246BFD] mt-0.5">{{ locationLine }}</p>
              <p v-if="branch.digitalAddress" class="text-xs font-mono text-gray-400 mt-0.5">{{ branch.digitalAddress }}</p>
              <p v-if="distanceLabel" class="inline-flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                <svg class="w-3.5 h-3.5 text-[#246BFD]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                {{ distanceLabel }} from your location
              </p>
            </div>
          </div>
          <div class="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm h-72 sm:h-96">
            <PharmacyMap v-if="mapLocation" :location="mapLocation" :pharmacy-name="branch.branchName || pharmacyName" class="w-full h-full" />
            <div v-else class="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3 text-gray-400">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
              <p class="text-sm font-medium">Location coordinates not available</p>
            </div>
          </div>
        </section>

        <!-- ─── Available Medications ─── -->
        <section>
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-7 bg-pink-500 rounded-full"></div>
            <h2 class="text-xl font-black text-gray-900 dark:text-white">Available Medications</h2>
            <span v-if="!drugsLoading && drugs.length > 0" class="text-sm font-bold text-gray-400">{{ drugs.length }}</span>
          </div>

          <!-- Search + filter bar -->
          <div v-if="!drugsLoading && drugs.length > 0" class="space-y-3 mb-5">
            <div class="flex items-center gap-3">
              <!-- Search -->
              <div class="relative flex-1 group">
                <input v-model="drugSearch" type="text" placeholder="Search medications…"
                  class="w-full h-11 pl-10 pr-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-[#246BFD]/20 text-sm font-semibold placeholder:text-gray-400 transition-all"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <!-- Filter toggle -->
              <button @click="showFilters = !showFilters"
                class="h-11 px-4 flex items-center gap-2 rounded-xl border text-sm font-bold transition-all flex-shrink-0"
                :class="hasActiveDrugFilters
                  ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD]'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                Filters
                <span v-if="hasActiveDrugFilters" class="w-2 h-2 rounded-full bg-white/80"></span>
              </button>
            </div>

            <!-- Filter panel -->
            <Transition
              enter-active-class="transition-all duration-250 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-show="showFilters" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg p-5 space-y-5">
                <div class="flex flex-wrap gap-6">
                  <!-- Form pills -->
                  <div v-if="availableForms.length > 0">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Form</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button v-for="f in availableForms" :key="f" @click="toggleForm(f)"
                        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                        :class="formFilter.includes(f) ? 'bg-[#246BFD] text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#246BFD]/10 hover:text-[#246BFD]'"
                      >{{ f }}</button>
                    </div>
                  </div>
                  <!-- Stock -->
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Stock</p>
                    <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                      <button v-for="opt in [{ key: 'all', label: 'All' }, { key: 'in_stock', label: 'In Stock' }, { key: 'out_of_stock', label: 'Out of Stock' }]"
                        :key="opt.key" @click="stockFilter = opt.key as any"
                        class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                        :class="stockFilter === opt.key ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'"
                      >{{ opt.label }}</button>
                    </div>
                  </div>
                  <!-- Sort -->
                  <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Sort by</p>
                    <div class="flex flex-wrap gap-1.5">
                      <button v-for="opt in [{ key: 'default', label: 'Default' }, { key: 'name_asc', label: 'Name A–Z' }, { key: 'price_asc', label: 'Price ↑' }, { key: 'price_desc', label: 'Price ↓' }]"
                        :key="opt.key" @click="sortBy = opt.key as any"
                        class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                        :class="sortBy === opt.key ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20'"
                      >{{ opt.label }}</button>
                    </div>
                  </div>
                </div>
                <!-- Active chips -->
                <div v-if="hasActiveDrugFilters" class="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex-wrap">
                  <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Active:</span>
                  <span v-if="drugSearch.trim()" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">"{{ drugSearch }}" <button @click="drugSearch = ''" class="hover:text-red-500">×</button></span>
                  <span v-for="f in formFilter" :key="f" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#246BFD]/10 text-[#246BFD]">{{ f }} <button @click="toggleForm(f)" class="hover:text-red-500">×</button></span>
                  <span v-if="stockFilter !== 'all'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{{ stockFilter === 'in_stock' ? 'In Stock' : 'Out of Stock' }} <button @click="stockFilter = 'all'" class="hover:text-red-500">×</button></span>
                  <span v-if="sortBy !== 'default'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">{{ sortBy === 'name_asc' ? 'Name A–Z' : sortBy === 'price_asc' ? 'Price ↑' : 'Price ↓' }} <button @click="sortBy = 'default'" class="hover:text-red-500">×</button></span>
                  <button @click="clearDrugFilters" class="ml-auto text-xs font-bold text-red-500 hover:text-red-600">Clear all</button>
                </div>
                <p class="text-xs font-semibold text-gray-400">Showing <span class="font-bold text-gray-900 dark:text-white">{{ filteredDrugs.length }}</span> of {{ drugs.length }}</p>
              </div>
            </Transition>
          </div>

          <!-- Loading skeleton -->
          <div v-if="drugsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-pulse">
              <div class="h-36 bg-gray-200 dark:bg-gray-700"></div>
              <div class="p-4 space-y-2"><div class="h-4 bg-gray-100 dark:bg-gray-600 rounded w-3/4"></div><div class="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div><div class="h-5 bg-gray-100 dark:bg-gray-600 rounded w-1/3 mt-3"></div></div>
            </div>
          </div>

          <!-- Drug grid -->
          <div v-else-if="filteredDrugs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="price in paginatedDrugs" :key="price.id"
              class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <!-- Image -->
              <div class="relative h-40 bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0 cursor-pointer"
                @click="price.product_id && $router.push({ name: 'MedicationDetail', params: { id: price.product_id } })"
              >
                <LazyImage :src="price.image || price.medication_image || (price as any).drug_image || ''" :alt="price.name || ''" aspect-ratio="square" class-name="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <!-- Badges -->
                <div class="absolute top-2.5 left-2.5 flex flex-col gap-1">
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm border"
                    :class="price.in_stock ? 'bg-green-500/90 border-green-400/20 text-white' : 'bg-red-500/90 border-red-400/20 text-white'">
                    <span class="w-1.5 h-1.5 rounded-full bg-white" :class="price.in_stock ? 'animate-pulse' : ''"></span>
                    {{ price.in_stock ? 'In Stock' : 'Restocking' }}
                  </span>
                  <span v-if="price.requires_prescription" class="inline-flex items-center px-2 py-1 text-[10px] font-bold rounded-lg bg-[#246BFD]/90 backdrop-blur-sm border border-[#246BFD]/20 text-white">Rx Required</span>
                </div>
              </div>

              <!-- Body -->
              <div class="p-4 flex flex-col flex-1">
                <div class="flex-1">
                  <h4
                    class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors line-clamp-3 leading-snug mb-1 cursor-pointer"
                    @click="price.product_id && $router.push({ name: 'MedicationDetail', params: { id: price.product_id } })"
                  >{{ price.name }}</h4>
                </div>

                <!-- Price -->
                <div class="flex items-baseline gap-1.5 mt-3 mb-3">
                  <span class="text-lg font-black text-[#246BFD]">{{ formatCurrency(price.discount_price || price.price) }}</span>
                  <span v-if="price.discount_price" class="text-xs text-gray-400 line-through">{{ formatCurrency(price.price) }}</span>
                  <span v-if="price.discount_price" class="ml-auto text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                    -{{ Math.round(((price.price - price.discount_price) / price.price) * 100) }}%
                  </span>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <button
                    v-if="price.product_id"
                    @click="$router.push({ name: 'MedicationDetail', params: { id: price.product_id } })"
                    class="flex-1 h-9 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD] transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    Details
                  </button>
                  <button
                    @click="addToCart(price)"
                    :disabled="!price.in_stock"
                    class="flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    :class="price.in_stock
                      ? 'bg-[#246BFD] text-white hover:bg-[#1a56d6] shadow-sm shadow-blue-500/20 active:scale-95'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400'"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    {{ price.in_stock ? 'Add to Cart' : 'Unavailable' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="!drugsLoading && totalDrugPages > 1" class="flex items-center justify-between mt-8 gap-4">
            <p class="text-xs font-semibold text-gray-400 hidden sm:block">
              Showing {{ (currentDrugPage - 1) * DRUGS_PER_PAGE + 1 }}–{{ Math.min(currentDrugPage * DRUGS_PER_PAGE, filteredDrugs.length) }} of {{ filteredDrugs.length }}
            </p>
            <div class="flex items-center gap-1.5 mx-auto sm:mx-0">
              <button
                @click="currentDrugPage--"
                :disabled="currentDrugPage === 1"
                class="h-9 w-9 flex items-center justify-center rounded-xl border font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                :class="currentDrugPage === 1 ? 'border-gray-200 dark:border-gray-700 text-gray-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD]'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <template v-for="p in totalDrugPages" :key="p">
                <button
                  v-if="p === 1 || p === totalDrugPages || Math.abs(p - currentDrugPage) <= 1"
                  @click="currentDrugPage = p"
                  class="h-9 min-w-[2.25rem] px-2 flex items-center justify-center rounded-xl border text-sm font-bold transition-all"
                  :class="p === currentDrugPage
                    ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-md shadow-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD]'"
                >{{ p }}</button>
                <span
                  v-else-if="p === 2 && currentDrugPage > 3 || p === totalDrugPages - 1 && currentDrugPage < totalDrugPages - 2"
                  class="h-9 w-9 flex items-center justify-center text-gray-400 text-sm select-none"
                >…</span>
              </template>
              <button
                @click="currentDrugPage++"
                :disabled="currentDrugPage === totalDrugPages"
                class="h-9 w-9 flex items-center justify-center rounded-xl border font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                :class="currentDrugPage === totalDrugPages ? 'border-gray-200 dark:border-gray-700 text-gray-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD]'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <!-- Empty / no match -->
          <div v-if="!drugsLoading && filteredDrugs.length === 0" class="py-16 text-center">
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <p class="text-sm font-semibold text-gray-400">{{ hasActiveDrugFilters ? 'No medications match your filters.' : 'No medications listed for this branch.' }}</p>
            <button v-if="hasActiveDrugFilters" @click="clearDrugFilters" class="mt-3 text-xs font-bold text-[#246BFD] hover:underline">Clear filters</button>
          </div>
        </section>

        <!-- ─── Ratings & Reviews ─── -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-1 h-7 bg-yellow-500 rounded-full"></div>
              <h2 class="text-xl font-black text-gray-900 dark:text-white">Ratings & Reviews</h2>
            </div>
            <button v-if="authStore.isAuthenticated" @click="showReviewModal = true"
              class="px-5 py-2.5 bg-[#246BFD] hover:bg-[#1a56d6] text-white text-sm font-bold rounded-xl shadow-md active:scale-95 transition-all"
            >Write a Review</button>
          </div>

          <!-- Loading -->
          <div v-if="reviewsLoading" class="py-12 text-center">
            <div class="w-8 h-8 border-t-2 border-b-2 border-[#246BFD] rounded-full animate-spin mx-auto"></div>
          </div>

          <template v-else>
            <!-- Stats block -->
            <div v-if="reviewStats && reviewStats.totalReviews > 0" class="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mb-6">
              <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div class="text-center lg:text-left flex-shrink-0">
                  <span class="text-6xl font-black text-gray-900 dark:text-white">{{ (reviewStats.averageRating || 0).toFixed(1) }}</span>
                  <div class="mt-2"><RatingStars :rating="reviewStats.averageRating || 0" size="lg" /></div>
                  <p class="text-xs font-semibold text-gray-400 mt-1">{{ reviewStats.totalReviews }} review{{ reviewStats.totalReviews !== 1 ? 's' : '' }}</p>
                </div>
                <div class="flex-1 space-y-2">
                  <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                    <span class="text-xs font-bold text-gray-500 w-3 text-right">{{ star }}</span>
                    <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <div class="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div class="h-full bg-amber-400 rounded-full transition-all duration-700"
                        :style="{ width: `${reviewStats.totalReviews ? (((reviewStats.ratingDistribution as any)?.[star] || 0) / reviewStats.totalReviews) * 100 : 0}%` }"
                      ></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-400 w-6 text-right">{{ (reviewStats.ratingDistribution as any)?.[star] || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No reviews yet -->
            <div v-if="reviews.length === 0" class="py-16 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
              <div class="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </div>
              <p class="font-bold text-gray-900 dark:text-white mb-1">No reviews yet</p>
              <p class="text-sm text-gray-400 mb-4">Be the first to share your experience.</p>
              <button v-if="authStore.isAuthenticated" @click="showReviewModal = true" class="px-5 py-2.5 bg-[#246BFD] text-white text-sm font-bold rounded-xl hover:bg-[#1a56d6] active:scale-95 transition-all">Write a Review</button>
            </div>

            <!-- Review list -->
            <div v-else class="space-y-4">
              <ReviewCard
                v-for="review in reviews"
                :key="review.id"
                :review="review"
                class="!rounded-2xl !bg-white dark:!bg-gray-800 !shadow-sm !border !border-gray-100 dark:!border-gray-700/50"
                @helpful="handleReviewHelpful"
                @not-helpful="handleReviewNotHelpful"
              />
            </div>
          </template>
        </section>

        <!-- ─── Footer actions ─── -->
        <div class="flex gap-3 pt-2 pb-4">
          <a :href="`tel:${branch.phone}`" class="flex-1 py-3.5 rounded-2xl bg-[#246BFD] text-white font-bold text-sm text-center hover:bg-[#1a56d6] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">Call Branch</a>
          <a v-if="whatsappUrl" :href="whatsappUrl" target="_blank" class="flex-1 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-sm text-center hover:bg-emerald-600 active:scale-[0.98] transition-all">WhatsApp</a>
          <a v-if="mapsUrl" :href="mapsUrl" target="_blank" class="flex-1 py-3.5 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm text-center border border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:text-[#246BFD] active:scale-[0.98] transition-all">Directions</a>
        </div>

      </div>
    </template>

    <AddReviewModal
      :show="showReviewModal"
      target-type="pharmacy"
      :target-id="pharmacyId"
      :target-name="branch?.branchName ?? pharmacyName"
      @close="showReviewModal = false"
      @submit="handleAddReview"
    />
  </div>
</template>
