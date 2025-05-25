<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import MedicationCard from '@/components/MedicationCard.vue';

const { registerElement } = useScrollAnimation();
const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

// Sample popular coupons data
const popularCoupons = ref([
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
</script>

<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Popular <span class="text-[#246BFD]">Prescription</span> Coupons
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Save big on your most common prescriptions
        </p>
      </div>

      <!-- Coupons Grid -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <MedicationCard
            v-for="drug in popularCoupons"
            :key="drug.id"
            :medication="drug"
            variant="coupon"
          />
        </div>

      <!-- View All Button -->
      <div class="mt-12 text-center delay-500 scroll-animate slide-up">
        <button class="px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300">
          View All Coupons
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 