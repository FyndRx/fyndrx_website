<script setup lang="ts">
// HMR Trigger Final
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useNotification } from '@/composables/useNotification';
import { medicationService } from '@/services/medicationService';
import { pharmacyService } from '@/services/pharmacyService';
import { reviewService } from '@/services/reviewService';
import { recentlyViewedService } from '@/services/recentlyViewedService';
import { blogService } from '@/services/blogService';
import { formatDate } from '@/utils/date';
import type { Medication } from '@/models/Medication';
import type { Review, ReviewStats } from '@/models/Review';
import type { BlogPost } from '@/types/blog';
import LazyImage from '@/components/LazyImage.vue';
import Dropdown from '@/components/Dropdown.vue';
import RatingStars from '@/components/RatingStars.vue';
import ReviewCard from '@/components/ReviewCard.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import PharmacySearchFilter from '@/components/PharmacySearchFilter.vue';
import Pagination from '@/components/Pagination.vue';

const cartStore = useCartStore();
const authStore = useAuthStore();
const notification = useNotification();
const router = useRouter();
const route = useRoute();

interface Pharmacy {
  id: number;
  name: string;
  logo: string;
  price: number;
  discountPrice?: number;
  inStock: boolean;
  distance?: string;
  rating?: number;
  // Additional fields for cart operations
  priceId?: number;
  pharmacyBranchId?: number;
  formId?: number;
  strengthId?: number;
  uomId?: number;
  // For filtering
  pharmacy?: {
    name: string;
    logo: string;
    distance?: string;
    rating?: number;
    is_open?: boolean;
  };
  pharmacy_name?: string; // Fallback for pharmacy name
}

// State
const medication = ref<Medication | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const pharmacies = ref<Pharmacy[]>([]);
const loadingPharmacies = ref(false);
const reviews = ref<Review[]>([]);
const reviewStats = ref<ReviewStats | null>(null); // Kept from original
const reviewsLoading = ref(false);
const showAddReviewModal = ref(false); // Kept from original
const relatedBlogs = ref<BlogPost[]>([]);
const blogsLoading = ref(false);

// Pharmacy Filtering State
const pharmacySearch = ref('');
const pharmacySort = ref('price_asc');
const showOpenOnly = ref(false);
const showInStockOnly = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(9);
const userLocation = ref<{ lat: number; lng: number } | null>(null);

const selectedBrand = ref<number | null>(null);
const selectedForm = ref<string | number>('');
const selectedStrength = ref<string | number>('');
const selectedUom = ref<string | number>('');
const customQuantities = ref<Map<number, number>>(new Map());

const filteredPharmacies = computed(() => {
  let result = [...pharmacies.value];

  // 1. Search
  if (pharmacySearch.value) {
    const query = pharmacySearch.value.toLowerCase();
    result = result.filter(p => 
      (p.pharmacy?.name || '').toLowerCase().includes(query) ||
      (p.pharmacy_name || '').toLowerCase().includes(query)
    );
  }

  // 2. Filter: Open Now
  if (showOpenOnly.value) {
    result = result.filter(p => p.pharmacy?.is_open);
  }

  // 3. Filter: In Stock
  if (showInStockOnly.value) {
    result = result.filter(p => p.inStock); // Use p.inStock from the Pharmacy interface
  }

  // 4. Sort
  result.sort((a, b) => {
    switch (pharmacySort.value) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0);
      case 'distance_asc':
        // Sort by numeric distance if available (from location search), otherwise string parsing
        const distA = (a as any).distanceValue ?? parseFloat(a.distance || '0');
        const distB = (b as any).distanceValue ?? parseFloat(b.distance || '0');
        return distA - distB;
      default:
        return 0;
    }
  });

  return result;
});

const paginatedPharmacies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPharmacies.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredPharmacies.value.length / itemsPerPage.value));

