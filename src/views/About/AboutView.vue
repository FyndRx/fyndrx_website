<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSeoMeta } from '@/composables/useSeoMeta';
import latifaImage from '@/assets/team/latifa.jpg';
import abyImage from '@/assets/team/aby.jpg';
import wunnamImage from '@/assets/team/wunnam.jpg';

useSeoMeta({
  title: 'About FyndRx | Safest and Most Convenient Online Pharmacy in Ghana',
  description: 'Learn about FyndRx, Ghana\'s safest and most convenient online pharmacy. Order prescriptions, consult pharmacists, and get medicine delivered to your doorstep. Discover our mission to make healthcare accessible to all.',
  keywords: 'about FyndRx, online pharmacy Ghana, ePharmacy, healthcare platform, medicine delivery, pharmacist consultation, prescription upload',
  ogType: 'website',
});

const isVisible = ref(false);
const activeValue = ref<number | null>(null);

onMounted(() => {
  isVisible.value = true;
});

const features = [
  {
    title: 'Medicine Search & Ordering',
    description: 'Search for medicines from a wide catalogue, compare prices across multiple pharmacies, and order with ease — all from your device.',
    icon: 'search',
    color: '#246BFD',
  },
  {
    title: 'Prescription Upload',
    description: 'Upload your prescriptions securely and let our partner pharmacies prepare your medication. No more queues or waiting.',
    icon: 'prescription',
    color: '#FE9615',
  },
  {
    title: 'Pharmacist Consultation',
    description: 'Connect with licensed pharmacists anytime you need professional advice. Get expert guidance from the comfort of your home.',
    icon: 'consultation',
    color: '#10B981',
  },
  {
    title: 'Pharmacy Finder',
    description: 'Locate pharmacies near you with real-time availability. Find the closest, most affordable option in seconds.',
    icon: 'location',
    color: '#8B5CF6',
  },
];

const values = [
  {
    title: 'Safety & Reliability',
    description: 'Every pharmacy and product on FyndRx is verified. We ensure that you receive only genuine, quality-assured medication.',
    icon: 'shield',
  },
  {
    title: 'Multiple Price Options',
    description: 'Compare prices across partner pharmacies to find the best deal. No hidden charges — complete transparency on every order.',
    icon: 'price',
  },
  {
    title: 'Flexible Payments',
    description: 'Pay the way that works for you. We support mobile money, credit/debit cards, and more payment options.',
    icon: 'payment',
  },
  {
    title: '24/7 Access',
    description: 'Access healthcare anytime, anywhere. FyndRx is available around the clock — because health does not wait.',
    icon: 'clock',
  },
  {
    title: 'Easy Prescriptions',
    description: 'Upload, manage, and refill your prescriptions digitally. Keep your medical history organized in one secure place.',
    icon: 'document',
  },
  {
    title: 'Expert Consultation',
    description: 'Book a telehealth consultation with licensed professionals. Get prescriptions, advice, and follow-up care remotely.',
    icon: 'doctor',
  },
];

const steps = [
  { step: '01', title: 'Search', description: 'Search for your medicine or browse categories', color: '#246BFD' },
  { step: '02', title: 'Upload', description: 'Upload your prescription if required', color: '#FE9615' },
  { step: '03', title: 'Compare', description: 'Compare prices across partner pharmacies', color: '#10B981' },
  { step: '04', title: 'Deliver', description: 'Get your medication delivered to your door', color: '#8B5CF6' },
];

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Partner Pharmacies', value: '500+' },
  { label: 'Cities Covered', value: '20+' },
  { label: 'Customer Satisfaction', value: '98%' },
];

