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
    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full select-none ring-1"
    :class="{
      // Solid chips with their own contrast: this is a disclosure label, so it must stay readable
      // on light cards, dark cards and photos alike.
      'bg-white text-gray-700 ring-gray-900/15 shadow-sm dark:bg-gray-900 dark:text-gray-100 dark:ring-white/25': variant === 'sponsored',
      'bg-accent-100 text-accent-800 ring-accent-500/30 dark:bg-accent-900 dark:text-accent-100 dark:ring-accent-400/40': variant === 'featured',
      'bg-brand-50 text-brand-700 ring-brand-500/25 dark:bg-brand-900 dark:text-brand-100 dark:ring-brand-400/40': variant === 'promoted',
    }"
  >
    <svg class="w-2 h-2 opacity-70" fill="currentColor" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3"/>
    </svg>
    {{ LABELS[variant] }}
  </span>
</template>
