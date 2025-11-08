<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'search' | 'noitems' | 'favorites' | 'history' | 'general';
  message?: string;
  actionText?: string;
  showAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'general',
  showAction: true
});

const emit = defineEmits<{
  action: [];
}>();

const emptyConfig = computed(() => {
  const configs = {
    search: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>`,
      title: 'No results found',
      defaultMessage: 'Try adjusting your search or filter criteria to find what you\'re looking for.',
      defaultAction: 'Clear Filters',
      illustration: '🔍'
    },
    noitems: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>`,
      title: 'Nothing here yet',
      defaultMessage: 'Start exploring to add items to your collection.',
      defaultAction: 'Browse Items',
      illustration: '📦'
    },
    favorites: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>`,
      title: 'No favorites yet',
      defaultMessage: 'Save your favorite medications and pharmacies for quick access.',
      defaultAction: 'Browse Medications',
      illustration: '❤️'
    },
    history: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>`,
      title: 'No history yet',
      defaultMessage: 'Your recently viewed items will appear here.',
      defaultAction: 'Start Browsing',
      illustration: '🕐'
    },
    general: {
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`,
      title: 'Nothing to show',
      defaultMessage: 'There are no items to display at this time.',
      defaultAction: 'Go Back',
      illustration: '📄'
    }
  };
  return configs[props.type];
});

const displayMessage = computed(() => props.message || emptyConfig.value.defaultMessage);
const displayAction = computed(() => props.actionText || emptyConfig.value.defaultAction);
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[300px] py-12 px-4 text-center">
    <div class="mb-4 text-6xl">
      {{ emptyConfig.illustration }}
    </div>
    
    <svg 
      class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      v-html="emptyConfig.icon"
    ></svg>
    
    <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
      {{ emptyConfig.title }}
    </h3>
    
    <p class="mb-6 text-sm text-gray-600 dark:text-gray-400 max-w-md">
      {{ displayMessage }}
    </p>
    
    <button
      v-if="showAction"
      @click="emit('action')"
      class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      {{ displayAction }}
    </button>
  </div>
</template>

