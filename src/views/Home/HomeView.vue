<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Hero from '@/views/Home/landing/Hero.vue';
import QuickSearch from '@/views/Home/landing/QuickSearch.vue';
import Features from '@/views/Home/landing/Features.vue';
import HowItWorks from '@/views/Home/landing/HowItWorks.vue';
import Stats from '@/views/Home/landing/Stats.vue';
import PharmacyList from '@/views/Home/landing/PharmacyList.vue';
import Testimonials from '@/views/Home/landing/TestimonialsSection.vue';
import CTA from '@/views/Home/landing/CTA.vue';
import BlogPosts from '@/views/Home/landing/BlogPosts.vue';
import NewsletterSignup from '@/views/Home/landing/NewsletterSignup.vue';

const isVisible = ref(false);

import PromotionsCarousel from '@/views/Home/landing/PromotionsCarousel.vue';
import PartnershipBanner from '@/views/Home/landing/PartnershipBanner.vue';
import AppDownloadBanner from '@/views/Home/landing/AppDownloadBanner.vue';

onMounted(() => {
  isVisible.value = true;
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10"></div>
      <Hero />
    </section>

    <!-- Quick Search Section -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <QuickSearch />
    </section>

    <!-- Features Section -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <Features />
    </section>

    <!-- How It Works -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-[#FE9615]/5"></div>
      <HowItWorks />
    </section>

    <!-- Pharmacy List -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-[#246BFD]/5"></div>
      <PharmacyList />
    </section>

    <!-- Service Banner -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <PromotionsCarousel />
    </section>

    <!-- Stats Section -->
    <section 
      class="relative overflow-hidden"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <Stats />
    </section>

    <!-- Partnership Section -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <PartnershipBanner />
    </section>

    <!-- Testimonials Section -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <Testimonials />
    </section>

    <!-- App Download Section -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <AppDownloadBanner />
    </section>

    <!-- CTA Section -->
    <section 
      class="relative overflow-hidden"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <CTA />
    </section>

    <!-- Blog Posts -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <BlogPosts />
    </section>

    <!-- Newsletter Signup -->
    <section 
      class="relative overflow-hidden"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-[#FE9615]/10 to-[#246BFD]/10"></div>
      <NewsletterSignup />
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