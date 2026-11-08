<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import LazyImage from '@/components/LazyImage.vue';
import type { PharmacyMapPin } from '@/models/Pharmacy';

/**
 * The pharmacies currently in the map's view, as a list. Picking one focuses it on the map;
 * hovering one emphasises its pin. Selection state is owned by the page.
 */
const props = defineProps<{
  pins: PharmacyMapPin[];
  activeId: string | null;
}>();

defineEmits<{
  (e: 'select', id: string): void;
  (e: 'hover', id: string | null): void;
}>();

const listEl = ref<HTMLElement | null>(null);

// Keep the selected row visible when the selection came from the map
watch(() => props.activeId, async (id) => {
  if (!id) return;
  await nextTick();
  listEl.value?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});

const href = (pin: PharmacyMapPin) =>
  pin.type === 'hq' ? `/pharmacy/${pin.pharmacyId}` : `/pharmacy/${pin.pharmacyId}/branch/${pin.id}`;
</script>

<template>
  <ul ref="listEl" class="p-2 space-y-1">
    <li
      v-for="pin in pins"
      :key="pin.id"
      :data-id="pin.id"
      class="flex gap-1 items-center rounded-2xl transition duration-200 ease-out-quart"
      :class="activeId === pin.id ? 'bg-brand-500/10 ring-1 ring-brand-500/30' : 'hover:bg-gray-900/5 dark:hover:bg-white/5'"
      @pointerenter="$emit('hover', pin.id)"
      @pointerleave="$emit('hover', null)"
    >
      <button
        type="button"
        class="flex flex-1 gap-3 items-center p-2.5 min-w-0 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        @click="$emit('select', pin.id)"
      >
        <div class="overflow-hidden w-12 h-12 rounded-xl ring-1 shrink-0 ring-gray-200/70 dark:ring-white/10">
          <LazyImage :src="pin.logo || ''" :alt="pin.name" aspect-ratio="square" class-name="w-full h-full" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold leading-tight text-gray-900 truncate dark:text-white">{{ pin.name }}</p>
          <p v-if="pin.type === 'branch'" class="mt-0.5 text-xs text-gray-500 truncate dark:text-gray-400">{{ pin.pharmacyName }}</p>
          <div class="flex flex-wrap gap-x-2.5 gap-y-0.5 items-center mt-1 text-xs">
            <span class="inline-flex gap-1.5 items-center font-medium" :class="pin.isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'">
              <span class="w-1.5 h-1.5 rounded-full" :class="pin.isOpen ? 'bg-emerald-500' : 'bg-slate-400'"></span>
              {{ pin.isOpen ? 'Open now' : 'Closed' }}
            </span>
            <span v-if="pin.rating > 0" class="inline-flex gap-1 items-center font-medium text-gray-600 dark:text-gray-300">
              <svg class="w-3 h-3 text-accent-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L3.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z" /></svg>
              {{ pin.rating.toFixed(1) }}
            </span>
            <span v-if="pin.deliveryAvailable" class="font-medium text-brand-600 dark:text-brand-300">Delivers</span>
          </div>
        </div>
      </button>
      <router-link
        :to="href(pin)"
        class="flex justify-center items-center mr-1.5 w-9 h-9 text-gray-400 rounded-full transition duration-200 shrink-0 ease-out-quart hover:bg-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        :aria-label="`View ${pin.name}`"
        title="View pharmacy"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
      </router-link>
    </li>
  </ul>
</template>
