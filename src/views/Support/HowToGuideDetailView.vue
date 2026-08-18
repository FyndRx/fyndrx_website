<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { howToUseService } from '@/services/howToUseService';
import type { HowToGuide } from '@/models/HowToGuide';

const route = useRoute();

useSeoMeta({
  title: 'How to Use FyndRx | Guide',
  description: 'A step-by-step FyndRx guide.',
  ogType: 'article',
});

const loading = ref(true);
const notFound = ref(false);
const guide = ref<HowToGuide | null>(null);
const relatedGuides = ref<HowToGuide[]>([]);
const copied = ref(false);

const slug = computed(() => route.params.slug as string);

async function loadGuide(targetSlug: string) {
  loading.value = true;
  notFound.value = false;
  guide.value = null;
  relatedGuides.value = [];
  copied.value = false;

  try {
    const result = await howToUseService.getGuideBySlug(targetSlug);
    if (!result) {
      notFound.value = true;
      return;
    }

    guide.value = result;

    // Per-guide title/description so shared links and search results show the
    // actual guide, not the generic hub page — useSeoMeta only applies once at
    // mount, before this data exists, so refresh the two tags directly here.
    document.title = `${result.title} | How to Use FyndRx`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', result.summary);

    relatedGuides.value = await howToUseService.getRelatedGuides(result);
  } catch (error) {
    console.error('Failed to load guide:', error);
    notFound.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadGuide(slug.value));

// Re-fetch when navigating from one guide's page straight to another (e.g. a
// "related guide" link) — same route, different param, no remount.
watch(slug, (newSlug) => {
  if (newSlug) loadGuide(newSlug);
});

const canShare = typeof navigator !== 'undefined' && !!navigator.share;

const share = async () => {
  if (!guide.value) return;
  const shareData = {
    title: `${guide.value.title} | FyndRx`,
    text: guide.value.summary,
    url: window.location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
    }
  } catch {
    // User cancelled the native share sheet, or clipboard access was denied —
    // either way there's nothing to recover from; the URL is still visible
    // in the address bar for manual copying.
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="px-4 py-12 mx-auto max-w-3xl sm:px-6 lg:px-8">

      <router-link
        to="/how-to-use"
        class="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#246BFD] dark:hover:text-[#5089FF] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all guides
      </router-link>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
      </div>

      <div v-else-if="notFound" class="p-10 text-center bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
        <div class="inline-flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-[#246BFD]/10">
          <svg class="w-7 h-7 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Guide not found</h1>
        <p class="mb-6 text-gray-500 dark:text-gray-400">This guide may have moved or no longer exists.</p>
        <router-link
          to="/how-to-use"
          class="inline-flex items-center px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300"
        >
          Browse all guides
        </router-link>
      </div>

      <template v-else-if="guide">
        <div class="p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="flex flex-wrap items-center gap-3 mb-3">
            <span class="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-[#246BFD]/10 text-[#246BFD]">
              {{ guide.category }}
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FE9615]/10 text-[#FE9615]">
              {{ guide.estimatedTime }}
            </span>
          </div>

          <h1 class="mb-3 text-3xl font-bold text-gray-900 dark:text-white">{{ guide.title }}</h1>
          <p class="mb-8 text-gray-600 dark:text-gray-300">{{ guide.summary }}</p>

          <ol class="mb-6 space-y-6 border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-3">
            <li v-for="step in guide.steps" :key="step.order" class="relative pl-8">
              <span class="absolute -left-[17px] top-0 flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full bg-[#246BFD]">
                {{ step.order }}
              </span>
              <h3 class="font-medium text-gray-900 dark:text-white">{{ step.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ step.description }}</p>
            </li>
          </ol>

          <div class="flex items-start gap-3 p-4 mb-8 rounded-xl bg-[#246BFD]/5 dark:bg-[#246BFD]/10">
            <svg class="flex-shrink-0 w-5 h-5 mt-0.5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p class="text-sm text-gray-700 dark:text-gray-300"><span class="font-semibold">Tip:</span> {{ guide.tip }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <router-link
              :to="guide.cta.to"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-all duration-300"
            >
              {{ guide.cta.label }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </router-link>

            <button
              type="button"
              @click="share"
              class="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 8.632a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {{ copied ? 'Link copied!' : (canShare ? 'Share' : 'Copy link') }}
            </button>
          </div>
        </div>

        <div v-if="relatedGuides.length > 0" class="mt-8">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">You might also like</h2>
          <div class="space-y-3">
            <router-link
              v-for="related in relatedGuides"
              :key="related.slug"
              :to="`/how-to-use/${related.slug}`"
              class="flex items-center justify-between gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-[#246BFD] hover:shadow-md transition-all group"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors">{{ related.title }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ related.summary }}</p>
              </div>
              <svg class="flex-shrink-0 w-5 h-5 text-gray-300 group-hover:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
