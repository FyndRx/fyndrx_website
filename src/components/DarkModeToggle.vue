<script setup lang="ts">
import { onMounted } from 'vue';
import { useDarkMode } from '@/composables/useDarkMode';

const { isDark, toggleDarkMode, initDarkMode } = useDarkMode();

onMounted(() => {
  initDarkMode();
});
</script>

<script lang="ts">
export default {
  name: 'DarkModeToggle'
};
</script>

<template>
  <button
    @click="toggleDarkMode"
    class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-offset-2"
    :class="isDark ? 'bg-gray-700' : 'bg-[#246BFD]'"
    aria-label="Toggle dark mode"
  >
    <span
      class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-all duration-300 flex items-center justify-center"
      :class="isDark ? 'translate-x-7' : 'translate-x-0'"
    >
      <!-- Sun Icon (Light Mode) -->
      <svg
        v-if="!isDark"
        class="w-4 h-4 text-[#FE9615]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      <!-- Moon Icon (Dark Mode) -->
      <svg
        v-else
        class="w-4 h-4 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </span>
  </button>
</template>

