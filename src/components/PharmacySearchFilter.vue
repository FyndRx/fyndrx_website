<script setup lang="ts">
import Dropdown from '@/components/Dropdown.vue';

defineProps<{
  modelValue: string;
  sortBy: string;
  showOpenOnly: boolean;
  showInStockOnly: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:sortBy', value: string): void;
  (e: 'update:showOpenOnly', value: boolean): void;
  (e: 'update:showInStockOnly', value: boolean): void;
  (e: 'use-location'): void;
}>();

const sortOptions = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating: High to Low', value: 'rating_desc' },
  { label: 'Distance: Nearest', value: 'distance_asc' },
];
</script>

<template>
  <div class="mb-6 space-y-4">
    <div class="flex flex-col gap-4 md:flex-row">
      <!-- Search Input -->
      <div class="flex-1">
        <div class="relative">
          <input
            :value="modelValue"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search pharmacies..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] transition-all"
          />
          <svg class="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Sort Dropdown -->
      <div class="w-full md:w-48">
        <Dropdown
          :model-value="sortBy"
          @update:model-value="(val) => emit('update:sortBy', val as string)"
          :options="sortOptions"
          placeholder="Sort by"
        />
      </div>
    </div>

    <!-- Filter Toggles -->
    <div class="flex flex-wrap gap-2">
      <button
        @click="emit('update:showOpenOnly', !showOpenOnly)"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all border',
          showOpenOnly
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
        ]"
      >
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="showOpenOnly ? 'bg-green-500' : 'bg-gray-300'"></span>
          Open Now
        </div>
      </button>

      <button
        @click="emit('update:showInStockOnly', !showInStockOnly)"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all border',
          showInStockOnly
            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
        ]"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          In Stock Only
        </div>
      </button>

      <button
        @click="emit('use-location')"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Use my location
        </div>
      </button>
    </div>
  </div>
</template>
