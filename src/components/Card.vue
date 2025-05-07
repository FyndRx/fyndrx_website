<script setup lang="ts">
defineProps<{
  hover?: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden',
      { 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300': hover }
    ]"
  >
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <slot name="header"></slot>
    </div>
    <div class="p-6">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <slot name="footer"></slot>
    </div>
  </div>
</template> 