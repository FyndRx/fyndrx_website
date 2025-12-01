<script setup lang="ts">
import { computed } from 'vue';
import Dropdown from '@/components/Dropdown.vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}>();

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
  (e: 'update:perPage', perPage: number): void;
}>();

const perPageOptions = [
  { label: '12 per page', value: 12 },
  { label: '24 per page', value: 24 },
  { label: '48 per page', value: 48 },
  { label: '96 per page', value: 96 },
];

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
  <div class="flex flex-col gap-4 items-center justify-between py-6 border-t border-gray-200 dark:border-gray-700 md:flex-row">
    <!-- Results Summary -->
    <div class="text-sm text-gray-700 dark:text-gray-300">
      Showing <span class="font-medium">{{ showingStart }}</span> to <span class="font-medium">{{ showingEnd }}</span> of <span class="font-medium">{{ totalItems }}</span> results
    </div>

    <!-- Controls -->
    <div class="flex flex-col gap-4 items-center sm:flex-row">
      <!-- Per Page Dropdown -->
      <div class="w-40">
        <Dropdown
          :model-value="perPage"
          @update:model-value="(val: string | number | (string | number)[]) => handlePerPageChange(val as number)"
          :options="perPageOptions"
          size="small"
          placeholder="Items per page"
        />
      </div>

      <!-- Pagination Buttons -->
      <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
        <!-- Previous -->
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-700 dark:hover:bg-gray-800"
        >
          <span class="sr-only">Previous</span>
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Page Numbers -->
        <button
          v-for="(page, index) in pages"
          :key="index"
          @click="handlePageChange(page)"
          :disabled="page === '...'"
          :class="[
            'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0',
            page === currentPage
              ? 'z-10 bg-[#246BFD] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246BFD]'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800',
            page === '...' ? 'cursor-default' : 'cursor-pointer'
          ]"
        >
          {{ page }}
        </button>

        <!-- Next -->
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-gray-700 dark:hover:bg-gray-800"
        >
          <span class="sr-only">Next</span>
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>
