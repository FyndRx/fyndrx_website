<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { howToUseService } from '@/services/howToUseService';
import type { HowToCategory, HowToGuide, HowToQuickStartItem } from '@/models/HowToGuide';

const { registerElement } = useScrollAnimation();

useSeoMeta({
  title: 'How to Use FyndRx | Step-by-Step Guide',
  description: 'Learn how to use FyndRx step by step — create an account, search and compare medication prices, upload prescriptions, book teleconsultations, checkout securely, and track your delivery.',
  keywords: 'how to use FyndRx, FyndRx guide, FyndRx tutorial, order medicine online Ghana, upload prescription guide, teleconsultation guide',
  ogType: 'website',
});

const loading = ref(true);
const categories = ref<HowToCategory[]>([]);
const quickStart = ref<HowToQuickStartItem[]>([]);
const allGuides = ref<HowToGuide[]>([]);
const selectedCategory = ref<string | null>(null);
const searchQuery = ref('');
const activeGuideId = ref<string | number | null>(null);

onMounted(async () => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));

  try {
    const [cats, quick, guides] = await Promise.all([
      howToUseService.getCategories(),
      howToUseService.getQuickStart(),
      howToUseService.getGuides(),
    ]);
    categories.value = cats;
    quickStart.value = quick;
    allGuides.value = guides;
  } catch (error) {
    console.error('Failed to load How to Use content:', error);
  } finally {
    loading.value = false;
  }
});

const filteredGuides = computed(() => {
  let guides = allGuides.value;

  if (selectedCategory.value) {
    guides = guides.filter(g => g.category === selectedCategory.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    guides = guides.filter(g =>
      g.title.toLowerCase().includes(query) ||
      g.summary.toLowerCase().includes(query) ||
      g.steps.some(s => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
    );
  }

  return guides;
});

const groupedGuides = computed(() => {
  const groups: { category: string; icon: string; guides: HowToGuide[] }[] = [];
  for (const category of categories.value) {
    const guides = filteredGuides.value.filter(g => g.category === category.name);
    if (guides.length > 0) {
      groups.push({ category: category.name, icon: category.icon, guides });
    }
  }
  return groups;
});

const selectCategory = (name: string) => {
  selectedCategory.value = selectedCategory.value === name ? null : name;
  activeGuideId.value = null;
};

const toggleGuide = (id: string | number) => {
  activeGuideId.value = activeGuideId.value === id ? null : id;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

    <!-- Hero -->
    <div class="py-20 bg-gradient-to-br from-[#246BFD] to-[#5089FF]">
      <div class="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 class="mb-4 text-5xl font-bold text-white">How to Use FyndRx</h1>
        <p class="text-xl text-blue-100 mb-8">
          Your complete, step-by-step guide to ordering medicine, managing prescriptions, and consulting doctors online.
        </p>
        <div class="relative max-w-xl mx-auto">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search guides — e.g. &quot;upload prescription&quot;"
            class="w-full pl-12 pr-4 py-4 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-base shadow-lg"
          />
        </div>
      </div>
    </div>

    <!-- Quick Start Journey -->
    <div class="px-4 py-14 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h2 class="mb-2 text-2xl font-semibold text-center text-gray-900 dark:text-white">
        Your Journey in 6 Steps
      </h2>
      <p class="mb-10 text-center text-gray-500 dark:text-gray-400">
        A quick overview before you dive into the detailed guides below.
      </p>

      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#246BFD]"></div>
      </div>

      <div v-else class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="(item, index) in quickStart"
          :key="item.order"
          class="scroll-animate slide-up visible relative flex flex-col items-center text-center"
          :style="{ transitionDelay: (index * 60) + 'ms' }"
        >
          <div class="relative flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-[#246BFD]/20">
            <svg class="w-7 h-7 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
            </svg>
            <span class="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full bg-[#FE9615]">
              {{ item.order }}
            </span>
          </div>
          <h3 class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{{ item.title }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- Guides -->
    <div class="px-4 pb-20 mx-auto max-w-5xl sm:px-6 lg:px-8">

      <!-- Category filter pills -->
      <div v-if="!loading" class="flex flex-wrap justify-center gap-3 mb-12">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.name)"
          :class="[
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
            selectedCategory === category.name
              ? 'bg-[#246BFD] text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#246BFD]'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="category.icon"></path>
          </svg>
          {{ category.name }}
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
      </div>

      <div v-else-if="groupedGuides.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        No guides found. Try a different search term or category.
      </div>

      <div v-else class="space-y-14">
        <div v-for="group in groupedGuides" :key="group.category" class="scroll-animate slide-up visible">
          <div class="flex items-center gap-3 mb-6">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#246BFD]/10">
              <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="group.icon"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ group.category }}</h2>
          </div>

          <div class="space-y-4">
            <div
              v-for="guide in group.guides"
              :key="guide.id"
              class="overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl"
            >
              <div
                role="button"
                tabindex="0"
                @click="toggleGuide(guide.id)"
                @keydown.enter="toggleGuide(guide.id)"
                @keydown.space.prevent="toggleGuide(guide.id)"
                class="flex items-center justify-between w-full gap-4 p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div>
                  <div class="flex flex-wrap items-center gap-3 mb-1">
                    <span class="text-lg font-medium text-gray-900 dark:text-white">{{ guide.title }}</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FE9615]/10 text-[#FE9615]">
                      {{ guide.estimatedTime }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ guide.summary }}</p>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                  <router-link
                    :to="`/how-to-use/${guide.slug}`"
                    @click.stop
                    title="Open this guide on its own page"
                    class="p-2 rounded-full text-gray-400 hover:text-[#246BFD] hover:bg-[#246BFD]/10 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
                    </svg>
                  </router-link>
                  <svg
                    class="w-6 h-6 text-[#246BFD] transition-transform duration-300"
                    :class="{ 'rotate-180': activeGuideId === guide.id }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <div v-show="activeGuideId === guide.id" class="px-6 pb-6">
                <ol class="mb-5 space-y-5 border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-3">
                  <li
                    v-for="step in guide.steps"
                    :key="step.order"
                    class="relative pl-7"
                  >
                    <span class="absolute -left-[15px] top-0 flex items-center justify-center w-7 h-7 text-xs font-bold text-white rounded-full bg-[#246BFD]">
                      {{ step.order }}
                    </span>
                    <h4 class="font-medium text-gray-900 dark:text-white">{{ step.title }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ step.description }}</p>
                  </li>
                </ol>

                <div class="flex items-start gap-3 p-4 mb-5 rounded-xl bg-[#246BFD]/5 dark:bg-[#246BFD]/10">
                  <svg class="flex-shrink-0 w-5 h-5 mt-0.5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Tip:</span> {{ guide.tip }}</p>
                </div>

                <router-link
                  :to="guide.cta.to"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-all duration-300"
                >
                  {{ guide.cta.label }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Still need help -->
      <div class="mt-16 p-8 bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 dark:from-[#246BFD]/20 dark:to-[#FE9615]/20 rounded-2xl">
        <h3 class="mb-2 text-2xl font-semibold text-center text-gray-900 dark:text-white">
          Still not sure where to start?
        </h3>
        <p class="mb-6 text-center text-gray-600 dark:text-gray-300">
          Check our FAQs or reach out — our support team is here to help 24/7.
        </p>
        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <router-link
            to="/faq"
            class="inline-flex items-center px-8 py-3 space-x-2 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>View FAQs</span>
          </router-link>
          <router-link
            to="/help"
            class="inline-flex items-center px-8 py-3 space-x-2 rounded-full bg-white text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span>Help Center</span>
          </router-link>
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
