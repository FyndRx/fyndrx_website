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
  <a
    :href="ad.creative.cta.href"
    :target="ad.creative.cta.external ? '_blank' : undefined"
    :rel="ad.creative.cta.external ? 'noopener noreferrer' : undefined"
    class="h-full flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 bg-white dark:bg-gray-800 group cursor-pointer"
    :style="{ borderColor: accent + '55' }"
    @click="handleClick"
  >
    <!-- Image -->
    <div class="relative h-44 overflow-hidden flex-shrink-0">
      <img
        v-if="ad.creative.imageUrl"
        :src="ad.creative.imageUrl"
        :alt="ad.creative.headline"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="w-full h-full" :style="{ background: `linear-gradient(135deg, ${accent}22, ${accent}44)` }"></div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

      <!-- Top-right: AdLabel -->
      <div class="absolute top-3 right-3">
        <AdLabel variant="promoted" />
      </div>

      <!-- Bottom accent pill -->
      <div class="absolute bottom-3 left-3">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow"
          :style="{ backgroundColor: accent }"
        >
          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
          </svg>
          {{ ad.advertiser }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col p-5 gap-3">
      <div>
        <h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight">
          {{ ad.creative.headline }}
        </h3>
        <p v-if="ad.creative.subline" class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {{ ad.creative.subline }}
        </p>
      </div>

      <div class="mt-auto pt-2">
        <span
          class="inline-flex items-center gap-1.5 text-xs font-bold transition-all duration-200 group-hover:gap-2.5"
          :style="{ color: accent }"
        >
          {{ ad.creative.cta.label }}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </span>
      </div>
    </div>

    <!-- Bottom accent line -->
    <div class="h-0.5" :style="{ backgroundColor: accent }"></div>
  </a>
</template>
