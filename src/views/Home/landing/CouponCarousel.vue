<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import MedicationCard from '@/components/MedicationCard.vue';

const { registerElement } = useScrollAnimation();
const isVisible = ref(false);
const currentIndex = ref(0);

onMounted(() => {
  isVisible.value = true;
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

// Sample coupon data
const coupons = ref([
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

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % coupons.value.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + coupons.value.length) % coupons.value.length;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};
</script>

<script lang="ts">
  export default {
    name: 'CouponCarousel',
  }
</script>

<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-12 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Latest <span class="text-[#246BFD]">Deals</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Don't miss out on these exclusive pharmacy coupons
        </p>
      </div>

      <!-- Carousel -->
      <div class="relative delay-200 scroll-animate slide-up">
        <!-- Navigation Buttons -->
        <button
          @click="prevSlide"
          class="absolute left-0 z-10 flex items-center justify-center w-12 h-12 transition-colors -translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-0 z-10 flex items-center justify-center w-12 h-12 transition-colors translate-x-4 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Coupon Cards -->
        <div class="relative overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${currentIndex * 405}px)` }"
          >
            <div class="flex w-full gap-6">
              <div v-for="drug in coupons" :key="drug.id" class="flex-shrink-0 w-[380px] md:w-[385px]">
                <MedicationCard
                  :medication="drug"
                  variant="detailed"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Dots Navigation -->
        <div class="flex justify-center mt-8 space-x-2">
          <button
            v-for="(_, index) in coupons"
            :key="index"
            @click="goToSlide(index)"
            class="w-3 h-3 transition-colors rounded-full"
            :class="index === currentIndex ? 'bg-[#246BFD]' : 'bg-gray-300 dark:bg-gray-600'"
          ></button>
        </div>
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