<script setup lang="ts">
// HMR Trigger Final
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useNotification } from '@/composables/useNotification';
import { PharmacyPrice, pharmacyService } from '@/services/pharmacyService';
import type { MedicationPricingHierarchy } from '@/services/pharmacyService'; // Import new type
import PharmacySearchFilter from '@/components/PharmacySearchFilter.vue';
import Pagination from '@/components/Pagination.vue';
import { recentlyViewedService } from '@/services/recentlyViewedService';

import type { Medication } from '@/models/Medication';
import LazyImage from '@/components/LazyImage.vue';
import Dropdown from '@/components/Dropdown.vue';

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
  drug_name?: string;
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
  };
  pharmacy_name?: string; // Fallback for pharmacy name
}

// State
const medication = ref<Medication | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const pharmacies = ref<(Pharmacy & { isPreferredBrand?: boolean })[]>([]);
const allPrices = ref<PharmacyPrice[]>([]); // Master list of all prices
const hierarchy = ref<MedicationPricingHierarchy['hierarchy'] | null>(null); // New Hierarchy State
const loadingPharmacies = ref(false);


// Pharmacy Filtering State
const pharmacySearch = ref('');
const pharmacySort = ref('price_asc');
const showOpenOnly = ref(false);
const showInStockOnly = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(9);
const userLocation = ref<{ lat: number; lng: number } | null>(null);

const selectedBrand = ref<number | null>(null);
const selectedVariant = ref<string>(''); // Combined Form + Strength
const selectedForm = ref<string | number>('');
const selectedStrength = ref<string | number>('');
const selectedUom = ref<string | number>('');

const customQuantities = ref<Map<number, number>>(new Map());

