<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="text-center max-w-2xl mx-auto" :class="{ 'animate-fade-in': isVisible }">
      <!-- Decorative elements -->
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10 rounded-full blur-3xl"></div>
        <h1 class="text-9xl font-bold text-[#246BFD] relative">
          404
        </h1>
      </div>

      <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
        Oops! Page Not Found
      </h2>
      
      <p class="text-gray-600 dark:text-gray-300 mb-8 text-lg">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track!
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link 
          to="/" 
          class="px-8 py-3 rounded-full bg-gradient-to-r from-[#246BFD] to-[#5089FF] text-white font-semibold hover:shadow-lg hover:shadow-[#246BFD]/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Go Back Home
        </router-link>
        <router-link 
          to="/contact" 
          class="px-8 py-3 rounded-full bg-gradient-to-r from-[#FE9615] to-[#ffb547] text-white font-semibold hover:shadow-lg hover:shadow-[#FE9615]/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Contact Support
        </router-link>
      </div>

      <!-- Decorative elements -->
      <div class="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div class="h-2 rounded-full bg-gradient-to-r from-[#246BFD]/20 to-[#FE9615]/20"></div>
        <div class="h-2 rounded-full bg-gradient-to-r from-[#FE9615]/20 to-[#246BFD]/20"></div>
        <div class="h-2 rounded-full bg-gradient-to-r from-[#246BFD]/20 to-[#FE9615]/20"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
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