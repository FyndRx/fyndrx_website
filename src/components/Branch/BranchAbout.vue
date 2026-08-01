<script setup lang="ts">
import { inject } from 'vue';
import { sanitizeHtml } from '@/utils/sanitize';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value?.description">
    <div class="flex items-center gap-3 mb-5">
      <div class="w-1 h-7 bg-[#246BFD] rounded-full"></div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white">About This Branch</h2>
    </div>
    <div
      v-html="sanitizeHtml(branchState.branch.value.description)"
      class="prose prose-sm dark:prose-invert max-w-3xl prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-[#246BFD] prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
    ></div>
  </section>
</template>
