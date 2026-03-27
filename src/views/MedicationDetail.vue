<script setup lang="ts">
// HMR Trigger Final
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useNotification } from '@/composables/useNotification';
import { pharmacyService } from '@/services/pharmacyService';
import { medicationService } from '@/services/medicationService';
import PharmacySearchFilter from '@/components/PharmacySearchFilter.vue';
import Pagination from '@/components/Pagination.vue';
import { recentlyViewedService } from '@/services/recentlyViewedService';

import type { Medication } from '@/models/Medication';
import LazyImage from '@/components/LazyImage.vue';

const cartStore = useCartStore();
const authStore = useAuthStore();
const notification = useNotification();
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
  
  // Medication Details
  medication_name?: string;
  brand_name?: string;
  form_name?: string;
  strength?: string;
  uom?: string;
  // For filtering
  pharmacy?: {
    name: string;
    logo: string;
    distance?: string;
    rating?: number;
    is_open?: boolean;
    branch_name?: string; // Branch Name
  };
  pharmacy_name?: string; // Fallback for pharmacy name
  branch_id?: number; // Branch ID
  branch_name?: string; // Branch Name
  latitude?: number;
  longitude?: number;
}

// State
const medication = ref<Medication | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const loadingPharmacies = ref(false);
const loadingRelated = ref(false);
const exactMatch = ref<any>(null);
const relatedDrugs = ref<any[]>([]);
const pharmacyMeta = ref<any>(null);
const relatedMeta = ref<any>(null);
const dummyDescription = `
  <div class="space-y-4">
    <p>This medication is primarily used to treat various bacterial infections. It works by stopping the growth of bacteria.</p>
    <ul class="list-disc pl-5 space-y-2">
      <li><strong>Effective against:</strong> Ear infections, pneumonia, skin infections, and urinary tract infections.</li>
      <li><strong>Dosage:</strong> Typically taken every 8 to 12 hours as prescribed by your doctor.</li>
      <li><strong>Precautions:</strong> Inform your doctor if you have allergies to penicillin or cephalosporin antibiotics.</li>
    </ul>
    <p class="text-sm italic text-gray-500">Note: This is a sample medical description for demonstration purposes.</p>
  </div>
`;


// Pharmacy Filtering State
const pharmacySearch = ref('');
const pharmacySort = ref('price_asc');
const showOpenOnly = ref(false);
const showInStockOnly = ref(false);
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const pharmacyPage = ref(1);
const relatedPage = ref(1);
const relatedSearch = ref('');
const relatedSort = ref('price');
const relatedShowOpenOnly = ref(false);
const relatedShowInStockOnly = ref(false);
const itemsPerPage = ref(9);

const customQuantities = ref<Map<number, number>>(new Map());

const paginatedPharmacies = computed(() => {
  if (!exactMatch.value || !exactMatch.value.pharmacies) return [];
  
  // New structure: exactMatch.pharmacies.data
  let rawData = exactMatch.value.pharmacies.data || [];
  
  // Client-side filtering as fallback/augmentation
  if (showOpenOnly.value) rawData = rawData.filter((p: any) => p.is_open);
  if (showInStockOnly.value) rawData = rawData.filter((p: any) => p.in_stock);
  
  return rawData.map((p: any) => ({
    id: p.pharmacy_id,
    name: p.pharmacy_name,
    logo: p.logoPath || '',
    price: p.price,
    discountPrice: p.discount_price,
    inStock: p.in_stock ?? true,
    branch_id: p.branch_id,
    branch_name: p.branch_name,
    
    // For compatibility with cart/filtering
    pharmacy: {
      name: p.pharmacy_name,
      logo: p.logoPath || '',
      is_open: p.is_open,
      branch_name: p.branch_name,
      latitude: p.latitude,
      longitude: p.longitude
    }
  }));
});

const totalPharmacyPages = computed(() => pharmacyMeta.value?.last_page || 1);
const totalRelatedPages = computed(() => relatedMeta.value?.last_page || 1);

