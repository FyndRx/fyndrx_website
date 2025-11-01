<script setup lang="ts">
import { ref, onMounted } from 'vue';
import latifaImage from '@/assets/team/latifa.jpg';
import abyImage from '@/assets/team/aby.jpg';
import wunnamImage from '@/assets/team/wunnam.jpg';

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Partner Pharmacies', value: '500+' },
  { label: 'Cities Covered', value: '20+' },
  { label: 'Customer Satisfaction', value: '98%' },
];

const team = [
  {
    name: 'Alhassan Latifa',
    role: 'Medical Director',
    image: latifaImage,
  },
  {
    name: 'Abdul Basit Yahaya',
    role: 'Head of Technology',
    image: abyImage,
  },
  {
    name: 'Mahmud Wunnam',
    role: 'Operations Manager',
    image: wunnamImage,
  },
  // {
  //   name: 'Nurudeen Yahuza',
  //   role: 'Software Engineer',
  //   image: '/src/assets/team/yahuza.jpg',
  // },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10"></div>
      <div class="relative px-4 py-24 mx-auto max-w-7xl sm:py-32 sm:px-6 lg:px-8">
        <div class="text-center" :class="{ 'animate-fade-in': isVisible }">
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            About <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#FE9615]">FyndRX</span>
          </h1>
          <p class="max-w-3xl mx-auto mt-6 text-xl text-gray-600 dark:text-gray-300">
            We're revolutionizing healthcare access through technology, making quality care more accessible and affordable for everyone.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="lg:text-center" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase">
            Our Mission
          </h2>
          <p class="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Making Healthcare Accessible
          </p>
          <p class="max-w-2xl mt-4 text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            We believe that quality healthcare should be accessible to everyone, regardless of their location or financial situation. Our platform connects patients with healthcare providers, making it easier to get the care you need when you need it.
          </p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4" :class="{ 'animate-fade-in': isVisible }">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#FE9615]">
              {{ stat.value }}
            </div>
            <div class="mt-2 text-lg text-gray-600 dark:text-gray-300">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-12 text-center" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Meet Our Team
          </h2>
          <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
            The passionate people behind FyndRX
          </p>
        </div>
        <div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="member in team" :key="member.name" 
               class="text-center transition-all duration-300 transform hover:-translate-y-2"
               :class="{ 'animate-fade-in': isVisible }">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/20 to-[#FE9615]/20 rounded-full blur-xl"></div>
              <img class="relative object-cover w-40 h-40 mx-auto rounded-full" :src="member.image" :alt="member.name">
            </div>
            <div class="mt-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ member.name }}</h3>
              <p class="text-[#246BFD] dark:text-[#5089FF]">{{ member.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10">
      <div class="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8" :class="{ 'animate-fade-in': isVisible }">
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Join Us in Our Mission
        </h2>
        <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Be part of the healthcare revolution
        </p>
        <div class="flex justify-center gap-4 mt-8">
          <router-link 
            to="/register" 
            class="px-8 py-3 rounded-full bg-gradient-to-r from-[#246BFD] to-[#5089FF] text-white font-semibold hover:shadow-lg hover:shadow-[#246BFD]/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Get Started
          </router-link>
          <router-link 
            to="/contact" 
            class="px-8 py-3 rounded-full bg-gradient-to-r from-[#FE9615] to-[#ffb547] text-white font-semibold hover:shadow-lg hover:shadow-[#FE9615]/20 transition-all duration-300 transform hover:-translate-y-0.5"
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
  animation: fadeIn 1s ease-out forwards;
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