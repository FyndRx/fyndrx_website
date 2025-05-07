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

// Sample pharmacy data
const pharmacies = ref([
  {
    id: 1,
    name: 'CVS Pharmacy',
    rating: 4.5,
    reviews: 128,
    distance: '0.5 miles',
    image: '/images/pharmacies/cvs.jpg',
    isOpen: true
  },
  {
    id: 2,
    name: 'Walgreens',
    rating: 4.3,
    reviews: 95,
    distance: '1.2 miles',
    image: '/images/pharmacies/walgreens.jpg',
    isOpen: true
  },
  {
    id: 3,
    name: 'Rite Aid',
    rating: 4.1,
    reviews: 76,
    distance: '0.8 miles',
    image: '/images/pharmacies/rite-aid.jpg',
    isOpen: false
  }
]);
</script>

<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12 scroll-animate slide-up">
        <h2 class="text-4xl font-medium text-gray-900 dark:text-white mb-4">
          Find Pharmacies Near You
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Compare prices and find the best deals at pharmacies in your area
        </p>
      </div>

      <!-- Search and Filter -->
      <div class="mb-8 scroll-animate slide-up delay-200">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Search pharmacies..."
              class="w-full px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#246BFD]"
            />
          </div>
          <div class="flex gap-2">
            <button class="px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Open Now
            </button>
            <button class="px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Distance
            </button>
            <button class="px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Rating
            </button>
          </div>
        </div>
      </div>

      <!-- Pharmacy Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(pharmacy, index) in pharmacies"
          :key="pharmacy.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover-lift">
            <!-- Pharmacy Image -->
            <div class="relative h-48">
              <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <p class="text-gray-400">Pharmacy Image</p>
              </div>
              <div class="absolute top-4 right-4">
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="pharmacy.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ pharmacy.isOpen ? 'Open' : 'Closed' }}
                </span>
              </div>
            </div>

            <!-- Pharmacy Info -->
            <div class="p-6">
              <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {{ pharmacy.name }}
              </h3>
              <div class="flex items-center space-x-4 mb-4">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span class="ml-1 text-gray-600 dark:text-gray-300">
                    {{ pharmacy.rating }} ({{ pharmacy.reviews }} reviews)
                  </span>
                </div>
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="ml-1 text-gray-600 dark:text-gray-300">
                    {{ pharmacy.distance }}
                  </span>
                </div>
              </div>
              <button class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors">
                View Deals
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div class="text-center mt-12 scroll-animate slide-up delay-500">
        <button class="px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300">
          View All Pharmacies
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