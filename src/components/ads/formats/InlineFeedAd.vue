<script setup lang="ts">
import { onMounted } from 'vue';
import type { Ad } from '@/types/Ad';
import { useAdSession } from '@/composables/useAdSession';
import AdLabel from '@/components/ads/AdLabel.vue';

const props = defineProps<{ ad: Ad; zone: string }>();
const session = useAdSession();

onMounted(() => session.recordImpression(props.ad.id, props.zone));
const handleClick = () => session.recordClick(props.ad.id, props.zone);

const accent = props.ad.creative.accentColor ?? '#246BFD';
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border flex flex-col sm:flex-row gap-0 group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white dark:bg-gray-800"
    :style="{ borderColor: accent + '33' }"
  >
    <!-- Left accent stripe -->
    <div class="w-full sm:w-1 sm:h-auto h-1 flex-shrink-0 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none transition-all"
      :style="{ backgroundColor: accent }"></div>

    <!-- Image -->
    <div v-if="ad.creative.imageUrl" class="sm:w-40 md:w-48 flex-shrink-0 overflow-hidden">
      <img
        :src="ad.creative.imageUrl"
        :alt="ad.creative.headline"
        class="w-full h-32 sm:h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>

    <!-- Text -->
    <div class="flex-1 flex flex-col justify-between p-4 md:p-5">
      <div>
        <div class="flex items-start justify-between gap-3 mb-2">
          <p class="text-[10px] font-bold uppercase tracking-widest" :style="{ color: accent }">
            {{ ad.advertiser }}
          </p>
          <AdLabel variant="sponsored" />
        </div>
        <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-1">
          {{ ad.creative.headline }}
        </h4>
        <p v-if="ad.creative.subline" class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {{ ad.creative.subline }}
        </p>
      </div>

      <div class="mt-3">
        <a
          :href="ad.creative.cta.href"
          :target="ad.creative.cta.external ? '_blank' : undefined"
          :rel="ad.creative.cta.external ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-200 hover:gap-2.5"
          :style="{ color: accent }"
          @click="handleClick"
        >
          {{ ad.creative.cta.label }}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>
