import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { pharmacyService, type PharmacyPrice } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import type { PharmacyBranch } from '@/models/Pharmacy';
import type { Review, ReviewStats } from '@/models/Review';
import { useDistanceCalculator } from '@/composables/useDistanceCalculator';
import { isPharmacyOpenNow } from '@/utils/responseTransformers';
import { useNotification } from '@/composables/useNotification';
import { useCartStore } from '@/store/cart';

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const SERVICE_CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  dispensing:  { bg: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400',   icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  clinical:    { bg: 'bg-teal-500',   text: 'text-teal-600 dark:text-teal-400',   icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  diagnostic:  { bg: 'bg-amber-500',  text: 'text-amber-600 dark:text-amber-400', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  lab:         { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  delivery:    { bg: 'bg-[#246BFD]',  text: 'text-[#246BFD]',                     icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  wellness:    { bg: 'bg-pink-500',   text: 'text-pink-600 dark:text-pink-400',   icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  specialized: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  operational: { bg: 'bg-gray-500',   text: 'text-gray-600 dark:text-gray-400',   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export const STORAGE_LABELS: Record<string, string> = {
  cold_chain: 'Cold Chain', controlled_vault: 'Controlled Vault', refrigeration: 'Refrigerated', ambient: 'Ambient',
};

const DRUGS_PER_PAGE = 12;

export function useBranchDetail() {
  const route = useRoute();
  const router = useRouter();
  const notification = useNotification();
  const cartStore = useCartStore();
  const { haversineKm, formatDistance } = useDistanceCalculator();

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

  // ── Reviews ──
  const reviews = ref<Review[]>([]);
  const reviewStats = ref<ReviewStats | null>(null);
  const reviewsLoading = ref(false);
  const showReviewModal = ref(false);

  // ── Geolocation ──
  const userLat = ref<number | null>(null);
  const userLng = ref<number | null>(null);

  async function loadDrugs(page = 1) {
    drugsLoading.value = true;
    try {
      const { prices, meta, availableForms: forms } = await pharmacyService.getPricesByPharmacy(pharmacyId, {
        branch_id: branchId,
        q: drugSearch.value.trim() || undefined,
        form: formFilter.value.length ? formFilter.value : undefined,
        stock: stockFilter.value,
        sort: sortBy.value,
        page,
        per_page: DRUGS_PER_PAGE,
      });
      drugs.value = prices;
      availableForms.value = forms;
      currentDrugPage.value = meta?.current_page ?? page;
      totalDrugPages.value = meta?.last_page ?? 1;
      totalDrugs.value = meta?.total ?? prices.length;
    } catch {
      drugs.value = [];
      totalDrugs.value = 0;
      totalDrugPages.value = 1;
    } finally {
      drugsLoading.value = false;
    }
  }

  function goToDrugPage(page: number) {
    loadDrugs(page);
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
    return formatDistance(distanceKm.value) + ' away';
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

  // ── Drug filters (server-driven — search/filter/sort/pagination all happen in the API) ──
  const availableForms = ref<string[]>([]);
  const totalDrugs = ref(0);
  const totalDrugPages = ref(1);
  let drugSearchDebounce: ReturnType<typeof setTimeout> | null = null;

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

  watch([formFilter, stockFilter, sortBy], () => {
    currentDrugPage.value = 1;
    loadDrugs(1);
  });

  watch(drugSearch, () => {
    if (drugSearchDebounce) clearTimeout(drugSearchDebounce);
    drugSearchDebounce = setTimeout(() => {
      currentDrugPage.value = 1;
      loadDrugs(1);
    }, 300);
  });

  // ── Hours ──
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

  async function initializeData() {
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
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.status === 404 || err?.message?.includes('404')) {
        error.value = '404';
      } else {
        error.value = 'Failed to load branch details.';
      }
    } finally {
      loading.value = false;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { userLat.value = pos.coords.latitude; userLng.value = pos.coords.longitude; },
        () => {}
      );
    }
  }

  return {
    router,
    pharmacyId,
    branchId,
    branch,
    pharmacyName,
    pharmacyLogo,
    loading,
    error,
    drugs,
    drugsLoading,
    drugSearch,
    formFilter,
    stockFilter,
    sortBy,
    showFilters,
    currentDrugPage,
    DRUGS_PER_PAGE,
    reviews,
    reviewStats,
    reviewsLoading,
    showReviewModal,
    distanceLabel,
    mapLocation,
    mapsUrl,
    whatsappUrl,
    locationLine,
    availableForms,
    totalDrugs,
    hasActiveDrugFilters,
    toggleForm,
    clearDrugFilters,
    goToDrugPage,
    totalDrugPages,
    todayKey,
    hoursRows,
    isCurrentlyOpen,
    hasOnlinePay,
    hasCashPOS,
    displayRating,
    displayReviewCount,
    addToCart,
    handleAddReview,
    handleReviewHelpful,
    handleReviewNotHelpful,
    initializeData,
  };
}
