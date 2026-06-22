<script setup lang="ts">
import { ref, computed } from 'vue';
import { emailTemplates } from '@/data/emailTemplates';

const selectedId = ref(emailTemplates[0].id);
const viewMode = ref<'desktop' | 'mobile'>('desktop');

const selectedTemplate = computed(() => 
  emailTemplates.find(t => t.id === selectedId.value) || emailTemplates[0]
);

const selectTemplate = (id: string) => {
  selectedId.value = id;
};
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-2">Email Gallery</h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">Premium communication templates for the FyndRx ecosystem.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-3 space-y-4">
          <div
            v-for="template in emailTemplates"
            :key="template.id"
            @click="selectTemplate(template.id)"
            class="group p-5 rounded-2xl cursor-pointer transition-all duration-300 border"
            :class="selectedId === template.id
              ? 'bg-white dark:bg-gray-800 border-[#246BFD] shadow-lg shadow-blue-500/10'
              : 'bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'"
          >
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-bold transition-colors" :class="selectedId === template.id ? 'text-[#246BFD]' : 'text-gray-900 dark:text-white'">
                {{ template.name }}
              </h3>
              <div v-if="selectedId === template.id" class="w-2 h-2 rounded-full bg-[#246BFD]"></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {{ template.description }}
            </p>
          </div>
        </div>

        <!-- Preview Area -->
        <div class="lg:col-span-9">
          <div class="bg-[#0F172A] rounded-[2.5rem] p-4 shadow-2xl overflow-hidden ring-8 ring-gray-100 dark:ring-gray-700">
            <!-- Simulator Header -->
            <div class="flex items-center justify-between mb-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
              <div class="flex gap-2">
                <div class="w-3.5 h-3.5 rounded-full bg-red-500/80"></div>
                <div class="w-3.5 h-3.5 rounded-full bg-yellow-500/80"></div>
                <div class="w-3.5 h-3.5 rounded-full bg-green-500/80"></div>
              </div>

              <div class="flex bg-white/10 rounded-xl p-1">
                <button
                  @click="viewMode = 'mobile'"
                  class="p-2 rounded-lg transition-all"
                  :class="viewMode === 'mobile' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-white/60 hover:text-white'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </button>
                <button
                  @click="viewMode = 'desktop'"
                  class="p-2 rounded-lg transition-all"
                  :class="viewMode === 'desktop' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-white/60 hover:text-white'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>

              <div class="text-xs font-bold text-white/40 uppercase tracking-widest hidden sm:block">
                {{ selectedTemplate.subject }}
              </div>
            </div>

            <!-- Frame -->
            <div
              class="relative transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] mx-auto bg-white rounded-2xl overflow-hidden shadow-inner"
              :style="{ width: viewMode === 'mobile' ? '375px' : '100%', height: '800px' }"
            >
              <iframe
                :srcdoc="selectedTemplate.html"
                class="w-full h-full border-0"
                sandbox="allow-same-origin"
              ></iframe>
            </div>
          </div>

          <!-- Template Info -->
          <div class="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
            <div>
              <span class="text-[10px] uppercase tracking-widest font-bold text-[#246BFD] bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/40">Active Template</span>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ selectedTemplate.name }}</h2>
            </div>
            <div class="flex gap-3">
              <button class="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Copy HTML
              </button>
              <button class="px-6 py-3 bg-[#246BFD] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                Send Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

iframe {
  background-color: white;
}
</style>
