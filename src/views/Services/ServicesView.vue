<script setup lang="ts">
// Component logic can be added here if needed
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-primary-600">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Our Services
          </h1>
          <p class="mt-6 max-w-3xl mx-auto text-xl text-primary-100">
            Comprehensive healthcare solutions designed to meet your needs
          </p>
        </div>
      </div>
    </div>

    <!-- Services Grid -->
    <div class="py-16 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Service 1 -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Online Appointments
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Schedule and manage your healthcare appointments online with our network of trusted providers.
              </p>
            </div>
          </div>

          <!-- Service 2 -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Prescription Management
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Track and manage your prescriptions, set medication reminders, and get refills online.
              </p>
            </div>
          </div>

          <!-- Service 3 -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Provider Network
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Access our extensive network of healthcare providers, specialists, and medical facilities.
              </p>
            </div>
          </div>

          <!-- Service 4 -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Secure Health Records
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Store and access your medical records securely in one place, with complete privacy protection.
              </p>
            </div>
          </div>

          <!-- Service 5 -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Telehealth Services
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Connect with healthcare providers through secure video consultations from the comfort of your home.
              </p>
            </div>
          </div>

          <!-- Service 6 -->
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Health Analytics
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                Track your health metrics and get personalized insights to improve your well-being.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles will go here */
</style> 