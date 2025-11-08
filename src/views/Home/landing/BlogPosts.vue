<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const { registerElement } = useScrollAnimation();
const isVisible = ref(false);
const blogPosts = ref<BlogPost[]>([]);
const loading = ref(true);

onMounted(async () => {
  isVisible.value = true;
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
  
  try {
    const { posts } = await blogService.getPosts(1, 3);
    blogPosts.value = posts;
  } catch (error) {
    console.error('Failed to load blog posts:', error);
  } finally {
    loading.value = false;
  }
});

const viewPost = (slug: string) => {
  router.push({ name: 'blog-post', params: { slug } });
};

const viewAllBlogs = () => {
  router.push({ name: 'blog' });
};
</script>

<script lang="ts">
export default {};
</script>

<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Latest <span class="text-[#246BFD]">Blog</span> Posts
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Stay informed with our latest articles and tips
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>

      <!-- Blog Posts Grid -->
      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="post in blogPosts"
          :key="post.id"
          @click="viewPost(post.slug)"
          class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
        >
          <div class="relative h-48 overflow-hidden">
            <LazyImage
              :src="post.coverImage"
              :alt="post.title"
              aspectRatio="landscape"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div class="absolute top-3 left-3">
              <span class="inline-block px-3 py-1 rounded-full bg-[#246BFD] text-white text-xs font-semibold">
                {{ post.category }}
              </span>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ new Date(post.date).toLocaleDateString() }}</span>
              <span>•</span>
              <span>{{ post.readTime }} min read</span>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#246BFD] transition-colors">
              {{ post.title }}
            </h3>
            
            <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {{ post.excerpt }}
            </p>

            <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <img 
                  :src="post.author.avatar" 
                  :alt="post.author.name" 
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ post.author.name }}
                </span>
              </div>
              
              <span class="text-[#246BFD] font-medium text-sm group-hover:text-[#5089FF]">
                Read More →
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- View All Button -->
      <div class="mt-12 text-center delay-500 scroll-animate slide-up">
        <button 
          @click="viewAllBlogs"
          class="px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View All Posts
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 