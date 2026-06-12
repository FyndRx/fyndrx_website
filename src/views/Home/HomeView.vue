<script setup lang="ts">
import { useSeoMeta } from '@/composables/useSeoMeta';
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
import ConsultationSection from '@/views/Home/landing/ConsultationSection.vue';
import PromotionsCarousel from '@/views/Home/landing/PromotionsCarousel.vue';
import PartnershipBanner from '@/views/Home/landing/PartnershipBanner.vue';

useSeoMeta({
  title: 'FyndRx | Safest and Most Convenient Online Pharmacy in Ghana',
  description: 'Order your prescription medicine the most convenient way and have them delivered to your doorstep. Get online prescriptions through our free online consultation service and buy medicines at anytime and from anywhere you are in need. Search for medicines, upload prescriptions and find pharmacies near you. With multiple price options and flexible payments, there are no limits for you.',
  keywords: 'order medicines online, online pharmacy Ghana, ePharmacy, upload prescription, pharmacist consultation, find pharmacy, medicine delivery, FyndRx, Ghana',
  ogType: 'website',
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
    <section class="relative z-10">
      <QuickSearch />
    </section>

    <!-- How It Works — mental model first, before feature detail -->
    <section class="relative">
      <HowItWorks />
    </section>

    <!-- Features Section -->
    <section class="relative">
      <Features />
    </section>

    <!-- Consultation Section -->
    <section class="relative">
      <ConsultationSection />
    </section>

    <!-- Pharmacy List -->
    <section class="relative">
      <PharmacyList />
    </section>

    <!-- Stats Section -->
    <section class="relative overflow-hidden">
      <Stats />
    </section>

    <!-- Partnership Section -->
    <section class="relative">
      <PartnershipBanner />
    </section>

    <!-- Testimonials Section -->
    <section class="relative">
      <Testimonials />
    </section>

    <!-- Featured Health Programs — contextualised after core trust is established -->
    <section class="relative">
      <PromotionsCarousel />
    </section>

    <!-- CTA Section — conversion moment before lower-engagement content -->
    <section class="relative overflow-hidden">
      <CTA />
    </section>

    <!-- Blog Posts -->
    <section class="relative">
      <BlogPosts />
    </section>

    <!-- Newsletter Signup -->
    <section class="relative overflow-hidden">
      <NewsletterSignup />
    </section>
  </div>
</template>

 