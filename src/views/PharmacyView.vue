<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useNotification } from '@/composables/useNotification';
import { useCartStore } from '@/store/cart';
import { pharmacyService, type PharmacyPrice } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import { useDataCacheStore } from '@/store/dataCache';
import { formatCurrency } from '@/utils/currency';
import type { Pharmacy } from '@/models/Pharmacy';
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
const customQuantities = ref<Record<number, number>>({});
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

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(12);

const SERVICE_LABELS: Record<string, string> = {
  consultation: 'Consultation',
  delivery: 'Medicine Delivery',
  maternal: 'Maternal Care',
  vaccination: 'Vaccination',
  diagnostic: 'Diagnostic Services',
  insurance: 'Insurance Accepted',
  '24/7': '24/7 Service',
};

const filteredPrices = computed(() => {
  if (!medicationSearchQuery.value) return pharmacyPrices.value;
  
  const query = medicationSearchQuery.value.toLowerCase();
  return pharmacyPrices.value.filter(price =>
    (price.name || '').toLowerCase().includes(query) ||
    (price.brand_name || '').toLowerCase().includes(query)
  );
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

const setCustomQuantity = (priceId: number, quantity: number) => {
  customQuantities.value[priceId] = quantity;
};

// addToCart logic unified below...

const loadPharmacy = async () => {
  loading.value = true;
  error.value = null;
  try {
    const id = parseInt(route.params.id as string);
    
    // Validate route param
    if (isNaN(id)) {
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
  if (!pharmacyId || typeof pharmacyId !== 'number' || isNaN(pharmacyId)) {
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
    pharmacyDrugPriceId: price.id || 0
  });

  notification.success(
    'Added to Cart!',
    `${quantity} x ${price.name}`
  );
};

const viewMedicationDetails = (price: PharmacyPrice) => {
  if (!price.drug_id) return;
  router.push({ 
    name: 'MedicationDetail', 
    params: { id: price.drug_id },
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
  
  setTimeout(() => {
    const tabContent = document.querySelector('.tab-content-container');
    if (tabContent) {
      const yOffset = -100;
      const y = tabContent.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, 50);
};

onMounted(() => {
  loadPharmacy();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
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
            <span v-if="pharmacy.services.includes('24/7')" class="px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md bg-[#246BFD]/90 text-white border border-white/20 shadow-xl">
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
                    <span class="font-medium tracking-tight">{{ pharmacy.address }}</span>
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
          <div class="bg-white shadow-2xl dark:bg-gray-800 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-700/50">
            <div class="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 px-8">
              <nav class="flex overflow-x-auto no-scrollbar gap-8">
                <button
                  v-for="tab in ['overview', 'services', 'branches', 'reviews']"
                  :key="tab"
                  v-show="tab !== 'branches' || (pharmacy?.branchesCount || 0) > 0"
                  @click="switchTab(tab)"
                  class="px-2 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap relative group"
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
            
            <div class="p-10">
              <!-- Overview Tab -->
              <div v-if="activeTab === 'overview'" class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div class="space-y-6">
                  <div class="flex items-center gap-4">
                    <div class="w-1.5 h-8 bg-[#246BFD] rounded-full"></div>
                    <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Facility Profile</h3>
                  </div>
                  <div class="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-10 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700/50 leading-relaxed font-medium" v-html="pharmacy.description"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div class="space-y-8">
                    <div class="flex items-center gap-4">
                      <div class="w-1.5 h-8 bg-green-500 rounded-full"></div>
                      <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Operating Hours</h3>
                    </div>
                    <div class="space-y-3 bg-gray-50 dark:bg-gray-900/40 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700/50">
                      <div
                        v-for="(hours, day) in pharmacy.workingHours"
                        :key="day"
                        class="flex justify-between items-center group"
                      >
                        <span class="font-black text-xs uppercase tracking-widest text-gray-400 group-hover:text-[#246BFD] transition-colors">{{ day }}</span>
                        <div class="h-px flex-1 mx-4 bg-gray-200 dark:bg-gray-700/50 border-dashed border-t"></div>
                        <span class="font-bold text-gray-900 dark:text-white">{{ hours }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-8">
                     <div class="flex items-center gap-4">
                      <div class="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                      <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Quick Connect</h3>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                      <a :href="`tel:${pharmacy.phone}`" class="flex items-center gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                         <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#246BFD] flex items-center justify-center group-hover:bg-[#246BFD] group-hover:text-white transition-colors">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                         </div>
                         <div>
                           <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Support</p>
                           <p class="font-bold text-gray-900 dark:text-white">{{ pharmacy.phone }}</p>
                         </div>
                      </a>
                      <a :href="`mailto:${pharmacy.email}`" class="flex items-center gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                         <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                         </div>
                         <div>
                           <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</p>
                           <p class="font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-none">{{ pharmacy.email }}</p>
                         </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Services Tab -->
              <div v-if="activeTab === 'services'" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div
                  v-for="service in pharmacy.services"
                  :key="service"
                  class="group p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div class="flex items-center gap-6">
                    <div class="flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white shadow-xl dark:bg-gray-800 text-[#246BFD] group-hover:bg-[#246BFD] group-hover:text-white transition-all duration-500">
                      <svg v-if="service === 'delivery'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                      <svg v-else-if="service === '24/7'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                      <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                    </div>
                    <div>
                      <h4 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ SERVICE_LABELS[service] || service }}</h4>
                      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Available at this location</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Branches Tab -->
              <div v-if="activeTab === 'branches'" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div v-if="pharmacy.branches && pharmacy.branches.length > 0" class="grid grid-cols-1 gap-8">
                  <div
                    v-for="branch in pharmacy.branches"
                    :key="branch.id"
                    class="p-10 rounded-[2.5rem] bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 overflow-hidden relative group"
                  >
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[#246BFD]/5 rounded-bl-full -z-0"></div>
                    <div class="flex flex-col md:flex-row justify-between gap-10 relative z-10">
                      <div class="space-y-6">
                        <div class="flex items-center gap-4">
                          <div class="w-14 h-14 rounded-2xl bg-[#246BFD]/10 text-[#246BFD] flex items-center justify-center">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 01-1 1H2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                          </div>
                          <h4 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors">{{ branch.branchName }}</h4>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div class="space-y-1">
                            <p class="text-[10px] font-black uppercase tracking-widest text-[#246BFD]">Location</p>
                            <p class="font-bold text-gray-700 dark:text-gray-300 leading-snug">{{ branch.address }}</p>
                            <p v-if="branch.digitalAddress" class="text-xs font-black text-gray-400 uppercase mt-2">{{ branch.digitalAddress }}</p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-[10px] font-black uppercase tracking-widest text-[#246BFD]">Contact</p>
                            <p class="font-bold text-gray-700 dark:text-gray-300 leading-snug">{{ branch.phone }}</p>
                            <p v-if="branch.managerName" class="text-xs font-medium text-gray-400 mt-2">Mgr: {{ branch.managerName }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex flex-col gap-3 min-w-[180px]">
                        <a :href="`tel:${branch.phone}`" class="px-6 py-4 rounded-[1rem] bg-[#246BFD] text-white text-xs font-black uppercase tracking-widest text-center shadow-lg shadow-blue-500/30 hover:shadow-[#246BFD]/50 hover:-translate-y-1 transition-all">Call Branch</a>
                        <a v-if="branch.latitude && branch.longitude" :href="`https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`" target="_blank" class="px-6 py-4 rounded-[1rem] bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-xs font-black uppercase tracking-widest text-center hover:bg-gray-100 transition-all border border-gray-100 dark:border-gray-700">Get Directions</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reviews Tab -->
              <div v-if="activeTab === 'reviews'" class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div v-if="reviewsLoading" class="py-20 text-center">
                  <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#246BFD] mx-auto"></div>
                  <p class="mt-6 text-xs font-black uppercase tracking-widest text-gray-400">Syncing Testimonials...</p>
                </div>

                <div v-else class="space-y-12">
                   <!-- Statistics Summary -->
                  <div v-if="reviewStats" class="p-10 bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50">
                    <div class="flex flex-col gap-12 lg:flex-row lg:items-center">
                      <div class="text-center lg:text-left">
                        <p class="text-[10px] font-black uppercase tracking-widest text-[#246BFD] mb-2">Aggregate Rating</p>
                        <div class="flex items-center justify-center lg:justify-start gap-4">
                          <span class="text-7xl font-black tracking-tighter text-gray-900 dark:text-white">
                            {{ (reviewStats.averageRating || 0).toFixed(1) }}
                          </span>
                          <div class="text-left">
                            <RatingStars :rating="reviewStats.averageRating || 0" size="lg" />
                            <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                              From {{ reviewStats.totalReviews || 0 }} Experience{{ (reviewStats.totalReviews || 0) !== 1 ? 's' : '' }}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex-1 space-y-3">
                        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-4">
                          <span class="text-[10px] font-black text-gray-400 w-4">{{ rating }}</span>
                          <div class="flex-1 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-400 rounded-full transition-all duration-1000" :style="{ width: `${reviewStats.totalReviews ? (((reviewStats.ratingDistribution as any)?.[rating] || 0) / reviewStats.totalReviews) * 100 : 0}%` }"></div>
                          </div>
                          <span class="text-[10px] font-black text-gray-400 w-8 text-right">{{ (reviewStats.ratingDistribution as any)?.[rating] || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                      <div class="w-1.5 h-8 bg-[#246BFD] rounded-full"></div>
                      <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Verified Testimonials</h3>
                    </div>
                    <button @click="showAddReviewModal = true" class="px-8 py-4 bg-[#246BFD] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all">Submit Review</button>
                  </div>

                  <div v-if="reviews.length > 0" class="grid grid-cols-1 gap-8">
                    <ReviewCard
                      v-for="review in reviews"
                      :key="review.id"
                      :review="review"
                      class="!rounded-[2.5rem] !bg-white dark:!bg-gray-800 !p-10 !shadow-xl !border !border-gray-50 dark:!border-gray-700/50"
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
        <div class="space-y-12">
          <!-- Compliance & Trust -->
          <div class="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
             <h3 class="text-xl font-black uppercase tracking-widest mb-8 relative z-10">Facility Trust</h3>
             
             <div class="space-y-8 relative z-10">
               <div v-if="pharmacy.licenseNumber" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-green-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">License Verified</p>
                   <p class="font-bold tracking-tight">{{ pharmacy.licenseNumber }}</p>
                 </div>
               </div>

               <div class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#246BFD]">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v11a2 2 0 01-1 1H2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Branch Network</p>
                   <p class="font-bold tracking-tight">{{ pharmacy.branchesCount || 1 }} Active Locations</p>
                 </div>
               </div>

               <div class="pt-6 border-t border-white/10">
                 <p class="text-[10px] font-medium text-gray-500 leading-relaxed uppercase tracking-widest">Ensuring you receive only genuine, certified medications through our verified pharmacy network.</p>
               </div>
             </div>
          </div>

          <!-- Help Widget -->
          <div class="bg-[#246BFD] p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/40">
             <h3 class="text-xl font-black uppercase tracking-widest mb-4">Need Help?</h3>
             <p class="text-sm font-medium mb-8 text-blue-100">Our support team is available to assist you with your orders and health inquiries.</p>
             <button class="w-full py-4 bg-white text-[#246BFD] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors">Start Chat</button>
          </div>
        </div>
      </div>

      <!-- Full Width Location Hub -->
      <div class="mt-16 bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-12 lg:p-20 space-y-12">
            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-1.5 h-10 bg-[#246BFD] rounded-full"></div>
                <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">Presence Hub</h2>
              </div>
              <p class="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Visit us at our primary location or navigate through our extensive branch network across the region.</p>
            </div>

            <div class="space-y-8">
              <div class="flex items-center gap-6 p-8 bg-gray-50 dark:bg-gray-900/40 rounded-[2rem] border border-gray-100 dark:border-gray-700/50">
                 <div class="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-[#246BFD]">
                   <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-[10px] font-black uppercase tracking-widest text-[#246BFD] mb-1">Primary Headquarters</p>
                   <p class="text-xl font-black text-gray-900 dark:text-white tracking-tight">{{ pharmacy.address }}</p>
                 </div>
              </div>

              <div class="flex gap-4">
                <a 
                  :href="pharmacy.location ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}` : '#'" 
                  target="_blank"
                  class="flex-1 py-5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest text-center shadow-xl hover:-translate-y-1 transition-all"
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
      <div id="inventory" class="mt-16 space-y-12 pb-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-1.5 h-10 bg-[#246BFD] rounded-full shadow-[0_0_15px_rgba(36,107,253,0.5)]"></div>
              <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">Inventory Explorer</h2>
            </div>
            <p class="text-xl text-gray-500 font-medium tracking-tight">Browse and secure medications available at this facility.</p>
          </div>

          <!-- Search & Filter in Inventory -->
          <div class="flex-1 max-w-xl group">
            <div class="relative">
              <input
                v-model="medicationSearchQuery"
                type="text"
                placeholder="Search medications at this facility..."
                class="w-full h-16 pl-14 pr-6 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-2xl focus:ring-4 focus:ring-[#246BFD]/20 text-lg font-bold transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <svg class="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div v-if="loading" class="py-32 text-center">
          <div class="w-20 h-20 border-t-4 border-b-4 border-[#246BFD] rounded-full animate-spin mx-auto shadow-2xl shadow-blue-500/20"></div>
          <p class="mt-8 text-xs font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Scanning Inventory Database...</p>
        </div>

        <div v-else>
          <div v-if="filteredPrices.length > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div
                v-for="price in paginatedPrices"
                :key="price.id"
                @click="viewMedicationDetails(price)"
                class="group bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-50 dark:border-gray-700/50 hover:-translate-y-2 relative cursor-pointer"
              >
               <!-- Stock Badge Overlay -->
               <div class="absolute top-4 left-4 z-10">
                 <div 
                   class="px-3 py-1.5 backdrop-blur-md rounded-xl shadow-xl border flex items-center gap-2"
                   :class="price.in_stock ? 'bg-green-500/90 border-white/20' : 'bg-red-500/90 border-white/20'"
                 >
                    <span class="w-2 h-2 rounded-full animate-pulse bg-white"></span>
                    <span class="text-[10px] font-black text-white uppercase tracking-widest">
                      {{ price.in_stock ? 'In Stock' : 'Restocking' }}
                    </span>
                 </div>
               </div>

               <!-- Image Section -->
               <div class="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
                 <LazyImage
                   :src="price.image || price.medication_image || price.drug_image || '/placeholder-med.png'"
                   :alt="price.name || ''"
                   aspectRatio="square"
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
               </div>

               <!-- Content Section -->
               <div class="p-8 space-y-6">
                 <div>
                    <div class="flex items-center gap-2 mb-2">
                       <h4 class="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors">
                         {{ price.name }}
                       </h4>
                       <span v-if="price.requires_prescription" class="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#246BFD] bg-blue-50 dark:bg-blue-900/30 rounded-md border border-[#246BFD]/20">Rx</span>
                    </div>
                 </div>

                 <!-- Pricing & Stock Hub -->
                 <div class="pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Price per unit</span>
                    <div class="flex items-center justify-between">
                      <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-black text-[#246BFD] tracking-tighter">
                          {{ formatCurrency(price.discount_price || price.price) }}
                        </span>
                        <span v-if="price.discount_price" class="text-xs font-bold text-gray-400 line-through">
                          {{ formatCurrency(price.price) }}
                        </span>
                      </div>
                      
                      <!-- Inline Stock Indicator -->
                      <span 
                        class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                        :class="price.in_stock ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-800'"
                      >
                        {{ price.in_stock ? (price.stock_quantity !== undefined ? `Stock: ${price.stock_quantity}` : 'In Stock') : 'Out of Stock' }}
                      </span>
                    </div>
                 </div>

                 <!-- Add to Cart Control -->
                 <div class="pt-6 border-t border-gray-50 dark:border-gray-700/50 flex flex-col gap-3">
                    <div class="flex gap-3">
                      <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center px-1 h-12 w-32 border border-gray-100 dark:border-gray-700">
                        <button 
                          @click="setCustomQuantity(price.id, Math.max(1, (customQuantities[price.id] || 1) - 1))"
                          class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#246BFD] transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                        </button>
                        <input 
                          type="number"
                          :value="customQuantities[price.id] || 1"
                          @input="setCustomQuantity(price.id, Math.max(1, parseInt(($event.target as HTMLInputElement).value) || 1))"
                          class="w-full bg-transparent text-center text-xs font-black text-gray-900 dark:text-white border-none focus:ring-0 p-0"
                        />
                        <button 
                          @click="setCustomQuantity(price.id, (customQuantities[price.id] || 1) + 1)"
                          class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#246BFD] transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                        </button>
                      </div>
                      
                      <button 
                        @click="addToCart(price)"
                        :disabled="!price.in_stock || (price.stock_quantity !== undefined && (customQuantities[price.id] || 1) > price.stock_quantity)"
                        class="flex-1 h-12 bg-[#246BFD] hover:bg-[#1a56d6] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-30 disabled:translate-y-0 flex items-center justify-center gap-2"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>

                    <!-- Stock Error Message -->
                    <p 
                      v-if="price.stock_quantity !== undefined && (customQuantities[price.id] || 1) > price.stock_quantity"
                      class="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse"
                    >
                      Maximum available: {{ price.stock_quantity }} units
                    </p>
                 </div>
                 </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="mt-16 pt-12 border-t border-gray-100 dark:border-gray-700/50">
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
          <div v-else class="py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-50 dark:border-gray-700/50">
            <div class="w-24 h-24 bg-[#246BFD]/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg class="w-12 h-12 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
            </div>
            <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">No Matching Assets</h3>
            <p class="text-gray-500 font-medium font-inter uppercase tracking-widest text-[10px]">Adjust your search query to explore other inventory items.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="p-12 text-center bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 max-w-lg mx-auto">
        <div class="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Pharmacy Not Found</h2>
        <p class="text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">The pharmacy profile you're looking for might have been moved or removed from our network.</p>
        <button 
          @click="router.push({ name: 'pharmacies' })"
          class="inline-flex items-center gap-2 px-8 py-4 bg-[#246BFD] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all"
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