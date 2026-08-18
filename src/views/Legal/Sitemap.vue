<script setup lang="ts">
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Sitemap | FyndRx',
  description: 'Browse every page on FyndRx — from medication search and pharmacy finder to prescriptions, teleconsultations, account management, and support.',
  keywords: 'FyndRx sitemap, site map, all pages, FyndRx navigation',
  ogType: 'website',
});

interface SitemapLink {
  name: string;
  path: string;
  description?: string;
}

interface SitemapSection {
  title: string;
  icon: string;
  links: SitemapLink[];
}

const sections: SitemapSection[] = [
  {
    title: 'Main',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    links: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
      { name: 'Our Services', path: '/services' },
      { name: 'Blog', path: '/blog' },
      { name: 'Contact Us', path: '/contact' },
    ],
  },
  {
    title: 'Shop & Health',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m-10 0a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z',
    links: [
      { name: 'Browse Medications', path: '/medications' },
      { name: 'Find a Pharmacy', path: '/pharmacies' },
      { name: 'Telehealth Consultations', path: '/telehealth' },
      { name: 'Start a Consultation (No Account Needed)', path: '/consultations/public/new' },
      { name: 'Track a Consultation', path: '/consultations/public/search' },
      { name: 'Upload a Prescription', path: '/upload-prescription' },
      { name: 'Partner With Us (Pharmacies)', path: '/pharmacy/onboard' },
    ],
  },
  {
    title: 'My Account',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    links: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'My Orders', path: '/orders' },
      { name: 'My Prescriptions', path: '/prescriptions' },
      { name: 'My Consultations', path: '/consultations' },
      { name: 'Transactions', path: '/transactions' },
      { name: 'Favorites', path: '/favorites' },
      { name: 'Notifications', path: '/notifications' },
      { name: 'My Profile', path: '/profile' },
      { name: 'Edit Profile', path: '/profile/edit' },
      { name: 'Cart', path: '/cart' },
      { name: 'Checkout', path: '/checkout' },
    ],
  },
  {
    title: 'Account Access',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    links: [
      { name: 'Sign In', path: '/login' },
      { name: 'Create Account', path: '/register' },
      { name: 'Forgot Password', path: '/forgot-password' },
    ],
  },
  {
    title: 'Support & Guides',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    links: [
      { name: 'How to Use FyndRx', path: '/how-to-use' },
      { name: 'Help Center', path: '/help' },
      { name: 'FAQs', path: '/faq' },
      { name: 'Report a Problem', path: '/report' },
      { name: 'Feedback', path: '/feedback' },
    ],
  },
  {
    title: 'Legal & Policies',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    links: [
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Accessibility Statement', path: '/accessibility' },
      { name: 'Sitemap', path: '/sitemap' },
    ],
  },
];
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">

      <!-- Page Header -->
      <div class="mb-12 text-center">
        <span class="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-[#246BFD] bg-[#246BFD]/10 rounded-full">Navigation</span>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Sitemap</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">Every page on FyndRx, organized in one place</p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="section in sections"
          :key="section.title"
          class="p-6 bg-white shadow-sm dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#246BFD]/10 flex-shrink-0">
              <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="section.icon"></path>
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ section.title }}</h2>
          </div>
          <ul class="space-y-2.5">
            <li v-for="link in section.links" :key="link.path">
              <router-link
                :to="link.path"
                class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[#246BFD] dark:hover:text-[#5089FF] transition-colors"
              >
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></span>
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Legal Nav -->
      <div class="mt-12 flex flex-wrap justify-center gap-3 text-sm">
        <router-link to="/terms" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Terms of Service</router-link>
        <router-link to="/privacy" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Privacy Policy</router-link>
        <router-link to="/cookies" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Cookie Policy</router-link>
        <router-link to="/accessibility" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Accessibility</router-link>
      </div>
    </div>
  </div>
</template>
