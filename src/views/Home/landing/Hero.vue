<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import LazyImage from '@/components/LazyImage.vue';

const { registerElement } = useScrollAnimation();
const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<template>
  <div class="relative min-h-[90vh] flex items-center">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-0 left-0 w-96 h-96 bg-[#246BFD]/20 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#FE9615]/20 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left Column -->
        <div class="space-y-8 mt-20 md:mt-0">
          <h1 class="text-5xl md:text-6xl font-medium text-gray-900 dark:text-white leading-tight scroll-animate slide-in-left">
            Find the Best 
            <span class="text-[#246BFD]">Pharmacy</span> 
            Deals Near You
          </h1>
          <p class="text-xl font-light text-gray-600 dark:text-gray-300 scroll-animate slide-in-left delay-200">
            Save money on your prescriptions with FyndRx. Compare prices, find coupons, and get the best deals from pharmacies in your area.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 scroll-animate slide-in-left delay-300">
            <button class="px-8 py-4 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#246BFD]/20 hover-lift">
              Find Pharmacies
            </button>
            <button class="px-8 py-4 rounded-full bg-white text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 hover-lift">
              Learn More
            </button>
          </div>
          <div class="flex items-center space-x-8 pt-8 scroll-animate slide-in-left delay-400">
            <div class="flex items-center space-x-2 hover-scale">
              <div class="w-12 h-12 rounded-full bg-[#FE9615]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-gray-900 dark:text-white">100+</p>
                <p class="text-gray-600 dark:text-gray-300 font-light">Pharmacies</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 hover-scale">
              <div class="w-12 h-12 rounded-full bg-[#246BFD]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-gray-900 dark:text-white">50%</p>
                <p class="text-gray-600 dark:text-gray-300 font-light">Average Savings</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="relative scroll-animate slide-in-right delay-300">
          <!-- Hero Image with LazyImage -->
          <div class="relative w-full h-[500px] rounded-2xl overflow-hidden hover:shadow-2xl hover-scale">
            <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20"></div>
            <LazyImage
              src="/src/assets/images/hero-image.png"
              alt="Hero Image"
              aspectRatio="landscape"
              className="w-full h-full"
            />
          </div>
          
          <!-- Floating Elements -->
          <div class="absolute -top-8 -right-8 w-32 h-32 bg-[#FE9615]/10 rounded-full filter blur-xl hover-rotate"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-[#246BFD]/10 rounded-full filter blur-xl hover-rotate"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating {
  animation: float 3s ease-in-out infinite;
}
</style> 