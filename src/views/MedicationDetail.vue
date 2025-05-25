<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import LazyImage from '@/components/LazyImage.vue';
import Dropdown from '@/components/Dropdown.vue';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import BlogCard from '@/components/BlogCard.vue';

interface Pharmacy {
  id: number;
  name: string;
  logo: string;
  price: number;
  discountPrice: number;
  inStock: boolean;
  distance?: string;
  rating?: number;
}

interface Medication {
  id: number;
  drug_name: string;
  description: string | null;
  brands: Array<{ id: number; name: string }>;
  forms: Array<{
    id: number;
    form_name: string;
    strengths: Array<{
      id: number;
      strength: string;
      uoms: Array<{ id: number; uom: string }>;
    }>;
  }>;
  image?: string;
  predefinedQuantities?: number[];
}

interface Blog {
  id: number;
  title: string;
  summary: string;
  url: string;
}

const medication = ref<Medication | null>(null);
const selectedBrand = ref<number | null>(null);
const selectedForm = ref<string | number>('');
const selectedStrength = ref<string | number>('');
const selectedUom = ref<string | number>('');
const selectedQuantity = ref<number>(1);
const selectedPharmacy = ref<Pharmacy | null>(null);
const showCouponModal = ref(false);
const loading = ref(true);

// Sample data - Replace with actual API call
const pharmacies = ref<Pharmacy[]>([
  {
    id: 1,
    name: 'CVS Pharmacy',
    logo: '/images/pharmacies/cvs.png',
    price: 25.99,
    discountPrice: 19.99,
    inStock: true,
    distance: '0.5 miles',
    rating: 4.5
  },
  {
    id: 2,
    name: 'Walgreens',
    logo: '/images/pharmacies/walgreens.png',
    price: 27.99,
    discountPrice: 21.99,
    inStock: true,
    distance: '1.2 miles',
    rating: 4.3
  },
  {
    id: 3,
    name: 'Rite Aid',
    logo: '/images/pharmacies/rite-aid.png',
    price: 24.99,
    discountPrice: 18.99,
    inStock: false,
    distance: '0.8 miles',
    rating: 4.1
  }
]);

const relatedBlogs = ref<Blog[]>([
  {
    id: 1,
    title: 'How Amoxicillin Works: Uses, Side Effects, and More',
    summary: 'Learn about the uses, side effects, and important information regarding Amoxicillin, a common antibiotic.',
    url: '#'
  },
  {
    id: 2,
    title: 'Antibiotic Resistance: What You Need to Know',
    summary: 'Understand the growing concern of antibiotic resistance and how to use antibiotics responsibly.',
    url: '#'
  },
  {
    id: 3,
    title: 'Tips for Taking Your Medication Safely',
    summary: 'Best practices for taking prescription medications like Amoxicillin safely and effectively.',
    url: '#'
  }
]);

// const brandOptions = computed(() => {
//   if (!medication.value) return [];
//   return medication.value.brands.map(brand => ({
//     label: brand.name,
//     value: brand.id
//   }));
// });

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

// Watch for form changes to update strength and UOM
watch(selectedForm, (newFormId) => {
  if (newFormId && medication.value) {
    const form = medication.value.forms.find(f => f.id === Number(newFormId));
    if (form?.strengths.length) {
      selectedStrength.value = form.strengths[0].id;
      if (form.strengths[0].uoms.length) {
        selectedUom.value = form.strengths[0].uoms[0].id;
      }
    }
  }
});

// Watch for strength changes to update UOM
watch(selectedStrength, (newStrengthId) => {
  if (newStrengthId && medication.value) {
    const form = medication.value.forms.find(f => f.id === Number(selectedForm.value));
    const strength = form?.strengths.find(s => s.id === Number(newStrengthId));
    if (strength?.uoms.length) {
      selectedUom.value = strength.uoms[0].id;
    }
  }
});

const handleBrandSelect = (brandId: number) => {
  selectedBrand.value = brandId;
};

const handleGetCoupon = (pharmacy: Pharmacy) => {
  selectedPharmacy.value = pharmacy;
  showCouponModal.value = true;
};

