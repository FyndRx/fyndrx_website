<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useNotification } from '@/composables/useNotification';
import { useCartStore } from '@/store/cart';
import { pharmacyService, type PharmacyPrice } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import { useDataCacheStore } from '@/store/dataCache';
import type { Pharmacy } from '@/models/Pharmacy';
import type { Review, ReviewStats } from '@/models/Review';
import LazyImage from '@/components/LazyImage.vue';
import RatingStars from '@/components/RatingStars.vue';
import ReviewCard from '@/components/ReviewCard.vue';

import AddReviewModal from '@/components/AddReviewModal.vue';
import Pagination from '@/components/Pagination.vue';

const router = useRouter();
const notification = useNotification();
const cartStore = useCartStore();

const PharmacyMap = defineAsyncComponent(() => import('@/components/PharmacyMap.vue'));

const route = useRoute();
const dataCache = useDataCacheStore();
const { registerElement } = useScrollAnimation();

const pharmacy = ref<Pharmacy | null>(null);
const pharmacyPrices = ref<PharmacyPrice[]>([]);
const reviews = ref<Review[]>([]);
const reviewStats = ref<ReviewStats | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('overview');
const medicationSearch = ref('');
const showAddReviewModal = ref(false);
const reviewsLoading = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredPrices = computed(() => {
  if (!medicationSearch.value) return pharmacyPrices.value;
  
  const query = medicationSearch.value.toLowerCase();
  return pharmacyPrices.value.filter(price =>
    (price.drug_name || '').toLowerCase().includes(query) ||
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
  const medSection = document.querySelector('.medications-grid');
  if (medSection) {
    medSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

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

const addToCart = (price: PharmacyPrice) => {
  if (!pharmacy.value) return;
  
  cartStore.addItem({
    medicationId: price.drug_id || (price as any).medicationId, // mapping might needed based on API
    medicationName: price.drug_name || '',
    pharmacyId: pharmacy.value.id,
    pharmacyName: pharmacy.value.name,
    pharmacyLogo: pharmacy.value.image, // Check mapping

    formId: price.drug_brand_form_id,
    formName: price.form_name || '',
    strengthId: price.dosage_id,
    strength: price.strength || '',
    uomId: price.strength_uom_id,
    uom: price.uom || '',
    
    quantity: 1,
    price: price.price,
    discountPrice: price.discount_price,
    image: (price as any).drug_image || '', // Ensure image is available or fallback
    inStock: price.in_stock || false,
    requiresPrescription: (price as any).requires_prescription || false,
    pharmacyBranchId: price.pharmacy_branch_id || pharmacy.value.id,
    branchName: (price as any).branch_name || (price as any).pharmacy_branch?.name || (price as any).pharmacy_branch?.branch_name
  });

  notification.success(
    'Added to Cart!',
    `1 x ${price.drug_name} (${price.strength} ${price.uom})`
  );
};

const viewMedicationDetails = (medicationId: number) => {
  if (!medicationId) return;
  router.push({ name: 'MedicationDetail', params: { id: medicationId } });
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
      <div class="mb-8 overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
        <!-- Header Image -->
        <div class="relative h-80">
          <div class="absolute inset-0">
            <LazyImage
              :src="pharmacy.image"
              :alt="pharmacy.name"
              aspectRatio="landscape"
              className="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>
          
          <!-- Badges Overlay -->
          <div class="absolute top-6 right-6 flex gap-2">
            <span
              class="px-4 py-2 text-sm font-semibold rounded-full backdrop-blur-md border-2"
              :class="pharmacy.isOpen 
                ? 'bg-green-500/90 text-white border-green-400' 
                : 'bg-red-500/90 text-white border-red-400'"
            >
              {{ pharmacy.isOpen ? '● Open Now' : '● Closed' }}
            </span>
          </div>

          <!-- Pharmacy Info Overlay -->
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h1 class="mb-2 text-3xl font-bold md:text-4xl">
                  {{ pharmacy.name }}
                </h1>
                <div class="flex flex-col gap-2 text-sm md:flex-row md:items-center md:gap-4">
                  <div class="flex items-center gap-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                    <span>{{ pharmacy.address }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <span>{{ pharmacy.rating }} ({{ pharmacy.reviews?.length || 0 }} reviews)</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                    </svg>
                    <span>{{ pharmacy.distance }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Bar -->
        <div class="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-3">
            <a
              :href="`tel:${pharmacy.phone}`"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Call Now
            </a>
            <a
              :href="pharmacy.location ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}` : '#'"
              target="_blank"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Get Directions
            </a>
            <button
              @click="showAddReviewModal = true"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-[#246BFD] hover:text-[#246BFD] transition-all duration-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
              Write Review
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Tabs -->
          <div class="mb-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl tab-content-container">
            <div class="border-b border-gray-200 dark:border-gray-700">
              <nav class="flex overflow-x-auto -mb-px">
                <button
                  v-for="tab in ['overview', 'medications', 'services', 'reviews']"
                  :key="tab"
                  @click="switchTab(tab)"
                  class="px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap"
                  :class="[
                    activeTab === tab
                      ? 'border-[#246BFD] text-[#246BFD]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  ]"
                >
                  {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- Overview Tab -->
              <div v-if="activeTab === 'overview'" class="space-y-6">
                <div>
                  <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">About</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ pharmacy.description }}</p>
                </div>

                <div>
                  <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Working Hours</h3>
                  <div class="space-y-2">
                    <div
                      v-for="(hours, day) in pharmacy.workingHours"
                      :key="day"
                      class="flex justify-between text-gray-600 dark:text-gray-300"
                    >
                      <span class="capitalize">{{ day }}</span>
                      <span>{{ hours }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Contact Information</h3>
                  <div class="space-y-2">
                    <p class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Phone:</span> {{ pharmacy.phone }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Email:</span> {{ pharmacy.email }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Website:</span>
                      <a
                        :href="pharmacy.website"
                        target="_blank"
                        class="text-[#246BFD] hover:underline"
                      >
                        {{ pharmacy.website }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Services Tab -->
              <div v-if="activeTab === 'services'" class="space-y-6">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div
                    v-for="service in pharmacy.services"
                    :key="service"
                    class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <h4 class="mb-1 font-medium text-gray-900 dark:text-white">{{ service }}</h4>
                  </div>
                </div>
              </div>

              <!-- Reviews Tab -->
              <div v-if="activeTab === 'reviews'" class="space-y-6">
                <div v-if="reviewsLoading" class="py-12 text-center">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
                  <p class="mt-4 text-gray-600 dark:text-gray-300">Loading reviews...</p>
                </div>

                <div v-else>
                  <div v-if="reviewStats" class="p-6 mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div class="flex items-center gap-3 mb-2">
                          <span class="text-5xl font-bold text-gray-900 dark:text-white">
                            {{ (reviewStats?.averageRating || 0).toFixed(1) }}
                          </span>
                          <div>
                            <RatingStars :rating="reviewStats?.averageRating || 0" size="lg" />
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Based on {{ reviewStats?.totalReviews || 0 }} review{{ (reviewStats?.totalReviews || 0) !== 1 ? 's' : '' }}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex-1 max-w-md space-y-2">
                        <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-2">
                          <span class="text-sm text-gray-600 dark:text-gray-400 w-3">{{ rating }}</span>
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              class="h-full bg-yellow-400"
                              :style="{ width: `${reviewStats?.totalReviews ? (((reviewStats.ratingDistribution as any)?.[rating] || 0) / reviewStats.totalReviews) * 100 : 0}%` }"
                            ></div>
                          </div>
                          <span class="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                            {{ (reviewStats?.ratingDistribution as any)?.[rating] || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      Customer Reviews
                    </h3>
                    <button
                      @click="showAddReviewModal = true"
                      class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all flex items-center gap-2"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Write a Review
                    </button>
                  </div>

                  <div v-if="reviews.length > 0" class="space-y-4">
                    <ReviewCard
                      v-for="review in reviews"
                      :key="review.id"
                      :review="review"
                      @helpful="handleReviewHelpful"
                      @not-helpful="handleReviewNotHelpful"
                    />
                  </div>

                  <div v-else class="py-12 text-center">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">Be the first to review this pharmacy!</p>
                    <button
                      @click="showAddReviewModal = true"
                      class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all"
                    >
                      Write the First Review
                    </button>
                  </div>
                </div>
              </div>

              <!-- Medications Tab -->
              <div v-if="activeTab === 'medications'" class="space-y-6">
                <!-- Search Bar -->
                <div class="mb-6">
                  <div class="relative">
                              <input
                      v-model="medicationSearch"
                      type="text"
                      placeholder="Search medications at this pharmacy..."
                      class="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#246BFD] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <svg class="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                  </div>
                  <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Showing {{ paginatedPrices.length }} of {{ filteredPrices.length }} medications
                  </p>
                </div>

                <!-- Medications List -->
                <div v-if="paginatedPrices.length > 0" class="space-y-4">
                  <div
                    v-for="price in paginatedPrices"
                    :key="price.id"
                    class="p-4 transition-all duration-300 bg-white border border-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-xl hover:shadow-md group"
                  >
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                       <!-- Image (placeholder available) -->
                       <div class="flex-shrink-0 w-16 h-16 overflow-hidden bg-white dark:bg-gray-700 rounded-lg">
                         <LazyImage
                           :src="price.drug_image || ''"
                           :alt="price.drug_name || ''"
                           aspectRatio="square"
                           className="w-full h-full object-cover"
                         />
                       </div>
                       
                       <div class="flex-1 min-w-0">
                         <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-semibold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors cursor-pointer" @click="viewMedicationDetails(price.drug_id || (price as any).medicationId)">
                              {{ price.drug_name }}
                            </h4>
                            <span v-if="(price as any).requires_prescription" class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 rounded-full">
                              Rx
                            </span>
                         </div>
                         
                         <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span v-if="(price as any).branch_name || (price as any).pharmacy_branch?.name" class="block text-xs font-medium text-[#246BFD] mb-0.5">
                              {{ (price as any).branch_name || (price as any).pharmacy_branch?.name }}
                            </span>
                            {{ price.brand_name }} • {{ price.form_name }} • {{ price.strength }} {{ price.uom }}
                         </p>
                         
                         <div class="flex items-center gap-2">
                           <span 
                             class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                             :class="price.in_stock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'"
                           >
                             <span class="w-1.5 h-1.5 rounded-full" :class="price.in_stock ? 'bg-green-500' : 'bg-red-500'"></span>
                             {{ price.in_stock ? 'In Stock' : 'Out of Stock' }}
                           </span>
                         </div>
                       </div>
                       
                       <!-- Price & Action -->
                       <div class="flex flex-row items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-gray-700 sm:flex-col sm:items-end sm:justify-center sm:pt-0 sm:mt-0 sm:border-0">
                          <div class="text-right">
                            <div class="flex items-baseline gap-2 justify-end">
                              <span class="text-lg font-bold text-gray-900 dark:text-white">
                                GH₵ {{ (price.discount_price || price.price).toFixed(2) }}
                              </span>
                              <span v-if="price.discount_price && price.discount_price < price.price" class="text-xs text-gray-400 line-through">
                                GH₵ {{ price.price.toFixed(2) }}
                              </span>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">per unit</p>
                          </div>
                          
                          <div class="flex gap-2">
                             <button 
                               @click="viewMedicationDetails(price.drug_id || (price as any).medicationId)"
                               class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                             >
                               Details
                             </button>
                             <button
                               @click="addToCart(price)"
                               :disabled="!price.in_stock"
                               class="px-4 py-2 text-sm font-medium text-white bg-[#246BFD] rounded-lg hover:bg-[#1a5cff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                               Add
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <!-- Pagination -->
                  <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
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
                <div v-else class="py-12 text-center">
                  <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-gray-600 dark:text-gray-300">No medications found matching your search.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Google Maps Card -->
          <div class="bg-white shadow-lg dark:bg-gray-800 rounded-2xl overflow-hidden">
            <div class="p-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                Location
              </h3>
              <div class="h-64 mb-4 overflow-hidden rounded-xl">
                <PharmacyMap
                  :location="pharmacy.location || { lat: 0, lng: 0 }"
                  :pharmacy-name="pharmacy.name"
                />
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ pharmacy.address }}</p>
            </div>
          </div>

          <!-- Contact Card -->
          <div class="bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <div class="p-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              <div class="space-y-3">
                <a 
                  :href="`tel:${pharmacy.phone}`"
                  class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[#246BFD] group-hover:bg-[#246BFD] group-hover:text-white transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ pharmacy.phone }}</p>
                  </div>
                </a>

                <a 
                  :href="`mailto:${pharmacy.email}`"
                  class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p class="font-medium text-gray-900 dark:text-white truncate">{{ pharmacy.email }}</p>
                  </div>
                </a>

                <a 
                  v-if="pharmacy.website"
                  :href="pharmacy.website"
                  target="_blank"
                  class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-500 dark:text-gray-400">Website</p>
                    <p class="font-medium text-gray-900 dark:text-white truncate">Visit Website</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Working Hours Card -->
          <div class="bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <div class="p-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Working Hours
              </h3>
              <div class="space-y-2">
                <div
                  v-for="(hours, day) in pharmacy.workingHours"
                  :key="day"
                  class="flex justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">{{ day }}</span>
                  <span class="text-gray-600 dark:text-gray-400">{{ hours }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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