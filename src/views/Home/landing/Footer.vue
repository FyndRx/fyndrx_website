<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import appStoreBanner from '@/assets/appstore_banner.svg';
import playStoreBanner from '@/assets/playstore_banner.svg';

const { registerElement } = useScrollAnimation();
const currentYear = ref(new Date().getFullYear());

onMounted(() => {
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const socialLinks = [
  {
    name: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    url: 'https://www.facebook.com/fyndrx'
  },
  {
    name: 'X',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    url: '#'
  },
  {
    name: 'Instagram',
    icon: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
    url: 'https://instagram.com/fyndrx_'
  },
  {
    name: 'YouTube',
    icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    url: 'https://www.youtube.com/@fyndrx_'
  },
  {
    name: 'TikTok',
    icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    url: 'https://www.tiktok.com/@fyndrx_'
  },
  {
    name: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    url: 'https://www.linkedin.com/company/fyndrx'
  }
];

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' }
];

const supportLinks = [
  { name: 'Help Center', path: '/help' },
  { name: 'FAQs', path: '/faqs' },
  { name: 'Report a Problem', path: '/report' },
  { name: 'Feedback', path: '/feedback' }
];

const informationLinks = [
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Letterhead', path: '/letterhead' },
  { name: 'Cookie Policy', path: '/cookies' },
  { name: 'Accessibility', path: '/accessibility' }
];

const contactInfo = {
  address: 'Mayflower Building, Community 10',
  district: 'Tema',
  city: 'Greater Accra',
  email: 'info@fyndrx.com',
  phone: '+233 24 399 6999'
};
</script>

<script lang="ts">
export default {
  name: 'Footer'
};
</script>

<template>
  <footer class="relative bg-gradient-to-b from-[#1A2233] to-[#0F172A] text-white pt-16 pb-8">
    <!-- Decorative elements -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#246BFD] via-[#FE9615] to-[#246BFD]"></div>
    
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-7">
        <!-- Brand Section -->
        <div class="space-y-6 lg:col-span-2">
          <router-link to="/" class="inline-flex items-center group">
            <img 
              :src="logoWhiteOrange" 
              alt="FyndRx Logo" 
              class="w-full h-20 mr-3 transition-transform duration-300 group-hover:rotate-12"
            />
            <!-- <span class="text-3xl font-extrabold text-white">
              Fynd<span class="text-[#FE9615]">Rx</span>
            </span> -->
          </router-link>
          <p class="leading-relaxed text-gray-400">
            Your trusted partner in accessible and affordable healthcare.
          </p>
          <div class="flex space-x-4">
            <a 
              v-for="social in socialLinks" 
              :key="social.name"
              :href="social.url"
              class="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#FE9615] transition-all duration-300 group"
            >
              <svg 
                class="w-5 h-5 text-gray-400 transition-colors group-hover:text-white" 
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path :d="social.icon" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="lg:col-span-1">
          <h4 class="relative inline-block mb-6 text-lg font-semibold">
            Quick Links
            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FE9615] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </h4>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.name">
              <router-link 
                :to="link.path"
                class="relative text-gray-400 transition-colors duration-300 hover:text-white group"
              >
                {{ link.name }}
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FE9615] transition-all duration-300 group-hover:w-full"></span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div class="lg:col-span-1">
          <h4 class="mb-6 text-lg font-semibold">Support</h4>
          <ul class="space-y-3">
            <li v-for="link in supportLinks" :key="link.name">
              <router-link 
                :to="link.path"
                class="relative text-gray-400 transition-colors duration-300 hover:text-white group"
              >
                {{ link.name }}
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FE9615] transition-all duration-300 group-hover:w-full"></span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Information -->
        <div class="lg:col-span-1">
          <h4 class="mb-6 text-lg font-semibold">Information</h4>
          <ul class="space-y-3">
            <li v-for="link in informationLinks" :key="link.name">
              <router-link 
                :to="link.path"
                class="relative text-gray-400 transition-colors duration-300 hover:text-white group"
              >
                {{ link.name }}
                <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FE9615] transition-all duration-300 group-hover:w-full"></span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="lg:col-span-2">
          <h4 class="mb-6 text-lg font-semibold">Contact Us</h4>
          <ul class="space-y-3 text-gray-400">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-[#FE9615] mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>{{ contactInfo.address }}, {{ contactInfo.district }}, {{ contactInfo.city }}</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 text-[#FE9615] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span>{{ contactInfo.email }}</span>
            </li>
            <li class="flex items-center">
              <svg class="w-5 h-5 text-[#FE9615] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span>{{ contactInfo.phone }}</span>
            </li>
          </ul>
        </div>

        <!-- App Store Badges -->
        <div class="lg:col-span-2">
          <h4 class="mb-6 text-lg font-semibold">Download Our App</h4>
          <div class="flex space-x-4">
            <a href="#" class="transition-opacity hover:opacity-90">
              <img :src="appStoreBanner" alt="Download on the App Store" class="w-full h-10" />
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.aby.fyndrx" class="transition-opacity hover:opacity-90">
              <img :src="playStoreBanner" alt="GET IT ON Google Play" class="w-full h-10" />
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="pt-8 mt-12 text-center border-t border-gray-800">
        <p class="text-gray-400">
          &copy; {{ currentYear }} FyndRX. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.router-link-active {
  @apply text-white;
}
</style> 