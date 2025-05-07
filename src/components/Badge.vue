<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      {
        'px-2 py-0.5 text-xs': size === 'sm',
        'px-2.5 py-0.5 text-sm': size === 'md',
        'px-3 py-1 text-base': size === 'lg',
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200': variant === 'default',
        'bg-[#246BFD]/10 text-[#246BFD] dark:bg-[#246BFD]/20': variant === 'primary',
        'bg-[#FE9615]/10 text-[#FE9615] dark:bg-[#FE9615]/20': variant === 'accent',
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': variant === 'success',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': variant === 'warning',
        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': variant === 'error'
      }
    ]"
  >
    <slot />
  </span>
</template> 