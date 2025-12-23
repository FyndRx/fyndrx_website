<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDate } from '@/utils/date';
import { usePullToRefresh } from '@/composables/useMobileGestures';
import type { BlogPost } from '@/types/blog';
import { blogService } from '@/services/blogService';
import LazyImage from '@/components/LazyImage.vue';
import Dropdown from '@/components/Dropdown.vue';
import EmptyState from '@/components/EmptyState.vue';

const router = useRouter();
const route = useRoute();
const isLoading = ref(true);
const featuredPost = ref<BlogPost | null>(null);
const posts = ref<BlogPost[]>([]);
const totalPosts = ref(0);
const searchQuery = ref('');
const selectedCategory = ref('All');
const selectedTag = ref('All');
const sortBy = ref('date-desc');
const currentPage = ref(1);
const postsPerPage = 9;
const showFilters = ref(false);

const categories = ref<{ label: string; value: string }[]>([]);
const allTags = ref<{ label: string; value: string }[]>([]);

onMounted(async () => {
  const [cats, tags] = await Promise.all([
    blogService.getCategories(),
    blogService.getAllTags()
  ]);
  
  categories.value = [{ label: 'All Categories', value: 'All' }, ...cats.map((c: string) => ({ label: c, value: c }))];
  allTags.value = [{ label: 'All Tags', value: 'All' }, ...tags.map((t: string) => ({ label: t, value: t }))];

  const categoryParam = route.query.category as string;
  if (categoryParam) {
    selectedCategory.value = categoryParam;
  }
  
  await loadPosts();
});

const sortOptions = [
  { label: 'Newest First', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'Most Popular', value: 'likes' },
  { label: 'Most Viewed', value: 'views' }
];

const totalPages = computed(() => Math.ceil(totalPosts.value / postsPerPage));

const activeFiltersCount = computed(() => {
  let count = 0;
  if (selectedCategory.value !== 'All') count++;
  if (selectedTag.value !== 'All') count++;
  if (searchQuery.value) count++;
  if (sortBy.value !== 'date-desc') count++;
  return count;
});

