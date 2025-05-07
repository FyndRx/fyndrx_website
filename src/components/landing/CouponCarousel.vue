<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

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
    title: '20% Off All Prescriptions',
    description: 'Save big on your next prescription purchase',
    code: 'SAVE20',
    expiry: '2024-12-31',
    pharmacy: 'FyndRx Pharmacy',
    image: '/src/assets/images/coupon.png'
  },
  {
    id: 2,
    title: 'Free Delivery on Orders Over $50',
    description: 'Get your medications delivered to your doorstep',
    code: 'FREESHIP',
    expiry: '2024-12-31',
    pharmacy: 'Walgreens',
    image: 'https://i.pinimg.com/736x/03/8f/9a/038f9a00d6456ba6344884d3e19cac21.jpg'
  },
  {
    id: 3,
    title: '15% Off First Order',
    description: 'New customer special offer',
    code: 'WELCOME15',
    expiry: '2024-12-31',
    pharmacy: 'Rite Aid',
    image: 'https://i.pinimg.com/736x/ec/27/02/ec27020c58526a2b9be6377f758ec4ce.jpg'
  },
  {
    id: 4,
    title: '25% Off Generic Medications',
    description: 'Save on generic prescription drugs',
    code: 'GENERIC25',
    expiry: '2024-12-31',
    pharmacy: 'Walmart Pharmacy',
    image: '/src/assets/images/coupon.png'
  },
  {
    id: 5,
    title: '10% Off All Vitamins',
    description: 'Boost your health with discounted vitamins',
    code: 'VITAMIN10',
    expiry: '2024-12-31',
    pharmacy: 'Target Pharmacy',
    image: 'https://i.pinimg.com/736x/75/d4/90/75d49093098e3278c60310e04ab15b28.jpg'
  },
  {
    id: 6,
    title: 'Free Health Screening',
    description: 'Get a free health screening with any purchase',
    code: 'SCREENFREE',
    expiry: '2024-12-31',
    pharmacy: 'Kroger Pharmacy',
    image: '/src/assets/images/coupon.png'
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

<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12 scroll-animate slide-up">
        <h2 class="text-4xl font-medium text-gray-900 dark:text-white mb-4">
          Latest <span class="text-[#246BFD]">Deals</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Don't miss out on these exclusive pharmacy coupons
        </p>
      </div>

      <!-- Carousel -->
      <div class="relative scroll-animate slide-up delay-200">
        <!-- Navigation Buttons -->
        <button
          @click="prevSlide"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          @click="nextSlide"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Coupon Cards -->
        <div class="relative overflow-hidden">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(-${currentIndex * (100/3)}%)` }"
          >
            <div
              v-for="(coupon, index) in coupons"
              :key="coupon.id"
              class="w-1/3 flex-shrink-0 p-4 transition-all duration-500 hover:translate-y-[-10px]"
            >
              <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover-lift">
                <!-- Coupon Image -->
                <div class="relative h-48">
                  <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20"></div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <img :src="coupon.image" alt="" class="w-full h-48 object-cover" />
                    <!-- <p class="text-gray-400">Coupon Image</p> -->
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
        </div>

        <!-- Dots Navigation -->
        <div class="flex justify-center mt-8 space-x-2">
          <button
            v-for="(_, index) in coupons"
            :key="index"
            @click="goToSlide(index)"
            class="w-3 h-3 rounded-full transition-colors"
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