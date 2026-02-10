<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import UserAvatar from '@/components/UserAvatar.vue';
import DarkModeToggle from '@/components/DarkModeToggle.vue';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';

const authStore = useAuthStore();
const cartStore = useCartStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

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
    class="print:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="{
      'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg': isScrolled || isMobileMenuOpen,
      'bg-transparent': !isScrolled,
    }"
  >
    <nav class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center group">
          <img 
            :src="logoBlueOrange" 
            alt="FyndRx Logo" 
            class="w-full h-10 mr-3 transition-transform duration-300 group-hover:rotate-12 dark:hidden"
          />
          <img 
            :src="isScrolled ? logoBlueOrange : logoWhiteOrange" 
            alt="FyndRx Logo" 
            class="hidden w-full h-10 mr-3 transition-transform duration-300 group-hover:rotate-12 dark:block"
          />
        </router-link>

        <!-- Desktop Navigation -->
        <div class="items-center hidden space-x-8 md:flex">
          <router-link 
            v-for="link in ['Home', 'Medications', 'Pharmacies', 'Blog', 'About', 'Contact']" 
            :key="link"
            :to="link === 'Home' ? '/' : '/' + link.toLowerCase()"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a 
              :href="href" 
              @click="navigate"
              class="relative font-medium transition-all duration-300 group flex items-center"
              :class="[
                isActive ? 'text-[#246BFD]' : 'text-gray-700 hover:text-[#246BFD] dark:text-gray-200',
              ]"
            >
              <!-- Creative Active Dot -->
              <span 
                v-if="isActive" 
                class="absolute -left-3 w-1.5 h-1.5 rounded-full bg-[#246BFD] shadow-[0_0_10px_#246BFD] animate-pulse"
              ></span>

              {{ link }}

              <!-- Hover Underline (Only if not active) -->
              <span 
                v-if="!isActive"
                class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#246BFD] transition-all duration-300 group-hover:w-full opacity-50"
              ></span>
            </a>
          </router-link>
        </div>

        <!-- Right Side Actions -->
        <div class="items-center hidden space-x-3 md:flex">
          <!-- Upload Prescription Button -->
          <router-link 
            to="/upload-prescription"
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FE9615] text-white font-medium hover:bg-[#ffb547] transition-all duration-300 hover:shadow-lg hover:shadow-[#FE9615]/20"
            title="Upload Prescription"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span class="text-sm">Upload Rx</span>
          </router-link>

          <!-- Cart Icon with Badge -->
          <router-link 
            to="/cart"
            class="relative p-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group"
            title="Shopping Cart"
          >
            <svg 
              class="w-6 h-6 text-gray-700 dark:text-white transition-transform group-hover:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span 
              v-if="cartStore.cartItemsCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-[#FE9615] rounded-full animate-pulse"
            >
              {{ cartStore.cartItemsCount > 99 ? '99+' : cartStore.cartItemsCount }}
            </span>
          </router-link>

          <!-- Dark Mode Toggle -->
          <DarkModeToggle />

          <!-- Auth Buttons / User Avatar -->
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
          <UserAvatar v-else />
        </div>

        <!-- Mobile Menu Button -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-2 transition-colors rounded-lg md:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <svg 
            :class="{
              'w-6 h-6 text-gray-700 dark:text-white': isScrolled || isMobileMenuOpen,
              'w-6 h-6 text-white': !isScrolled && !isMobileMenuOpen
            }" 
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
        class="py-4 space-y-4 transition-all duration-300 md:hidden"
      >
        <router-link 
          v-for="link in ['Home', 'Medications', 'Pharmacies', 'Blog', 'About', 'Contact']" 
          :key="link"
          :to="link === 'Home' ? '/' : '/' + link.toLowerCase()"
          class="block text-gray-700 dark:text-gray-300 hover:text-[#246BFD] font-medium transition-colors"
          @click="isMobileMenuOpen = false"
        >
          {{ link }}
        </router-link>
        
        <!-- Upload Prescription Link -->
        <router-link 
          to="/upload-prescription"
          class="flex items-center gap-2 p-3 rounded-lg bg-[#FE9615] text-white font-medium hover:bg-[#ffb547] transition-all"
          @click="isMobileMenuOpen = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <span>Upload Prescription</span>
        </router-link>
        
        <!-- Cart Link -->
        <router-link 
          to="/cart"
          class="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-[#246BFD] hover:text-white transition-all"
          @click="isMobileMenuOpen = false"
        >
          <span class="font-medium">Shopping Cart</span>
          <span v-if="cartStore.cartItemsCount > 0" class="px-2 py-1 text-xs font-bold text-white bg-[#FE9615] rounded-full">
            {{ cartStore.cartItemsCount }}
          </span>
        </router-link>
        
        <!-- Mobile Dark Mode Toggle -->
        <div class="flex justify-center py-2">
          <DarkModeToggle />
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
</style> 