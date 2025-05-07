<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

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
    title: 'Lipitor 20mg',
    description: 'Save on your cholesterol medication',
    code: 'FRXLIP3R20',
    expiry: '2024-12-31',
    pharmacy: 'CVS Pharmacy',
    savings: '30%',
    image: 'https://i.pinimg.com/736x/ec/27/02/ec27020c58526a2b9be6377f758ec4ce.jpg'
  },
  {
    id: 2,
    title: 'Metformin 500mg',
    description: 'Discount on diabetes medication',
    code: 'FRXMETF3R2',
    expiry: '2024-12-31',
    pharmacy: 'FyndRx Pharmacy',
    savings: '25%',
    image: '/src/assets/images/coupon.png'
  },
  {
    id: 3,
    title: 'Lisinopril 10mg',
    description: 'Save on blood pressure medication',
    code: 'FRXISIJQW3',
    expiry: '2024-12-31',
    pharmacy: 'FyndRx Pharmacy',
    savings: '35%',
    image: '/src/assets/images/coupon.png'
  }
]);
</script>

<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16 scroll-animate slide-up">
        <h2 class="text-4xl font-medium text-gray-900 dark:text-white mb-4">
          Popular <span class="text-[#246BFD]">Prescription</span> Coupons
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Save big on your most common prescriptions
        </p>
      </div>

      <!-- Coupons Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(coupon, index) in popularCoupons"
          :key="coupon.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover-lift">
            <!-- Coupon Image -->
            <div class="relative h-48">
              <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <img 
                  :src="coupon.image" 
                  :alt="coupon.title"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 rounded-full bg-[#FE9615]/10 text-[#FE9615] text-sm font-medium">
                  {{ coupon.savings }} Off
                </span>
              </div>
            </div>

            <!-- Coupon Info -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full bg-[#246BFD]/10 text-[#246BFD] text-sm font-medium">
                  {{ coupon.pharmacy }}
                </span>
                <span class="text-gray-400 text-sm">
                  Expires: {{ new Date(coupon.expiry).toLocaleDateString() }}
                </span>
              </div>
              <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {{ coupon.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                {{ coupon.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-medium text-[#246BFD]">
                    {{ coupon.code }}
                  </span>
                  <button class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
                <button class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors">
                  Use Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div class="text-center mt-12 scroll-animate slide-up delay-500">
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