const filteredPharmacies = computed(() => {
  // 0. Base Filter: Start with the master list and filter by Brand & Variant locally
  // This replaces the old 'pharmacies' ref which was populated by API calls
  
  // A. Filter by Brand
  let pricesToProcess = allPrices.value;
  if (selectedBrand.value) {
      pricesToProcess = pricesToProcess.filter(p => p.drug_brand_id === selectedBrand.value);
  }
  
  // B. Filter by Variant (Form/Strength/UOM)
  // Only apply if a specific variant is selected
  // The selectedVariant string contains "formId_strengthId_uomId"
  if (selectedVariant.value) {
      const parts = selectedVariant.value.split('_');
      // We can strict filter because selectedVariant MUST exist in the hierarchy which is derived from prices
      const fId = Number(parts[0]);
      const sId = Number(parts[1]);
      const uId = Number(parts[2]);
      
      pricesToProcess = pricesToProcess.filter(p => {
          // Use flexible matching for form_id as per service logic
          const pFormId = p.drug_brand_form_id || (p as any).form_id;
          const pStrengthId = p.dosage_id || p.strength_id; // Check both legacy/new fields
          const pUomId = p.strength_uom_id || p.uom_id;
          
          return pFormId === fId && pStrengthId === sId && pUomId === uId;
      });
  }

  // C. Deduplicate Pharamcies (same logic as before: prioritize brand, lowest price)
  const pharmacyMap = new Map<number, any>();
  const preferredBrandId = selectedBrand.value;

  pricesToProcess.forEach(price => {
      const pharmacyId = price.pharmacy_id;
      const existing = pharmacyMap.get(pharmacyId);
      
      const isPreferred = preferredBrandId && price.drug_brand_id === preferredBrandId;
      const existingIsPreferred = existing && preferredBrandId && existing.drug_brand_id === preferredBrandId;
      
      if (!existing) {
        pharmacyMap.set(pharmacyId, price);
      } else if (isPreferred && !existingIsPreferred) {
        pharmacyMap.set(pharmacyId, price);
      } else if (isPreferred === existingIsPreferred) {
         if (price.price < existing.price) {
           pharmacyMap.set(pharmacyId, price);
         }
      }
  });

  // Convert to View Models
  let result = Array.from(pharmacyMap.values()).map(price => ({
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
      
      // Map medication details
      drug_name: price.drug_name,
      brand_name: price.brand_name,
      form_name: price.form_name,
      strength: price.strength,
      uom: price.uom,

      isPreferredBrand: preferredBrandId ? price.drug_brand_id === preferredBrandId : false,
      
      // Pass the pharmacy object for filtering
      pharmacy: price.pharmacy || {
        name: price.pharmacy_name || '',
        logo: price.pharmacy_logo || '',
        rating: price.rating,
        is_open: true // Default to true if unknown
      },
      pharmacy_name: price.pharmacy_name
  }));


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
      case 'distance_asc': {
        // Sort by numeric distance if available (from location search), otherwise string parsing
        const distA = (a as any).distanceValue ?? parseFloat(a.distance || '0');
        const distB = (b as any).distanceValue ?? parseFloat(b.distance || '0');
        return distA - distB;
      }
      default:
        // Default sort: Preferred Brand first, then Price Ascending
        if (a.isPreferredBrand !== b.isPreferredBrand) {
          return a.isPreferredBrand ? -1 : 1;
        }
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

const variantOptions = computed(() => {
  if (!hierarchy.value || !selectedBrand.value) return [];
  
  const brandNode = hierarchy.value.brands.find(b => b.id === selectedBrand.value);
  if (!brandNode) return [];

  const options: { label: string; value: string }[] = [];
  
  brandNode.forms.forEach(form => {
    form.variants.forEach(variant => {
      options.push({
        label: variant.label,
        value: variant.value
      });
    });
  });
  
  return options;
});


const loadMedicationData = async (medicationId: number) => {
  loading.value = true;
  error.value = null;
  
  try {
    const data = await pharmacyService.getMedicationDetailsWithPrices(medicationId);
    
    medication.value = data.medication;
    allPrices.value = data.pricing;
    hierarchy.value = data.hierarchy;
    
    // Initial State Setup
    if (data.hierarchy.brands.length > 0) {
      // 1. Deteimine Brand to Select
      let brandToSelect = data.hierarchy.brands[0].id; // Default to first
      const queryBrandId = route.query.brand ? Number(route.query.brand) : null;

      // If query brand exists and is valid in hierarchy, use it
      if (queryBrandId && data.hierarchy.brands.find(b => b.id === queryBrandId)) {
        brandToSelect = queryBrandId;
      }
      
      selectedBrand.value = brandToSelect;
      
      // 2. Determine Variant to Select
      const brandNode = data.hierarchy.brands.find(b => b.id === brandToSelect);
      if (brandNode && brandNode.forms.length > 0) {
        
        // Strategy A: Construct Variant from Query Params (e.g. ?form=1&strength=2&uom=3)
        const qForm = route.query.form;
        const qStrength = route.query.strength;
        const qUom = route.query.uom;
        
        let variantToSelect = '';

        if (qForm && qStrength && qUom) {
             // Construct the variant key: formId_strengthId_uomId
             // Note: In filteredPharmacies logic, we split by '_'. 
             // We need to ensure this matches the `value` property in variantOptions.
             // Usually variant.value is "formId_strengthId_uomId"
             const candidate = `${qForm}_${qStrength}_${qUom}`;
             
             // Check if this specific variant exists for the selected brand
             const exists = brandNode.forms.some(f => 
                 f.variants.some(v => v.value === candidate)
             );
             
             if (exists) {
                 variantToSelect = candidate;
             }
        }

        // Strategy B: Fallback to first available variant if query is missing or invalid
        if (!variantToSelect && brandNode.forms.length > 0 && brandNode.forms[0].variants.length > 0) {
           // We might want to be smarter here? 
           // If we have a queryBrandId but no variant, maybe we should pick the *most popular*?
           // For now, first available is safe.
           variantToSelect = brandNode.forms[0].variants[0].value;
        }

        if (variantToSelect) {
            selectedVariant.value = variantToSelect;
        }
      }
    }
    
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

// Watch for Variant changes to update Form, Strength, and UOM
watch(selectedVariant, (newVal) => {
  if (newVal) {
    const parts = newVal.split('_');
    const formId = Number(parts[0]);
    const strengthId = Number(parts[1]);
    const uomId = Number(parts[2]);
    
    selectedForm.value = formId;
    selectedStrength.value = strengthId;
    selectedUom.value = uomId;
  }
});


const handleBrandSelect = (brandId: number) => {
  selectedBrand.value = brandId;
  
  // Auto-select first variant for the new brand
  if (hierarchy.value) {
    const brandNode = hierarchy.value.brands.find(b => b.id === brandId);
    if (brandNode && brandNode.forms.length > 0 && brandNode.forms[0].variants.length > 0) {
      selectedVariant.value = brandNode.forms[0].variants[0].value;
    } else {
        selectedVariant.value = ''; // Reset if no options
    }
  }
};


const getCustomQuantity = (pharmacyId: number): number => {
  return customQuantities.value.get(pharmacyId) || 1;
};

const setCustomQuantity = (pharmacyId: number, quantity: number) => {
  customQuantities.value.set(pharmacyId, quantity);
};



const addToCart = (pharmacy: Pharmacy, quantity: number = 1) => {
  if (!medication.value) return;
  
  // Validation: Ensure the pharmacy object has the necessary details
  // Since our filtering logic guarantees these are set for filtered items, this is a safety check.
  if (!pharmacy.formId || !pharmacy.strengthId || !pharmacy.uomId) {
    notification.warning(
      'Cart Error',
      'Missing product details. Please try refreshing the page.'
    );
    return;
  }

  // Use pharmacy_branch_id from the price response if available
  const pharmacyBranchId = pharmacy.pharmacyBranchId || pharmacy.id;

  cartStore.addItem({
    medicationId: medication.value.id,
    medicationName: medication.value.drug_name,
    pharmacyId: pharmacy.id,
    pharmacyName: pharmacy.name,
    pharmacyLogo: pharmacy.logo,

    formId: pharmacy.formId,
    formName: pharmacy.form_name || '',
    strengthId: pharmacy.strengthId,
    strength: pharmacy.strength || '',
    uomId: pharmacy.uomId,
    uom: pharmacy.uom || '',
    quantity: quantity,
    price: pharmacy.price,
    discountPrice: pharmacy.discountPrice,
    image: medication.value.image,
    inStock: pharmacy.inStock,
    requiresPrescription: medication.value.requiresPrescription,
    // Store pharmacy_branch_id for API calls
    pharmacyBranchId: pharmacyBranchId,
    pharmacyDrugPriceId: pharmacy.priceId // Added for API compatibility
  });

  notification.success(
    'Added to Cart!',
    `${quantity} x ${medication.value.drug_name} from ${pharmacy.name}`
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
                    <!-- Variant Selection (Merged Form + Strength + UOM) -->
                    <div class="flex-1 min-w-[300px]">
                      <Dropdown
                        v-model="selectedVariant"
                        :options="variantOptions"
                        label="Select Option"
                        placeholder="Select Option"
                        required
                        searchable
                        class="w-full"
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

              <div v-if="selectedVariant" class="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  Prices shown are for your selected option. Change your selection above to see different options and prices.
                </p>
              </div>
            </div>
            
            <div v-if="loadingPharmacies" class="py-12 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-300">Loading pharmacy prices...</p>
            </div>

            <div v-else-if="paginatedPharmacies.length === 0" class="py-12 text-center">
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
                      <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-medium text-gray-900 dark:text-white truncate">
                      {{ pharmacy.name }}
                    </h3>

                  </div>
                  <!-- Medication Details (Brand, Strength, Form) -->
                  <div class="mb-3 text-sm text-gray-600 dark:text-gray-300">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ pharmacy.brand_name || pharmacy.drug_name }}
                    </p>
                    <p>
                   {{ pharmacy.strength }} {{ pharmacy.uom }} • {{ pharmacy.form_name }}
                    </p>
                  </div>

                  <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                          <span 
                            v-if="pharmacy.isPreferredBrand" 
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#246BFD]/10 text-[#246BFD] ml-auto"
                          >
                            Preferred Brand
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
                        GH₵ {{ (pharmacy.discountPrice || pharmacy.price || 0).toFixed(2) }}
                      </span>
                      <span v-if="pharmacy.discountPrice && pharmacy.discountPrice < pharmacy.price" class="text-sm text-gray-400 line-through">
                        GH₵ {{ (pharmacy.price || 0).toFixed(2) }}
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