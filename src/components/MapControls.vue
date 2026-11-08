<script setup lang="ts">
/**
 * Branded zoom / locate buttons that sit over any FyndRx map (replacing Google's default
 * controls). The parent wires the events to the map instance.
 */
withDefaults(defineProps<{ showLocate?: boolean; locating?: boolean }>(), { showLocate: false, locating: false });

defineEmits<{ (e: 'zoom-in'): void; (e: 'zoom-out'): void; (e: 'locate'): void }>();

const button =
  'flex items-center justify-center w-10 h-10 text-gray-700 transition duration-200 ease-out-quart dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-300 active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 focus-visible:z-10 motion-reduce:transition-none';
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex overflow-hidden flex-col rounded-2xl ring-1 backdrop-blur-md divide-y shadow-card bg-white/90 ring-black/5 divide-gray-200/80 dark:bg-gray-800/90 dark:ring-white/10 dark:divide-white/10">
      <button type="button" :class="button" aria-label="Zoom in" title="Zoom in" @click="$emit('zoom-in')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M12 5v14M5 12h14" /></svg>
      </button>
      <button type="button" :class="button" aria-label="Zoom out" title="Zoom out" @click="$emit('zoom-out')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M5 12h14" /></svg>
      </button>
    </div>

    <button
      v-if="showLocate"
      type="button"
      class="flex justify-center items-center w-10 h-10 rounded-2xl ring-1 backdrop-blur-md transition duration-200 ease-out-quart shadow-card bg-white/90 text-brand-600 ring-black/5 dark:bg-gray-800/90 dark:text-brand-300 dark:ring-white/10 hover:bg-brand-500 hover:text-white active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 motion-reduce:transition-none"
      aria-label="Show my location"
      title="My location"
      @click="$emit('locate')"
    >
      <svg v-if="!locating" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" />
        <path stroke-linecap="round" d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
        <circle cx="12" cy="12" r="7.5" />
      </svg>
      <span v-else class="w-4 h-4 rounded-full border-2 animate-spin border-current/40 border-t-current" aria-hidden="true"></span>
    </button>
  </div>
</template>
