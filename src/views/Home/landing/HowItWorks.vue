<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const { registerElement } = useScrollAnimation();
const router = useRouter();

onMounted(() => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const steps = ref([
  {
    id: 1,
    title: 'Search for Drugs',
    description: 'Search by drug name, brand, or medical condition — compare prices across all partner pharmacies instantly.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: 'bg-[#246BFD]/10 text-[#246BFD]'
  },
  {
    id: 2,
    title: 'Upload Prescription',
    description: 'Upload your prescription securely. A licensed pharmacist verifies it before your order is processed.',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    id: 3,
    title: 'Add to Cart & Checkout',
    description: 'Select your preferred pharmacy, add items to cart, and complete payment with multiple secure options.',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    color: 'bg-[#FE9615]/10 text-[#FE9615]'
  },
  {
    id: 4,
    title: 'Track Your Order',
    description: 'Get SMS and push notifications at every step — from order confirmation to delivery at your doorstep.',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    color: 'bg-green-500/10 text-green-500'
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
          <div class="relative flex flex-col p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover-lift h-full">
            <!-- Step Number badge -->
            <span class="absolute top-5 right-5 text-xs font-bold text-gray-300 dark:text-gray-600">
              {{ String(step.id).padStart(2, '0') }}
            </span>

            <!-- Step Icon -->
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" :class="step.color">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="step.icon"></path>
              </svg>
            </div>

            <!-- Step Content -->
            <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {{ step.title }}
            </h3>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Connector line (desktop only) -->
      <div class="hidden lg:flex items-center justify-center mt-2 mb-6 px-16 pointer-events-none select-none" aria-hidden="true">
        <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
      </div>

      <!-- CTA Button -->
      <div class="mt-10 text-center delay-500 scroll-animate slide-up">
        <button
          @click="router.push('/medications')"
          class="px-8 py-4 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors shadow-lg hover:shadow-[#246BFD]/30"
        >
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