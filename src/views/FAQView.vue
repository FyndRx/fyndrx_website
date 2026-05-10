<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { informationService, type HelpArticle } from '@/services/informationService';

const { registerElement } = useScrollAnimation();

useSeoMeta({
  title: 'Frequently Asked Questions | FyndRx',
  description: 'Find answers to common questions about FyndRx — how it works, ordering, prescriptions, delivery, payments, and more. We are here to help.',
  keywords: 'FyndRx FAQ, frequently asked questions, online pharmacy help, how does FyndRx work, prescription upload help, delivery questions',
  ogType: 'website',
});

const activeIndex = ref<number | null>(null);
const allFaqs = ref<HelpArticle[]>([]);
const loading = ref(true);

const categories = ref([
  {
    id: 'General',
    name: 'General',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'Orders & Delivery',
    name: 'Orders & Delivery',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
  },
  {
    id: 'Prescriptions',
    name: 'Prescriptions',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    id: 'Payments & Security',
    name: 'Payments & Security',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  }
]);

const selectedCategory = ref('General');

onMounted(async () => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));

  try {
    allFaqs.value = await informationService.getFAQs();
  } catch (error) {
    console.error('Failed to load FAQs:', error);
  } finally {
    loading.value = false;
  }
});

const toggleFAQ = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const filteredFAQs = computed(() => {
  if (!selectedCategory.value) return allFaqs.value;
  return allFaqs.value.filter(faq => faq.category === selectedCategory.value);
});

const filterByCategory = (category: string) => {
  selectedCategory.value = category;
  activeIndex.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="py-20 bg-gradient-to-br from-[#246BFD] to-[#5089FF]">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-4 text-5xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p class="text-xl text-blue-100">
            Find answers to common questions about FyndRx
          </p>
        </div>
      </div>
    </div>

    <div class="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="lg:w-64 flex-shrink-0">
          <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
            <nav class="space-y-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="filterByCategory(category.id)"
                :class="[
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  selectedCategory === category.id
                    ? 'bg-[#246BFD] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="category.icon"></path>
                </svg>
                <span class="font-medium">{{ category.name }}</span>
              </button>
            </nav>
          </div>
        </div>

        <div class="flex-1">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
          </div>

          <div v-else-if="filteredFAQs.length === 0" class="text-center py-12 text-gray-500">
            No FAQs found for this category.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(faq, index) in filteredFAQs"
              :key="faq.id"
              class="scroll-animate slide-up visible"
            >
              <div class="overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
                <button
                  @click="toggleFAQ(index)"
                  class="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span class="text-lg font-medium text-gray-900 dark:text-white pr-8">
                    {{ faq.title }}
                  </span>
                  <svg
                    class="flex-shrink-0 w-6 h-6 text-[#246BFD] transition-transform duration-300"
                    :class="{ 'rotate-180': activeIndex === index }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div v-show="activeIndex === index" class="overflow-hidden transition-all duration-300">
                  <div class="px-6 pb-6 text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" v-html="faq.content">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-12 p-8 bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 dark:from-[#246BFD]/20 dark:to-[#FE9615]/20 rounded-2xl">
            <h3 class="mb-2 text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Still have questions?
            </h3>
            <p class="mb-6 text-center text-gray-600 dark:text-gray-300">
              Our support team is here to help you 24/7
            </p>
            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <router-link
                to="/help"
                class="inline-flex items-center px-8 py-3 space-x-2 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <span>Help Center</span>
              </router-link>
              <router-link
                to="/contact"
                class="inline-flex items-center px-8 py-3 space-x-2 rounded-full bg-white text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Contact Us</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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












