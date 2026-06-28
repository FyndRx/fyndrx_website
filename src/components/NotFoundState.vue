<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Props {
  title?: string;
  message?: string;
  actionText?: string;
  actionRoute?: string | object;
}

withDefaults(defineProps<Props>(), {
  title: 'Not Found',
  message: 'The item you\'re looking for doesn\'t exist or has been removed.',
  actionText: 'Go Back',
  actionRoute: '/'
});

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[75vh] py-16 px-4 text-center" :class="{ 'animate-fade-in': isVisible, 'opacity-0': !isVisible }">
    <div class="relative mb-8 group">
      <div class="absolute inset-0 bg-gradient-to-tr from-[#246BFD]/20 to-[#FE9615]/20 rounded-full blur-3xl animate-pulse group-hover:scale-110 transition-transform duration-700"></div>
      
      <div class="relative bg-white dark:bg-gray-800 p-8 rounded-full shadow-2xl border border-gray-50 dark:border-gray-700/50 flex items-center justify-center w-40 h-40 mx-auto">
        <h1 class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#246BFD] to-[#FE9615]">
          404
        </h1>
      </div>
      
      <!-- Floating elements for creativity -->
      <div class="absolute -top-4 -left-4 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
      <div class="absolute -bottom-6 -right-2 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full animate-bounce" style="animation-delay: 0.5s"></div>
    </div>
    
    <h3 class="mb-4 text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
      {{ title }}
    </h3>
    
    <p class="mb-10 text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
      {{ message }}
    </p>
    
    <router-link 
      :to="actionRoute"
      class="px-8 py-4 rounded-full bg-gradient-to-r from-[#246BFD] to-[#5089FF] text-white font-bold tracking-wide hover:shadow-xl hover:shadow-[#246BFD]/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      {{ actionText }}
    </router-link>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