const generateCoupon = async () => {
  if (!selectedPharmacy.value || !medication.value) return;

  const couponElement = document.getElementById('coupon-template');
  if (!couponElement) return;

  try {
    const canvas = await html2canvas(couponElement);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 297; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${medication.value.drug_name}-coupon.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const saveToCoupons = () => {
  // TODO: Implement saving to user's coupons list
  console.log('Saving coupon to user\'s list');
};

const shareCoupon = () => {
  // TODO: Implement sharing functionality
  if (navigator.share) {
    navigator.share({
      title: `${medication.value?.drug_name} Coupon`,
      text: `Get ${selectedPharmacy.value?.discountPrice} off ${medication.value?.drug_name} at ${selectedPharmacy.value?.name}!`,
      url: window.location.href
    });
  }
};

onMounted(async () => {
  // TODO: Replace with actual API call
  medication.value = {
    id: 1,
    drug_name: 'Amoxicillin',
    description: 'Antibiotic used to treat bacterial infections',
    brands: [
      { id: 1, name: 'Amoxil' },
      { id: 2, name: 'Trimox' }
    ],
    forms: [
      {
        id: 1,
        form_name: 'Capsules',
        strengths: [
          { id: 1, strength: '250mg', uoms: [{ id: 1, uom: 'CAPSULE(S)' }] },
          { id: 2, strength: '500mg', uoms: [{ id: 1, uom: 'CAPSULE(S)' }] }
        ]
      },
      {
        id: 2,
        form_name: 'Suspension',
        strengths: [
          { id: 3, strength: '125mg/5ml', uoms: [{ id: 2, uom: 'ML' }] },
          { id: 4, strength: '250mg/5ml', uoms: [{ id: 2, uom: 'ML' }] }
        ]
      }
    ],
    image: '/src/assets/images/medications/amoxicillin.jpg',
    predefinedQuantities: [1, 2, 3, 4, 5, 10, 20, 30]
  };
  // Pre-select first brand if available
  if (medication.value.brands.length) {
    selectedBrand.value = medication.value.brands[0].id;
  }
  // Pre-select first form, strength, and UOM if available
  if (medication.value.forms.length) {
    selectedForm.value = medication.value.forms[0].id;
    const firstStrength = medication.value.forms[0].strengths[0];
    if (firstStrength) {
      selectedStrength.value = firstStrength.id;
      if (firstStrength.uoms.length) {
        selectedUom.value = firstStrength.uoms[0].id;
      }
    }
  }
  loading.value = false;
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
                <div class="overflow-hidden aspect-w-4 aspect-h-3 rounded-xl">
                  <LazyImage
                    :src="medication.image || '/images/medications/default.jpg'"
                    :alt="medication.drug_name"
                    aspectRatio="landscape"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <!-- Info and Form -->
              <div class="flex flex-col justify-between flex-1">
                <div>
                  <h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                    {{ medication.drug_name }}
                  </h1>
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
                    <div class="flex-1 min-w-[180px]">
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
                    <div class="flex-1 min-w-[180px]">
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
                    <div class="flex-1 min-w-[180px]">
                      <Dropdown
                        v-model="selectedUom"
                        :options="uomOptions"
                        label="Unit of Measure"
                        placeholder="Select UOM"
                        required
                        searchable
                      />
                    </div>
                    <!-- Quantity Selection -->
                    <div class="flex-1 min-w-[120px]">
                      <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity
                      </label>
                      <input
                        type="number"
                        v-model="selectedQuantity"
                        min="1"
                        class="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 focus:ring-2 focus:ring-[#246BFD]"
                        placeholder="Enter quantity"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Pharmacies -->
        <div class="overflow-visible bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="p-8">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Available at Pharmacies
            </h2>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="pharmacy in pharmacies"
                :key="pharmacy.id"
                class="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 overflow-hidden bg-white rounded-lg dark:bg-gray-800">
                      <LazyImage
                        :src="pharmacy.logo"
                        :alt="pharmacy.name"
                        aspectRatio="square"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900 dark:text-white">
                        {{ pharmacy.name }}
                      </h3>
                      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span v-if="pharmacy.distance">{{ pharmacy.distance }}</span>
                        <span v-if="pharmacy.rating">• {{ pharmacy.rating }} ★</span>
                      </div>
                    </div>
                  </div>
                  <span
                    class="px-3 py-1 text-sm font-medium rounded-full"
                    :class="pharmacy.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                  >
                    {{ pharmacy.inStock ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-bold text-[#246BFD]">
                      Ghc{{ pharmacy.discountPrice.toFixed(2) }}
                    </span>
                    <span class="ml-2 text-lg text-gray-500 line-through">
                      Ghc{{ pharmacy.price.toFixed(2) }}
                    </span>
                  </div>
                  <button
                    v-if="pharmacy.inStock"
                    @click="handleGetCoupon(pharmacy)"
                    class="px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors"
                  >
                    Get Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Blogs Section -->
        <div v-if="relatedBlogs.length" class="mt-12">
          <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Related Blogs</h2>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BlogCard
              v-for="blog in relatedBlogs"
              :key="blog.id"
              :title="blog.title"
              :excerpt="blog.summary"
              :date="blog.date || '2024-01-01'"
              :author="blog.author || 'FyndRx Team'"
              :category="blog.category || 'General'"
              :image="blog.image || '/images/blog/default.jpg'"
              :url="blog.url"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Coupon Modal -->
    <div
      v-if="showCouponModal && selectedPharmacy && medication"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div class="w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-2xl">
        <div id="coupon-template" class="bg-white p-6 rounded-xl border-2 border-dashed border-[#246BFD] mb-6">
          <div class="mb-4 text-center">
            <h3 class="text-2xl font-bold text-[#246BFD] mb-2">
              {{ Math.round((1 - selectedPharmacy.discountPrice / selectedPharmacy.price) * 100) }}% OFF
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              {{ medication.drug_name }}
            </p>
          </div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Valid at</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedPharmacy.name }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Save</p>
              <p class="text-xl font-bold text-[#246BFD]">
                Ghc{{ (selectedPharmacy.price - selectedPharmacy.discountPrice).toFixed(2) }}
              </p>
            </div>
          </div>
          <div class="text-sm text-center text-gray-500 dark:text-gray-400">
            <p>Valid until: {{ new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() }}</p>
            <p class="mt-1">Terms and conditions apply</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="generateCoupon"
            class="flex-1 px-4 py-2 rounded-lg bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
          >
            Download PDF
          </button>
          <button
            @click="saveToCoupons"
            class="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-colors"
          >
            Save to Coupons
          </button>
          <button
            @click="shareCoupon"
            class="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-colors"
          >
            Share
          </button>
        </div>

        <button
          @click="showCouponModal = false"
          class="absolute text-gray-400 top-4 right-4 hover:text-gray-500"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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