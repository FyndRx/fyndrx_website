<script setup lang="ts">

</script>

<script lang="ts">
export default {
    name: 'PharmacySearchBar'
}
</script>

<template>
      <!-- Search and Filter -->
      <div class="mb-8 delay-200 scroll-animate slide-up">
        <div class="flex flex-col gap-4 md:flex-row">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Search pharmacies..."
              class="w-full px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#246BFD]"
            />
          </div>
          <div class="flex gap-2">
            <button class="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              Open Now
            </button>
            <button class="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              Distance
            </button>
            <button class="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-200 rounded-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              Rating
            </button>
          </div>
        </div>
      </div>
</template>