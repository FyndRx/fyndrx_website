<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const { registerElement } = useScrollAnimation();
const isVisible = ref(false);
const email = ref('');
const isSubmitting = ref(false);
const isSuccess = ref(false);

onMounted(() => {
  isVisible.value = true;
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  if (!email.value) return;
  
  isSubmitting.value = true;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  isSubmitting.value = false;
  isSuccess.value = true;
  email.value = '';
  
  // Reset success message after 3 seconds
  setTimeout(() => {
    isSuccess.value = false;
  }, 3000);
};
</script>

<template>
  <section class="py-20 bg-[#246BFD]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left Column -->
        <div class="scroll-animate slide-in-left">
          <h2 class="text-4xl font-medium text-white mb-4">
            Stay Updated with the Latest Deals
          </h2>
          <p class="text-xl text-blue-100 mb-8">
            Subscribe to our newsletter and never miss out on exclusive pharmacy deals and savings tips.
          </p>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-white">100+</p>
                <p class="text-blue-100 font-light">Pharmacies</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-white">50%</p>
                <p class="text-blue-100 font-light">Average Savings</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="scroll-animate slide-in-right">
          <form @submit="handleSubmit" class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h3 class="text-2xl font-medium text-gray-900 dark:text-white mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Get the latest deals and savings tips delivered to your inbox.
            </p>
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:text-gray-600 dark:border-gray-600 focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                class="w-full px-6 py-3 rounded-lg bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
              >
                Subscribe Now
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-4">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </form>
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