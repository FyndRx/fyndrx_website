<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { useAuthStore } from '@/store/auth';

useSeoMeta({
  title: 'Our Services | FyndRx',
  description: 'Explore FyndRx services: medication search and price comparison, prescription upload, online pharmacist consultations, pharmacy finder, and home delivery across Ghana.',
  keywords: 'FyndRx services, online pharmacy Ghana, prescription upload, teleconsultation, medication delivery, pharmacy finder, price comparison',
  ogType: 'website',
});

const router = useRouter();
const authStore = useAuthStore();

const services = [
  {
    id: 1,
    title: 'Medication Search & Price Comparison',
    description: 'Search thousands of medications by name, brand, or medical condition. Instantly compare prices across all our verified partner pharmacies to get the best deal — no hidden fees.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: '#246BFD',
    cta: { label: 'Search Medications', route: '/medications' },
    highlights: ['Compare prices across 100+ pharmacies', 'Real-time stock availability', 'Generic & branded options'],
  },
  {
    id: 2,
    title: 'Prescription Upload & Management',
    description: 'Upload your prescription securely from your phone or computer. Our licensed partner pharmacists verify it and prepare your order — no more queuing at the pharmacy.',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    color: '#FE9615',
    cta: { label: 'Upload Prescription', route: '/upload-prescription' },
    highlights: ['Secure & encrypted upload', 'Pharmacist verification within hours', 'Digital prescription history'],
  },
  {
    id: 3,
    title: 'Online Teleconsultation',
    description: 'Skip the waiting room. Connect with a licensed doctor or pharmacist from anywhere in Ghana. Receive a diagnosis, treatment plan, and digital prescription — all in one session.',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    color: '#10B981',
    cta: { label: 'Book Consultation', route: 'consultation' },
    highlights: ['24/7 availability', 'Licensed Ghanaian doctors', 'Digital prescription issued instantly'],
  },
  {
    id: 4,
    title: 'Pharmacy Finder',
    description: 'Locate verified partner pharmacies near you in seconds. Filter by location, services offered, and opening hours. Every pharmacy on FyndRx is licensed by the Ghana Pharmacy Council.',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
    color: '#8B5CF6',
    cta: { label: 'Find Pharmacies', route: '/pharmacies' },
    highlights: ['GPS-based nearby search', 'Operating hours & contacts', 'FDA-verified partners only'],
  },
  {
    id: 5,
    title: 'Home Delivery',
    description: 'Have your medications delivered straight to your door. Track your order in real-time from the moment it leaves the pharmacy to arrival at your address.',
    icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0',
    color: '#F59E0B',
    cta: { label: 'Order Now', route: '/medications' },
    highlights: ['Same-day delivery available', 'Real-time order tracking', 'SMS & push notifications'],
  },
  {
    id: 6,
    title: 'Secure Health Records',
    description: 'Your prescription history, consultation records, and order receipts are stored securely in your FyndRx account. Access them anytime, from any device.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: '#EC4899',
    cta: { label: 'View Records', route: '/prescriptions', requiresAuth: true },
    highlights: ['Encrypted data storage', 'Ghana Data Protection Act compliant', 'Full prescription history'],
  },
];

const handleCta = (service: typeof services[0]) => {
  if (service.cta.route === 'consultation') {
    router.push({ name: authStore.isAuthenticated ? 'create-consultation' : 'public-create-consultation' });
  } else if (service.cta.requiresAuth && !authStore.isAuthenticated) {
    router.push({ name: 'login' });
  } else {
    router.push(service.cta.route);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

    <!-- Hero -->
    <div class="relative overflow-hidden bg-gradient-to-br from-[#246BFD] to-[#5089FF]">
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-[#FE9615]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      <div class="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block px-4 py-1 mb-6 text-xs font-bold uppercase tracking-widest text-[#FE9615] bg-[#FE9615]/10 border border-[#FE9615]/20 rounded-full">
          What We Offer
        </span>
        <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Healthcare, <span class="text-[#FE9615]">Simplified</span>
        </h1>
        <p class="mt-6 max-w-2xl mx-auto text-xl text-blue-100 leading-relaxed">
          Every service you need to find, afford, and receive quality medication — all in one platform built for Ghana.
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <router-link
            to="/medications"
            class="px-8 py-4 rounded-full bg-white text-[#246BFD] font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-white/20 hover:-translate-y-0.5"
          >
            Get Started
          </router-link>
          <router-link
            to="/telehealth"
            class="px-8 py-4 rounded-full bg-transparent text-white font-bold border-2 border-white/40 hover:bg-white/10 hover:border-white transition-all duration-300"
          >
            Book a Consultation
          </router-link>
        </div>
      </div>
    </div>

    <!-- Services Grid -->
    <div class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="service in services"
            :key="service.id"
            class="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <!-- Colour accent line on hover -->
            <div
              class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              :style="{ backgroundColor: service.color }"
            ></div>

            <!-- Icon -->
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
              :style="{ backgroundColor: service.color + '15' }"
            >
              <svg class="w-7 h-7" :style="{ color: service.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
              </svg>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ service.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1">{{ service.description }}</p>

            <!-- Highlights -->
            <ul class="space-y-2 mb-8">
              <li
                v-for="highlight in service.highlights"
                :key="highlight"
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
              >
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: service.color }"></span>
                {{ highlight }}
              </li>
            </ul>

            <!-- CTA -->
            <button
              @click="handleCta(service)"
              class="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
              :style="{ backgroundColor: service.color, color: '#fff' }"
            >
              {{ service.cta.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Strip -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p class="text-3xl font-extrabold text-[#246BFD]">FDA-Verified</p>
            <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm">Every pharmacy is licensed by Ghana FDA & Pharmacy Council</p>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-[#FE9615]">100% Secure</p>
            <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm">Health data encrypted and protected under Ghana Data Protection Act</p>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-[#10B981]">24/7 Support</p>
            <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm">Customer support and teleconsultation available around the clock</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Banner -->
    <div class="bg-gradient-to-r from-[#246BFD] to-[#5089FF] py-16">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-extrabold text-white mb-4">Ready to get started?</h2>
        <p class="text-blue-100 text-lg mb-8">Join thousands of Ghanaians who manage their healthcare on FyndRx.</p>
        <router-link
          to="/register"
          class="inline-block px-10 py-4 rounded-full bg-white text-[#246BFD] font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:-translate-y-0.5"
        >
          Create a Free Account
        </router-link>
      </div>
    </div>

  </div>
</template>
