<script setup lang="ts">
import { defineProps } from 'vue';
import LazyImage from './LazyImage.vue';

const props = defineProps<{
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  image: string;
  url?: string;
}>();

defineOptions({
  name: 'BlogCard'
});
</script>

<script lang="ts">
  export default {
    name: 'BlogCard',
  }
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
    <!-- Blog Image -->
    <div class="relative h-48">
      <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20"></div>
      <LazyImage
        :src="props.image"
        :alt="props.title"
        aspectRatio="landscape"
        className="w-full h-full object-cover rounded-t-2xl"
      />
      <div class="absolute top-4 left-4">
        <span class="px-3 py-1 rounded-full bg-[#246BFD]/10 text-[#246BFD] text-sm font-medium">
          {{ props.category }}
        </span>
      </div>
    </div>
    <!-- Blog Content -->
    <div class="flex flex-col flex-1 p-6">
      <div class="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{{ new Date(props.date).toLocaleDateString() }}</span>
        <span class="mx-2">•</span>
        <span>{{ props.author }}</span>
      </div>
      <h3 class="mb-3 text-xl font-medium text-gray-900 dark:text-white">
        {{ props.title }}
      </h3>
      <p class="flex-1 mb-6 text-gray-600 dark:text-gray-300">
        {{ props.excerpt }}
      </p>
      <a
        v-if="props.url"
        :href="props.url"
        target="_blank"
        class="text-[#246BFD] font-medium hover:text-[#5089FF] transition-colors self-start"
      >
        Read More →
      </a>
    </div>
  </div>
</template>

<style scoped>
</style> 