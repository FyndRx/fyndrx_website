<script setup lang="ts">
import { computed } from 'vue';
import { useSettingsStore } from '@/store/settings';
import { useRoute } from 'vue-router';

const settingsStore = useSettingsStore();
const route = useRoute();

const isMaintenanceMode = computed(() => settingsStore.maintenanceMode);

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

// Only show banner on public pages (since protected ones have the overlay)
const shouldShowBanner = computed(() => {
  return isMaintenanceMode.value && publicPages.includes(route.name as string);
});
</script>

<template>
  <transition name="slide-down">
    <div v-if="shouldShowBanner" class="relative z-[60] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 py-2 px-4 shadow-lg overflow-hidden">
      <!-- Animated background glow -->
      <div class="absolute inset-0 bg-white/10 animate-pulse pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto flex items-center justify-center space-x-3 text-white text-sm font-bold">
        <div class="flex items-center space-x-2">
          <span class="flex h-2 w-2 rounded-full bg-white animate-ping"></span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <p class="tracking-wide">
          <span class="hidden sm:inline">Platform Update: </span>
          Some transactional features are temporarily restricted for system maintenance.
        </p>
        
        <router-link to="/contact" class="hidden md:flex items-center underline underline-offset-4 hover:opacity-80 transition-opacity">
          Need help? Contact us
          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