const loadPosts = async () => {
  isLoading.value = true;
  try {
    const category = selectedCategory.value === 'All' ? undefined : selectedCategory.value;
    const { posts: fetchedPosts, total } = await blogService.getPosts(
      currentPage.value,
      postsPerPage,
      category,
      searchQuery.value
    );
    
    let filtered = fetchedPosts;
    
    if (selectedTag.value !== 'All') {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag.value));
    }
    
    if (sortBy.value === 'date-asc') {
      filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy.value === 'likes') {
      filtered = filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy.value === 'views') {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    
    posts.value = filtered;
    totalPosts.value = total;
    
    if (fetchedPosts.length > 0 && currentPage.value === 1) {
      featuredPost.value = fetchedPosts[0];
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    isLoading.value = false;
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'All';
  selectedTag.value = 'All';
  sortBy.value = 'date-desc';
  currentPage.value = 1;
  loadPosts();
};

const viewPost = (slug: string) => {
  router.push({ name: 'blog-post', params: { slug } });
};

const { handleTouchStart, handleTouchMove, handleTouchEnd, pullDistance, isRefreshing } = usePullToRefresh(async () => {
  await loadPosts();
});

watch([selectedCategory, selectedTag, sortBy, searchQuery], () => {
  currentPage.value = 1;
  loadPosts();
});

watch(currentPage, () => {
  loadPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


</script>

<template>
  <div 
    class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Pull to Refresh Indicator -->
    <div 
      v-if="pullDistance > 0"
      class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all"
      :style="{ transform: `translate(-50%, ${Math.min(pullDistance, 80)}px)` }"
    >
      <div class="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
        <svg 
          class="w-6 h-6 text-[#246BFD] transition-transform"
          :class="{ 'animate-spin': isRefreshing }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 dark:from-[#246BFD]/5 dark:to-[#FE9615]/5 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#246BFD]/10 text-[#246BFD] dark:bg-[#246BFD]/20 dark:text-[#246BFD] mb-4">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <span class="font-medium">FyndRX Health Blog</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Health Insights & Updates
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover expert insights, medication guides, and the latest healthcare news
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Featured Post -->
      <div v-if="featuredPost && !isLoading" class="mb-12">
        <div 
          @click="viewPost(featuredPost.slug)"
          class="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
        >
          <div class="absolute inset-0">
            <LazyImage
              :src="featuredPost.coverImage"
              :alt="featuredPost.title"
              aspectRatio="landscape"
              className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
          
          <div class="relative z-10 p-8 md:p-12 flex flex-col justify-end min-h-[500px]">
            <div class="mb-4">
              <span class="inline-block px-4 py-2 rounded-full bg-[#FE9615] text-white text-sm font-semibold mb-3">
                Featured
              </span>
              <span class="ml-2 inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold">
                {{ featuredPost.category }}
              </span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl">
              {{ featuredPost.title }}
            </h2>
            <p class="text-lg text-gray-200 mb-6 max-w-2xl">
              {{ featuredPost.excerpt }}
            </p>
            <div class="flex items-center gap-6 text-white/90 text-sm">
              <div class="flex items-center gap-2">
                <img 
                  :src="featuredPost.author.avatar" 
                  :alt="featuredPost.author.name" 
                  class="w-10 h-10 rounded-full ring-2 ring-white/30"
                />
                <span class="font-medium">{{ featuredPost.author.name }}</span>
              </div>
              <span>{{ formatDate(featuredPost.date) }}</span>
              <span>{{ featuredPost.readTime }} min read</span>
              <div class="flex items-center gap-1">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>{{ featuredPost.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <!-- Search -->
          <div class="relative flex-1 w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search articles, tags, authors..."
              class="w-full px-6 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#246BFD] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <svg class="absolute w-5 h-5 text-gray-400 right-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <!-- Filter Toggle -->
          <button
            @click="showFilters = !showFilters"
            class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            <span class="font-medium">Filters</span>
            <span v-if="activeFiltersCount > 0" class="px-2 py-0.5 text-xs font-bold bg-[#246BFD] text-white rounded-full">
              {{ activeFiltersCount }}
            </span>
          </button>
        </div>

        <!-- Expandable Filters -->
        <div v-if="showFilters" class="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dropdown
              v-model="selectedCategory"
              :options="categories"
              label="Category"
              placeholder="Select category"
            />
            <Dropdown
              v-model="selectedTag"
              :options="allTags"
              label="Tag"
              placeholder="Select tag"
              searchable
            />
            <Dropdown
              v-model="sortBy"
              :options="sortOptions"
              label="Sort By"
              placeholder="Select sort order"
            />
          </div>
          
          <button
            v-if="activeFiltersCount > 0"
            @click="clearFilters"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span class="text-sm font-medium">Clear All Filters</span>
          </button>
        </div>

        <!-- Results Count -->
        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {{ posts.length }} of {{ totalPosts }} article{{ totalPosts !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 9" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div class="h-48 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-6 space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="posts.length === 0"
        type="search"
        message="No blog posts found matching your criteria."
        @action="clearFilters"
      />

      <!-- Blog Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
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
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>{{ formatDate(post.date) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ post.readTime }} min</span>
              </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#246BFD] transition-colors">
              {{ post.title }}
            </h3>
            
            <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
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
              
              <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span>{{ post.likes }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span>{{ post.views }}</span>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag"
                class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1 && !isLoading" class="mt-12 flex justify-center">
        <nav class="flex items-center gap-2">
          <button
            @click="currentPage = currentPage - 1"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              currentPage === page
                ? 'bg-[#246BFD] text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ page }}
          </button>
          
          <button
            @click="currentPage = currentPage + 1"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
