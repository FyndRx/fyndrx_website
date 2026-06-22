<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'sponsored' | 'featured' | 'promoted';
}>(), { variant: 'sponsored' });

const LABELS: Record<string, string> = {
  sponsored: 'Sponsored',
  featured: 'Featured Partner',
  promoted: 'Promoted',
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded select-none"
    :class="{
      'bg-gray-100 text-gray-400 dark:bg-gray-700/60 dark:text-gray-500': variant === 'sponsored',
      'bg-[#FE9615]/10 text-[#FE9615] dark:bg-[#FE9615]/15': variant === 'featured',
      'bg-[#246BFD]/10 text-[#246BFD] dark:bg-[#246BFD]/15': variant === 'promoted',
    }"
  >
    <svg class="w-2 h-2 opacity-60" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3"/>
    </svg>
    {{ LABELS[variant] }}
  </span>
</template>
