<script setup lang="ts">
import Button from '@/components/Button.vue';
import { BuildingStorefrontIcon, UserGroupIcon, ChartBarIcon, ArrowRightIcon } from '@heroicons/vue/24/outline';
</script>

<template>
  <div class="py-24 bg-white dark:bg-gray-900 relative">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">
          For Healthcare Providers
        </h2>
        <h3 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Partner with <span class="relative whitespace-nowrap">
            <span class="relative z-10">FyndRx</span>
            <svg class="absolute bottom-0 left-0 w-full h-3 -mb-1 text-indigo-200 dark:text-indigo-900 -z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" stroke-width="8" fill="none" />
            </svg>
          </span>
        </h3>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Join our digital health ecosystem. Expand your reach, streamline operations, and deliver better care to thousands of patients.
        </p>
      </div>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        
        <!-- Pharmacy Card -->
        <div class="group relative bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900">
          <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BuildingStorefrontIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pharmacies</h4>
          <ul class="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Increase digital sales
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Manage inventory easily
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Access new customer base
            </li>
          </ul>
          <a href="#" class="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-2 transition-all">
            Join Network <ArrowRightIcon class="w-4 h-4 ml-1" />
          </a>
        </div>

        <!-- Doctors Card -->
        <div class="group relative bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900">
           <div class="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UserGroupIcon class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Doctors</h4>
          <ul class="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Teleconsultation tools
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Digital prescription management
            </li>
            <li class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Flexible scheduling
            </li>
          </ul>
          <a href="#" class="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold group-hover:gap-2 transition-all">
            Apply Now <ArrowRightIcon class="w-4 h-4 ml-1" />
          </a>
        </div>

        <!-- Statistics/Growth Card -->
        <div class="group relative bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-lg transform md:col-span-2 lg:col-span-1">
          <div class="absolute top-0 right-0 p-8 opacity-10">
             <ChartBarIcon class="w-32 h-32" />
          </div>
          <div class="relative z-10 h-full flex flex-col justify-between">
             <div>
                <h4 class="text-2xl font-bold mb-2">Why Partner?</h4>
                <p class="text-indigo-100 mb-6">
                   Our partners see an average of 40% growth in patient engagement within the first 3 months.
                </p>
                <div class="flex gap-4">
                   <div>
                      <p class="text-3xl font-bold">500+</p>
                      <p class="text-sm text-indigo-200">Pharmacies</p>
                   </div>
                   <div class="w-px bg-white/20"></div>
                   <div>
                      <p class="text-3xl font-bold">10k+</p>
                      <p class="text-sm text-indigo-200">Patients</p>
                   </div>
                </div>
             </div>
             
             <Button variant="secondary" class="mt-8 bg-white text-indigo-600 hover:bg-gray-100 border-none w-full justify-center">
                Get Started
             </Button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