const handlePageChange = (page: number) => {
  currentPage.value = page;
  // Scroll to top of pharmacy list
  const pharmacySection = document.getElementById('pharmacy-list');
  if (pharmacySection) {
    pharmacySection.scrollIntoView({ behavior: 'smooth' });
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

const handleLocationSearch = () => {
  if (!navigator.geolocation) {
    notification.error('Error', 'Geolocation is not supported by your browser');
    return;
  }

  loadingPharmacies.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Update pharmacies with distance
      pharmacies.value = pharmacies.value.map(p => {
        // Assuming pharmacy object has location { lat, lng } or similar
        // If not available in current data, we might need to fetch it or use mock data
        // Checking pharmacy.pharmacy.location or similar
        const pLat = (p.pharmacy as any)?.location?.lat || (p.pharmacy as any)?.latitude;
        const pLng = (p.pharmacy as any)?.location?.lng || (p.pharmacy as any)?.longitude;

        if (pLat && pLng) {
          const dist = calculateDistance(userLocation.value!.lat, userLocation.value!.lng, pLat, pLng);
          return {
            ...p,
            distance: `${dist.toFixed(1)} km`,
            distanceValue: dist // Store numeric value for sorting
          };
        }
        return p;
      });

      pharmacySort.value = 'distance_asc';
      loadingPharmacies.value = false;
      notification.success('Location Updated', 'Pharmacies sorted by distance to your location');
    },
    (error) => {
      console.error('Geolocation error:', error);
      loadingPharmacies.value = false;
      notification.error('Error', 'Unable to retrieve your location');
    }
  );
};

const formOptions = computed(() => {
  if (!medication.value) return [];
  return medication.value.forms.map(form => ({
    label: form.form_name,
    value: form.id
  }));
});

const strengthOptions = computed(() => {
  if (!selectedForm.value || !medication.value) return [];
  const form = medication.value.forms.find(f => f.id === Number(selectedForm.value));
  return form?.strengths.map(strength => ({
    label: strength.strength,
    value: strength.id
  })) || [];
});

const uomOptions = computed(() => {
  if (!selectedStrength.value || !medication.value) return [];
  const form = medication.value.forms.find(f => f.id === Number(selectedForm.value));
  const strength = form?.strengths.find(s => s.id === Number(selectedStrength.value));
  return strength?.uoms.map(uom => ({
    label: uom.uom,
    value: uom.id
  })) || [];
});



const updatePharmacyPrices = async () => {
  if (!medication.value) return;
  
  loadingPharmacies.value = true;
  try {
    const filters = {
      drug_brand_form_id: selectedForm.value ? Number(selectedForm.value) : undefined,
      dosage_id: selectedStrength.value ? Number(selectedStrength.value) : undefined,
      strength_uom_id: selectedUom.value ? Number(selectedUom.value) : undefined
    };
    
    const prices = await pharmacyService.getPricesByDrug(medication.value.id, filters);
    
    // Deduplicate pharmacies - keep the one with the lowest price
    const pharmacyMap = new Map<number, any>();
    
    prices.forEach(price => {
      const pharmacyId = price.pharmacy_id;
      const existing = pharmacyMap.get(pharmacyId);
      
      if (!existing || price.price < existing.price) {
        pharmacyMap.set(pharmacyId, price);
      }
    });

    pharmacies.value = Array.from(pharmacyMap.values()).map(price => ({
      id: price.pharmacy_id,
      name: price.pharmacy_name || price.pharmacy?.name || 'Unknown Pharmacy',
      logo: price.pharmacy_logo || price.pharmacy?.logo || '',
      price: price.price,
      discountPrice: price.discount_price,
      inStock: price.in_stock ?? false,
      distance: price.distance || price.pharmacy?.distance,
      rating: price.rating || price.pharmacy?.rating,
      priceId: price.id,
      pharmacyBranchId: price.pharmacy_branch_id,
      formId: price.drug_brand_form_id,
      strengthId: price.dosage_id,
      uomId: price.strength_uom_id,
      // Pass the pharmacy object for filtering
      pharmacy: price.pharmacy || {
        name: price.pharmacy_name || 'Unknown Pharmacy',
        logo: price.pharmacy_logo || '',
        distance: price.distance,
        rating: price.rating,
        is_open: price.pharmacy?.is_open
      },
      pharmacy_name: price.pharmacy_name
    }));
  } catch (err) {
    console.error('Error loading pharmacy prices:', err);
    pharmacies.value = [];
  } finally {
    loadingPharmacies.value = false;
  }
};

