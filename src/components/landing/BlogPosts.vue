<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const { registerElement } = useScrollAnimation();
const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
  // Register elements for scroll animation
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

// Sample blog posts data
const blogPosts = ref([
  {
    id: 1,
    title: 'How to Save Money on Prescriptions',
    excerpt: 'Learn the best strategies to reduce your prescription costs and find the best deals.',
    date: '2024-03-15',
    author: 'John Doe',
    category: 'Savings Tips',
    image: '/images/blog/save-money.jpg'
  },
  {
    id: 2,
    title: 'Understanding Pharmacy Discounts',
    excerpt: 'A comprehensive guide to understanding how pharmacy discounts work and how to maximize your savings.',
    date: '2024-03-10',
    author: 'Jane Smith',
    category: 'Education',
    image: '/images/blog/discounts.jpg'
  },
  {
    id: 3,
    title: 'The Future of Pharmacy Savings',
    excerpt: 'Explore the latest trends and innovations in pharmacy savings and prescription management.',
    date: '2024-03-05',
    author: 'Mike Johnson',
    category: 'Industry News',
    image: '/images/blog/future.jpg'
  }
]);
</script>

<script lang="ts">
export default {};
</script>

<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16 scroll-animate slide-up">
        <h2 class="text-4xl font-medium text-gray-900 dark:text-white mb-4">
          Latest <span class="text-[#246BFD]">Blog</span> Posts
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Stay informed with our latest articles and tips
        </p>
      </div>

      <!-- Blog Posts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(post, index) in blogPosts"
          :key="post.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover-lift">
            <!-- Blog Image -->
            <div class="relative h-48">
              <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <p class="text-gray-400">Blog Image</p>
              </div>
              <div class="absolute top-4 left-4">
                <span class="px-3 py-1 rounded-full bg-[#246BFD]/10 text-[#246BFD] text-sm font-medium">
                  {{ post.category }}
                </span>
              </div>
            </div>

            <!-- Blog Content -->
            <div class="p-6">
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{{ new Date(post.date).toLocaleDateString() }}</span>
                <span class="mx-2">•</span>
                <span>{{ post.author }}</span>
              </div>
              <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-3">
                {{ post.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                {{ post.excerpt }}
              </p>
              <button class="text-[#246BFD] font-medium hover:text-[#5089FF] transition-colors">
                Read More →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div class="text-center mt-12 scroll-animate slide-up delay-500">
        <button class="px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300">
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
</style> 