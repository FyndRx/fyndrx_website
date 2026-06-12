<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { informationService, type HelpCategory, type AppSettings } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Help Center | FyndRx',
  description: 'Get help with FyndRx — find answers about ordering medications, uploading prescriptions, delivery, payments, consultations, and account management.',
  keywords: 'FyndRx help, support center, FAQs, medication ordering help, prescription upload guide',
  ogType: 'website',
});

const categories = ref<HelpCategory[]>([]);
const appSettings = ref<AppSettings | null>(null);
const loading = ref(true);
const activeFaq = ref<{ categoryIndex: number, articleIndex: number } | null>(null);
const searchQuery = ref('');

onMounted(async () => {
  try {
    const [helpData, settings] = await Promise.all([
      informationService.getHelpCenter(),
      informationService.getAppSettings(),
    ]);
    categories.value = helpData;
    appSettings.value = settings;
  } catch (error) {
    console.error('Failed to load help center:', error);
  } finally {
    loading.value = false;
  }
});

const toggleFaq = (categoryIndex: number, articleIndex: number) => {
  if (activeFaq.value?.categoryIndex === categoryIndex && activeFaq.value?.articleIndex === articleIndex) {
    activeFaq.value = null;
  } else {
    activeFaq.value = { categoryIndex, articleIndex };
  }
};

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value;
  const query = searchQuery.value.toLowerCase();
  
  return categories.value.map(category => ({
    ...category,
    articles: category.articles.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.content.toLowerCase().includes(query)
    )
  })).filter(category => category.articles.length > 0);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

    <!-- Hero -->
    <div class="py-16 bg-gradient-to-br from-[#246BFD] to-[#5089FF]">
      <div class="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-white mb-3">Help Center</h1>
        <p class="text-blue-100 text-lg mb-8">Find answers, guides, and support for everything on FyndRx.</p>
        <!-- Search Bar -->
        <div class="relative max-w-xl mx-auto">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search for help articles..."
            class="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-base shadow-lg"
          />
        </div>
      </div>
    </div>

    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 py-12">

      <!-- Help Content -->
      <div class="max-w-3xl mx-auto">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
        </div>

        <div v-else-if="filteredCategories.length === 0" class="text-center py-12 text-gray-500">
          No help articles found.
        </div>

        <div v-else v-for="(category, cIndex) in filteredCategories" :key="category.id" class="mb-10">
          <h2 class="mb-6 text-2xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-100 dark:border-gray-800">
            {{ category.name }}
          </h2>
          <div class="space-y-4">
            <div
              v-for="(article, aIndex) in category.articles"
              :key="article.id"
              class="transition-all duration-300 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-md"
            >
              <button
                @click="toggleFaq(cIndex, aIndex)"
                class="w-full px-6 py-4 text-left focus:outline-none"
              >
                <div class="flex items-center justify-between">
                  <span class="text-lg font-medium text-gray-900 dark:text-white">{{ article.title }}</span>
                  <svg
                    class="w-5 h-5 text-gray-500 transition-transform duration-300 transform dark:text-gray-400"
                    :class="{ 'rotate-180': activeFaq?.categoryIndex === cIndex && activeFaq?.articleIndex === aIndex }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div
                v-show="activeFaq?.categoryIndex === cIndex && activeFaq?.articleIndex === aIndex"
                class="px-6 pb-4 text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none"
                v-html="article.content"
              >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support -->
      <div class="max-w-3xl mx-auto mt-12">
        <div class="bg-gradient-to-br from-[#246BFD]/5 to-[#FE9615]/5 dark:from-[#246BFD]/10 dark:to-[#FE9615]/10 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
          <h2 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Still Need Help?</h2>
          <p class="mb-8 text-gray-600 dark:text-gray-300">
            Our support team is available 24/7 to assist you. Reach out through any of the channels below.
          </p>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              :href="'mailto:' + (appSettings?.contact.email || 'support@fyndrx.com')"
              class="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:shadow-md transition-all group text-center"
            >
              <div class="w-12 h-12 rounded-full bg-[#246BFD]/10 flex items-center justify-center group-hover:bg-[#246BFD]/20 transition-colors">
                <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white text-sm">Email Support</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ appSettings?.contact.email || 'support@fyndrx.com' }}</p>
              </div>
            </a>

            <a
              :href="'tel:' + (appSettings?.contact.phone || '+233530510839')"
              class="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#FE9615] hover:shadow-md transition-all group text-center"
            >
              <div class="w-12 h-12 rounded-full bg-[#FE9615]/10 flex items-center justify-center group-hover:bg-[#FE9615]/20 transition-colors">
                <svg class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white text-sm">Phone Support</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ appSettings?.contact.phone || '+233 53 051 0839' }}</p>
              </div>
            </a>

            <router-link
              to="/report"
              class="flex flex-col items-center gap-3 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-400 hover:shadow-md transition-all group text-center"
            >
              <div class="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900 dark:text-white text-sm">Report a Problem</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Submit a bug or complaint</p>
              </div>
            </router-link>
          </div>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Business hours: {{ appSettings?.contact.hours || 'Mon – Sat, 8:00 AM – 8:00 PM' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 