watch(selectedForm, async (newFormId) => {
  if (newFormId && medication.value) {
    const form = medication.value.forms.find((f: any) => f.id === Number(newFormId));
    if (form?.strengths && form.strengths.length) {
      selectedStrength.value = form.strengths[0].id;
      if (form.strengths[0].uoms && form.strengths[0].uoms.length) {
        selectedUom.value = form.strengths[0].uoms[0].id;
      }
    }
    await updatePharmacyPrices();
  }
});

watch(selectedStrength, async (newStrengthId) => {
  if (newStrengthId && medication.value) {
    const form = medication.value.forms.find((f: any) => f.id === Number(selectedForm.value));
    const strength = form?.strengths.find((s: any) => s.id === Number(newStrengthId));
    if (strength?.uoms && strength.uoms.length) {
      selectedUom.value = strength.uoms[0].id;
    }
    await updatePharmacyPrices();
  }
});

watch(selectedUom, async () => {
  if (selectedUom.value && selectedForm.value && selectedStrength.value) {
    await updatePharmacyPrices();
  }
});


const handleBrandSelect = (brandId: number) => {
  selectedBrand.value = brandId;
};


const getCustomQuantity = (pharmacyId: number): number => {
  return customQuantities.value.get(pharmacyId) || 1;
};

const setCustomQuantity = (pharmacyId: number, quantity: number) => {
  customQuantities.value.set(pharmacyId, quantity);
};

const getQuantityOptions = computed(() => {
  if (!medication.value) return [];
  const quantities = medication.value.predefinedQuantities || [1, 5, 10, 30];
  return quantities.map(qty => ({
    label: `${qty} ${qty === 1 ? 'unit' : 'units'}`,
    value: qty
  }));
});

const addToCart = (pharmacy: Pharmacy, quantity: number = 1) => {
  if (!medication.value) return;
  
  if (!selectedForm.value || !selectedStrength.value || !selectedUom.value) {
    notification.warning(
      'Selection Required',
      'Please select form, strength, and unit of measure before adding to cart.'
    );
    return;
  }

  const form = medication.value.forms.find(f => f.id === Number(selectedForm.value));
  const strength = form?.strengths.find(s => s.id === Number(selectedStrength.value));
  const uom = strength?.uoms.find(u => u.id === Number(selectedUom.value));

  if (!form || !strength || !uom) return;

  // const brand = medication.value.brands.find(b => b.id === selectedBrand.value); // Removed selectedBrand

  // Use pharmacy_branch_id from the price response if available
  const pharmacyBranchId = pharmacy.pharmacyBranchId || pharmacy.id;

  cartStore.addItem({
    medicationId: medication.value.id,
    medicationName: medication.value.drug_name,
    pharmacyId: pharmacy.id,
    pharmacyName: pharmacy.name,
    pharmacyLogo: pharmacy.logo,
    // brandId: brand?.id, // Removed selectedBrand
    // brandName: brand?.name, // Removed selectedBrand
    formId: form.id,
    formName: form.form_name,
    strengthId: strength.id,
    strength: strength.strength,
    uomId: uom.id,
    uom: uom.uom,
    quantity: quantity,
    price: pharmacy.price,
    discountPrice: pharmacy.discountPrice,
    image: medication.value.image,
    inStock: pharmacy.inStock,
    requiresPrescription: medication.value.requiresPrescription,
    // Store pharmacy_branch_id for API calls
    pharmacyBranchId: pharmacyBranchId
  });

  notification.success(
    'Added to Cart!',
    `${quantity} x ${medication.value.drug_name} from ${pharmacy.name}`
  );
};

