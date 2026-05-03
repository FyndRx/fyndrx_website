<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
const retryAfter = ref(0);
const timerInterval = ref<number | null>(null);

const handleRateLimit = (event: Event) => {
  const customEvent = event as CustomEvent;
  const headerValue = customEvent.detail?.retryAfter;
  let secondsToWait = 60; // Default to 1 minute if header is missing

  if (headerValue) {
    const parsed = parseInt(headerValue, 10);
    if (!isNaN(parsed)) {
      secondsToWait = parsed;
    }
  }

  retryAfter.value = secondsToWait;
  isVisible.value = true;

  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }

  timerInterval.value = window.setInterval(() => {
    if (retryAfter.value > 0) {
      retryAfter.value--;
    } else {
      isVisible.value = false;
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
      }
    }
  }, 1000);
};

const close = () => {
  isVisible.value = false;
};

onMounted(() => {
  window.addEventListener('api:rate-limit', handleRateLimit);
});

onUnmounted(() => {
  window.removeEventListener('api:rate-limit', handleRateLimit);
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
      <div class="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-5 dark:bg-gray-900/40">
        <!-- Background Gradient Glow -->
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 flex items-start space-x-4">
          <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Whoa there! Too fast.</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              You've hit our rate limit. To keep the platform stable, we temporarily paused your requests. 
            </p>
            
            <div class="mt-3 flex items-center space-x-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                Wait {{ retryAfter }}s
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">before trying again.</span>
            </div>
          </div>

          <button @click="close" class="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-linear" :style="{ width: `${(retryAfter / 60) * 100}%` }"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%) scale(0.9);
}
</style>
