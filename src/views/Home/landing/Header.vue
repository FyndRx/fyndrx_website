<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import UserAvatar from '@/components/UserAvatar.vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const isAuthenticated = authStore.isAuthenticated;

const { registerElement } = useScrollAnimation();
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 50;
  });
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<script lang="ts">
export default {
  name: 'Header'
};
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="{
      'bg-white/80 backdrop-blur-md shadow-lg': isScrolled || isMobileMenuOpen,
      'bg-transparent': !isScrolled,
    }"
  >
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center group">
          <img 
            :src="'/src/assets/logo/logo_blue_orange.png'" 
            alt="FyndRx Logo" 
            class="w-full h-10 mr-3 group-hover:rotate-12 transition-transform duration-300 dark:hidden"
          />
          <img 
            :src="isScrolled ? '/src/assets/logo/logo_blue_orange.png' : '/src/assets/logo/logo_white_orange.png'" 
            alt="FyndRx Logo" 
            class="w-full h-10 mr-3 group-hover:rotate-12 transition-transform duration-300 hidden dark:block"
          />
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            v-for="link in ['Home', 'Blog', 'About', 'Contact', 'Upload Prescription']" 
            :key="link"
            :to="link === 'Home' ? '/' : '/' + link.toLowerCase().replace(' ', '-')"
            class="text-gray-700 hover:text-[#246BFD] font-medium transition-all duration-300 relative group"
            :class="{'dark:text-white': !isScrolled}"
          >
            {{ link }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#246BFD] transition-all duration-300 group-hover:w-full"></span>
          </router-link>
        </div>

        <!-- App Store Badges and Auth Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- App Store Badges -->
          <div class="flex items-center space-x-2 mr-4">
            <a href="#" class="w-32 h-10 hover:opacity-90 transition-opacity">
              <img src="/src/assets/appstore_banner.svg" alt="Download on the App Store" class="w-full h-full" />
            </a>
            <a href="#" class="w-32 h-10 hover:opacity-90 transition-opacity">
              <img src="/src/assets/playstore_banner.svg" alt="GET IT ON Google Play" class="w-full h-full" />
            </a>
          </div>

          <!-- Auth Buttons -->
          <template v-if="!isAuthenticated">
            <router-link 
            to="/login" 
            class="px-6 py-2.5 rounded-full bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#246BFD]/20"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register" 
            class="px-6 py-2.5 rounded-full bg-[#FE9615] text-white font-semibold hover:bg-[#ffb547] transition-all duration-300 hover:shadow-lg hover:shadow-[#FE9615]/20"
          >
              Register
            </router-link>
          </template>
          <template v-else>
            <UserAvatar />
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg 
            :class="{'w-6 h-6 text-gray-700': isScrolled, 'w-6 h-6 text-white': !isScrolled}" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              v-if="!isMobileMenuOpen"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path 
              v-else
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div 
        v-if="isMobileMenuOpen"
        class="md:hidden py-4 space-y-4 transition-all duration-300"
      >
        <router-link 
          v-for="link in ['Home', 'Blog', 'About', 'Contact', 'Upload Prescription']" 
          :key="link"
          :to="link === 'Home' ? '/' : '/' + link.toLowerCase().replace(' ', '-')"
          class="block text-gray-700 hover:text-[#246BFD] font-medium transition-colors"
        >
          {{ link }}
        </router-link>
        
        <!-- Mobile App Store Badges -->
        <div class="flex space-x-2 py-4 justify-center">
          <a href="#" class=" h-12 hover:opacity-90 transition-opacity">
            <img src="/src/assets/appstore_banner.svg" alt="Download on the App Store" class="h-12" />
          </a>
          <a href="#" class=" h-12 hover:opacity-90 transition-opacity">
            <img src="/src/assets/playstore_banner.svg" alt="GET IT ON Google Play" class="h-12" />
          </a>
        </div>

        <template v-if="!isAuthenticated">
          <div class="flex space-x-2">
          <router-link 
            to="/login" 
            class="block w-full px-4 py-2 text-center rounded-full bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-colors"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register" 
            class="block w-full px-4 py-2 text-center rounded-full bg-[#FE9615] text-white font-semibold hover:bg-[#ffb547] transition-colors"
          >
            Register
            </router-link>
          </div>
        </template>
        <template v-else>
          <UserAvatar />
        </template>
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* .router-link-active {
  @apply text-[#246BFD];
} */

/* Override the active state for auth buttons */
/* .router-link-active[to="/login"] {
  @apply text-white;
} */
</style> 