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
    title: 'Search for Drugs',
    description: 'Search by drug name, brand, or medical condition',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
  },
  {
    id: 2,
    title: 'Upload Prescription',
    description: 'Upload your prescription for pharmacist verification',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
  },
  {
    id: 3,
    title: 'Add to Cart & Checkout',
    description: 'Select pharmacy, add to cart, and complete your order',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    id: 4,
    title: 'Track Your Order',
    description: 'Monitor your order status and get real-time updates',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  }
]);
</script>

<script lang="ts">
  export default {
    name: 'HowItWorks',
  }
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
          Get your medications delivered in just a few simple steps
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