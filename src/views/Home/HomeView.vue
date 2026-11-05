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
import AdZone from '@/components/ads/AdZone.vue';

useSeoMeta({
  title: 'FyndRx | Safest and Most Convenient Online Pharmacy in Ghana',
  description: 'Order your prescription medicine the most convenient way and have them delivered to your doorstep. Get online prescriptions through our free online consultation service and buy medicines at anytime and from anywhere you are in need. Search for medicines, upload prescriptions and find pharmacies near you. With multiple price options and flexible payments, there are no limits for you.',
  keywords: 'order medicines online, online pharmacy Ghana, ePharmacy, upload prescription, pharmacist consultation, find pharmacy, medicine delivery, FyndRx, Ghana',
  ogType: 'website',
});
</script>

<template>
  <div class="relative min-h-screen isolate overflow-x-clip">
    <!-- One continuous page canvas: pastel brand wash + soft orbs spaced down the page.
         Sections are transparent, so there is never a hard edge between them. -->
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-accent-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"></div>
      <div class="absolute top-[14%] -right-72 h-[44rem] w-[44rem] rounded-full bg-brand-200/40 blur-[130px] dark:bg-brand-500/10"></div>
      <div class="absolute top-[30%] -left-72 h-[44rem] w-[44rem] rounded-full bg-accent-200/40 blur-[130px] dark:bg-transparent"></div>
      <div class="absolute top-[48%] -right-72 h-[44rem] w-[44rem] rounded-full bg-brand-200/35 blur-[130px] dark:bg-brand-500/8"></div>
      <div class="absolute top-[66%] -left-72 h-[44rem] w-[44rem] rounded-full bg-accent-200/35 blur-[130px] dark:bg-transparent"></div>
      <div class="absolute top-[84%] -right-72 h-[44rem] w-[44rem] rounded-full bg-brand-200/35 blur-[130px] dark:bg-brand-500/8"></div>
    </div>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
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

    <!-- Partnership Section — moved up from below Stats/Testimonials so pharmacy
         owners browsing the site don't have to scroll past 8+ other sections
         to find "Partner with FyndRx" (was previously easy to miss entirely). -->
    <section class="relative">
      <PartnershipBanner />
    </section>

    <!-- Features Section -->
    <section class="relative">
      <Features />
    </section>

    <!-- Z2: Mid-feed banner ad. Sits after the value proposition (not between it and the partner pitch);
         `empty:hidden` removes the frame's spacing when no ad resolves. -->
    <div class="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-6 empty:hidden">
      <AdZone zone="Z2-home-midfeed" route="home" />
    </div>

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

 