const loadReviews = async () => {
  if (!medication.value) return;
  
  reviewsLoading.value = true;
  try {
    reviews.value = await reviewService.getReviewsByTarget('medication', medication.value.id);
    reviewStats.value = await reviewService.getReviewStats('medication', medication.value.id);
  } catch (err) {
    console.error('Error loading reviews:', err);
  } finally {
    reviewsLoading.value = false;
  }
};

const handleAddReview = async (reviewData: { rating: number; title: string; comment: string }) => {
  if (!medication.value) return;
  
  try {
    await reviewService.addReview({
      reviewable_type: 'medication',
      reviewable_id: medication.value.id,
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

const loadRelatedBlogs = async () => {
  if (!medication.value) return;
  
  blogsLoading.value = true;
  try {
    const searchTerms = [
      medication.value.category,
      medication.value.drug_name.split(' ')[0],
      medication.value.requiresPrescription ? 'prescription' : 'medication'
    ];
    
    const allPosts = blogService.getAllPosts();
    const relevant = allPosts.filter(post => {
      const postText = `${post.title} ${post.excerpt} ${post.tags?.join(' ')} ${post.category}`.toLowerCase();
      return searchTerms.some((term: string | string[]) => Array.isArray(term) ? term.some(t => postText.includes(t.toLowerCase())) : postText.includes(term.toLowerCase()));
    }).slice(0, 3);
    
    if (relevant.length === 0) {
      const { posts } = await blogService.getPosts(1, 3);
      relatedBlogs.value = posts;
    } else {
      relatedBlogs.value = relevant;
    }
  } catch (error) {
    console.error('Error loading related blogs:', error);
  } finally {
    blogsLoading.value = false;
  }
};

const viewBlogPost = (slug: string) => {
  router.push({ name: 'blog-post', params: { slug } });
};

const loadMedicationDetails = async (medicationId: number) => {
  loading.value = true;
  try {
    medication.value = await medicationService.getMedicationById(medicationId);
    
    if (medication.value) {
      if (authStore.isAuthenticated) {
        await recentlyViewedService.addToRecentlyViewed(medication.value.id);
      }
      
      if (medication.value.brands && medication.value.brands.length) {
        selectedBrand.value = (medication.value.brands[0] as any).id;
      }
      
      if (medication.value.forms && medication.value.forms.length) {
        selectedForm.value = (medication.value.forms[0] as any).id;
        const firstStrength = (medication.value.forms[0] as any).strengths?.[0];
        if (firstStrength) {
          selectedStrength.value = firstStrength.id;
          if (firstStrength.uoms && firstStrength.uoms.length) {
            selectedUom.value = firstStrength.uoms[0].id;
          }
        }
      }
      
      await updatePharmacyPrices();
      await loadReviews();
      // await loadRelatedBlogs(); // Temporarily disabled as it causes infinite loading
    }
  } catch (err) {
    console.error('Error loading medication:', err);
    notification.error('Error', 'Failed to load medication details');
  } finally {
    loading.value = false;
  }
};
// ...
/*
        <!-- Reviews Section -->
        <div class="mt-12">
          <!-- ... content commented out ... -->
        </div>

        <!-- Related Blogs Section -->
        <div class="mt-12">
          <!-- ... content commented out ... -->
        </div>
*/

onMounted(async () => {
  const medicationId = route.params.id ? parseInt(route.params.id as string) : 1;
  console.log('MedicationDetail mounted, id:', medicationId);
  await loadMedicationDetails(medicationId);
});

// Watch for route changes to reload medication when navigating between different medications
watch(() => route.params.id, async (newId) => {
  if (newId) {
    const medicationId = parseInt(newId as string);
    console.log('Route changed, loading medication:', medicationId);
    await loadMedicationDetails(medicationId);
  }
});
</script>

<template>
  <div class="min-h-screen pt-10 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">


      <!-- Loading State -->
      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading medication details...</p>
      </div>

      <!-- Medication Details -->
      <div v-else-if="medication" class="py-12 space-y-8">
        <!-- Header with Form inside -->
        <div class="overflow-visible bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="p-8">
            <div class="flex flex-col gap-8 md:flex-row">
              <!-- Image -->
              <div class="w-full md:w-1/3">
                <div class="relative overflow-hidden aspect-w-4 aspect-h-3 rounded-xl">
                  <LazyImage
                    :src="medication.image || '/images/medications/default.jpg'"
                    :alt="medication.drug_name"
                    aspectRatio="landscape"
                    className="w-full h-full object-cover"
                  />
                  <div class="absolute top-4 right-4">
                    <FavoriteButton
                      type="medication"
                      :item-id="medication.id"
                      size="large"
                    />
                  </div>
                </div>
              </div>

              <!-- Info and Form -->
              <div class="flex flex-col justify-between flex-1">
                <div>
                  <div class="flex items-center gap-3 mb-4">
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                      {{ medication.drug_name }}
                    </h1>
                    <span v-if="medication.requiresPrescription" class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                      Requires Prescription
                    </span>
                  </div>
                  <p v-if="medication.description" class="mb-6 text-gray-600 dark:text-gray-300">
                    {{ medication.description }}
                  </p>
                </div>
                <!-- Selection Form (horizontal) -->
                <div class="mt-4">
                  <!-- Brand Selection -->
                  <div class="mb-4">
                    <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Brand
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="brand in medication.brands"
                        :key="brand.id"
                        @click="handleBrandSelect(brand.id)"
                        class="px-4 py-2 transition-all duration-200 rounded-full"
                        :class="[
                          selectedBrand === brand.id
                            ? 'bg-[#246BFD] text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        ]"
                      >
                        {{ brand.name }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Horizontal Form Fields -->
                  <div class="flex flex-wrap gap-4">
                    <!-- Form Selection -->
                    <div class="flex-1 min-w-[200px]">
                      <Dropdown
                        v-model="selectedForm"
                        :options="formOptions"
                        label="Form"
                        placeholder="Select Form"
                        required
                        searchable
                      />
                    </div>
                    <!-- Strength Selection -->
                    <div class="flex-1 min-w-[200px]">
                      <Dropdown
                        v-model="selectedStrength"
                        :options="strengthOptions"
                        label="Strength"
                        placeholder="Select Strength"
                        required
                        searchable
                      />
                    </div>
                    <!-- UOM Selection -->
                    <div class="flex-1 min-w-[200px]">
                      <Dropdown
                        v-model="selectedUom"
                        :options="uomOptions"
                        label="Unit of Measure"
                        placeholder="Select UOM"
                        required
                        searchable
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Pharmacies -->
        <div id="pharmacy-list" class="bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="p-8 overflow-visible">
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Available at Pharmacies
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ filteredPharmacies.length }} {{ filteredPharmacies.length === 1 ? 'pharmacy' : 'pharmacies' }} available
                </p>
              </div>

              <!-- Search and Filters -->
              <PharmacySearchFilter
                v-model="pharmacySearch"
                v-model:sort-by="pharmacySort"
                v-model:show-open-only="showOpenOnly"
                v-model:show-in-stock-only="showInStockOnly"
                @use-location="handleLocationSearch"
              />

              <div v-if="selectedForm && selectedStrength" class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  Prices shown are for your selected form and strength. Change your selection above to see different options and prices.
                </p>
              </div>
            </div>
            
            <div v-if="loadingPharmacies" class="py-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-300">Loading pharmacy prices...</p>
            </div>

            <div v-else-if="filteredPharmacies.length === 0" class="py-12 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No Pharmacies Found</h3>
              <p class="text-gray-600 dark:text-gray-300">No pharmacies match your current search or filters.</p>
              <button 
                @click="pharmacySearch = ''; showOpenOnly = false; showInStockOnly = false"
                class="mt-4 text-[#246BFD] font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>

            <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="(pharmacy, index) in paginatedPharmacies"
                :key="index"
                class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
              >
                  <div class="flex items-start justify-between mb-4">
                    <router-link 
                      :to="{ name: 'pharmacy', params: { id: pharmacy.id } }"
                      class="flex items-center gap-3 group"
                    >
                      <div class="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center p-2 shadow-sm group-hover:shadow-md transition-all">
                        <img
                          v-if="pharmacy.logo"
                          :src="pharmacy.logo"
                          :alt="pharmacy.name"
                          class="w-full h-full object-contain"
                          @error="($event.target as HTMLImageElement).style.display='none'"
                        />
                        <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#246BFD] transition-colors">{{ pharmacy.name }}</h3>
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span 
                            class="flex items-center gap-1 font-medium"
                            :class="pharmacy.pharmacy?.is_open ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                          >
                            <span class="w-1.5 h-1.5 rounded-full" :class="pharmacy.pharmacy?.is_open ? 'bg-green-500' : 'bg-red-500'"></span>
                            {{ pharmacy.pharmacy?.is_open ? 'Open' : 'Closed' }}
                          </span>
                          <span v-if="pharmacy.distance" class="flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            {{ pharmacy.distance }}
                          </span>
                          <span v-if="pharmacy.rating" class="flex items-center gap-1">
                            <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            {{ pharmacy.rating }}
                          </span>
                        </div>
                      </div>
                    </router-link>
                  </div>

                <div class="flex items-end justify-between mb-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Price per unit</p>
                    <div class="flex items-baseline gap-2">
                      <span class="text-2xl font-bold text-[#246BFD]">
                        GH₵ {{ (pharmacy.price || 0).toFixed(2) }}
                      </span>
                      <span v-if="pharmacy.discountPrice" class="text-sm text-gray-400 line-through">
                        GH₵ {{ (pharmacy.discountPrice || 0).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="pharmacy.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                    >
                      {{ pharmacy.inStock ? 'In Stock' : 'Out of Stock' }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex-1">
                    <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                      <button
                        @click="setCustomQuantity(pharmacy.id, Math.max(1, getCustomQuantity(pharmacy.id) - 1))"
                        class="px-3 py-2 text-gray-500 hover:text-[#246BFD] transition-colors"
                        :disabled="!pharmacy.inStock"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        :value="getCustomQuantity(pharmacy.id)"
                        @input="(e) => setCustomQuantity(pharmacy.id, parseInt((e.target as HTMLInputElement).value) || 1)"
                        class="w-full text-center bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-gray-900 dark:text-white"
                        min="1"
                        :disabled="!pharmacy.inStock"
                      />
                      <button
                        @click="setCustomQuantity(pharmacy.id, getCustomQuantity(pharmacy.id) + 1)"
                        class="px-3 py-2 text-gray-500 hover:text-[#246BFD] transition-colors"
                        :disabled="!pharmacy.inStock"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    @click="addToCart(pharmacy, getCustomQuantity(pharmacy.id))"
                    class="flex-1 px-4 py-2 bg-[#246BFD] text-white rounded-lg font-medium hover:bg-[#5089FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    :disabled="!pharmacy.inStock"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Add
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="filteredPharmacies.length > itemsPerPage" class="mt-8">
              <Pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredPharmacies.length"
                :per-page="itemsPerPage"
                @update:page="handlePageChange"
                @update:per-page="(val) => itemsPerPage = val"
              />
            </div>
          </div>
        </div>


        <!-- Reviews Section -->
        <div class="mt-12">
          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <div v-if="reviewsLoading" class="py-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-300">Loading reviews...</p>
            </div>

            <div v-else>
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
                  <p v-if="reviewStats" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ reviewStats.totalReviews }} review{{ reviewStats.totalReviews !== 1 ? 's' : '' }}
                  </p>
                </div>
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

              <div v-if="reviewStats && reviewStats.totalReviews > 0" class="p-6 mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-5xl font-bold text-gray-900 dark:text-white">
                        {{ reviewStats.averageRating.toFixed(1) }}
                      </span>
                      <div>
                        <RatingStars :rating="reviewStats.averageRating" size="lg" />
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Based on {{ reviewStats.totalReviews }} review{{ reviewStats.totalReviews !== 1 ? 's' : '' }}
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
                          :style="{ width: `${((reviewStats.ratingDistribution as any)[rating] / reviewStats.totalReviews) * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                        {{ (reviewStats.ratingDistribution as any)[rating] }}
                      </span>
                    </div>
                  </div>
                </div>
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
                <p class="text-gray-600 dark:text-gray-400 mb-4">Be the first to review this medication!</p>
                <button
                  @click="showAddReviewModal = true"
                  class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all"
                >
                  Write the First Review
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Blogs Section -->
        <div class="mt-12">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-[#246BFD]/10 rounded-lg">
                <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Related Articles
              </h2>
            </div>
            <router-link
              to="/blog"
              class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors"
            >
              View All Articles →
            </router-link>
          </div>

          <!-- Loading State -->
          <div v-if="blogsLoading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div class="p-6 space-y-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>

          <!-- Blog Posts -->
          <div v-else-if="relatedBlogs.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="blog in relatedBlogs"
              :key="blog.id"
              @click="viewBlogPost(blog.slug)"
              class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
            >
              <div class="relative h-48 overflow-hidden">
                <LazyImage
                  :src="blog.coverImage"
                  :alt="blog.title"
                  aspectRatio="landscape"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div class="absolute top-3 left-3">
                  <span class="inline-block px-3 py-1 rounded-full bg-[#246BFD] text-white text-xs font-semibold">
                    {{ blog.category }}
                  </span>
                </div>
                <div class="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ blog.likes }}</span>
                </div>
              </div>
              
              <div class="p-6">
                <div class="flex items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{{ formatDate(blog.date) }}</span>
                  </div>
                  <span>•</span>
                  <div class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{{ blog.readTime }} min read</span>
                  </div>
                </div>

                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#246BFD] transition-colors">
                  {{ blog.title }}
                </h3>
                
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {{ blog.excerpt }}
                </p>

                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center gap-2">
                    <img 
                      :src="blog.author.avatar" 
                      :alt="blog.author.name" 
                      class="w-8 h-8 rounded-full object-cover"
                    />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ blog.author.name }}
                    </span>
                  </div>
                  
                  <span class="text-[#246BFD] font-medium text-sm flex items-center gap-1 group-hover:text-[#5089FF]">
                    Read Article
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </span>
                </div>

                <!-- Tags -->
                <div v-if="blog.tags && blog.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
                  <span
                    v-for="tag in blog.tags.slice(0, 3)"
                    :key="tag"
                    class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">No related articles found</p>
            <router-link
              to="/blog"
              class="inline-block px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
            >
              Browse All Articles
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <AddReviewModal
      :show="showAddReviewModal"
      :target-type="'medication'"
      :target-id="medication ? String(medication.id) : ''"
      :target-name="medication ? medication.drug_name : ''"
      @close="showAddReviewModal = false"
      @submit="handleAddReview"
    />
  </div>
</template>

<style scoped>
.aspect-w-4 {
  position: relative;
  padding-bottom: 75%;
}

.aspect-w-4 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* Remove overflow:hidden/auto from parent containers if present */
.bg-white,
.dark\:bg-gray-800,
.rounded-2xl,
.shadow-lg {
  overflow: visible !important;
}

/* Ensure dropdown menu appears on top */
:deep(.dropdown-menu),
:deep(.dropdown__menu),
:deep(.dropdown-content) {
  z-index: 9999 !important;
  position: relative;
}
</style> 