const handlePharmacyPageChange = async (page: number) => {
  pharmacyPage.value = page;
  await loadPharmacies();
  // Scroll to top of pharmacy list
  const pharmacySection = document.getElementById('pharmacy-list');
  if (pharmacySection) {
    pharmacySection.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleRelatedPageChange = async (page: number) => {
  relatedPage.value = page;
  await loadRelatedDrugs();
};

// Legacy location logic kept for potential future use or removed if fully replaced

// All variant/hierarchy selectors removed


const loadPharmacies = async () => {
  if (!medication.value) return;
  loadingPharmacies.value = true;
  try {
    const filters = {
      brand_id: route.query.brand_id ? String(route.query.brand_id) : undefined,
      form_id: route.query.form_id ? String(route.query.form_id) : undefined,
      strength_id: route.query.strength_id ? String(route.query.strength_id) : undefined,
      uom_id: route.query.uom_id ? String(route.query.uom_id) : undefined,
      include_pharmacy: true,
      q: pharmacySearch.value || undefined,
      sort: pharmacySort.value === 'price_asc' ? 'price' : (pharmacySort.value === 'distance' ? 'distance' : undefined),
      lat: userLocation.value?.lat,
      lng: userLocation.value?.lng,
      page: pharmacyPage.value,
      per_page: itemsPerPage.value,
      is_open: showOpenOnly.value ? 1 : undefined,
      in_stock: showInStockOnly.value ? 1 : undefined
    };
    const rawResponse = await pharmacyService.getPricesByDrug(medication.value.id, filters as any);
    exactMatch.value = rawResponse.exact_match;
    pharmacyMeta.value = rawResponse.exact_match?.pharmacies?.meta;
  } catch (err) {
    console.error('Error loading pharmacies:', err);
  } finally {
    loadingPharmacies.value = false;
  }
};

const loadRelatedDrugs = async () => {
  if (!medication.value) return;
  loadingRelated.value = true;
  try {
    const filters = {
      brand_id: route.query.brand_id ? String(route.query.brand_id) : undefined,
      form_id: route.query.form_id ? String(route.query.form_id) : undefined,
      strength_id: route.query.strength_id ? String(route.query.strength_id) : undefined,
      uom_id: route.query.uom_id ? String(route.query.uom_id) : undefined,
      q: relatedSearch.value || undefined,
      sort: relatedSort.value.includes('price') ? 'price' : (relatedSort.value.includes('distance') ? 'distance' : undefined),
      page: relatedPage.value,
      per_page: itemsPerPage.value
    };
    const response = await pharmacyService.getRelatedDrugs(medication.value.id, filters as any);
    relatedDrugs.value = response.data || [];
    relatedMeta.value = response.meta;
  } catch (err) {
    console.error('Error loading related drugs:', err);
  } finally {
    loadingRelated.value = false;
  }
};

const loadMedicationData = async (medicationId: number) => {
  loading.value = true;
  error.value = null;
  
  try {
    // 1. Get basic medication details
    medication.value = await medicationService.getMedicationById(medicationId);
    
    // 2. Load pharmacies and related drugs in parallel
    await Promise.all([
      loadPharmacies(),
      loadRelatedDrugs()
    ]);
    
    if (medication.value && authStore.isAuthenticated) {
        await recentlyViewedService.addToRecentlyViewed(medication.value.id);
    }

  } catch (err) {
    console.error('Error loading medication data:', err);
    error.value = 'Failed to load medication details';
    notification.error('Error', 'Failed to load medication details');
  } finally {
    loading.value = false;
  }
};


// Watchers

// Watchers for filtering and sorting
watch([pharmacySearch, pharmacySort, showOpenOnly, showInStockOnly], () => {
  pharmacyPage.value = 1;
  loadPharmacies();
});

watch([relatedSearch, relatedSort, relatedShowOpenOnly, relatedShowInStockOnly], () => {
  relatedPage.value = 1;
  loadRelatedDrugs();
});


const getCustomQuantity = (pharmacyId: number): number => {
  return customQuantities.value.get(pharmacyId) || 1;
};

const setCustomQuantity = (pharmacyId: number, quantity: number) => {
  customQuantities.value.set(pharmacyId, quantity);
};



const addToCart = (pharmacy: Pharmacy, quantity: number = 1) => {
  if (!medication.value) return;
  
  // Validation: Ensure we have exactMatch data
  if (!exactMatch.value) {
    notification.warning(
      'Cart Error',
      'Missing product details. Please try refreshing the page.'
    );
    return;
  }

  // Use branch_id from the pharmacy item if available
  const cartBranchId = pharmacy.branch_id || pharmacy.id;

  cartStore.addItem({
    medicationId: medication.value.id,
    medicationName: medication.value.name,
    pharmacyId: pharmacy.id,
    pharmacyName: pharmacy.name,
    pharmacyLogo: pharmacy.logo,

    formId: exactMatch.value.form_id,
    formName: exactMatch.value.form || '',
    strengthId: exactMatch.value.strength_id,
    strength: exactMatch.value.strength || '',
    uomId: exactMatch.value.uom_id || 0,
    uom: exactMatch.value.uom || '',
    quantity: quantity,
    price: pharmacy.price,
    discountPrice: pharmacy.discountPrice,
    image: medication.value.image,
    inStock: pharmacy.inStock,
    requiresPrescription: medication.value.requiresPrescription,
    // Store pharmacy_branch_id for API calls
    pharmacyBranchId: cartBranchId,
    pharmacyDrugPriceId: pharmacy.priceId // Added for API compatibility
  });

  notification.success(
    'Added to Cart!',
    `${quantity} x ${medication.value.name} from ${pharmacy.name}`
  );
};



onMounted(async () => {
  const medicationId = route.params.id ? parseInt(route.params.id as string) : 1;
  console.log('MedicationDetail mounted, id:', medicationId);
  await loadMedicationData(medicationId);
});

// Watch for route changes to reload medication when navigating between different medications
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadMedicationData(parseInt(newId as string));
    }
  }
);
</script>

