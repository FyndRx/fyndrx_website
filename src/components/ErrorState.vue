<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'network' | 'notfound' | 'server' | 'permission' | 'general';
  message?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  showRetry: true,
  showGoHome: false
});

const emit = defineEmits<{
  retry: [];
}>();

const errorConfig = computed(() => {
  const configs = {
    network: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m2.829 2.829L9.88 9.88"></path>`,
      title: 'Connection Error',
      defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      color: 'text-red-500'
    },
    notfound: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
      title: 'Not Found',
      defaultMessage: 'The item you\'re looking for doesn\'t exist or has been removed.',
      color: 'text-gray-400'
    },
    server: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>`,
      title: 'Server Error',
      defaultMessage: 'Something went wrong on our end. Our team has been notified. Please try again later.',
      color: 'text-yellow-500'
    },
    permission: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>`,
      title: 'Access Denied',
      defaultMessage: 'You don\'t have permission to view this content. Please log in or contact support.',
      color: 'text-orange-500'
    },
    general: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
      title: 'Oops! Something went wrong',
      defaultMessage: 'An unexpected error occurred. Please try again.',
      color: 'text-red-400'
    }
  };
  return configs[props.type];
});

const displayMessage = computed(() => props.message || errorConfig.value.defaultMessage);
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center">
    <div class="mb-6 relative">
      <div class="absolute inset-0 animate-ping opacity-20">
        <svg 
          class="w-20 h-20 mx-auto" 
          :class="errorConfig.color" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          v-html="errorConfig.icon"
        ></svg>
      </div>
      <svg 
        class="w-20 h-20 mx-auto relative" 
        :class="errorConfig.color" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        v-html="errorConfig.icon"
      ></svg>
    </div>
    
    <h3 class="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
      {{ errorConfig.title }}
    </h3>
    
    <p class="mb-8 text-base text-gray-600 dark:text-gray-400 max-w-md">
      {{ displayMessage }}
    </p>
    
    <div class="flex flex-wrap gap-3 justify-center">
      <button
        v-if="showRetry"
        @click="emit('retry')"
        class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Try Again
      </button>
      
      <button
        v-if="showGoHome"
        @click="$router.push({ name: 'home' })"
        class="px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border-2 border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:text-[#246BFD] transition-all duration-300 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        Go Home
      </button>
    </div>
    
    <div v-if="type === 'network'" class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        <span class="font-semibold">💡 Quick tips:</span><br>
        • Check your WiFi or mobile data<br>
        • Try disabling VPN if enabled<br>
        • Wait a moment and refresh
      </p>
    </div>
  </div>
</template>

