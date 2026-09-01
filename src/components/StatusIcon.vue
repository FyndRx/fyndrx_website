<script setup lang="ts">
// One icon per status, shared by order timelines, transaction lists, and
// notifications so the same status always draws the same glyph.
defineProps<{ status?: string | null }>();

const CHECKMARK = ['M5 13l4 4L19 7'];
const CHECK_CIRCLE = ['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'];
const X_CIRCLE = ['M18.364 18.364A9 9 0 105.636 5.636a9 9 0 0012.728 12.728zM15 9l-6 6m0-6l6 6'];
const CLOCK = ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'];

const ICON_PATHS: Record<string, string[]> = {
  pending: ['M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'],
  confirmed: CHECKMARK,
  active: CHECKMARK,
  processing: [
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  ],
  ready: ['M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'],
  out_for_delivery: ['M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'],
  completed: CHECK_CIRCLE,
  dispensed: CHECK_CIRCLE,
  paid: CHECK_CIRCLE,
  success: CHECK_CIRCLE,
  cancelled: X_CIRCLE,
  failed: X_CIRCLE,
  expired: CLOCK,
  refunded: ['M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6'],
};

const DEFAULT_PATHS = ['M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'];

const pathsFor = (status?: string | null) => ICON_PATHS[(status || '').toLowerCase().trim()] || DEFAULT_PATHS;
</script>

<template>
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path v-for="d in pathsFor(status)" :key="d" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="d" />
  </svg>
</template>
