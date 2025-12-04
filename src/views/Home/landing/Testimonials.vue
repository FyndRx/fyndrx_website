<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { testimoniesService } from '@/services/testimoniesService';
import TestimonyCard from '@/components/TestimonyCard.vue';
import type { Testimony, TestimonyStats } from '@/models/Testimony';

const { registerElement } = useScrollAnimation();
const testimonies = ref<Testimony[]>([]);
const stats = ref<TestimonyStats>({
  total: 0,
  averageRating: 0,
  verifiedCount: 0,
  featuredCount: 0
});
const loading = ref(true);

onMounted(async () => {
  try {
    testimonies.value = await testimoniesService.getFeaturedTestimonies(6);
    stats.value = await testimoniesService.getTestimoniesStats();
  } catch (error) {
    console.error('Error loading testimonies:', error);
  } finally {
    loading.value = false;
  }

  setTimeout(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((element) => registerElement(element as HTMLElement));
  }, 100);
});
</script>

<script lang="ts">
export default {
  name: 'Testimonials',
}
</script>

<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-800">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          What Our <span class="text-[#246BFD]">Customers</span> Say
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Real stories from real people who trust FyndRx
        </p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="animate-pulse">
          <div class="h-80 bg-white dark:bg-gray-900 rounded-2xl"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(testimony, index) in testimonies"
          :key="testimony.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <TestimonyCard :testimony="testimony" />
        </div>
      </div>

      <div class="mt-16 text-center scroll-animate slide-up delay-700">
        <div class="inline-flex items-center p-4 space-x-4 bg-white shadow-lg dark:bg-gray-900 rounded-2xl">
          <div class="flex -space-x-4">
            <img
              v-for="i in 4"
              :key="i"
              :src="`https://i.pravatar.cc/100?img=${i}`"
              alt="Customer"
              class="w-12 h-12 border-4 border-white rounded-full dark:border-gray-900"
            />
          </div>
          <div class="text-left">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.total > 0 ? `${stats.total}+` : '12+' }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Happy Customers
            </p>
          </div>
          <div class="text-left border-l border-gray-200 dark:border-gray-700 pl-4">
            <p class="text-2xl font-bold text-[#FE9615]">
              {{ stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '5.0' }}/5
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Average Rating
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>



