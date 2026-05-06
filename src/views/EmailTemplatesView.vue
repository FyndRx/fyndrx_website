<script setup lang="ts">
import { ref, computed } from 'vue';
import { emailTemplates, categories, type EmailTemplate } from '@/data/emailTemplates';
import { useNotification } from '@/composables/useNotification';

const notification = useNotification();
const activeCategory = ref('all');
const expandedTemplate = ref<string | null>(null);
const copiedId = ref<string | null>(null);

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') return emailTemplates;
  return emailTemplates.filter(t => t.category === activeCategory.value);
});

const toggleExpand = (id: string) => {
  expandedTemplate.value = expandedTemplate.value === id ? null : id;
};

const copyHtml = async (template: EmailTemplate) => {
  try {
    await navigator.clipboard.writeText(template.html);
    copiedId.value = template.id;
    notification.success('Copied!', `${template.name} HTML copied to clipboard.`);
    setTimeout(() => { copiedId.value = null; }, 2000);
  } catch {
    notification.error('Copy Failed', 'Could not copy to clipboard.');
  }
};

const categoryColors: Record<string, string> = {
  authentication: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  orders: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  consultations: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  account: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-[#1A2233] via-[#0F172A] to-[#1A2233] pt-28 pb-16">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-10 left-10 w-72 h-72 bg-[#246BFD] rounded-full blur-[128px]"></div>
        <div class="absolute bottom-10 right-10 w-72 h-72 bg-[#FE9615] rounded-full blur-[128px]"></div>
      </div>
      <div class="relative px-4 mx-auto max-w-6xl text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
          <span>Developer Resources</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Email <span class="text-[#FE9615]">Templates</span>
        </h1>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Production-ready email templates for the FyndRX platform. Each template uses inline styles for maximum email client compatibility.
        </p>
        <div class="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            {{ emailTemplates.length }} Templates
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[#246BFD]"></div>
            {{ categories.length - 1 }} Categories
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-[#FE9615]"></div>
            Inline Styled
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 mx-auto max-w-6xl -mt-8 pb-16">
      <!-- Category Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none p-2 flex flex-wrap gap-2 mb-10 sticky top-20 z-20 border border-gray-100 dark:border-gray-700">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          :class="activeCategory === cat.id
            ? 'bg-gradient-to-r from-[#246BFD] to-[#1B4DBC] text-white shadow-lg shadow-blue-500/20'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          <span v-html="cat.icon"></span>
          <span>{{ cat.label }}</span>
          <span
            v-if="cat.id !== 'all'"
            class="ml-1 text-xs px-2 py-0.5 rounded-full"
            :class="activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'"
          >
            {{ emailTemplates.filter(t => t.category === cat.id).length }}
          </span>
        </button>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300"
          :class="{ 'lg:col-span-2': expandedTemplate === template.id }"
        >
          <!-- Template Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                :class="categoryColors[template.category]"
              >
                {{ template.category }}
              </span>
              <div class="min-w-0">
                <h3 class="font-bold text-gray-900 dark:text-white truncate">{{ template.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ template.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Copy Button -->
              <button
                @click="copyHtml(template)"
                class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                :class="copiedId === template.id
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-[#246BFD] hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-[#246BFD]'"
              >
                <svg v-if="copiedId !== template.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ copiedId === template.id ? 'Copied!' : 'Copy HTML' }}
              </button>
              <!-- Expand Button -->
              <button
                @click="toggleExpand(template.id)"
                class="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-all"
              >
                <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': expandedTemplate === template.id }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Subject Line Preview -->
          <div class="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2 text-sm">
            <span class="text-gray-400 font-medium">Subject:</span>
            <span class="text-gray-700 dark:text-gray-300 font-mono text-xs">{{ template.subject }}</span>
          </div>

          <!-- Email Preview -->
          <div
            class="email-preview-container overflow-hidden transition-all duration-300"
            :class="expandedTemplate === template.id ? 'max-h-none' : 'max-h-[480px]'"
          >
            <div class="p-5 bg-[#F1F5F9] dark:bg-gray-900/50">
              <div class="mx-auto" :class="expandedTemplate === template.id ? 'max-w-[620px]' : ''">
                <iframe
                  :srcdoc="template.html"
                  class="w-full border-0 rounded-lg bg-white shadow-sm"
                  :style="expandedTemplate === template.id ? 'height: 800px;' : 'height: 440px;'"
                  sandbox="allow-same-origin"
                  :title="template.name"
                ></iframe>
              </div>
            </div>
          </div>

          <!-- Fade overlay when collapsed -->
          <div
            v-if="expandedTemplate !== template.id"
            class="relative -mt-16 h-16 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"
          ></div>
        </div>
      </div>

      <!-- Usage Note -->
      <div class="mt-12 bg-gradient-to-r from-[#246BFD]/5 to-[#FE9615]/5 dark:from-[#246BFD]/10 dark:to-[#FE9615]/10 rounded-2xl p-8 border border-[#246BFD]/10 dark:border-[#246BFD]/20">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#246BFD]/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75V19a2.25 2.25 0 01-4.5 0v-.25c0-.438-.174-.858-.485-1.169l-.548-.547z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-2">Using These Templates</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
              Each template uses <strong>inline CSS styles</strong> for maximum compatibility across email clients (Gmail, Outlook, Apple Mail, etc.).
              Click <strong>"Copy HTML"</strong> on any template to grab the raw HTML, then replace the <code class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono" v-pre>{{placeholders}}</code> with dynamic data in your backend.
            </p>
            <div class="flex flex-wrap gap-2">
              <span class="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">✓ Gmail Compatible</span>
              <span class="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">✓ Outlook Compatible</span>
              <span class="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">✓ Mobile Responsive</span>
              <span class="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">✓ Dark Mode Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.email-preview-container {
  position: relative;
}

.email-preview-container iframe {
  pointer-events: none;
}

.email-preview-container:hover iframe {
  pointer-events: auto;
}
</style>