const team = [
  {
    name: 'Alhassan Latifa',
    role: 'Business Lead and Marketing Strategist',
    image: latifaImage,
  },
  {
    name: 'Abdul Basit Yahaya',
    role: 'General Technical Operations Lead',
    image: abyImage,
  },
  {
    name: 'Mahmud Wunnam',
    role: 'Lead Developer',
    image: wunnamImage,
  },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">

    <!-- ===================== HERO SECTION ===================== -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/10 via-transparent to-[#FE9615]/10"></div>
      <!-- Decorative circles -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-[#246BFD]/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FE9615]/5 rounded-full blur-3xl"></div>

      <div class="relative px-4 py-24 mx-auto max-w-7xl sm:py-32 sm:px-6 lg:px-8">
        <div class="text-center" :class="{ 'animate-fade-in': isVisible }">
          <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-[#246BFD] bg-[#246BFD]/10 rounded-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Convenient · Reliable · Safe
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Your Healthcare, <br class="hidden sm:block" />
            <span class="relative">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#5089FF]">Reimagined</span>
              <span class="absolute bottom-2 left-0 w-full h-3 bg-[#246BFD]/10 rounded-full -z-0"></span>
            </span>
          </h1>
          <p class="max-w-3xl mx-auto mt-6 text-lg text-gray-600 dark:text-gray-300 sm:text-xl leading-relaxed">
            FyndRx is the most convenient, reliable, and safe online healthcare platform. 
            Order medicines online with ease, consult a pharmacist at any time of need, and access 
            healthcare anytime, anywhere.
          </p>
        </div>
      </div>
    </section>

    <!-- ===================== WHAT WE DO SECTION ===================== -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#FE9615] font-semibold tracking-wide uppercase">What We Do</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need in One Platform
          </p>
          <p class="max-w-2xl mx-auto mt-4 text-lg text-gray-500 dark:text-gray-400">
            From searching for medicines to finding pharmacies near you — FyndRx puts healthcare at your fingertips.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            class="relative group p-8 bg-white dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1"
            :class="{ 'animate-fade-in': isVisible }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-14 h-14 rounded-xl mb-6 transition-transform duration-300 group-hover:scale-110"
              :style="{ backgroundColor: feature.color + '15' }"
            >
              <!-- Search icon -->
              <svg v-if="feature.icon === 'search'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <!-- Prescription icon -->
              <svg v-if="feature.icon === 'prescription'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <!-- Consultation icon -->
              <svg v-if="feature.icon === 'consultation'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <!-- Location icon -->
              <svg v-if="feature.icon === 'location'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ feature.description }}</p>

            <!-- Bottom accent line -->
            <div
              class="absolute bottom-0 left-0 w-0 h-1 rounded-b-2xl transition-all duration-500 group-hover:w-full"
              :style="{ backgroundColor: feature.color }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== MISSION SECTION ===================== -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/5 to-[#FE9615]/5"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <!-- Left: Mission text -->
          <div :class="{ 'animate-fade-in': isVisible }">
            <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase mb-2">
              Our Mission
            </h2>
            <p class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
              Making Healthcare Accessible for Everyone
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              We believe that access to quality healthcare is a fundamental right, not a privilege. FyndRx was founded to 
              bridge the gap between patients and pharmacies, making it easier to find, compare, and order the medicines 
              you need — no matter where you are.
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              With multiple price options and flexible payment methods, there are no limits for you. 
              Whether you need a routine prescription refill or urgent medication, FyndRx is your trusted partner 
              in accessible and affordable healthcare.
            </p>
          </div>

          <!-- Right: Mission visual -->
          <div class="relative" :class="{ 'animate-fade-in': isVisible }">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div class="text-3xl font-bold text-[#246BFD] mb-2">🎯</div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Our Vision</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">A world where quality healthcare is just a tap away for everyone.</p>
              </div>
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
                <div class="text-3xl font-bold text-[#FE9615] mb-2">💡</div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Innovation</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">Using technology to simplify and transform how people access medicine.</p>
              </div>
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div class="text-3xl font-bold text-[#10B981] mb-2">🤝</div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Trust</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">Partnering with verified pharmacies to ensure safety and quality.</p>
              </div>
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
                <div class="text-3xl font-bold text-[#8B5CF6] mb-2">🌍</div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Impact</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">Reaching communities across Ghana with accessible healthcare solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== WHY CHOOSE US SECTION ===================== -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase">Why Choose FyndRx</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Built Around What Matters to You
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(value, index) in values"
            :key="value.title"
            class="relative group flex items-start gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700/60 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 cursor-default"
            :class="{ 'animate-fade-in': isVisible }"
            :style="{ animationDelay: `${index * 80}ms` }"
            @mouseenter="activeValue = index"
            @mouseleave="activeValue = null"
          >
            <!-- Icon -->
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <svg v-if="value.icon === 'shield'" class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <svg v-if="value.icon === 'price'" class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <svg v-if="value.icon === 'payment'" class="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <svg v-if="value.icon === 'clock'" class="w-6 h-6 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-if="value.icon === 'document'" class="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-if="value.icon === 'doctor'" class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">{{ value.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== STATS SECTION ===================== -->
    <section class="py-16 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD] to-[#5089FF]"></div>
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJINHYtMmgzMnptMC0zMFYySDR2Mmgzem0wIDE1VjE3SDR2Mmgzem0wIDE1VjMySDR2Mmgzem0wLTE1VjE3SDR2Mmgzem0wIDE1VjMySDR2Mmgzem0wLTE1VjE3SDR2Mmgzem0wIDE1VjMySDR2Mmgzem0wLTE1VjE3SDR2MmgzMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4" :class="{ 'animate-fade-in': isVisible }">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-extrabold text-white sm:text-5xl">
              {{ stat.value }}
            </div>
            <div class="mt-2 text-lg text-white/80">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== HOW IT WORKS SECTION ===================== -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#FE9615] font-semibold tracking-wide uppercase">How It Works</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Your Health in 4 Simple Steps
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(item, index) in steps"
            :key="item.step"
            class="relative text-center group"
            :class="{ 'animate-fade-in': isVisible }"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <!-- Step number -->
            <div
              class="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 text-2xl font-extrabold text-white transition-transform duration-300 group-hover:scale-110"
              :style="{ background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)` }"
            >
              {{ item.step }}
              <!-- Pulse ring -->
              <div
                class="absolute inset-0 rounded-full animate-ping opacity-20"
                :style="{ backgroundColor: item.color }"
              ></div>
            </div>

            <!-- Connector line (hidden on last item and mobile) -->
            <div
              v-if="index < steps.length - 1"
              class="absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 hidden lg:block"
            ></div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TEAM SECTION ===================== -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase">Our Team</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Meet the People Behind FyndRx
          </p>
          <p class="max-w-2xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-300">
            A passionate team committed to revolutionizing healthcare accessibility through technology.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <div
            v-for="member in team"
            :key="member.name"
            class="group text-center"
            :class="{ 'animate-fade-in': isVisible }"
          >
            <div class="relative inline-block mb-6">
              <div class="absolute -inset-2 bg-gradient-to-r from-[#246BFD]/30 to-[#FE9615]/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                class="relative w-36 h-36 mx-auto rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg transition-transform duration-300 group-hover:scale-105"
                :src="member.image"
                :alt="member.name"
              />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ member.name }}</h3>
            <p class="text-[#246BFD] dark:text-[#5089FF] font-medium mt-1">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CTA SECTION ===================== -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD] to-[#5089FF]"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div class="relative px-4 mx-auto text-center max-w-3xl sm:px-6 lg:px-8" :class="{ 'animate-fade-in': isVisible }">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          Ready to Access Healthcare<br />the Smarter Way?
        </h2>
        <p class="mt-6 text-lg text-white/80 leading-relaxed">
          Join thousands of users who trust FyndRx for their healthcare needs. 
          Get started today — it is free, fast, and secure.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <router-link
            to="/register"
            class="px-10 py-4 rounded-full bg-white text-[#246BFD] font-bold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started for Free
          </router-link>
          <router-link
            to="/contact"
            class="px-10 py-4 rounded-full bg-transparent text-white font-bold border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
          >
            Contact Us
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>