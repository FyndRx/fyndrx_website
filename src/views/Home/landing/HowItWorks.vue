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

const steps = ref([
  {
    id: 1,
    title: 'Search for Pharmacies',
    description: 'Enter your location to find pharmacies near you',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    id: 2,
    title: 'Compare Prices',
    description: 'View and compare prices for your prescriptions',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    id: 3,
    title: 'Apply Coupons',
    description: 'Use available coupons to save on your purchase',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 4,
    title: 'Save Money',
    description: 'Get the best deals and save on your prescriptions',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
]);
</script>

<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          How It <span class="text-[#246BFD]">Works</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Save money on your prescriptions in just a few simple steps
        </p>
      </div>

      <!-- Steps Grid -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="flex flex-col items-center p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover-lift">
            <!-- Step Number -->
            <div class="w-12 h-12 rounded-full bg-[#246BFD]/10 flex items-center justify-center mb-6">
              <span class="text-2xl font-medium text-[#246BFD]">{{ step.id }}</span>
            </div>

            <!-- Step Icon -->
            <div class="w-12 h-12 rounded-full bg-[#FE9615]/10 flex items-center justify-center mb-6">
              <svg class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="step.icon"></path>
              </svg>
            </div>

            <!-- Step Content -->
            <h3 class="mb-3 text-xl font-medium text-center text-gray-900 dark:text-white">
              {{ step.title }}
            </h3>
            <p class="text-center text-gray-600 dark:text-gray-300">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="mt-16 text-center delay-500 scroll-animate slide-up">
        <button class="px-8 py-4 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors">
          Get Started
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