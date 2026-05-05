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
        <router-link to="/" class="flex items-center shrink-0 group">
          <img 
            :src="logoBlueOrange" 
            alt="FyndRx Logo" 
            class="h-10 mr-3 transition-transform duration-300 group-hover:rotate-12 dark:hidden"
          />
          <img 
            :src="isScrolled ? logoBlueOrange : logoWhiteOrange" 
            alt="FyndRx Logo" 
            class="hidden h-10 mr-3 transition-transform duration-300 group-hover:rotate-12 dark:block"
          />
        </router-link>

        <!-- Desktop Navigation — visible lg+ -->
        <div class="items-center hidden lg:flex space-x-6 xl:space-x-8 mx-4">
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
              class="relative font-medium transition-all duration-300 group flex items-center whitespace-nowrap text-sm xl:text-base"
              :class="[
                isActive ? 'text-[#246BFD]' : 'text-gray-700 hover:text-[#246BFD] dark:text-gray-200',
              ]"
            >
              <!-- Active Dot -->
              <span 
                v-if="isActive" 
                class="absolute -left-3 w-1.5 h-1.5 rounded-full bg-[#246BFD] shadow-[0_0_10px_#246BFD] animate-pulse"
              ></span>
              {{ link }}
              <!-- Hover Underline -->
              <span 
                v-if="!isActive"
                class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#246BFD] transition-all duration-300 group-hover:w-full opacity-50"
              ></span>
            </a>
          </router-link>
        </div>

        <!-- Right Side Actions — visible lg+ -->
        <div class="items-center hidden lg:flex space-x-2 xl:space-x-3 shrink-0">

          <!-- Upload Rx: icon-only on lg, full label on xl+ -->
          <router-link 
            to="/upload-prescription"
            class="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FE9615] text-white font-medium hover:bg-[#ffb547] transition-all duration-300 hover:shadow-lg hover:shadow-[#FE9615]/20"
            title="Upload Prescription"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span class="hidden xl:inline text-sm whitespace-nowrap">Upload Rx</span>
          </router-link>

          <!-- Cart -->
          <router-link 
            to="/cart"
            class="relative p-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group shrink-0"
            title="Shopping Cart"
          >
            <svg class="w-5 h-5 text-gray-700 dark:text-white transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span 
              v-if="cartStore.cartItemsCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#FE9615] rounded-full animate-pulse"
            >
              {{ cartStore.cartItemsCount > 99 ? '99+' : cartStore.cartItemsCount }}
            </span>
          </router-link>

          <!-- Dark Mode Toggle -->
          <DarkModeToggle />

          <!-- Auth Buttons / User Avatar -->
          <template v-if="!isAuthenticated">
            <!-- Sign In: always text; Register: icon + text on xl, icon-only on lg -->
            <router-link 
              to="/login" 
              class="px-4 xl:px-6 py-2 rounded-full bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#246BFD]/20 text-sm whitespace-nowrap"
            >
              Sign In
            </router-link>
            <router-link 
              to="/register" 
              class="hidden xl:block px-6 py-2 rounded-full bg-[#FE9615] text-white font-semibold hover:bg-[#ffb547] transition-all duration-300 hover:shadow-lg hover:shadow-[#FE9615]/20 text-sm whitespace-nowrap"
            >
              Register
            </router-link>
          </template>
          <UserAvatar v-else />
        </div>

        <!-- Mobile Actions — visible only below lg -->
        <div class="flex items-center lg:hidden space-x-2 ml-auto mr-2">
          <!-- Upload Rx Icon -->
          <router-link 
            to="/upload-prescription"
            class="p-2 rounded-full bg-[#FE9615]/10 text-[#FE9615] hover:bg-[#FE9615] hover:text-white transition-all duration-300"
            title="Upload Prescription"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </router-link>

          <!-- Cart Icon -->
          <router-link 
            to="/cart"
            class="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-[#246BFD] hover:text-white transition-all duration-300"
            title="Shopping Cart"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span 
              v-if="cartStore.cartItemsCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-[#FE9615] rounded-full"
            >
              {{ cartStore.cartItemsCount }}
            </span>
          </router-link>

          <!-- User Avatar or Login Icon -->
          <template v-if="!isAuthenticated">
            <router-link 
              to="/login"
              class="p-2 rounded-full bg-[#246BFD]/10 text-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
              title="Sign In"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </router-link>
          </template>
          <div v-else class="relative z-[60]">
            <UserAvatar />
          </div>
        </div>

        <!-- Hamburger — visible below lg -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-2 transition-colors rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
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
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"
            />
            <path 
              v-else
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile / Tablet Menu — below lg -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="isMobileMenuOpen"
          class="pb-6 pt-2 space-y-1 lg:hidden"
        >
          <!-- Nav Links -->
          <router-link 
            v-for="link in ['Home', 'Medications', 'Pharmacies', 'Blog', 'About', 'Contact']" 
            :key="link"
            :to="link === 'Home' ? '/' : '/' + link.toLowerCase()"
            class="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:text-[#246BFD] hover:bg-[#246BFD]/5 font-medium transition-all"
            @click="isMobileMenuOpen = false"
          >
            {{ link }}
          </router-link>

          <div class="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <!-- Dark Mode Toggle row -->
            <div class="flex items-center justify-between px-4 py-2">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Appearance</span>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </transition>
    </nav>
  </header>
</template>

<style scoped>
</style>