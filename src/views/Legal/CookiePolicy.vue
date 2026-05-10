<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { informationService, type LegalDocument } from '@/services/informationService';

const document = ref<LegalDocument | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    document.value = await informationService.getLegalDocument('cookie-policy');
  } catch (error) {
    console.error('Failed to load cookie policy:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
      <div class="p-8 bg-white shadow-sm dark:bg-gray-800 rounded-2xl">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
        </div>
        <div v-else-if="document" class="prose dark:prose-invert max-w-none">
          <h1 class="text-3xl font-bold mb-8">{{ document.title }}</h1>
          <div v-html="document.content"></div>
          <p v-if="document.updated_at" class="mt-8 text-sm text-gray-500">
            Last updated: {{ new Date(document.updated_at).toLocaleDateString() }}
          </p>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          Cookie Policy content is currently unavailable.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.prose :deep(p) {
  margin-bottom: 1rem;
}
</style>
