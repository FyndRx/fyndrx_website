<script setup lang="ts">
import { computed } from 'vue';
import Dropdown from '@/components/Dropdown.vue';

const props = withDefaults(
  defineProps<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    /** Choices offered in the per-page selector. */
    perPageOptions?: number[];
    /** Inside a card/table footer: drop the top border and vertical padding. */
    embedded?: boolean;
  }>(),
  { perPageOptions: () => [12, 24, 48, 96], embedded: false },
);

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
  (e: 'update:perPage', perPage: number): void;
}>();

const perPageChoices = computed(() => props.perPageOptions.map((n) => ({ label: `${n} per page`, value: n })));

const showingStart = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.perPage + 1;
});

const showingEnd = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.totalItems);
});

const pages = computed(() => {
  const range: (number | string)[] = [];
  const delta = 2; // Number of pages to show around current page

  for (let i = 1; i <= props.totalPages; i++) {
    if (
      i === 1 ||
      i === props.totalPages ||
      (i >= props.currentPage - delta && i <= props.currentPage + delta)
    ) {
      range.push(i);
    } else if (
      range[range.length - 1] !== '...' &&
      range.length > 0
    ) {
      range.push('...');
    }
  }
  return range;
});

const handlePageChange = (page: number | string) => {
  if (typeof page === 'number' && page !== props.currentPage) {
    emit('update:page', page);
  }
};

const handlePerPageChange = (val: string | number) => {
  emit('update:perPage', Number(val));
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-between w-full gap-4 md:flex-row"
    :class="embedded ? '' : 'py-6 border-t border-gray-200/70 dark:border-white/10'"
  >
    <!-- Results summary -->
    <p class="text-sm text-gray-600 dark:text-gray-300" role="status">
      Showing <span class="font-semibold text-gray-900 dark:text-white">{{ showingStart }}</span>–<span class="font-semibold text-gray-900 dark:text-white">{{ showingEnd }}</span>
      of <span class="font-semibold text-gray-900 dark:text-white">{{ totalItems }}</span> results
    </p>

    <!-- Controls -->
    <div class="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      <div class="w-40">
        <Dropdown
          :model-value="perPage"
          @update:model-value="(val: string | number | (string | number)[]) => handlePerPageChange(val as number)"
          :options="perPageChoices"
          size="small"
          placeholder="Items per page"
        />
      </div>

      <nav class="flex items-center gap-1" aria-label="Pagination">
        <button
          type="button"
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="flex items-center justify-center text-gray-600 transition duration-200 rounded-full w-9 h-9 ease-out-quart dark:text-gray-300 hover:bg-brand-500/10 hover:text-brand-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <span class="sr-only">Previous page</span>
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>

        <span v-for="(page, i) in pages" :key="`${i}-${page}`" class="contents">
          <span v-if="page === '...'" class="px-1 text-sm text-gray-400 select-none" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            @click="handlePageChange(page)"
            :aria-current="page === currentPage ? 'page' : undefined"
            :aria-label="`Page ${page}`"
            class="flex items-center justify-center px-1 text-sm font-medium transition duration-200 rounded-full min-w-9 h-9 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            :class="page === currentPage
              ? 'bg-brand-500 text-white shadow-glow-brand'
              : 'text-gray-700 dark:text-gray-200 hover:bg-brand-500/10 hover:text-brand-600'"
          >{{ page }}</button>
        </span>

        <button
          type="button"
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="flex items-center justify-center text-gray-600 transition duration-200 rounded-full w-9 h-9 ease-out-quart dark:text-gray-300 hover:bg-brand-500/10 hover:text-brand-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <span class="sr-only">Next page</span>
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>
