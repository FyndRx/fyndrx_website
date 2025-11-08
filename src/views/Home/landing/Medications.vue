<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MedicationCard from '@/components/MedicationCard.vue';

interface Medication {
  id: number;
  drug_name: string;
  description?: string | null;
  brands?: Array<{ id: number; name: string }>;
  forms?: Array<{
    id: number;
    form_name: string;
    strengths: Array<{
      id: number;
      strength: string;
      uoms: Array<{ id: number; uom: string }>;
    }>;
  }>;
  price?: number;
  discountPrice?: number;
  image?: string;
}

const searchQuery = ref('');
const searchResults = ref<Medication[]>([]);
const popularDrugs = ref([
  {
    id: 1,
    drug_name: 'Amoxicillin',
    image: '/src/assets/images/medications/amoxicillin.jpg',
    description: 'Antibiotic used to treat bacterial infections',
    price: 25.99,
    discountPrice: 19.99,
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
    ]
  },
  {
    id: 2,
    drug_name: 'Ibuprofen',
    image: '/src/assets/images/medications/ibuprofen.jpg',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain and inflammation',
    price: 15.99,
    discountPrice: 12.99,
    brands: [
      { id: 3, name: 'Advil' },
      { id: 4, name: 'Motrin' }
    ],
    forms: [
      {
        id: 3,
        form_name: 'Tablets',
        strengths: [
          { id: 5, strength: '200mg', uoms: [{ id: 1, uom: 'TABLET(S)' }] },
          { id: 6, strength: '400mg', uoms: [{ id: 1, uom: 'TABLET(S)' }] },
          { id: 7, strength: '600mg', uoms: [{ id: 1, uom: 'TABLET(S)' }] }
        ]
      },
      {
        id: 4,
        form_name: 'Liquid',
        strengths: [
          { id: 8, strength: '100mg/5ml', uoms: [{ id: 2, uom: 'ML' }] }
        ]
      }
    ]
  },
  {
    id: 3,
    drug_name: 'Omeprazole',
    image: '/src/assets/images/medications/omeprazole.jpg',
    description: 'Proton pump inhibitor used to reduce stomach acid production',
    price: 35.99,
    discountPrice: 29.99,
    brands: [
      { id: 5, name: 'Prilosec' },
      { id: 6, name: 'Losec' }
    ],
    forms: [
      {
        id: 5,
        form_name: 'Capsules',
        strengths: [
          { id: 9, strength: '10mg', uoms: [{ id: 1, uom: 'CAPSULE(S)' }] },
          { id: 10, strength: '20mg', uoms: [{ id: 1, uom: 'CAPSULE(S)' }] },
          { id: 11, strength: '40mg', uoms: [{ id: 1, uom: 'CAPSULE(S)' }] }
        ]
      },
      {
        id: 6,
        form_name: 'Tablets',
        strengths: [
          { id: 12, strength: '20mg', uoms: [{ id: 1, uom: 'TABLET(S)' }] }
        ]
      }
    ]
  }
]);

const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase().trim();
  
  searchResults.value = popularDrugs.value.filter(drug => {
    // Search in drug name
    if (drug.drug_name.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in brand names
    if (drug.brands?.some(brand => brand.name.toLowerCase().includes(query))) {
      return true;
    }
    
    // Search in description
    if (drug.description?.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search in forms and strengths
    if (drug.forms?.some(form => 
      form.form_name.toLowerCase().includes(query) ||
      form.strengths.some(strength => strength.strength.toLowerCase().includes(query))
    )) {
      return true;
    }
    
    return false;
  });
};

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});
</script>

<script lang="ts">
export default {
  name: 'Medications'
};
</script>

<template>
  <section class="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Browse <span class="text-[#246BFD]">Medications</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Search for medications by name, brand, or condition and compare prices across verified pharmacies
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-16 delay-200 scroll-animate slide-up">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search medications..."
            class="w-full px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @keyup.enter="handleSearch"
          />
          <button 
            class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
            @click="handleSearch"
          >
            Find CARE
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-16">
        <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="flex flex-wrap gap-3">
            <MedicationCard
              v-for="medication in searchResults"
              :key="medication.id"
              :medication="medication"
              variant="simple"
            />
          </div>
        </div>
      </div>

      <!-- Latest Deals -->
      <!-- <div class="mb-16 delay-300 scroll-animate slide-up">
        <h3 class="mb-8 text-2xl font-medium text-center text-gray-900 dark:text-white">
          Latest Deals
        </h3>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <MedicationCard
            v-for="drug in popularDrugs"
            :key="drug.id"
            :medication="drug"
            variant="detailed"
          />
        </div>
      </div> -->

      <!-- Popular Prescription Coupons -->
      <!-- <div class="scroll-animate slide-up delay-400">
        <h3 class="mb-8 text-2xl font-medium text-center text-gray-900 dark:text-white">
          Popular Prescription Coupons
        </h3>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <MedicationCard
            v-for="drug in popularDrugs"
            :key="drug.id"
            :medication="drug"
            variant="coupon"
          />
        </div>
      </div> -->
    </div>
  </section>
</template>

<style scoped>

.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.scroll-animate.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.delay-200 {
  transition-delay: 200ms;
}

.delay-300 {
  transition-delay: 300ms;
}

.delay-400 {
  transition-delay: 400ms;
}
</style> 