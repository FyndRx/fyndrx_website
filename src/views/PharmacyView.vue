<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useNotification } from '@/composables/useNotification';
import { useCartStore } from '@/store/cart';
import { pharmacyService, type PharmacyPrice } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import { useDataCacheStore } from '@/store/dataCache';
import { formatCurrency } from '@/utils/currency';
import type { Pharmacy, PharmacyBranch } from '@/models/Pharmacy';
import type { Review, ReviewStats } from '@/models/Review';
import LazyImage from '@/components/LazyImage.vue';
import RatingStars from '@/components/RatingStars.vue';
import ReviewCard from '@/components/ReviewCard.vue';

import AddReviewModal from '@/components/AddReviewModal.vue';
import Pagination from '@/components/Pagination.vue';
import PharmacyMap from '@/components/PharmacyMap.vue';


const route = useRoute();
const router = useRouter();
const notification = useNotification();
const cartStore = useCartStore();
const dataCache = useDataCacheStore();
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function branchDistanceLabel(price: PharmacyPrice): string | null {
  if (userLat.value == null || userLng.value == null) return null;
  const lat = price.branch_location?.lat ?? price.latitude;
  const lng = price.branch_location?.lng ?? price.longitude;
  if (lat == null || lng == null) return null;
  return fmtDist(haversineKm(userLat.value, userLng.value, lat, lng));
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


const availableForms = computed(() => {
  const forms = new Set<string>();
  pharmacyPrices.value.forEach(p => { if (p.form_name) forms.add(p.form_name); });
  return [...forms].sort();
});

const availableBranches = computed(() => {
  const map = new Map<string, string>();
  pharmacyPrices.value.forEach(p => {
    if (p.branch_id && p.branch_name) map.set(p.branch_id, p.branch_name);
  });
  return [...map.entries()].map(([id, name]) => ({ id, name }));
});

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

const filteredPrices = computed(() => {
  let prices = pharmacyPrices.value;

  if (medicationSearchQuery.value.trim()) {
    const q = medicationSearchQuery.value.toLowerCase();
    prices = prices.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.brand_name || '').toLowerCase().includes(q)
    );
  }

  if (drugFormFilter.value.length > 0) {
    prices = prices.filter(p => drugFormFilter.value.includes(p.form_name || ''));
  }

  if (stockFilter.value === 'in_stock') {
    prices = prices.filter(p => p.in_stock);
  } else if (stockFilter.value === 'out_of_stock') {
    prices = prices.filter(p => !p.in_stock);
  }

  if (branchFilter.value) {
    prices = prices.filter(p => p.branch_id === branchFilter.value);
  }

  if (sortBy.value === 'name_asc') {
    prices = [...prices].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy.value === 'price_asc') {
    prices = [...prices].sort((a, b) => (a.discount_price || a.price || 0) - (b.discount_price || b.price || 0));
  } else if (sortBy.value === 'price_desc') {
    prices = [...prices].sort((a, b) => (b.discount_price || b.price || 0) - (a.discount_price || a.price || 0));
  }

  return prices;
});

watch([medicationSearchQuery, drugFormFilter, stockFilter, branchFilter, sortBy], () => {
  currentPage.value = 1;
});

const paginatedPrices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPrices.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredPrices.value.length / itemsPerPage.value));

