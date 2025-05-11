<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDate } from '@/utils/date'
import type { BlogPost } from '@/types/blog'
import { blogService } from '@/services/blogService'
import TextInput from '@/components/TextInput.vue'

const isLoading = ref(true)
const featuredPost = ref<BlogPost | null>(null)
const posts = ref<BlogPost[]>([])
const categories = ['All', 'Health Conditions', 'Drug Information', 'News', 'Wellness']
const selectedCategories = ref(['All'])
const searchQuery = ref('')
const currentPage = ref(1)
const postsPerPage = 9

const filteredPosts = computed(() => {
  let filtered = posts.value

  // Filter by category
  if (!selectedCategories.value.includes('All')) {
    filtered = filtered.filter(post =>
      selectedCategories.value.includes(post.category)
    )
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
    )
  }

  // Pagination
  const start = (currentPage.value - 1) * postsPerPage
  return filtered.slice(start, start + postsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(posts.value.length / postsPerPage)
)

const toggleCategory = (category: string) => {
  if (category === 'All') {
    selectedCategories.value = ['All']
  } else {
    selectedCategories.value = selectedCategories.value.filter(c => c !== 'All')
    const index = selectedCategories.value.indexOf(category)
    if (index === -1) {
      selectedCategories.value.push(category)
    } else {
      selectedCategories.value.splice(index, 1)
    }
    if (selectedCategories.value.length === 0) {
      selectedCategories.value = ['All']
    }
  }
}

onMounted(async () => {
  try {
    const { posts: fetchedPosts } = await blogService.getPosts(currentPage.value, postsPerPage)
    posts.value = fetchedPosts
    
    // Set featured post (first post for now)
    if (fetchedPosts.length > 0) {
      featuredPost.value = fetchedPosts[0]
    }
    
    isLoading.value = false
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    // Add mock data for testing
    posts.value = [
      {
        id: 1,
        title: 'The Future of Healthcare Technology',
        slug: 'future-of-healthcare-technology',
        excerpt: 'Exploring how AI and machine learning are transforming patient care and medical research.',
        content: '<p>Your article content here...</p>',
        coverImage: 'https://media.istockphoto.com/id/2160715528/photo/female-asian-neuroscinetist-using-interactive-touch-screen-table-with-mri-scans-on-display-in.jpg?s=2048x2048&w=is&k=20&c=YS4UegfImjsNWTDnLpXy4Gjk8zjlshgjt2SqIKEDmeg=',
        category: 'Technology',
        date: '2024-03-15',
        author: {
          name: 'Alhassan Latifa',
          avatar: 'src/assets/team/latifa.jpg',
          bio: 'Healthcare Technology Specialist'
        },
        tags: ['AI', 'Healthcare', 'Technology', 'Innovation'],
        readTime: 8,
        likes: 42,
        comments: []
      },
      {
        id: 2,
        title: 'Understanding Modern Healthcare',
        slug: 'understanding-modern-healthcare',
        excerpt: 'A comprehensive guide to navigating the modern healthcare landscape.',
        content: '<p>Your article content here...</p>',
        coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=3880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Healthcare',
        date: '2024-03-10',
        author: {
          name: 'Abdul Basit Yahaya',
          avatar: 'src/assets/team/aby.jpg',
          bio: 'Healthcare Policy Expert'
        },
        tags: ['Healthcare', 'Policy', 'Guide'],
        readTime: 6,
        likes: 28,
        comments: []
      },
      {
        id: 1,
        title: 'The Future of Healthcare Technology',
        slug: 'future-of-healthcare-technology',
        excerpt: 'Exploring how AI and machine learning are transforming patient care and medical research.',
        content: '<p>Your article content here...</p>',
        coverImage: 'https://media.istockphoto.com/id/2160715528/photo/female-asian-neuroscinetist-using-interactive-touch-screen-table-with-mri-scans-on-display-in.jpg?s=2048x2048&w=is&k=20&c=YS4UegfImjsNWTDnLpXy4Gjk8zjlshgjt2SqIKEDmeg=',
        category: 'Technology',
        date: '2024-03-15',
        author: {
          name: 'Alhassan Latifa',
          avatar: 'src/assets/team/latifa.jpg',
          bio: 'Healthcare Technology Specialist'
        },
        tags: ['AI', 'Healthcare', 'Technology', 'Innovation'],
        readTime: 8,
        likes: 42,
        comments: []
      },
      {
        id: 2,
        title: 'Understanding Modern Healthcare',
        slug: 'understanding-modern-healthcare',
        excerpt: 'A comprehensive guide to navigating the modern healthcare landscape.',
        content: '<p>Your article content here...</p>',
        coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=3880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Healthcare',
        date: '2024-03-10',
        author: {
          name: 'Abdul Basit Yahaya',
          avatar: 'src/assets/team/aby.jpg',
          bio: 'Healthcare Policy Expert'
        },
        tags: ['Healthcare', 'Policy', 'Guide'],
        readTime: 6,
        likes: 28,
        comments: []
      },
      {
        id: 1,
        title: 'The Future of Healthcare Technology',
        slug: 'future-of-healthcare-technology',
        excerpt: 'Exploring how AI and machine learning are transforming patient care and medical research.',
        content: '<p>Your article content here...</p>',
        coverImage: 'https://media.istockphoto.com/id/2160715528/photo/female-asian-neuroscinetist-using-interactive-touch-screen-table-with-mri-scans-on-display-in.jpg?s=2048x2048&w=is&k=20&c=YS4UegfImjsNWTDnLpXy4Gjk8zjlshgjt2SqIKEDmeg=',
        category: 'Technology',
        date: '2024-03-15',
        author: {
          name: 'Alhassan Latifa',
          avatar: 'src/assets/team/latifa.jpg',
          bio: 'Healthcare Technology Specialist'
        },
        tags: ['AI', 'Healthcare', 'Technology', 'Innovation'],
        readTime: 8,
        likes: 42,
        comments: []
      },
      {
        id: 2,
        title: 'Understanding Modern Healthcare',
        slug: 'understanding-modern-healthcare',
        excerpt: 'A comprehensive guide to navigating the modern healthcare landscape.',
        content: '<p>Your article content here...</p>',
        coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=3880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        category: 'Healthcare',
        date: '2024-03-10',
        author: {
          name: 'Abdul Basit Yahaya',
          avatar: 'src/assets/team/aby.jpg',
          bio: 'Healthcare Policy Expert'
        },
        tags: ['Healthcare', 'Policy', 'Guide'],
        readTime: 6,
        likes: 28,
        comments: []
      },
    ]
    
    // Set featured post
    featuredPost.value = posts.value[0]
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-[#246BFD] to-[#FE9615] text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold mb-4">Our Blog</h1>
        <p class="text-xl text-white/80">
          Discover insights, updates, and stories from our team.
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-pulse space-y-8">
        <!-- Featured Post Skeleton -->
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
        
        <!-- Blog Grid Skeleton -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="i in 6" :key="i" class="space-y-4">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Featured Post -->
      <div v-if="featuredPost" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="relative rounded-lg overflow-hidden shadow-lg">
          <img :src="featuredPost.coverImage" :alt="featuredPost.title" class="w-full h-96 object-cover" />
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
            <div class="text-white">
              <span class="text-sm font-medium text-gray-200">{{ featuredPost.category }}</span>
              <h2 class="mt-2 text-3xl font-bold">{{ featuredPost.title }}</h2>
              <p class="mt-2 text-gray-200">{{ featuredPost.excerpt }}</p>
              <div class="mt-4 flex items-center">
                <img :src="featuredPost.author.avatar" :alt="featuredPost.author.name" class="h-10 w-10 rounded-full" />
                <div class="ml-3">
                  <p class="text-sm font-medium text-white">{{ featuredPost.author.name }}</p>
                  <p class="text-xs text-gray-300">{{ formatDate(featuredPost.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Blog Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Search and Filter -->
        <div class="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="w-full sm:w-96">
            <TextInput
              v-model="searchQuery"
              type="search"
              placeholder="Search articles..."
              icon="search"
            />
          </div>
          <div class="flex gap-2">
            <button
              v-for="category in categories"
              :key="category"
              @click="toggleCategory(category)"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium',
                selectedCategories.includes(category)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article
            v-for="post in filteredPosts"
            :key="post.id"
            class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img :src="post.coverImage" :alt="post.title" class="w-full h-48 object-cover" />
            <div class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-sm font-medium text-blue-600">{{ post.category }}</span>
                <span class="text-sm text-gray-500">{{ formatDate(post.date) }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ post.title }}</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">{{ post.excerpt }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <img :src="post.author.avatar" :alt="post.author.name" class="h-8 w-8 rounded-full" />
                  <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">{{ post.author.name }}</span>
                </div>
                <router-link
                  :to="{ name: 'blog-post', params: { slug: post.slug }}"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read more →
                </router-link>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div class="mt-12 flex justify-center">
          <nav class="flex items-center gap-2">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium',
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ page }}
            </button>
          </nav>
        </div>
      </div>
    </template>
  </div>
</template> 