<script setup lang="ts">
import { onMounted } from 'vue';
import type { Ad } from '@/types/Ad';
import { useAdSession } from '@/composables/useAdSession';
import AdLabel from '@/components/ads/AdLabel.vue';

const props = defineProps<{ ad: Ad; zone: string }>();
const session = useAdSession();

onMounted(() => session.recordImpression(props.ad.id, props.zone));

const handleClick = () => {
  session.recordClick(props.ad.id, props.zone);
};

const accent = props.ad.creative.accentColor ?? '#246BFD';
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl min-h-[260px] md:min-h-[320px] flex items-end group">
    <!-- Background image -->
    <div
      class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
      :style="{ backgroundImage: ad.creative.imageUrl ? `url(${ad.creative.imageUrl})` : 'none', backgroundColor: accent + '33' }"
    ></div>

    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

    <!-- Accent glow -->
    <div
      class="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"
      :style="{ backgroundColor: accent }"
    ></div>

    <!-- AdLabel top-left -->
    <div class="absolute top-4 left-4 z-10">
      <AdLabel variant="sponsored" />
    </div>

    <!-- Content -->
    <div class="relative z-10 p-6 md:p-8 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div class="max-w-lg">
        <p class="text-xs font-semibold uppercase tracking-widest mb-2" :style="{ color: accent }">
          {{ ad.advertiser }}
        </p>
        <h3 class="text-xl md:text-2xl font-bold text-white leading-snug">
          {{ ad.creative.headline }}
        </h3>
        <p v-if="ad.creative.subline" class="mt-2 text-sm text-white/70 leading-relaxed">
          {{ ad.creative.subline }}
        </p>
      </div>

      <a
        :href="ad.creative.cta.href"
        :target="ad.creative.cta.external ? '_blank' : undefined"
        :rel="ad.creative.cta.external ? 'noopener noreferrer' : undefined"
        class="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 whitespace-nowrap"
        :style="{ backgroundColor: accent }"
        @click="handleClick"
      >
        {{ ad.creative.cta.label }}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
      </a>
    </div>
  </div>
</template>
