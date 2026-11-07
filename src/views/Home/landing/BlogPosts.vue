<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import { formatDate } from '@/utils/date';
import { useInView } from '@/composables/useInView';
import LazyImage from '@/components/LazyImage.vue';

const blogPosts = ref<BlogPost[]>([]);
const loading = ref(true);
const loadError = ref(false);
const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.1 });

const loadPosts = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const { posts } = await blogService.getPosts(1, 3);
    blogPosts.value = posts;
  } catch (error) {
    console.error('Failed to load blog posts:', error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(loadPosts);
</script>

<script lang="ts">
export default {
  name: 'BlogPosts',
};
</script>

<template>
  <section ref="sectionRef" class="py-16 sm:py-20" :class="{ 'is-in': inView }">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col gap-6 mb-10 sm:mb-12 md:flex-row md:items-end md:justify-between reveal">
        <div class="max-w-2xl">
          <h2 class="text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">
            Latest <span class="text-brand-500">Blog</span> Posts
          </h2>
          <p class="mt-3 text-lg text-gray-600 sm:text-xl dark:text-gray-300">
            Stay informed with our latest articles and tips
          </p>
        </div>

        <router-link
          :to="{ name: 'blog' }"
          class="group hidden md:inline-flex items-center gap-2 px-6 py-3 font-medium transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 bg-white/70 backdrop-blur ease-out-quart hover:bg-brand-500 hover:text-white hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:bg-white/5 dark:text-brand-300 dark:hover:text-white"
        >
          View All Posts
          <svg class="w-5 h-5 transition-transform duration-200 ease-out-quart group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        <div
          v-for="i in 3"
          :key="i"
          class="overflow-hidden rounded-3xl bg-white/60 shadow-card ring-1 ring-white/70 animate-pulse motion-reduce:animate-none dark:bg-gray-800/40 dark:ring-white/10"
          :class="i === 1 ? 'md:col-span-2 lg:row-span-2' : ''"
        >
          <div class="bg-gray-200 dark:bg-gray-700" :class="i === 1 ? 'h-56 lg:h-80' : 'h-40'"></div>
          <div class="p-6 space-y-3">
            <div class="w-1/3 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="w-3/4 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="w-full h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      <!-- Error / empty -->
      <div
        v-else-if="loadError || blogPosts.length === 0"
        class="flex flex-col items-center px-6 py-14 text-center rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10"
        role="status"
      >
        <span class="flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-brand-500/10 text-brand-500">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h4m-4 4h10m-10 4h10" />
          </svg>
        </span>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ loadError ? "We couldn't load the latest posts" : 'No posts yet' }}
        </h3>
        <p class="max-w-md mt-2 text-gray-600 dark:text-gray-300">
          {{ loadError ? 'Please try again in a moment.' : 'New articles and health tips are on the way.' }}
        </p>
        <button
          v-if="loadError"
          type="button"
          class="px-6 py-3 mt-6 font-medium transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 ease-out-quart hover:bg-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-brand-300 dark:hover:text-white"
          @click="loadPosts"
        >
          Try again
        </button>
      </div>

      <!-- Posts: one featured (2 columns × 2 rows on desktop), the rest stacked beside it -->
      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(post, index) in blogPosts"
          :key="post.id"
          class="blog-card group relative flex flex-col overflow-hidden rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md transition duration-300 ease-out-quart hover:shadow-card-hover focus-within:ring-4 focus-within:ring-brand-500/30 dark:bg-gray-800/60 dark:ring-white/10"
          :class="index === 0 ? 'md:col-span-2 lg:row-span-2' : ''"
          :style="{ '--i': index }"
        >
          <div
            class="relative overflow-hidden shrink-0"
            :class="index === 0 ? 'h-56 sm:h-72 lg:h-auto lg:flex-1 lg:min-h-[300px]' : 'h-44'"
          >
            <LazyImage
              :src="post.coverImage"
              :alt="post.title"
              aspectRatio="landscape"
              className="w-full h-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span class="absolute px-3 py-1 text-xs font-semibold text-white rounded-full top-3 left-3 bg-brand-500 shadow-card">
              {{ post.category }}
            </span>
          </div>

          <div class="flex flex-col flex-1 p-6" :class="index === 0 ? 'sm:p-8' : ''">
            <div class="flex items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <time :datetime="String(post.date)">{{ formatDate(post.date) }}</time>
              <span aria-hidden="true">•</span>
              <span>{{ post.readTime }} min read</span>
            </div>

            <h3
              class="mb-2 font-bold text-gray-900 transition-colors dark:text-white group-hover:text-brand-500 line-clamp-2"
              :class="index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'"
            >
              <!-- The title is the card's link, stretched over the whole card: real link, keyboard focusable. -->
              <router-link
                :to="{ name: 'blog-post', params: { slug: post.slug } }"
                class="after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
              >
                {{ post.title }}
              </router-link>
            </h3>

            <p class="mb-5 text-gray-600 dark:text-gray-300" :class="index === 0 ? 'line-clamp-3' : 'line-clamp-2'">
              {{ post.excerpt }}
            </p>

            <div class="flex items-center justify-between pt-4 mt-auto border-t border-gray-900/5 dark:border-white/10">
              <div class="flex items-center min-w-0 gap-2">
                <LazyImage
                  :src="post.author.avatar"
                  :alt="post.author.name"
                  aspectRatio="square"
                  className="w-8 h-8 rounded-full"
                />
                <span class="text-sm font-medium text-gray-700 truncate dark:text-gray-300">
                  {{ post.author.name }}
                </span>
              </div>

              <span class="inline-flex items-center gap-1 text-sm font-medium text-brand-500 shrink-0">
                Read more
                <svg class="w-4 h-4 transition-transform duration-200 ease-out-quart group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- View all (mobile / tablet: the header link is hidden there) -->
      <div v-if="blogPosts.length" class="mt-8 text-center md:hidden reveal" style="--d: 0.3s">
        <router-link
          :to="{ name: 'blog' }"
          class="group inline-flex items-center justify-center gap-2 px-8 py-4 font-medium transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 bg-white/70 backdrop-blur ease-out-quart hover:bg-brand-500 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:bg-white/5 dark:text-brand-300 dark:hover:text-white"
        >
          View All Posts
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll-in via `.is-in` (useInView): header, then cards stagger. */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s);
}

.blog-card {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.1s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.1s),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.is-in .reveal,
.is-in .blog-card {
  opacity: 1;
  transform: none;
}

.is-in .blog-card:hover {
  transform: translateY(-4px);
  transition-delay: 0s;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .blog-card {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .is-in .blog-card:hover {
    transform: none;
  }
}
</style>
