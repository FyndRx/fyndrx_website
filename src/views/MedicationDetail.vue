<script setup lang="ts">
// HMR Trigger Final
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useNotification } from '@/composables/useNotification';
import { pharmacyService } from '@/services/pharmacyService';
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
const exactMatch = ref<any>(null);
const relatedDrugs = ref<any[]>([]);
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
const currentPage = ref(1);
const itemsPerPage = ref(9);
const userLocation = ref<{ lat: number; lng: number } | null>(null);

const customQuantities = ref<Map<number, number>>(new Map());

const filteredPharmacies = computed(() => {
  if (!exactMatch.value || !exactMatch.value.pharmacies) return [];

  let result = exactMatch.value.pharmacies.map((p: any) => ({
    id: p.pharmacy_id,
    name: p.pharmacy_name,
    logo: p.logo || '', // Exact match pharmacy has no logo in sample, but we keep it
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

  // 1. Search
  if (pharmacySearch.value) {
    const query = pharmacySearch.value.toLowerCase();
    result = result.filter((p: any) => 
      p.name.toLowerCase().includes(query)
    );
  }

  // 2. Filter: Open Now (Legacy, exactMatch pharmacies don't have is_open yet, but we keep the logic)
  if (showOpenOnly.value) {
    result = result.filter((p: any) => p.pharmacy?.is_open);
  }

  // 3. Filter: In Stock
  if (showInStockOnly.value) {
    result = result.filter((p: any) => p.inStock);
  }

  // 4. Sort
  result.sort((a: any, b: any) => {
    switch (pharmacySort.value) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'rating_desc':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return a.price - b.price;
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

// Legacy location logic kept for potential future use or removed if fully replaced

// All variant/hierarchy selectors removed


const loadMedicationData = async (medicationId: number) => {
  loading.value = true;
  error.value = null;
  
  try {
    // Get filters from URL query if present (brand_id, form_id, strength_id, uom_id)
    const filters = {
      brand_id: route.query.brand_id ? String(route.query.brand_id) : undefined,
      form_id: route.query.form_id ? String(route.query.form_id) : undefined,
      strength_id: route.query.strength_id ? String(route.query.strength_id) : undefined,
      uom_id: route.query.uom_id ? String(route.query.uom_id) : undefined,
      include_pharmacy: true,
      lat: userLocation.value?.lat,
      lng: userLocation.value?.lng
    };

    const data = await pharmacyService.getMedicationDetailsWithPrices(medicationId, filters);
    
    medication.value = data.medication;
    // allPrices removed as it's no longer used in the new UI flow
    // Store exact match and related drugs directly from the response if we were using it,
    // but getMedicationDetailsWithPrices returns transformed data.
    // For this refactor, let's also fetch the raw structured response for explicit exactMatch/relatedDrugs
    const rawResponse = await pharmacyService.getPricesByDrug(medicationId, filters);
    exactMatch.value = rawResponse.exact_match;
    relatedDrugs.value = rawResponse.related_drugs || [];
    
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

// Legacy selection logic removed


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
  <div class="min-h-screen pt-10 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Loading State -->
      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading medication details...</p>
      </div>

      <!-- Medication Details -->
      <div v-else-if="medication" class="py-12 space-y-8">
        <!-- Header Section with Exact Match Data -->
        <div class="overflow-visible bg-white shadow-xl dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
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
                  
                  <div v-if="exactMatch" class="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6">
                    <span v-if="exactMatch.generic_name" class="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                      Generic: {{ exactMatch.generic_name }}
                    </span>
                    <span class="flex items-center text-[#246BFD]">
                      {{ exactMatch.brand }} • {{ exactMatch.strength }} {{ exactMatch.uom }}
                    </span>
                    <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ exactMatch.form }}
                    </span>
                    <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {{ exactMatch.pharmacies?.length || 0 }} Pharmacies
                    </span>
                  </div>
                  
                  <div class="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700" v-html="exactMatch.description || dummyDescription"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Pharmacies -->
        <div id="pharmacy-list" class="bg-white shadow-xl dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="bg-gray-50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-black text-gray-900 dark:text-white">
                  Available Pharmacies
                </h2>
                <p class="text-sm text-gray-500 font-medium">
                  Showing {{ filteredPharmacies.length }} verified price listings
                </p>
              </div>
              <PharmacySearchFilter
                v-model="pharmacySearch"
                v-model:sort-by="pharmacySort"
                v-model:show-open-only="showOpenOnly"
                v-model:show-in-stock-only="showInStockOnly"
                class="scale-90 origin-right"
              />
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
                class="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-[#246BFD] hover:shadow-2xl hover:shadow-[#246BFD]/5 transition-all duration-300"
              >
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center p-3 shadow-sm group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                    <LazyImage
                      v-if="pharmacyItem.pharmacy?.logo"
                      :src="pharmacyItem.pharmacy.logo"
                      :alt="pharmacyItem.name"
                      aspectRatio="square"
                      className="w-full h-full object-contain"
                    />
                    <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <router-link :to="`/pharmacy/${pharmacyItem.id}`" class="block font-bold text-gray-900 dark:text-white truncate hover:text-[#246BFD] transition-colors text-lg mb-1">
                      {{ pharmacyItem.name }}
                    </router-link>
                    <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      {{ pharmacyItem.branch_name || 'Main Branch' }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        :class="pharmacyItem.pharmacy?.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      >
                        {{ pharmacyItem.pharmacy?.is_open ? 'Open Now' : 'Closed' }}
                      </span>
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        :class="pharmacyItem.inStock ? 'bg-[#246BFD]/10 text-[#246BFD]' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ pharmacyItem.inStock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mb-6 flex justify-between items-center bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-gray-400 uppercase mb-1">Price per unit</span>
                    <div class="flex items-baseline gap-3">
                       <span class="text-2xl font-black text-[#246BFD]">
                        Ghc{{ (pharmacyItem.discountPrice || pharmacyItem.price).toFixed(2) }}
                      </span>
                      <span v-if="pharmacyItem.discountPrice" class="text-base font-bold text-gray-400 line-through decoration-gray-400/50">
                        Ghc{{ pharmacyItem.price.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex gap-2">
                  <div class="flex-1 flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 h-12">
                     <button @click="setCustomQuantity(pharmacyItem.id, Math.max(1, getCustomQuantity(pharmacyItem.id) - 1))" class="text-gray-500 hover:text-[#246BFD] p-1">-</button>
                     <input 
                       type="number" 
                       :value="getCustomQuantity(pharmacyItem.id)"
                       @input="setCustomQuantity(pharmacyItem.id, parseInt(($event.target as HTMLInputElement).value) || 1)"
                       class="w-full bg-transparent text-center font-bold text-gray-900 dark:text-white border-0 focus:ring-0"
                     />
                     <button @click="setCustomQuantity(pharmacyItem.id, getCustomQuantity(pharmacyItem.id) + 1)" class="text-gray-500 hover:text-[#246BFD] p-1">+</button>
                  </div>
                  <button 
                    @click="addToCart(pharmacyItem, getCustomQuantity(pharmacyItem.id))"
                    class="h-12 w-32 bg-[#246BFD] hover:bg-[#1a56d6] text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-[#246BFD]/10"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-12 flex justify-center">
              <Pagination
                v-model:current-page="currentPage"
                :total-pages="totalPages"
                :total-items="filteredPharmacies.length"
                :per-page="itemsPerPage"
                @update:current-page="handlePageChange"
              />
            </div>
          </div>
        </div>

        <!-- Related Drugs Section -->
        <div v-if="relatedDrugs.length > 0" class="py-12 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-black text-gray-900 dark:text-white">Related Drug Variations</h3>
            <span class="text-sm font-bold text-[#246BFD] bg-[#246BFD]/5 px-4 py-1.5 rounded-full uppercase tracking-tighter">
               Explore Similar
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              class="group block bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex flex-col h-full">
                <div class="mb-4 relative rounded-xl overflow-hidden aspect-video bg-gray-50 dark:bg-gray-900/50">
                  <LazyImage
                    :src="drug.image || '/images/medications/default.jpg'"
                    :alt="drug.brand || drug.drug_name"
                    aspectRatio="landscape"
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div class="absolute top-2 right-2">
                    <span 
                      class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm"
                      :class="drug.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    >
                      {{ drug.in_stock ? 'In Stock' : 'Out' }}
                    </span>
                  </div>
                </div>

                <h4 class="font-black text-lg text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors mb-1 truncate">
                  {{ drug.brand || drug.drug_name }}
                </h4>
                <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter mb-4 line-clamp-2 min-h-[30px]">
                  {{ drug.name }}
                </p>

                <div class="mt-auto space-y-3">
                  <div class="flex flex-col bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <span class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Price per unit</span>
                    <div class="flex items-baseline gap-2">
                      <span class="text-lg font-black text-[#246BFD]">
                        Ghc{{ (drug.discount_price || drug.price).toFixed(2) }}
                      </span>
                      <span v-if="drug.discount_price" class="text-xs font-bold text-gray-400 line-through decoration-gray-400/50">
                        Ghc{{ drug.price.toFixed(2) }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[10px] font-bold text-[#246BFD] uppercase tracking-widest">
                    <span>{{ drug.form }}</span>
                    <div class="w-6 h-6 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#246BFD] group-hover:text-white transition-all shadow-sm">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </router-link>
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