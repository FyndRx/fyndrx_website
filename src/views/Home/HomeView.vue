<script setup lang="ts">
import { ref, onMounted } from 'vue';
// Import only the landing page content sections (not Header or Footer)
import Hero from '@/views/Home/landing/Hero.vue';
import Medications from '@/views/Home/landing/Medications.vue';
import PharmacyList from '@/views/Home/landing/PharmacyList.vue';
import CouponCarousel from '@/views/Home/landing/CouponCarousel.vue';
import HowItWorks from '@/views/Home/landing/HowItWorks.vue';
import PopularCoupons from '@/views/Home/landing/PopularCoupons.vue';
import BlogPosts from '@/views/Home/landing/BlogPosts.vue';
import NewsletterSignup from '@/views/Home/landing/NewsletterSignup.vue';

const isVisible = ref(false);

onMounted(() => {
  // Trigger animations when component is mounted
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

    <!-- Medications Section -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-[#246BFD]/5"></div>
      <Medications />
    </section>

    <!-- Pharmacy List -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-[#246BFD]/5"></div>
      <PharmacyList />
    </section>

    <!-- Coupon Carousel -->
    <section 
      class="relative overflow-hidden"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-[#FE9615]/10 to-[#246BFD]/10"></div>
      <CouponCarousel />
    </section>

    <!-- How It Works -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-[#FE9615]/5"></div>
      <HowItWorks />
    </section>

    <!-- Popular Coupons -->
    <section 
      class="relative overflow-hidden"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10"></div>
      <PopularCoupons />
    </section>

    <!-- Blog Posts -->
    <section 
      class="relative"
      :class="{ 'animate-fade-in': isVisible }"
    >
      <!-- <div class="absolute inset-0 bg-[#246BFD]/5"></div> -->
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