const handlePageChange = (page: number) => {
  currentPage.value = page;
  // Scroll to top of medications list
  const medSection = document.getElementById('medications-section');
  if (medSection) {
    medSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const setCustomQuantity = (priceId: string, quantity: number) => {
  customQuantities.value[priceId] = quantity;
};

// addToCart logic unified below...

const loadPharmacy = async () => {
  loading.value = true;
  error.value = null;
  try {
    const id = route.params.id as string;

    if (!id) {
      error.value = 'Invalid pharmacy ID';
      return;
    }

    // Get pharmacy details directly from API
    try {
      pharmacy.value = await pharmacyService.getPharmacy(id);
    } catch (errorr) {
    // } catch (pharmacyErr: any) {
      // If pharmacy detail endpoint doesn't exist (404), try to get pharmacy info from prices
      // if (pharmacyErr?.response?.status === 404 || pharmacyErr?.message?.includes('404')) {
      //   const prices = await pharmacyService.getPricesByPharmacy(id);
      //   if (prices.length > 0) {
      //     const firstPrice = prices[0];
      //     const pharmacyInfo = firstPrice.pharmacy || firstPrice.pharmacy_branch;
          
      //     if (pharmacyInfo) {
      //       // Use pharmacy info directly from price response - use API field names
      //       pharmacy.value = {
      //         id: pharmacyInfo.id || firstPrice.pharmacy_id || id,
      //         name: pharmacyInfo.name || '',
      //         address: pharmacyInfo.address || '',
      //         rating: (pharmacyInfo as any).rating || 0,
      //         reviews: [],
      //         image: (pharmacyInfo as any).logo || '',
      //         isOpen: (pharmacyInfo as any).is_open ?? true,
      //         distance: (pharmacyInfo as any).distance || '',
      //         services: [],
      //         workingHours: {
      //           monday: '',
      //           tuesday: '',
      //           wednesday: '',
      //           thursday: '',
      //           friday: '',
      //           saturday: '',
      //           sunday: ''
      //         },
      //         phone: '',
      //         email: '',
      //         website: '',
      //         description: '',
      //         location: { lat: 0, lng: 0 },
      //         medications: []
      //       };
      //     } else {
      //       error.value = 'Pharmacy not found';
      //       return;
      //     }
      //   } else {
      //     error.value = 'Pharmacy not found';
      //     return;
      //   }
      // } else {
        // throw pharmacyErr;
      // }
      error.value = errorr as string || 'Pharmacy not found';
      return;
    }
    
    if (pharmacy.value) {
      // Get prices for this pharmacy and cache them (requesting large page size to get all)
      const prices = await pharmacyService.getPricesByPharmacy(id, { per_page: 1000 });
      dataCache.setPharmacyPrices(prices);
      
      // Update state with prices directly
      pharmacyPrices.value = prices;
      
      // Removed: getPharmacyMedications call
      
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
  
  // Validate pharmacy ID before making API calls
  const pharmacyId = pharmacy.value.id;
  if (!pharmacyId) {
    error.value = 'Cannot load reviews: pharmacy.id is invalid';
    return;
  }
  
  reviewsLoading.value = true;
  try {
    const reviewsResponse = await reviewService.getReviewsByTarget('pharmacy', pharmacyId);    
    // Handle different response structures
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
    
    // Map API response to Review model (handle snake_case to camelCase)
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
    
    // Service already returns transformed ReviewStats model
    reviewStats.value = await reviewService.getReviewStats('pharmacy', pharmacyId);
  } catch (err) {
    // Don't set defaults - let error show
    reviewStats.value = null;
  } finally {
    reviewsLoading.value = false;
  }
};

const handleAddReview = async (reviewData: { rating: number; title: string; comment: string }) => {
  if (!pharmacy.value) return;
  
  // Validate pharmacy ID
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
  
  // Validation against stock_quantity
  if (price.stock_quantity !== undefined && quantity > price.stock_quantity) {
    notification.error('Stock Limit Exceeded', `Only ${price.stock_quantity} units available in stock.`);
    return;
  }
  
  cartStore.addItem({
    medicationId: price.drug_id,
    medicationName: price.name || '',
    pharmacyId: pharmacy.value.id,
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
    pharmacyBranchId: price.pharmacy_branch_id || pharmacy.value.id,
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

const switchTab = (tab: string) => {
  activeTab.value = tab;

  // Lazy-load branches the first time the tab is opened
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

const loadBranches = async (pharmacyId: string) => {
  if (branchesFetched.value) return;
  branchesLoading.value = true;
  try {
    branches.value = await pharmacyService.getPharmacyBranches(pharmacyId);
    branchesFetched.value = true;
  } catch (e) {
    console.error('Failed to load branches', e);
  } finally {
    branchesLoading.value = false;
  }
};

onMounted(() => {
  loadPharmacy();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { userLat.value = pos.coords.latitude; userLng.value = pos.coords.longitude; },
      () => { /* permission denied — distance labels simply won't show */ }
    );
  }
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div>
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading pharmacy...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen">
      <svg class="w-16 h-16 mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{{ error }}</p>
      <button 
        @click="loadPharmacy"
        class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Pharmacy Content -->
    <div v-else-if="pharmacy" class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="router.push({ name: 'pharmacies' })"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#246BFD] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Pharmacies
        </button>
      </div>

      <!-- Hero Section -->
      <div class="mb-12 overflow-hidden bg-white shadow-2xl dark:bg-gray-800 rounded-[2rem]">
        <div class="relative h-[450px]">
          <div class="absolute inset-0">
            <LazyImage
              :src="pharmacy.image"
              :alt="pharmacy.name"
              aspectRatio="landscape"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          </div>
          
          <!-- Badges Overlay -->
          <div class="absolute top-8 right-8 flex gap-3">
            <span
              class="px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20 shadow-xl"
              :class="pharmacy.isOpen 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'"
            >
              <span class="inline-block w-2 h-2 mr-2 rounded-full animate-pulse bg-white"></span>
              {{ pharmacy.isOpen ? 'Open Now' : 'Closed' }}
            </span>
            <span v-if="pharmacy.services.some(s => s.slug === '24/7' || s.slug === '24-7' || s.name === '24/7')" class="px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md bg-[#246BFD]/90 text-white border border-white/20 shadow-xl">
               24/7 Service
            </span>
          </div>

          <!-- Pharmacy Info Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-10 text-white">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div class="flex-1 space-y-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-2xl bg-white shadow-2xl overflow-hidden shrink-0">
                    <LazyImage 
                      :src="pharmacy.logo || '/images/pharmacies/default-pharmacy.jpg'" 
                      :alt="pharmacy.name" 
                      aspectRatio="square"
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                    {{ pharmacy.name }}
                  </h1>
                </div>
                
                <div class="flex flex-wrap items-center gap-6">
                  <div class="flex items-center gap-2 text-gray-200">
                    <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="font-medium tracking-tight">{{ pharmacy.address }}<span v-if="pharmacy.city || pharmacy.region" class="text-gray-300"> · {{ [pharmacy.city, pharmacy.region].filter(Boolean).join(', ') }}</span></span>
                  </div>
                  
                  <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-2 px-5 border border-white/10 shadow-xl">
                    <div class="flex items-center gap-1">
                      <svg v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(pharmacy.rating) ? 'text-yellow-400' : 'text-gray-400/50'" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                    <span class="font-black text-xl tracking-tighter">{{ pharmacy.rating.toFixed(1) }}</span>
                    <span class="text-sm font-bold text-gray-300 border-l border-white/20 pl-4 uppercase tracking-widest">{{ pharmacy.totalReviews || pharmacy.reviews?.length || 0 }} reviews</span>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-4">
                 <button 
                  @click="showAddReviewModal = true"
                  class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl"
                >
                  Rate this Facility
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-12">
          <!-- Information & Tabs -->
          <div class="bg-white shadow-xl dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
            <div class="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 px-6 sm:px-8">
              <nav class="flex overflow-x-auto no-scrollbar gap-8">
                <button
                  v-for="tab in ['overview', 'services', 'branches', 'reviews']"
                  :key="tab"
                  v-show="tab !== 'branches' || (pharmacy?.branchesCount || 0) > 0"
                  @click="switchTab(tab)"
                  class="px-1 py-4 text-sm font-semibold capitalize transition-all border-b-2 whitespace-nowrap relative group"
                  :class="[
                    activeTab === tab
                      ? 'border-[#246BFD] text-[#246BFD]'
                      : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <span class="relative z-10">{{ tab }}</span>
                  <div v-if="activeTab === tab" class="absolute inset-0 bg-[#246BFD]/5 blur-xl -z-0"></div>
                </button>
              </nav>
            </div>
            
            <div class="p-6 sm:p-8">
              <!-- Overview Tab -->
              <div v-if="activeTab === 'overview'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div class="space-y-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-1 h-6 bg-[#246BFD] rounded-full"></div>
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Facility Profile</h3>
                  </div>
                  <div class="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50 leading-relaxed" v-html="pharmacy.description"></div>
                </div>

                <div class="space-y-10">
                  <!-- Operating Hours (Full Width Stacked) -->
                  <div class="space-y-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-1 h-6 bg-green-500 rounded-full"></div>
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Operating Hours</h3>
                    </div>
                    <div class="space-y-2 bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                      <div
                        v-for="(hours, day) in pharmacy.workingHours"
                        :key="day"
                        class="flex justify-between items-center group p-2 rounded-xl transition-all"
                        :class="[
                          day === currentDayName
                            ? 'bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 shadow-sm'
                            : 'border border-transparent'
                        ]"
                      >
                        <span
                          class="font-semibold text-sm transition-colors flex items-center gap-2"
                          :class="[
                            day === currentDayName
                              ? 'text-[#246BFD]'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-[#246BFD]'
                          ]"
                        >
                          <span class="capitalize">{{ day }}</span>
                          <span v-if="day === currentDayName" class="text-[9px] lowercase font-semibold text-white bg-[#246BFD] px-2 py-0.5 rounded-full">today</span>
                        </span>
                        <div class="h-0 flex-1 mx-4 border-dashed border-t border-gray-300/50 dark:border-gray-600/50"></div>
                        <span
                          class="font-bold text-sm transition-colors"
                          :class="[
                            hours.toLowerCase() === 'closed'
                              ? 'text-red-500 dark:text-red-400'
                              : (day === currentDayName ? 'text-[#246BFD]' : 'text-gray-900 dark:text-white')
                          ]"
                        >
                          {{ hours }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Quick Connect (Side-by-side Grid) -->
                  <div class="space-y-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-1 h-6 bg-orange-500 rounded-full"></div>
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Quick Connect</h3>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <a :href="`tel:${pharmacy.phone}`" class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                         <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#246BFD] flex items-center justify-center group-hover:bg-[#246BFD] group-hover:text-white transition-colors">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                         </div>
                         <div>
                           <p class="text-xs font-semibold text-gray-400">Phone</p>
                           <p class="font-bold text-gray-900 dark:text-white">{{ pharmacy.phone }}</p>
                         </div>
                      </a>
                      <a :href="`mailto:${pharmacy.email}`" class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                         <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                         </div>
                         <div>
                           <p class="text-xs font-semibold text-gray-400">Email</p>
                           <p class="font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-none">{{ pharmacy.email }}</p>
                         </div>
                      </a>
                      <!-- WhatsApp -->
                      <a
                        v-if="pharmacy.whatsappNumber"
                        :href="`https://wa.me/${pharmacy.whatsappNumber.replace(/\D/g, '')}`"
                        target="_blank"
                        class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                      >
                        <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-400">WhatsApp</p>
                          <p class="font-bold text-gray-900 dark:text-white">{{ pharmacy.whatsappNumber }}</p>
                        </div>
                      </a>
                      <!-- Website -->
                      <a
                        v-if="pharmacy.website"
                        :href="pharmacy.website"
                        target="_blank"
                        class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                      >
                        <div class="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        </div>
                        <div class="min-w-0">
                          <p class="text-xs font-semibold text-gray-400">Website</p>
                          <p class="font-bold text-gray-900 dark:text-white truncate">{{ pharmacy.website.replace(/^https?:\/\//, '') }}</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  <!-- At a Glance: capabilities, delivery, payments -->
                  <div class="space-y-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-1 h-6 bg-violet-500 rounded-full"></div>
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">At a Glance</h3>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <!-- Online prescriptions -->
                      <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          :class="pharmacy.acceptsOnlinePrescriptions ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-400">Online Prescriptions</p>
                          <p class="font-bold text-sm" :class="pharmacy.acceptsOnlinePrescriptions ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                            {{ pharmacy.acceptsOnlinePrescriptions ? 'Accepted' : 'Not accepted' }}
                          </p>
                        </div>
                      </div>

                      <!-- Delivery -->
                      <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          :class="pharmacy.deliveryInfo?.available ? 'bg-blue-100 dark:bg-blue-900/30 text-[#246BFD]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-400">Home Delivery</p>
                          <p v-if="pharmacy.deliveryInfo?.available" class="font-bold text-sm text-[#246BFD]">
                            From GHS {{ pharmacy.deliveryInfo.baseFee?.toFixed(0) ?? '–' }}
                            <span v-if="pharmacy.deliveryInfo.radiusKm" class="text-gray-400 font-normal"> · {{ pharmacy.deliveryInfo.radiusKm }} km radius</span>
                          </p>
                          <p v-else class="font-bold text-sm text-gray-500 dark:text-gray-400">Not available</p>
                        </div>
                      </div>

                      <!-- Payment methods -->
                      <div v-if="(pharmacy.acceptedPaymentLabels ?? []).length > 0" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
                        <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-400">Payment Methods</p>
                          <p class="font-bold text-sm text-gray-900 dark:text-white">{{ pharmacy.acceptedPaymentLabels!.join(' · ') }}</p>
                        </div>
                      </div>

                      <!-- Languages -->
                      <div v-if="(pharmacy.languages ?? []).length > 0" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
                        <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-400">Languages Spoken</p>
                          <p class="font-bold text-sm text-gray-900 dark:text-white">{{ pharmacy.languages!.join(' · ') }}</p>
                        </div>
                      </div>

                      <!-- Special Storage -->
                      <div v-if="(pharmacy.specialStorage ?? []).length > 0" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
                        <div class="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>
                        </div>
                        <div>
                          <p class="text-xs font-semibold text-gray-400">Special Storage</p>
                          <div class="flex flex-wrap gap-1.5 mt-1">
                            <span
                              v-for="s in pharmacy.specialStorage"
                              :key="s"
                              class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800/30"
                            >
                              {{ s === 'cold_chain' ? 'Cold Chain' : s === 'controlled_vault' ? 'Controlled Vault' : s }}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <!-- Services Tab -->
              <div v-if="activeTab === 'services'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <!-- Empty state -->
                <div v-if="pharmacy.services.length === 0" class="py-16 text-center">
                  <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  </div>
                  <p class="text-sm font-medium text-gray-400">No services listed yet.</p>
                </div>

                <template v-else>
                  <!-- Count bar + category filter strip -->
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">{{ pharmacy.services.length }} service{{ pharmacy.services.length !== 1 ? 's' : '' }}</span>
                    <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <!-- All pill -->
                    <button
                      @click="activeServiceCategory = null"
                      class="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all"
                      :class="activeServiceCategory === null
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    >All</button>
                    <!-- Category pills -->
                    <button
                      v-for="cat in serviceCategories"
                      :key="cat.key"
                      @click="activeServiceCategory = cat.key"
                      class="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all capitalize"
                      :class="activeServiceCategory === cat.key
                        ? `${SERVICE_CATEGORY_STYLES[cat.key]?.bg ?? 'bg-gray-500'} text-white`
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    >{{ cat.label }}</button>
                  </div>

                  <!-- Service grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      v-for="service in filteredServices"
                      :key="service.slug || service.id"
                      class="group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
                      :class="[
                        service.category && SERVICE_CATEGORY_STYLES[service.category]
                          ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50'
                      ]"
                    >
                      <!-- Colored left accent -->
                      <div
                        class="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
                        :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.bg ?? 'bg-gray-300'"
                      ></div>

                      <!-- Icon -->
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700/60 transition-transform duration-300 group-hover:scale-110">
                        <svg
                          class="w-5 h-5"
                          :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500 dark:text-gray-400'"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="SERVICE_CATEGORY_STYLES[service.category ?? '']?.icon ?? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'"
                          />
                        </svg>
                      </div>

                      <!-- Content -->
                      <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-2">
                          <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">{{ service.name }}</h4>
                          <span
                            v-if="service.category"
                            class="flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700"
                            :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500'"
                          >{{ service.category }}</span>
                        </div>
                        <p v-if="service.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{{ service.description }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Transition message when filtered -->
                  <p v-if="activeServiceCategory && filteredServices.length === 0" class="text-center text-sm text-gray-400 py-8">
                    No services in this category.
                  </p>
                </template>
              </div>

              <!-- Branches Tab -->
              <div v-if="activeTab === 'branches'" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                <!-- Loading skeleton -->
                <div v-if="branchesLoading" class="space-y-4">
                  <div v-for="n in (pharmacy.branchesCount || 2)" :key="n" class="rounded-3xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700/50">
                    <div class="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                    <div class="p-6 space-y-3">
                      <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse w-1/2"></div>
                      <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                      <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
                    </div>
                  </div>
                </div>

                <div v-else-if="branches.length > 0" class="space-y-5">
                  <div
                    v-for="branch in branches"
                    :key="branch.id"
                    class="rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-500 overflow-hidden"
                  >
                    <!-- Branch banner -->
                    <div
                      class="relative h-28 overflow-hidden"
                      :class="!branch.bannerImage ? 'bg-gradient-to-r from-[#246BFD]/20 to-[#246BFD]/5 dark:from-[#246BFD]/10 dark:to-transparent' : ''"
                    >
                      <img v-if="branch.bannerImage" :src="branch.bannerImage" class="w-full h-full object-cover" :alt="branch.branchName" />
                      <div v-if="branch.bannerImage" class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                      <!-- Identity: pharmacy logo + branch name -->
                      <div class="absolute inset-0 flex items-end px-5 pb-3 gap-3">
                        <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img v-if="pharmacy?.logo" :src="pharmacy.logo" class="w-full h-full object-cover" :alt="pharmacy.name" />
                          <svg v-else class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </div>
                        <div class="min-w-0">
                          <h4 class="text-base font-black leading-tight truncate" :class="branch.bannerImage ? 'text-white drop-shadow' : 'text-gray-900 dark:text-white'">{{ branch.branchName }}</h4>
                          <div class="flex items-center gap-2 mt-0.5">
                            <span
                              class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-sm"
                              :class="branch.isOpen ? 'bg-emerald-100/90 text-emerald-700' : 'bg-red-100/90 text-red-700'"
                            >
                              <span class="w-1.5 h-1.5 rounded-full" :class="branch.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
                              {{ branch.isOpen ? 'Open Now' : 'Closed' }}
                            </span>
                            <span v-if="branch.isActive === false" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100/90 text-gray-500">Inactive</span>
                          </div>
                        </div>
                        <!-- Rating badge in card banner -->
                        <div v-if="(branch.rating ?? 0) > 0" class="ml-auto flex-shrink-0 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5">
                          <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          <span class="text-xs font-bold text-gray-800 dark:text-white">{{ branch.rating?.toFixed(1) }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Branch body -->
                    <div class="p-5 space-y-4">

                      <!-- Description -->
                      <p v-if="branch.description" class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ branch.description }}</p>

                      <!-- Info grid -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <!-- Address -->
                        <div>
                          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                          <p class="font-semibold text-gray-900 dark:text-white leading-snug">{{ branch.address }}</p>
                          <p v-if="branch.city || branch.region" class="text-xs font-medium text-[#246BFD] mt-0.5">
                            {{ [branch.city, branch.region].filter(Boolean).join(', ') }}
                          </p>
                          <p v-if="branch.digitalAddress" class="text-xs font-mono text-gray-400 mt-0.5">{{ branch.digitalAddress }}</p>
                        </div>
                        <!-- Contact -->
                        <div>
                          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                          <a :href="`tel:${branch.phone}`" class="font-semibold text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors block">{{ branch.phone }}</a>
                          <p v-if="branch.managerName" class="text-xs text-gray-400 mt-0.5">Manager: {{ branch.managerName }}</p>
                        </div>
                        <!-- Languages -->
                        <div v-if="(branch.languages ?? []).length > 0">
                          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Languages</p>
                          <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ branch.languages!.join(' · ') }}</p>
                        </div>
                        <!-- Delivery -->
                        <div v-if="branch.deliveryInfo">
                          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery</p>
                          <p v-if="branch.deliveryInfo.available" class="font-semibold text-[#246BFD] text-sm">
                            From GHS {{ branch.deliveryInfo.baseFee?.toFixed(0) ?? '–' }}
                            <span v-if="branch.deliveryInfo.radiusKm" class="text-gray-400 font-normal text-xs"> · {{ branch.deliveryInfo.radiusKm }} km</span>
                          </p>
                          <p v-else class="text-sm text-gray-500">Pickup only</p>
                        </div>
                      </div>

                      <!-- Capability pills -->
                      <div class="flex flex-wrap gap-1.5">
                        <span v-if="branch.acceptsOnlinePrescriptions" class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                          Online Rx
                        </span>
                        <span v-for="s in (branch.specialStorage ?? [])" :key="s" class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-cyan-50 text-cyan-700 border border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400">{{ s }}</span>
                      </div>

                      <!-- Branch services chips -->
                      <div v-if="(branch.services ?? []).length > 0">
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Services</p>
                        <div class="flex flex-wrap gap-1.5">
                          <span
                            v-for="s in branch.services!.slice(0, 5)"
                            :key="s.slug || s.id"
                            class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#246BFD]/8 text-[#246BFD] border border-[#246BFD]/15 dark:bg-[#246BFD]/10 dark:text-[#5089FF]"
                          >{{ s.name }}</span>
                          <span v-if="branch.services!.length > 5" class="px-2.5 py-0.5 text-[11px] text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full">+{{ branch.services!.length - 5 }}</span>
                        </div>
                      </div>

                      <!-- Payment + actions -->
                      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div v-if="(branch.acceptedPaymentMethods ?? []).length > 0" class="flex items-center gap-2">
                          <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            {{ branch.acceptedPaymentMethods!.map(m => m === 'platform' ? 'Online' : 'Cash/POS').join(' · ') }}
                          </span>
                        </div>
                        <div class="flex gap-2 ml-auto">
                          <a
                            v-if="branch.whatsappNumber"
                            :href="`https://wa.me/${branch.whatsappNumber.replace(/\D/g, '')}`"
                            target="_blank"
                            class="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all"
                            title="WhatsApp"
                          >
                            <svg class="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                          </a>
                          <router-link
                            :to="{ name: 'pharmacy-branch', params: { pharmacyId: pharmacy.id, branchId: branch.id } }"
                            class="px-4 py-2 rounded-xl bg-[#246BFD] text-white text-xs font-bold hover:bg-[#1a56d6] active:scale-95 transition-all flex items-center gap-1.5"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            View Details
                          </router-link>
                          <a :href="`tel:${branch.phone}`" class="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-white text-xs font-bold border border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:text-[#246BFD] active:scale-95 transition-all">Call</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="!branchesLoading" class="py-16 text-center">
                  <p class="text-sm text-gray-400">No branch information available.</p>
                </div>
              </div>

              <!-- Reviews Tab -->
              <div v-if="activeTab === 'reviews'" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div v-if="reviewsLoading" class="py-16 text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#246BFD] mx-auto"></div>
                  <p class="mt-6 text-sm font-semibold text-gray-500">Syncing Testimonials...</p>
                </div>

                <div v-else class="space-y-10">
                   <!-- Statistics Summary -->
                   <div v-if="reviewStats" class="p-6 sm:p-8 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                    <div class="flex flex-col gap-8 lg:flex-row lg:items-center">
                      <div class="text-center lg:text-left">
                        <p class="text-xs font-semibold text-[#246BFD] mb-1">Aggregate Rating</p>
                        <div class="flex items-center justify-center lg:justify-start gap-4">
                          <span class="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {{ (reviewStats.averageRating || 0).toFixed(1) }}
                          </span>
                          <div class="text-left">
                            <RatingStars :rating="reviewStats.averageRating || 0" size="lg" />
                            <p class="text-xs font-semibold text-gray-400 mt-1">
                              From {{ reviewStats.totalReviews || 0 }} Experience{{ (reviewStats.totalReviews || 0) !== 1 ? 's' : '' }}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex-1 space-y-2">
                        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-3">
                          <span class="text-xs font-semibold text-gray-400 w-3">{{ rating }}</span>
                          <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-400 rounded-full transition-all duration-1000" :style="{ width: `${reviewStats.totalReviews ? (((reviewStats.ratingDistribution as any)?.[rating] || 0) / reviewStats.totalReviews) * 100 : 0}%` }"></div>
                          </div>
                          <span class="text-xs font-semibold text-gray-400 w-6 text-right">{{ (reviewStats.ratingDistribution as any)?.[rating] || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex items-center gap-2.5">
                      <div class="w-1 h-6 bg-[#246BFD] rounded-full"></div>
                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Verified Testimonials</h3>
                    </div>
                    <button @click="showAddReviewModal = true" class="px-5 py-2.5 bg-[#246BFD] hover:bg-[#1a56d6] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95">Submit Review</button>
                  </div>

                  <div v-if="reviews.length > 0" class="grid grid-cols-1 gap-6">
                    <ReviewCard
                      v-for="review in reviews"
                      :key="review.id"
                      :review="review"
                      class="!rounded-2xl !bg-white dark:!bg-gray-800 !p-6 sm:!p-8 !shadow-md !border !border-gray-50 dark:!border-gray-700/50"
                      @helpful="handleReviewHelpful"
                      @not-helpful="handleReviewNotHelpful"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Compliance & Trust -->
          <div class="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden group">
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
             <h3 class="text-lg font-bold mb-6 relative z-10">Facility Trust</h3>
             
             <div class="space-y-6 relative z-10">
               <div v-if="pharmacy.licenseNumber" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-green-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">License Verified</p>
                   <p class="font-bold text-sm text-white tracking-tight">{{ pharmacy.licenseNumber }}</p>
                 </div>
               </div>

               <div class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#246BFD]">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-12-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-12v6m0 0a3 3 0 0 0 3 3h3m0 0a3 3 0 0 0 3-3v-3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">Branch Network</p>
                   <p class="font-bold text-sm text-white tracking-tight">{{ pharmacy.branchesCount || 1 }} Active Locations</p>
                 </div>
               </div>

               <!-- Digital address / location -->
               <div v-if="pharmacy.digitalAddress || pharmacy.city" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">Location</p>
                   <p class="font-bold text-sm text-white tracking-tight">{{ [pharmacy.city, pharmacy.region].filter(Boolean).join(', ') || pharmacy.address }}</p>
                   <p v-if="pharmacy.digitalAddress" class="text-xs text-amber-400 font-mono mt-0.5">{{ pharmacy.digitalAddress }}</p>
                 </div>
               </div>

               <div class="pt-5 border-t border-white/10">
                 <p class="text-xs font-medium text-gray-400 leading-relaxed">Ensuring you receive only genuine, certified medications through our verified pharmacy network.</p>
               </div>
             </div>
          </div>

          <!-- Help Widget -->
          <div class="bg-[#246BFD] p-6 sm:p-8 rounded-3xl text-white shadow-lg shadow-blue-500/10">
             <h3 class="text-lg font-bold mb-3">Need Help?</h3>
             <p class="text-sm font-medium mb-6 text-blue-100">Our support team is available to assist you with your orders and health inquiries.</p>
             <button class="w-full py-2.5 bg-white text-[#246BFD] rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all">Start Chat</button>
          </div>
        </div>
      </div>

      <!-- Full Width Location Hub -->
      <div class="mt-16 bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 lg:p-12 space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-1 h-8 bg-[#246BFD] rounded-full"></div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">Presence Hub</h2>
              </div>
              <p class="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Visit us at our primary location or navigate through our extensive branch network across the region.</p>
            </div>

            <div class="space-y-6">
              <div class="flex items-center gap-5 p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                 <div class="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-[#246BFD] flex-shrink-0">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-[#246BFD] mb-1">Primary Headquarters</p>
                   <p class="text-base font-bold text-gray-900 dark:text-white leading-tight">{{ pharmacy.address }}</p>
                   <p v-if="pharmacy.city || pharmacy.region" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ [pharmacy.city, pharmacy.region].filter(Boolean).join(', ') }}</p>
                   <p v-if="pharmacy.digitalAddress" class="text-xs font-bold text-[#246BFD]/70 mt-1 tracking-wide">{{ pharmacy.digitalAddress }}</p>
                 </div>
              </div>

              <div class="flex gap-4">
                <a 
                  :href="pharmacy.location ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}` : '#'" 
                  target="_blank"
                  class="flex-1 py-3 bg-[#246BFD] hover:bg-[#1a56d6] text-white rounded-xl text-sm font-bold text-center shadow-md hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Launch Navigation
                </a>
              </div>
            </div>
          </div>

          <div class="h-[500px] lg:h-auto min-h-[400px] border-l border-gray-100 dark:border-gray-700/50">
            <PharmacyMap
              v-if="pharmacy.location && (pharmacy.location.lat || pharmacy.location.lng)"
              :location="pharmacy.location"
              :pharmacy-name="pharmacy.name"
              class="w-full h-full"
            />
            <div v-else class="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-900/40 gap-4">
              <div class="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 text-center px-6">Location map not available for this pharmacy.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Inventory Explorer -->
      <div id="inventory" class="mt-16 space-y-8 pb-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-1 h-8 bg-[#246BFD] rounded-full"></div>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">Inventory Explorer</h2>
            </div>
            <p class="text-sm text-gray-500 font-medium tracking-tight">Browse and secure medications available at this facility.</p>
          </div>

          <!-- Search bar -->
          <div class="flex items-center gap-3 flex-1 max-w-xl">
            <div class="relative flex-1 group">
              <input
                v-model="medicationSearchQuery"
                type="text"
                placeholder="Search medications at this facility..."
                class="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-[#246BFD]/20 text-sm font-semibold transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <!-- Filter toggle -->
            <button
              @click="showFilters = !showFilters"
              class="h-12 px-4 flex items-center gap-2 rounded-xl border transition-all text-sm font-bold flex-shrink-0"
              :class="hasActiveFilters
                ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD]'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              Filters
              <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-white/80 inline-block"></span>
            </button>
          </div>
        </div>

        <!-- ── Filter panel ── -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-3"
        >
          <div v-show="showFilters" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg p-5 space-y-5">

            <div class="flex flex-wrap gap-6">

              <!-- Form type pills -->
              <div v-if="availableForms.length > 0" class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Form</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="form in availableForms"
                    :key="form"
                    @click="toggleForm(form)"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    :class="drugFormFilter.includes(form)
                      ? 'bg-[#246BFD] text-white shadow-sm shadow-blue-500/20'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#246BFD]/10 hover:text-[#246BFD]'"
                  >{{ form }}</button>
                </div>
              </div>

              <!-- Stock -->
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Stock</p>
                <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                  <button
                    v-for="opt in [{ key: 'all', label: 'All' }, { key: 'in_stock', label: 'In Stock' }, { key: 'out_of_stock', label: 'Out of Stock' }]"
                    :key="opt.key"
                    @click="stockFilter = opt.key as any"
                    class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                    :class="stockFilter === opt.key
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'"
                  >{{ opt.label }}</button>
                </div>
              </div>

              <!-- Branch -->
              <div v-if="availableBranches.length > 1">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Branch</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    @click="branchFilter = null"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    :class="branchFilter === null
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                  >All Branches</button>
                  <button
                    v-for="b in availableBranches"
                    :key="b.id"
                    @click="branchFilter = b.id"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    :class="branchFilter === b.id
                      ? 'bg-[#246BFD] text-white shadow-sm shadow-blue-500/20'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#246BFD]/10 hover:text-[#246BFD]'"
                  >{{ b.name }}</button>
                </div>
              </div>

              <!-- Sort -->
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Sort by</p>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="opt in [
                      { key: 'default', label: 'Default' },
                      { key: 'name_asc', label: 'Name A–Z' },
                      { key: 'price_asc', label: 'Price ↑' },
                      { key: 'price_desc', label: 'Price ↓' }
                    ]"
                    :key="opt.key"
                    @click="sortBy = opt.key as any"
                    class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    :class="sortBy === opt.key
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20 dark:hover:text-violet-400'"
                  >{{ opt.label }}</button>
                </div>
              </div>

            </div>

            <!-- Active filter chips + clear -->
            <div v-if="hasActiveFilters" class="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex-wrap">
              <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Active:</span>
              <span v-if="medicationSearchQuery.trim()" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                "{{ medicationSearchQuery }}"
                <button @click="medicationSearchQuery = ''" class="hover:text-red-500 transition-colors">×</button>
              </span>
              <span v-for="form in drugFormFilter" :key="form" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#246BFD]/10 text-[#246BFD]">
                {{ form }}
                <button @click="toggleForm(form)" class="hover:text-red-500 transition-colors">×</button>
              </span>
              <span v-if="stockFilter !== 'all'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {{ stockFilter === 'in_stock' ? 'In Stock' : 'Out of Stock' }}
                <button @click="stockFilter = 'all'" class="hover:text-red-500 transition-colors">×</button>
              </span>
              <span v-if="branchFilter" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {{ availableBranches.find(b => b.id === branchFilter)?.name ?? branchFilter }}
                <button @click="branchFilter = null" class="hover:text-red-500 transition-colors">×</button>
              </span>
              <span v-if="sortBy !== 'default'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                {{ sortBy === 'name_asc' ? 'Name A–Z' : sortBy === 'price_asc' ? 'Price ↑' : 'Price ↓' }}
                <button @click="sortBy = 'default'" class="hover:text-red-500 transition-colors">×</button>
              </span>
              <button @click="clearFilters" class="ml-auto text-xs font-bold text-red-500 hover:text-red-600 transition-colors">Clear all</button>
            </div>

            <!-- Result count -->
            <p class="text-xs font-semibold text-gray-400">
              Showing <span class="text-gray-900 dark:text-white font-bold">{{ filteredPrices.length }}</span> of {{ pharmacyPrices.length }} items
            </p>
          </div>
        </Transition>

        <div v-if="loading" class="py-24 text-center">
          <div class="w-12 h-12 border-t-2 border-b-2 border-[#246BFD] rounded-full animate-spin mx-auto shadow-md shadow-blue-500/20"></div>
          <p class="mt-6 text-sm font-semibold text-gray-500">Scanning Inventory Database...</p>
        </div>

        <div v-else>
          <div v-if="filteredPrices.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="price in paginatedPrices"
                :key="price.id"
                @click="viewMedicationDetails(price)"
                class="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1 relative cursor-pointer"
              >
               <!-- Stock Badge Overlay -->
               <div class="absolute top-3 left-3 z-10">
                 <div 
                   class="px-2.5 py-1 backdrop-blur-md rounded-lg shadow-md border flex items-center gap-1.5"
                   :class="price.in_stock ? 'bg-green-500/90 border-green-400/20 text-white' : 'bg-red-500/90 border-red-400/20 text-white'"
                 >
                    <span class="w-1.5 h-1.5 rounded-full animate-pulse bg-white"></span>
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-white">
                      {{ price.in_stock ? 'In Stock' : 'Restocking' }}
                    </span>
                 </div>
               </div>

               <!-- Image Section -->
               <div class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                 <LazyImage
                   :src="price.image || price.medication_image || price.drug_image || '/placeholder-med.png'"
                   :alt="price.name || ''"
                   aspectRatio="square"
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
               </div>

               <!-- Content Section -->
               <div class="p-6 space-y-4">
                 <div>
                    <div class="flex items-start justify-between gap-2 mb-1">
                       <h4 class="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors line-clamp-3">
                         {{ price.name }}
                       </h4>
                       <span v-if="price.requires_prescription" class="px-1.5 py-0.5 text-[9px] font-bold text-[#246BFD] bg-blue-50 dark:bg-blue-900/30 rounded border border-[#246BFD]/20 flex-shrink-0">Rx</span>
                    </div>
                    <!-- Branch name + distance -->
                    <div v-if="price.branch_name" class="flex items-center gap-1.5 mt-1">
                      <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ price.branch_name }}</span>
                      <span v-if="branchDistanceLabel(price)" class="flex-shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#246BFD] bg-[#246BFD]/8 px-1.5 py-0.5 rounded-full">
                        <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                        {{ branchDistanceLabel(price) }}
                      </span>
                    </div>
                 </div>

                 <!-- Pricing & Stock Hub -->
                 <div class="pt-3.5 border-t border-gray-100 dark:border-gray-700/50">
                    <span class="text-xs font-semibold text-gray-400 block mb-1">Price per unit</span>
                    <div class="flex items-center justify-between">
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-xl font-bold text-[#246BFD] tracking-tight">
                          {{ formatCurrency(price.discount_price || price.price) }}
                        </span>
                        <span v-if="price.discount_price" class="text-xs font-medium text-gray-400 line-through">
                          {{ formatCurrency(price.price) }}
                        </span>
                      </div>
                      
                      <!-- Inline Stock Indicator -->
                      <span 
                        class="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                        :class="price.in_stock ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-800'"
                      >
                        {{ price.in_stock ? (price.stock_quantity !== undefined ? `Stock: ${price.stock_quantity}` : 'In Stock') : 'Out of Stock' }}
                      </span>
                    </div>
                 </div>

                 <!-- Add to Cart Control -->
                 <div class="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex flex-col gap-2.5" @click.stop>
                    <div class="flex gap-3">
                      <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center px-1 h-10 w-28 border border-gray-100 dark:border-gray-700">
                        <button 
                          @click="setCustomQuantity(price.id, Math.max(1, (customQuantities[price.id] || 1) - 1))"
                          class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#246BFD] transition-colors"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                        </button>
                        <input 
                          type="number"
                          :value="customQuantities[price.id] || 1"
                          @input="setCustomQuantity(price.id, Math.max(1, parseInt(($event.target as HTMLInputElement).value) || 1))"
                          class="w-full bg-transparent text-center text-xs font-bold text-gray-900 dark:text-white border-none focus:ring-0 p-0"
                        />
                        <button 
                          @click="setCustomQuantity(price.id, (customQuantities[price.id] || 1) + 1)"
                          class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#246BFD] transition-colors"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                        </button>
                      </div>
                      
                      <button 
                        @click="addToCart(price)"
                        :disabled="!price.in_stock || (price.stock_quantity !== undefined && (customQuantities[price.id] || 1) > price.stock_quantity)"
                        class="flex-1 h-10 bg-[#246BFD] hover:bg-[#1a56d6] text-white rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-30 disabled:translate-y-0 flex items-center justify-center gap-1.5"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>

                    <!-- Stock Error Message -->
                    <p 
                      v-if="price.stock_quantity !== undefined && (customQuantities[price.id] || 1) > price.stock_quantity"
                      class="text-[10px] font-semibold text-red-500 animate-pulse text-center"
                    >
                      Maximum available: {{ price.stock_quantity }} units
                    </p>
                 </div>
               </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700/50">
              <Pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredPrices.length"
                :per-page="itemsPerPage"
                @update:page="handlePageChange"
                @update:per-page="(val) => itemsPerPage = val"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="py-24 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-50 dark:border-gray-700/50">
            <div class="w-20 h-20 bg-[#246BFD]/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No Matching Assets</h3>
            <p class="text-sm text-gray-500 font-medium tracking-tight">Adjust your search query to explore other inventory items.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50 max-w-lg mx-auto">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Pharmacy Not Found</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed">The pharmacy profile you're looking for might have been moved or removed from our network.</p>
        <button 
          @click="router.push({ name: 'pharmacies' })"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246BFD] text-white text-sm font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
        >
          Explore All Pharmacies
        </button>
      </div>
    </div>

    <AddReviewModal
      :show="showAddReviewModal"
      :target-type="'pharmacy'"
      :target-id="pharmacy ? String(pharmacy.id) : ''"
      :target-name="pharmacy ? pharmacy.name : ''"
      @close="showAddReviewModal = false"
      @submit="handleAddReview"
    />

  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}
</style> 