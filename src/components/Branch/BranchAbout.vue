<script setup lang="ts">
import { inject } from 'vue';
import { sanitizeHtml } from '@/utils/sanitize';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value?.description" class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md sm:p-8 dark:bg-gray-800/60 dark:ring-white/10">
    <div class="flex items-center gap-3 mb-5">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">About This Branch</h2>
    </div>
    <div
      v-html="sanitizeHtml(branchState.branch.value.description)"
      class="prose prose-sm dark:prose-invert max-w-3xl prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-brand-500 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
    ></div>
  </section>
</template>
