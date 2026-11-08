<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';
import { SERVICE_CATEGORY_STYLES } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value && (branchState.branch.value.services ?? []).length > 0" class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md sm:p-8 dark:bg-gray-800/60 dark:ring-white/10">
    <div class="flex items-center gap-3 mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Services</h2>
      <span class="text-sm font-bold text-gray-400">{{ branchState.branch.value.services!.length }}</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="service in branchState.branch.value.services" :key="service.slug || service.id"
        class="group relative flex items-start gap-4 p-5 rounded-2xl border bg-white/80 dark:bg-gray-800/70 border-gray-100 dark:border-gray-700/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
      >
        <div class="absolute left-0 top-4 bottom-4 w-0.5 rounded-full" :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.bg ?? 'bg-gray-300 dark:bg-gray-600'"></div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700/60 transition-transform duration-300 group-hover:scale-110">
          <svg class="w-5 h-5" :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500 dark:text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="SERVICE_CATEGORY_STYLES[service.category ?? '']?.icon ?? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">{{ service.name }}</h4>
            <span v-if="service.category" class="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700" :class="SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500'">{{ service.category }}</span>
          </div>
          <p v-if="service.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
