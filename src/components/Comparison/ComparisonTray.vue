<script setup lang="ts">
import LazyImage from '@/components/LazyImage.vue';
import type { Medication } from '@/models/Medication';

defineProps<{
  comparisonList: Medication[];
}>();

const emit = defineEmits<{
  clearAll: [];
  remove: [id: number];
  open: [];
}>();
</script>

<template>
  <Transition name="float-up">
    <div
      v-if="comparisonList.length > 0"
      class="fixed bottom-6 right-6 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-72"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-[#246BFD]/10 rounded-lg">
            <svg class="w-4 h-4 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span class="font-semibold text-sm text-gray-900 dark:text-white">
            Compare
            <span class="text-[#246BFD]">{{ comparisonList.length }}</span>/4
          </span>
        </div>
        <button @click="emit('clearAll')" class="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium">
          Clear all
        </button>
      </div>

      <div class="space-y-1.5 mb-3">
        <div
          v-for="med in comparisonList"
          :key="med.id"
          class="flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-700/60 rounded-xl"
        >
          <LazyImage :src="med.image" :alt="med.name" aspectRatio="square" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          <span class="flex-1 text-xs font-medium text-gray-800 dark:text-white truncate leading-tight">{{ med.name }}</span>
          <button @click="emit('remove', med.id)" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add more prompt when only 1 item -->
      <p v-if="comparisonList.length === 1" class="text-xs text-center text-gray-400 mb-3">
        Add at least one more to compare
      </p>

      <button
        @click="emit('open')"
        :disabled="comparisonList.length < 2"
        class="w-full py-2.5 rounded-full bg-[#246BFD] text-white text-sm font-semibold hover:bg-[#5089FF] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-[#246BFD]/30"
      >
        Compare Now
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.float-up-enter-active,
.float-up-leave-active { transition: all 0.3s cubic-bezier(.4,0,.2,1); }
.float-up-enter-from,
.float-up-leave-to { opacity: 0; transform: translateY(16px); }
</style>
