<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

/**
 * Debounced search box for table toolbars. `modelValue` is the *committed* query (what the page
 * sends to the server): it updates ~350ms after typing stops, immediately on Enter or clear.
 */
const props = withDefaults(
  defineProps<{ modelValue: string; placeholder?: string; label?: string; delay?: number }>(),
  { placeholder: 'Search…', label: 'Search', delay: 350 },
);
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const text = ref(props.modelValue);
let timer: ReturnType<typeof setTimeout> | null = null;

// Keep in sync when the page clears/changes the query itself
watch(() => props.modelValue, (v) => { if (v !== text.value) text.value = v; });

function commit() {
  if (timer) { clearTimeout(timer); timer = null; }
  const v = text.value.trim();
  if (v !== props.modelValue) emit('update:modelValue', v);
}

function onInput() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(commit, props.delay);
}

function clear() {
  text.value = '';
  commit();
}

onBeforeUnmount(() => { if (timer) clearTimeout(timer); });
</script>

<template>
  <div class="relative w-full">
    <svg class="absolute w-4 h-4 text-gray-400 -translate-y-1/2 pointer-events-none left-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      v-model="text"
      type="text"
      inputmode="search"
      :placeholder="placeholder"
      :aria-label="label"
      maxlength="100"
      class="w-full py-2.5 pl-10 text-sm text-gray-900 transition bg-white border border-gray-200 rounded-full pr-9 placeholder-gray-400 dark:bg-gray-900/60 dark:border-white/10 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
      @input="onInput"
      @keydown.enter.prevent="commit"
      @keydown.esc="clear"
    />
    <button
      v-if="text"
      type="button"
      class="absolute flex items-center justify-center w-6 h-6 text-gray-400 -translate-y-1/2 rounded-full right-2.5 top-1/2 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      aria-label="Clear search"
      @click="clear"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  </div>
</template>
