import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useNotification } from '@/composables/useNotification';
import { useCartStore } from '@/store/cart';
import { pharmacyService, type PharmacyPrice } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import { useDataCacheStore } from '@/store/dataCache';
import { useDistanceCalculator } from '@/composables/useDistanceCalculator';
import type { Pharmacy, PharmacyBranch } from '@/models/Pharmacy';
import type { Review, ReviewStats } from '@/models/Review';

export function usePharmacy() {
  const route = useRoute();
  const router = useRouter();
  const notification = useNotification();
  const cartStore = useCartStore();
  const dataCache = useDataCacheStore();
  const { haversineKm, formatDistance } = useDistanceCalculator();
  
  const customQuantities = ref<Record<string, number>>({});
  const { registerElement } = useScrollAnimation();

  const pharmacy = ref<Pharmacy | null>(null);
  const pharmacyPrices = ref<PharmacyPrice[]>([]);
  const reviews = ref<Review[]>([]);
  const reviewStats = ref<ReviewStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const activeTab = ref('overview');
  const medicationSearchQuery = ref('');
  const showAddReviewModal = ref(false);
  const reviewsLoading = ref(false);

  // Drug filter state
  const drugFormFilter = ref<string[]>([]);
  const stockFilter = ref<'all' | 'in_stock' | 'out_of_stock'>('all');
  const branchFilter = ref<string | null>(null);
  const sortBy = ref<'default' | 'name_asc' | 'price_asc' | 'price_desc'>('default');
  const showFilters = ref(false);

  // Services tab state
  const activeServiceCategory = ref<string | null>(null);

  // Branch state
  const branches = ref<PharmacyBranch[]>([]);
  const branchesLoading = ref(false);
  const branchesFetched = ref(false);

  // User geolocation for distance display on price cards
  const userLat = ref<number | null>(null);
  const userLng = ref<number | null>(null);

  function branchDistanceLabel(price: PharmacyPrice): string | null {
    if (userLat.value == null || userLng.value == null) return null;
    const lat = price.branch_location?.lat ?? price.latitude;
    const lng = price.branch_location?.lng ?? price.longitude;
    if (lat == null || lng == null) return null;
    return formatDistance(haversineKm(userLat.value, userLng.value, lat, lng));
  }

  // Pagination
  const currentPage = ref(1);
  const itemsPerPage = ref(12);

  const currentDayName = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());

  const serviceCategories = computed(() => {
    if (!pharmacy.value) return [];
    const seen = new Set<string>();
    return pharmacy.value.services
      .map(s => ({ key: s.category || 'other', label: s.category ? s.category.charAt(0).toUpperCase() + s.category.slice(1) : 'Other' }))
      .filter(c => { if (seen.has(c.key)) return false; seen.add(c.key); return true; });
  });

  const filteredServices = computed(() => {
    if (!pharmacy.value) return [];
    if (!activeServiceCategory.value) return pharmacy.value.services;
    return pharmacy.value.services.filter(s => (s.category || 'other') === activeServiceCategory.value);
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

  // Server-driven facets — populated from the last /pharmacy-prices response's meta
  const availableForms = ref<string[]>([]);
  const availableBranches = ref<{ id: string; name: string }[]>([]);
  const totalPrices = ref(0);
  const totalPages = ref(1);
  let priceSearchDebounce: ReturnType<typeof setTimeout> | null = null;

  const hasActiveFilters = computed(() =>
    drugFormFilter.value.length > 0 ||
    stockFilter.value !== 'all' ||
    branchFilter.value !== null ||
    sortBy.value !== 'default' ||
    medicationSearchQuery.value.trim() !== ''
  );

  function clearFilters() {
    drugFormFilter.value = [];
    stockFilter.value = 'all';
    branchFilter.value = null;
    sortBy.value = 'default';
    medicationSearchQuery.value = '';
  }

  function toggleForm(form: string) {
    const idx = drugFormFilter.value.indexOf(form);
    if (idx === -1) drugFormFilter.value = [...drugFormFilter.value, form];
    else drugFormFilter.value = drugFormFilter.value.filter(f => f !== form);
  }

  const handlePageChange = (page: number) => {
    loadPrices(page);
    const medSection = document.getElementById('inventory');
    if (medSection) {
      medSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  async function loadPrices(page = 1) {
    const id = pharmacy.value?.id;
    if (!id) return;

    const { prices, meta, availableForms: forms, availableBranches: branches } = await pharmacyService.getPricesByPharmacy(id, {
      branch_id: branchFilter.value ?? undefined,
      q: medicationSearchQuery.value.trim() || undefined,
      form: drugFormFilter.value.length ? drugFormFilter.value : undefined,
      stock: stockFilter.value,
      sort: sortBy.value,
      page,
      per_page: itemsPerPage.value,
    });

    pharmacyPrices.value = prices;
    dataCache.setPharmacyPrices(prices);
    availableForms.value = forms;
    availableBranches.value = branches;
    currentPage.value = meta?.current_page ?? page;
    totalPages.value = meta?.last_page ?? 1;
    totalPrices.value = meta?.total ?? prices.length;
  }

  watch([medicationSearchQuery], () => {
    if (priceSearchDebounce) clearTimeout(priceSearchDebounce);
    priceSearchDebounce = setTimeout(() => loadPrices(1), 300);
  });

  watch([drugFormFilter, stockFilter, branchFilter, sortBy], () => {
    loadPrices(1);
  });

  const setCustomQuantity = (priceId: string, quantity: number) => {
    customQuantities.value[priceId] = quantity;
  };

  const loadPharmacy = async () => {
    loading.value = true;
    error.value = null;
    try {
      const id = route.params.id as string;

      if (!id) {
        error.value = 'Invalid pharmacy ID';
        return;
      }

      try {
        pharmacy.value = await pharmacyService.getPharmacy(id);
      } catch (errorr: any) {
        if (errorr?.response?.status === 404 || errorr?.status === 404 || errorr?.message?.includes('404')) {
          error.value = '404';
        } else {
          error.value = errorr?.message || errorr as string || 'Pharmacy not found';
        }
        return;
      }
      
      if (pharmacy.value) {
        await loadPrices(1);
        await loadReviews();
      } else {
        error.value = 'Pharmacy not found';
      }
    } catch (err) {
      error.value = 'Failed to load pharmacy details. Please try again later.';
    } finally {
      loading.value = false;
    }
  };

  const loadReviews = async () => {
    if (!pharmacy.value) return;
    
    const pharmacyId = pharmacy.value.id;
    if (!pharmacyId) {
      error.value = 'Cannot load reviews: pharmacy.id is invalid';
      return;
    }
    
    reviewsLoading.value = true;
    try {
      const reviewsResponse = await reviewService.getReviewsByTarget('pharmacy', pharmacyId);    
      const reviewsAny = reviewsResponse as any;
      let reviewsArray: any[] = [];
      
      if (Array.isArray(reviewsAny)) {
        reviewsArray = reviewsAny;
      } else if (reviewsAny && typeof reviewsAny === 'object') {
        if (Array.isArray(reviewsAny.data)) {
          reviewsArray = reviewsAny.data;
        } else if (Array.isArray(reviewsAny.reviews)) {
          reviewsArray = reviewsAny.reviews;
        }
      }
      
      reviews.value = reviewsArray.map((review: any) => ({
        id: review.id?.toString() ?? review.id,
        userId: review.user_id?.toString() ?? review.userId?.toString() ?? '',
        userName: review.user_name ?? review.userName ?? '',
        userAvatar: review.user_avatar ?? review.userAvatar,
        targetType: review.target_type ?? review.targetType ?? review.reviewable_type ?? 'pharmacy',
        targetId: review.target_id?.toString() ?? review.targetId?.toString() ?? review.reviewable_id?.toString() ?? '',
        targetName: review.target_name ?? review.targetName,
        orderId: review.order_id?.toString() ?? review.orderId?.toString(),
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        verified: review.verified ?? false,
        helpful: review.helpful ?? review.helpful_count ?? 0,
        notHelpful: review.not_helpful ?? review.not_helpful_count ?? review.notHelpful ?? 0,
        pharmacyResponse: review.pharmacy_response ?? review.pharmacyResponse,
        createdAt: review.created_at ?? review.createdAt,
        updatedAt: review.updated_at ?? review.updatedAt
      }));
      
      reviewStats.value = await reviewService.getReviewStats('pharmacy', pharmacyId);
    } catch (err) {
      reviewStats.value = null;
    } finally {
      reviewsLoading.value = false;
    }
  };

  const handleAddReview = async (reviewData: { rating: number; title: string; comment: string }) => {
    if (!pharmacy.value) return;
    
    const pharmacyId = pharmacy.value.id;
    if (!pharmacyId || typeof pharmacyId !== 'number' || isNaN(pharmacyId)) {
      notification.error('Error', 'Invalid pharmacy ID');
      return;
    }
    
    try {
      await reviewService.addReview({
        reviewable_type: 'pharmacy',
        reviewable_id: pharmacyId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
      });
      
      await loadReviews();
      showAddReviewModal.value = false;
      notification.success('Review Submitted', 'Thank you for your feedback!');
    } catch (error) {
      notification.error('Submission Failed', 'Failed to submit review. Please try again.');
    }
  };

  const handleReviewHelpful = async (reviewId: string | number) => {
    try {
      await reviewService.markHelpful(reviewId, true);
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) (review as any).helpful = ((review as any).helpful || 0) + 1;
    } catch (error) {
      notification.error('Action Failed', 'Failed to mark review as helpful.');
    }
  };

  const handleReviewNotHelpful = async (reviewId: string | number) => {
    try {
      await reviewService.markHelpful(reviewId, false);
      const review = reviews.value.find(r => r.id === reviewId);
      if (review) (review as any).notHelpful = ((review as any).notHelpful || 0) + 1;
    } catch (error) {
      notification.error('Action Failed', 'Failed to mark review.');
    }
  };

  const addToCart = (price: PharmacyPrice, manualQuantity: number = 0) => {
    if (!pharmacy.value) return;
    
    const quantity = manualQuantity > 0 ? manualQuantity : (customQuantities.value[price.id] || 1);
    
    if (price.stock_quantity !== undefined && quantity > price.stock_quantity) {
      notification.error('Stock Limit Exceeded', `Only ${price.stock_quantity} units available in stock.`);
      return;
    }
    
    cartStore.addItem({
      medicationId: price.drug_id,
      medicationName: price.name || '',
      pharmacyId: String(pharmacy.value.id),
      pharmacyName: pharmacy.value.name,
      pharmacyLogo: pharmacy.value.logo || pharmacy.value.image,
  
      formId: price.form_id || 0,
      formName: price.form_name || '',
      strengthId: price.strength_id || 0,
      strength: price.strength || '',
      uomId: price.uom_id || 0,
      uom: price.uom || '',
      
      quantity: quantity,
      price: price.discount_price || price.price,
      discountPrice: price.discount_price,
      image: price.medication_image || (price as any).drug_image || pharmacy.value.image,
      inStock: price.in_stock || false,
      requiresPrescription: price.requires_prescription || false,
      pharmacyBranchId: price.pharmacy_branch_id || String(pharmacy.value.id),
      pharmacyDrugPriceId: price.id || ''
    });
  
    notification.success(
      'Added to Cart!',
      `${quantity} x ${price.name}`
    );
  };

  const viewMedicationDetails = (price: PharmacyPrice) => {
    if (!price.product_id) return;
    router.push({
      name: 'MedicationDetail',
      params: { id: price.product_id },
      query: {
        brand_id: price.brand_id,
        form_id: price.form_id,
        strength_id: price.strength_id,
        uom_id: price.uom_id
      }
    });
  };

  const loadBranches = async (pharmacyId: string | number) => {
    if (branchesFetched.value) return;
    branchesLoading.value = true;
    try {
      branches.value = await pharmacyService.getPharmacyBranches(String(pharmacyId));
      branchesFetched.value = true;
    } catch (e) {
      console.error('Failed to load branches', e);
    } finally {
      branchesLoading.value = false;
    }
  };

  const switchTab = (tab: string) => {
    activeTab.value = tab;
  
    if (tab === 'branches' && !branchesFetched.value && pharmacy.value) {
      loadBranches(pharmacy.value.id);
    }
  
    setTimeout(() => {
      const tabContent = document.querySelector('.tab-content-container');
      if (tabContent) {
        const yOffset = -100;
        const y = tabContent.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const initializeData = async () => {
    await loadPharmacy();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { userLat.value = pos.coords.latitude; userLng.value = pos.coords.longitude; },
        () => {}
      );
    }
  };

  return {
    pharmacy,
    pharmacyPrices,
    reviews,
    reviewStats,
    loading,
    error,
    activeTab,
    medicationSearchQuery,
    showAddReviewModal,
    reviewsLoading,
    drugFormFilter,
    stockFilter,
    branchFilter,
    sortBy,
    showFilters,
    activeServiceCategory,
    branches,
    branchesLoading,
    branchesFetched,
    userLat,
    userLng,
    currentPage,
    itemsPerPage,
    currentDayName,
    serviceCategories,
    filteredServices,
    SERVICE_CATEGORY_STYLES,
    availableForms,
    availableBranches,
    hasActiveFilters,
    totalPrices,
    totalPages,
    customQuantities,
    clearFilters,
    toggleForm,
    handlePageChange,
    setCustomQuantity,
    loadPharmacy,
    loadPrices,
    loadReviews,
    handleAddReview,
    handleReviewHelpful,
    handleReviewNotHelpful,
    addToCart,
    viewMedicationDetails,
    switchTab,
    initializeData,
    registerElement,
    branchDistanceLabel,
    router,
    route,
  };
}
