<script setup lang="ts">
import { ref } from 'vue';
import { BuildingStorefrontIcon, UserGroupIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
import { useInView } from '@/composables/useInView';

const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.15 });
</script>

<template>
  <section ref="sectionRef" class="relative py-16 sm:py-24" :class="{ 'is-in': inView }">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-12 sm:mb-16 reveal">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Partner with <span class="relative whitespace-nowrap">
            <span class="relative z-10">FyndRx</span>
            <svg class="absolute bottom-0 left-0 w-full h-3 -mb-1 text-brand-500/20 dark:text-brand-500/30 -z-0" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" stroke-width="8" fill="none" />
            </svg>
          </span>
        </h2>
        <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
          Join our digital health ecosystem. Expand your reach, streamline operations, and deliver better care to thousands of patients.
        </p>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

        <!-- Pharmacy Card -->
        <div class="reveal-card group relative bg-white/70 backdrop-blur-md shadow-card ring-1 ring-white/70 dark:ring-white/10 dark:bg-gray-800/60 rounded-3xl p-6 sm:p-8 transition-shadow duration-300 hover:shadow-card-hover" style="--i: 0">
          <div class="w-14 h-14 bg-brand-500/10 dark:bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BuildingStorefrontIcon class="w-8 h-8 text-brand-500" />
          </div>
          <h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pharmacies</h4>
          <ul class="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Increase digital sales
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Manage inventory easily
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
              Access new customer base
            </li>
          </ul>
          <router-link to="/pharmacy/onboard" class="inline-flex items-center text-brand-600 dark:text-brand-300 font-semibold gap-1 group-hover:gap-2 transition-all rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
            Join Network <ArrowRightIcon class="w-4 h-4" />
          </router-link>
        </div>

        <!-- Doctors Card -->
        <div class="reveal-card group relative bg-white/70 backdrop-blur-md shadow-card ring-1 ring-white/70 dark:ring-white/10 dark:bg-gray-800/60 rounded-3xl p-6 sm:p-8 transition-shadow duration-300 hover:shadow-card-hover" style="--i: 1">
          <div class="w-14 h-14 bg-accent-500/10 dark:bg-accent-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UserGroupIcon class="w-8 h-8 text-accent-500" />
          </div>
          <h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Doctors</h4>
          <ul class="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              Teleconsultation tools
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              Digital prescription management
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
              Flexible scheduling
            </li>
          </ul>
          <router-link to="/contact" class="inline-flex items-center text-accent-700 dark:text-accent-400 font-semibold gap-1 group-hover:gap-2 transition-all rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30">
            Apply Now <ArrowRightIcon class="w-4 h-4" />
          </router-link>
        </div>

        <!-- Statistics/Growth Card -->
        <div class="reveal-card group relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-500 rounded-3xl p-6 sm:p-8 text-white shadow-float md:col-span-2 lg:col-span-1" style="--i: 2">
          <div class="absolute top-0 right-0 p-8 opacity-10">
             <ChartBarIcon class="w-32 h-32" />
          </div>
          <div class="relative z-10 h-full flex flex-col justify-between">
             <div>
                <h4 class="text-2xl font-bold mb-2">Why Partner?</h4>
                <p class="text-white/85 mb-6">
                   Our partners see an average of 40% growth in patient engagement within the first 3 months.
                </p>
                <div class="flex gap-4">
                   <div>
                      <p class="text-3xl font-bold">100+</p>
                      <p class="text-sm text-white/75">Pharmacies</p>
                   </div>
                   <div class="w-px bg-white/20"></div>
                   <div>
                      <p class="text-3xl font-bold">10k+</p>
                      <p class="text-sm text-white/75">Patients</p>
                   </div>
                </div>
             </div>

             <router-link to="/pharmacy/onboard" class="mt-8 flex items-center justify-center w-full px-6 py-3 rounded-full bg-white text-brand-600 font-semibold transition duration-200 ease-out-quart hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">
                Get Started
             </router-link>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>

<style scoped>
/* Scroll-in via `.is-in` (useInView): header, then cards stagger. */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.reveal-card {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.1s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.1s),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.is-in .reveal,
.is-in .reveal-card {
  opacity: 1;
  transform: none;
}

.is-in .reveal-card:hover {
  transform: translateY(-4px);
  transition-delay: 0s;
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal-card {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .is-in .reveal-card:hover {
    transform: none;
  }
}
</style>
