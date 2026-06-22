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
    class="relative overflow-hidden rounded-2xl group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    :style="{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`, border: `1px solid ${accent}30` }"
  >
    <!-- Background image with overlay -->
    <div v-if="ad.creative.imageUrl" class="absolute inset-0">
      <img
        :src="ad.creative.imageUrl"
        :alt="ad.creative.headline"
        class="w-full h-full object-cover opacity-15 group-hover:opacity-20 transition-opacity duration-500"
      />
      <div class="absolute inset-0" :style="{ background: `linear-gradient(135deg, ${accent}22, transparent)` }"></div>
    </div>

    <!-- Glow orbs -->
    <div
      class="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20"
      :style="{ backgroundColor: accent }"
    ></div>
    <div
      class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-10"
      :style="{ backgroundColor: accent }"
    ></div>

    <div class="relative z-10 p-6 md:p-7">
      <!-- Header row -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <AdLabel variant="sponsored" />
          <p class="mt-2 text-[11px] font-bold uppercase tracking-widest" :style="{ color: accent }">
            {{ ad.advertiser }}
          </p>
        </div>
        <!-- Accent icon -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: accent + '22', border: `1px solid ${accent}44` }"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" :style="{ color: accent }">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
      </div>

      <!-- Headline + subline -->
      <h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-snug mb-2">
        {{ ad.creative.headline }}
      </h3>
      <p v-if="ad.creative.subline" class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
        {{ ad.creative.subline }}
      </p>

      <!-- CTA -->
      <a
        :href="ad.creative.cta.href"
        :target="ad.creative.cta.external ? '_blank' : undefined"
        :rel="ad.creative.cta.external ? 'noopener noreferrer' : undefined"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
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
