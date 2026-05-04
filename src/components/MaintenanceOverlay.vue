<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSettingsStore } from '@/store/settings';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';

const route = useRoute();
const settingsStore = useSettingsStore();

const isMaintenanceMode = computed(() => settingsStore.maintenanceMode);
const maintenanceMessage = computed(() => settingsStore.maintenanceMessage);

const shouldShow = ref(false);

const publicPages = [
  'home', 
  'about', 
  'services', 
  'contact', 
  'blog', 
  'blog-post', 
  'faq', 
  'help', 
  'terms', 
  'privacy', 
  'feedback', 
  'medications', 
  'pharmacies', 
  'pharmacy', 
  'MedicationDetail', 
  'not-found'
];

const checkVisibility = () => {
  if (isMaintenanceMode.value) {
    // Show overlay if the current route is NOT in the public informational pages list
    const routeName = route.name as string;
    if (!publicPages.includes(routeName)) {
      shouldShow.value = true;
    } else {
      shouldShow.value = false;
    }
  } else {
    shouldShow.value = false;
  }
};

const handleMaintenanceEvent = () => {
  settingsStore.setMaintenanceMode(true);
  checkVisibility();
};

watch(
  () => [route.path, isMaintenanceMode.value],
  () => {
    checkVisibility();
  }
);

onMounted(() => {
  window.addEventListener('api:maintenance', handleMaintenanceEvent);
  checkVisibility();
});

onUnmounted(() => {
  window.removeEventListener('api:maintenance', handleMaintenanceEvent);
});
</script>

<template>
  <Transition name="fade-overlay">
    <div v-if="shouldShow" class="fixed inset-0 z-[9999] bg-[#0A0F1D] flex items-center justify-center p-6 overflow-hidden">
      <!-- Premium Background Layers -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-600/20 rounded-full blur-[100px] animate-[pulse_8s_infinite]"></div>
        <div class="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[150px]"></div>
        
        <!-- Grid Pattern -->
        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      </div>

      <!-- Floating Branded Elements (Background) -->
      <div class="absolute inset-0 pointer-events-none opacity-10">
        <svg class="absolute top-20 left-20 w-16 h-16 text-blue-400 animate-[bounce_10s_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <svg class="absolute bottom-40 right-20 w-24 h-24 text-indigo-400 animate-[spin_20s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <!-- Content Card -->
      <div class="relative w-full max-w-2xl">
        <div class="absolute inset-0 bg-white/[0.01] backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"></div>
        
        <div class="relative z-10 p-12 md:p-16 text-center">
          <!-- Logo & Branding -->
          <div class="flex flex-col items-center mb-10">
            <div class="mb-8 group cursor-default">
              <img 
                :src="logoWhiteOrange" 
                alt="FyndRX Logo" 
                class="h-16 md:h-20 w-auto group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_20px_rgba(36,107,253,0.3)]"
              />
            </div>
            <div class="space-y-1">
              <span class="block text-sm font-bold text-blue-400 uppercase tracking-[0.3em] mb-1">FyndRX Platform</span>
              <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Enhancing Your <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Care Experience</span>
              </h1>
            </div>
          </div>

          <!-- Message -->
          <div class="max-w-md mx-auto mb-12">
            <div class="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <span class="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Scheduled Maintenance</span>
            </div>
            <p class="text-xl text-gray-400 font-medium leading-relaxed">
              {{ maintenanceMessage }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/" 
              class="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-blue-600 rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 active:scale-95 overflow-hidden"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span class="relative">Return to Public Site</span>
              <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </router-link>
            
            <a 
              href="mailto:support@fyndrx.com" 
              class="inline-flex items-center justify-center px-8 py-4 font-bold text-gray-300 border border-white/10 rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-300 active:scale-95"
            >
              Contact Support
            </a>
          </div>

          <!-- Footer -->
          <div class="mt-16 pt-8 border-t border-white/5">
            <p class="text-sm text-gray-500 font-medium">
              &copy; {{ new Date().getFullYear() }} FyndRX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.bg-grid-white\/\[0\.02\] {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
  transform: scale(1.05);
  backdrop-filter: blur(0px);
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}
</style>