<template>
  <div class="min-h-screen pt-10 bg-gray-50 dark:bg-[#0d1117]">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Loading State -->
      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading medication details...</p>
      </div>

      <!-- Medication Details -->
      <div v-else-if="medication" class="py-12 space-y-8">
        <!-- Header Section with Exact Match Data -->
        <div class="overflow-visible bg-white shadow-xl dark:bg-[#161c2c] rounded-2xl border border-gray-100 dark:border-gray-700/60">
          <div class="p-8">
            <div class="flex flex-col gap-10 md:flex-row">
              <!-- Image Section -->
              <div class="w-full md:w-1/3">
                <div class="relative overflow-hidden aspect-square rounded-2xl shadow-inner group">
                  <LazyImage
                    :src="exactMatch?.image || medication.image || '/images/medications/default.jpg'"
                    :alt="medication.name"
                    aspectRatio="square"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div class="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg">
                    <FavoriteButton
                      type="medication"
                      :item-id="medication.id"
                      size="large"
                    />
                  </div>
                  <div v-if="exactMatch?.requires_prescription ?? medication.requiresPrescription" class="absolute bottom-4 left-4">
                    <span class="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-orange-500 text-white shadow-lg">
                       Rx Required
                    </span>
                  </div>
                </div>
              </div>

              <!-- Info Section -->
              <div class="flex flex-col flex-1">
                <div class="mb-6">
                  <div class="flex flex-wrap items-baseline gap-3 mb-2">
                    <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white uppercase">
                      {{ exactMatch?.name || medication.name }}
                    </h1>
                  </div>
                  
                  <!-- Categories -->
                  <div v-if="exactMatch?.categories?.length || medication.category?.length" class="flex flex-wrap gap-2 mb-4">
                    <template v-if="exactMatch?.categories">
                      <span v-for="cat in exactMatch.categories" :key="cat.id" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#246BFD]/10 text-[#246BFD]">
                        {{ cat.name }}
                      </span>
                    </template>
                    <template v-else-if="Array.isArray(medication.category)">
                      <span v-for="cat in medication.category" :key="String(cat)" class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#246BFD]/10 text-[#246BFD]">
                        {{ typeof cat === 'string' ? cat : (cat as any).name }}
                      </span>
                    </template>
                    <template v-else-if="medication.category">
                      <span class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#246BFD]/10 text-[#246BFD]">
                        {{ medication.category }}
                      </span>
                    </template>
                  </div>

                  <div class="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700" v-html="exactMatch?.description || medication.description || dummyDescription"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Pharmacies -->
        <div id="pharmacy-list" class="bg-white shadow-xl dark:bg-[#161c2c] rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <div class="bg-gray-50 dark:bg-[#0d1420] px-8 py-8 border-b border-gray-100 dark:border-gray-700/60">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h2 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Available Pharmacies</h2>
                  <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black rounded uppercase">Verified</span>
                </div>
                <p class="text-sm text-gray-500 font-medium tracking-tight">
                  Comparing {{ pharmacyMeta?.total || paginatedPharmacies.length }} live price listings from vetted pharmacies
                </p>
              </div>

              <div class="flex-1 w-full max-w-2xl">
                <PharmacySearchFilter
                  v-model="pharmacySearch"
                  v-model:sort-by="pharmacySort"
                  v-model:show-open-only="showOpenOnly"
                  v-model:show-in-stock-only="showInStockOnly"
                  class="scale-90 origin-right transition-all hover:scale-100 focus-within:scale-100"
                />
              </div>
            </div>
          </div>

          <div class="p-8">
            <div v-if="loadingPharmacies" class="py-20 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium tracking-tight">Updating local pharmacy prices...</p>
            </div>

            <div v-else-if="paginatedPharmacies.length === 0" class="py-20 text-center">
              <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Variations Matched</h3>
              <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">We couldn't find pharmacies matching your current search criteria.</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="(pharmacyItem, index) in paginatedPharmacies"
                :key="index"
                class="group flex flex-col h-full overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-[#1a2235] rounded-2xl hover:shadow-2xl hover:-translate-y-2"
              >
                <!-- Image & Overlay Section -->
                <div class="p-4 pb-0">
                  <div class="relative h-48 overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#0d1117] shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <LazyImage
                      :src="pharmacyItem.pharmacy?.logo || '/images/pharmacies/default-pharmacy.jpg'"
                      :alt="pharmacyItem.name"
                      aspectRatio="landscape"
                      className="w-full h-full rounded-2xl overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 rounded-2xl bg-[#246BFD]/0 group-hover:bg-[#246BFD]/10 transition-all duration-500 ease-out"></div>
                    <!-- Badges Layer -->
                    <div class="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
                      <span 
                        class="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md transition-all"
                        :class="pharmacyItem.pharmacy?.is_open ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'"
                      >
                        <span class="w-1.5 h-1.5 mr-2 rounded-full animate-pulse bg-white"></span>
                        {{ pharmacyItem.pharmacy?.is_open ? 'Open' : 'Closed' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Text & Actions Section -->
                <div class="p-6 flex-1 flex flex-col pt-4">

                  <!-- Pharmacy Info Header -->
                  <div class="flex flex-col mb-4">
                    <h3 class="text-xl font-black text-gray-900 dark:text-white truncate group-hover:text-[#246BFD] transition-colors leading-tight">
                      <router-link :to="`/pharmacy/${pharmacyItem.id}`">{{ pharmacyItem.name }}</router-link>
                    </h3>
                    <div class="flex items-center gap-2 mt-1">
                      <svg class="w-3.5 h-3.5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p class="text-xs font-bold text-gray-500 dark:text-gray-400 truncate uppercase tracking-tight">
                        {{ pharmacyItem.branch_name || 'Main Branch' }}
                      </p>
                    </div>
                  </div>

                  <!-- Pricing & Add to Cart Block -->
                  <div class="pt-4 flex flex-col border-t border-gray-100 dark:border-gray-700">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Price per unit</span>
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-baseline gap-2">
                        <span class="text-xl font-bold text-[#246BFD]">
                          Ghc{{ (pharmacyItem.discountPrice || pharmacyItem.price).toFixed(2) }}
                        </span>
                        <span v-if="pharmacyItem.discountPrice" class="text-xs text-gray-400 line-through">
                          Ghc{{ pharmacyItem.price.toFixed(2) }}
                        </span>
                      </div>
                      <span 
                        class="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
                        :class="pharmacyItem.inStock ? 'bg-[#246BFD]/10 text-[#246BFD]' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                      >
                        <span v-if="pharmacyItem.inStock" class="w-1.5 h-1.5 mr-1.5 rounded-full animate-pulse bg-[#246BFD]"></span>
                        {{ pharmacyItem.inStock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                      <div class="bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center px-1 h-12 w-28 border border-gray-100 dark:border-gray-700">
                         <button @click="setCustomQuantity(pharmacyItem.id, Math.max(1, getCustomQuantity(pharmacyItem.id) - 1))" class="text-gray-500 hover:text-[#246BFD] active:scale-95 p-2 w-8 flex items-center justify-center font-bold text-lg transition-transform">-</button>
                         <input 
                           type="number" 
                           :value="getCustomQuantity(pharmacyItem.id)"
                           @input="setCustomQuantity(pharmacyItem.id, parseInt(($event.target as HTMLInputElement).value) || 1)"
                           class="w-full bg-transparent text-center font-bold text-gray-900 dark:text-white border-0 focus:ring-0 p-0"
                         />
                         <button @click="setCustomQuantity(pharmacyItem.id, getCustomQuantity(pharmacyItem.id) + 1)" class="text-gray-500 hover:text-[#246BFD] active:scale-95 p-2 w-8 flex items-center justify-center font-bold text-lg transition-transform">+</button>
                      </div>
                      <button 
                        @click="addToCart(pharmacyItem, getCustomQuantity(pharmacyItem.id))"
                        class="flex-1 h-12 bg-[#246BFD] hover:bg-[#1a56d6] text-white font-medium rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pharmacy Pagination -->
            <div v-if="totalPharmacyPages > 1" class="mt-12 flex justify-center">
              <Pagination
                v-model:current-page="pharmacyPage"
                :total-pages="totalPharmacyPages"
                :total-items="pharmacyMeta?.total || 0"
                :per-page="itemsPerPage"
                @update:current-page="handlePharmacyPageChange"
              />
            </div>
          </div>
        </div>

        <!-- Related Drugs Section -->
        <div v-if="relatedDrugs.length > 0 || relatedSearch" class="py-12 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <h3 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Related Drugs</h3>
                <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded uppercase">Verified</span>
              </div>
              <p class="text-sm text-gray-500 font-medium tracking-tight">Discover variations, strengths, and smart alternatives</p>
              
              <div class="flex flex-wrap gap-2 mt-3 pt-4 border-t border-gray-100 dark:border-gray-800 transition-all">
                <button 
                  @click="relatedSort = ''; relatedSearch = ''"
                  class="px-3 py-1 text-[11px] font-black rounded-full transition-all active:scale-95 border"
                  :class="relatedSort === '' && !relatedSearch ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-lg shadow-[#246BFD]/20' : 'bg-[#246BFD]/5 border-[#246BFD]/10 text-[#246BFD] hover:bg-[#246BFD]/10'"
                >
                  🔥 Best Match
                </button>
                <button 
                  @click="relatedSort = 'price_asc'"
                  class="px-3 py-1 text-[11px] font-black rounded-full transition-all active:scale-95 border"
                  :class="relatedSort === 'price_asc' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-green-500/5 border-green-500/10 text-green-600 hover:bg-green-500/10'"
                >
                  💰 Cheapest
                </button>
                <button 
                  @click="relatedSort = 'distance_asc'"
                  class="px-3 py-1 text-[11px] font-black rounded-full transition-all active:scale-95 border"
                  :class="relatedSort === 'distance_asc' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-amber-500/5 border-amber-500/10 text-amber-600 hover:bg-amber-500/10'"
                >
                  ⚡ Fast Delivery
                </button>
              </div>
            </div>
            
            <div class="flex-1 w-full max-w-2xl">
              <PharmacySearchFilter
                v-model="relatedSearch"
                v-model:sort-by="relatedSort"
                placeholder="Search brands, forms, or strengths..."
                :show-location="false"
                :show-toggles="false"
                class="scale-90 origin-right transition-all hover:scale-100 focus-within:scale-100"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link
              v-for="drug in relatedDrugs"
              :key="`${drug.drug_id}_${drug.form_id}_${drug.strength_id}_${drug.uom_id}`"
              :to="{
                path: `/medication/${drug.drug_id}`,
                query: { 
                  brand_id: drug.brand_id,
                  form_id: drug.form_id,
                  strength_id: drug.strength_id,
                  uom_id: drug.uom_id
                }
              }"
              class="group block h-full overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-[#1a2235] rounded-2xl hover:shadow-2xl hover:-translate-y-2"
            >
              <div class="flex flex-col h-full">
                <!-- Image & Overlay Section -->
                <div class="p-4 pb-0">
                  <div class="relative h-48 overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#0d1117] shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <LazyImage
                      :src="drug.image || '/images/medications/default.jpg'"
                      :alt="drug.name"
                      aspectRatio="landscape"
                      className="w-full h-full rounded-2xl overflow-hidden transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 rounded-2xl bg-[#246BFD]/0 group-hover:bg-[#246BFD]/10 transition-all duration-500 ease-out"></div>
                    <!-- Badges Layer -->
                    <div class="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
                      <span 
                        class="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md transition-all"
                        :class="drug.is_open ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'"
                      >
                        <span class="w-1.5 h-1.5 mr-2 rounded-full animate-pulse bg-white"></span>
                        {{ drug.is_open ? 'Open' : 'Closed' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Text & Metadata Section -->
                <div class="p-6 flex-1 flex flex-col pt-4">
                  <!-- Title -->
                  <h3 
                    class="mb-4 text-base font-bold text-gray-900 dark:text-white line-clamp-3 leading-snug group-hover:text-[#246BFD] transition-colors"
                    :title="drug.name"
                  >
                    {{ drug.name }}
                  </h3>

                  <!-- Pharmacy Info Section -->
                  <div v-if="drug.pharmacy_name" class="flex items-center gap-3 mb-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                      <LazyImage
                        v-if="drug.logoPath"
                        :src="drug.logoPath"
                        :alt="drug.pharmacy_name"
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-[#246BFD]/10 text-[#246BFD] text-sm font-medium">
                        {{ drug.pharmacy_name.charAt(0) }}
                      </div>
                    </div>
                    <div class="flex flex-col flex-1 min-w-0">
                      <span class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ drug.pharmacy_name }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {{ drug.branch_name || 'Main Branch' }}
                      </span>
                    </div>
                  </div>

                  <!-- Pricing Block -->
                  <div class="mt-auto pt-4 flex flex-col border-t border-gray-100 dark:border-gray-700">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Price per unit</span>
                    <div class="flex items-center justify-between">
                      <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-bold text-[#246BFD]">
                          Ghc{{ (drug.discount_price || drug.price).toFixed(2) }}
                        </span>
                        <span v-if="drug.discount_price" class="text-sm text-gray-400 line-through">
                          Ghc{{ drug.price.toFixed(2) }}
                        </span>
                      </div>
                      <span 
                        class="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
                        :class="drug.in_stock ? 'bg-[#246BFD]/10 text-[#246BFD]' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                      >
                        <span v-if="drug.in_stock" class="w-1.5 h-1.5 mr-1.5 rounded-full animate-pulse bg-[#246BFD]"></span>
                        {{ drug.in_stock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </router-link>
          </div>

          <!-- Related Drugs Pagination -->
          <div v-if="totalRelatedPages > 1" class="mt-12 flex justify-center">
            <Pagination
              v-model:current-page="relatedPage"
              :total-pages="totalRelatedPages"
              :total-items="relatedMeta?.total || 0"
              :per-page="itemsPerPage"
              @update:current-page="handleRelatedPageChange"
            />
          </div>
        </div>
      </div>
    </div>
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

/* Allow dropdowns to overflow only on the top-level card wrappers, not image containers */
.group > .overflow-visible-card {
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