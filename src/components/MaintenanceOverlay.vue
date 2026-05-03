<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { apiService } from '@/services/api';

const route = useRoute();
const isMaintenanceMode = ref(false);

const shouldShow = ref(false);

const checkVisibility = () => {
  // Show if maintenance mode is ON and the route is either auth-required or guest-required (login/register)
  if (isMaintenanceMode.value) {
    if (route.meta.requiresAuth || route.meta.requiresGuest) {
      shouldShow.value = true;
    } else {
      shouldShow.value = false;
    }
  } else {
    shouldShow.value = false;
  }
};

const handleMaintenanceEvent = () => {
  isMaintenanceMode.value = true;
  checkVisibility();
};

const checkStatus = async () => {
  try {
    // Only fetch if not already triggered by an interceptor
    if (!isMaintenanceMode.value) {
      // The endpoint added to postman collection
      const status: any = await apiService.get('/settings/status');
      if (status && status.maintenance_mode) {
        isMaintenanceMode.value = true;
      }
      checkVisibility();
    }
  } catch (err) {
    // If it fails with 503, the interceptor will trigger handleMaintenanceEvent anyway
  }
};

watch(
  () => route.path,
  () => {
    checkVisibility();
  }
);

onMounted(() => {
  window.addEventListener('api:maintenance', handleMaintenanceEvent);
  checkStatus();
});

onUnmounted(() => {
  window.removeEventListener('api:maintenance', handleMaintenanceEvent);
});
</script>

<template>
  <Transition name="fade-overlay">
    <div v-if="shouldShow" class="fixed inset-0 z-[9999] bg-gray-900/40 backdrop-blur-3xl flex items-center justify-center p-4">
      <!-- Glow Effects -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div class="relative w-full max-w-lg bg-white/10 dark:bg-gray-800/20 border border-white/20 shadow-2xl rounded-3xl p-10 text-center overflow-hidden">
        <!-- Floating animation gear -->
        <div class="flex justify-center mb-8 relative">
          <div class="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
          <svg class="w-24 h-24 text-white animate-[spin_10s_linear_infinite] drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>

        <h1 class="text-3xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
          System Update in Progress
        </h1>
        
        <p class="text-lg text-gray-200 dark:text-gray-300 font-medium leading-relaxed mb-8 drop-shadow">
          We are currently performing scheduled maintenance to improve your experience. Secure areas of the application are temporarily paused.
        </p>

        <div class="flex flex-col space-y-4">
          <router-link to="/" class="inline-flex items-center justify-center w-full px-6 py-4 text-sm font-bold text-gray-900 bg-white rounded-full hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-white/10">
            Return to Public Site
          </router-link>
          
          <a href="mailto:support@fyndrx.com" class="inline-flex items-center justify-center w-full px-6 py-4 text-sm font-bold text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors duration-200 backdrop-blur-md">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.5s ease, backdrop-filter 0.5s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}
</style>
