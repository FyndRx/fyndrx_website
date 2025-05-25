<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import BlogCard from '@/components/BlogCard.vue';

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
    summary: 'Learn the best strategies to reduce your prescription costs and find the best deals.',
    date: '2024-03-15',
    author: 'John Doe',
    category: 'Savings Tips',
    image: '/images/blog/save-money.jpg',
    url: '#'
  },
  {
    id: 2,
    title: 'Understanding Pharmacy Discounts',
    summary: 'A comprehensive guide to understanding how pharmacy discounts work and how to maximize your savings.',
    date: '2024-03-10',
    author: 'Jane Smith',
    category: 'Education',
    image: '/images/blog/discounts.jpg',
    url: '#'
  },
  {
    id: 3,
    title: 'The Future of Pharmacy Savings',
    summary: 'Explore the latest trends and innovations in pharmacy savings and prescription management.',
    date: '2024-03-05',
    author: 'Mike Johnson',
    category: 'Industry News',
    image: '/images/blog/future.jpg',
    url: '#'
  }
]);
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

      <!-- Blog Posts Grid -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <BlogCard
              v-for="blog in blogPosts"
              :key="blog.id"
              :title="blog.title"
              :excerpt="blog.summary"
              :date="blog.date || '2024-01-01'"
              :author="blog.author || 'FyndRx Team'"
              :category="blog.category || 'General'"
              :image="blog.image || '/images/blog/default.jpg'"
              :url="blog.url"
            />
      </div>

      <!-- View All Button -->
      <div class="mt-12 text-center delay-500 scroll-animate slide-up">
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