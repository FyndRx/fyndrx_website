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
    class="relative overflow-hidden rounded-2xl border group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-white dark:bg-gray-800"
    :style="{ borderColor: accent + '33' }"
  >
    <!-- Image -->
    <div v-if="ad.creative.imageUrl" class="relative h-36 overflow-hidden">
      <img
        :src="ad.creative.imageUrl"
        :alt="ad.creative.headline"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div class="absolute bottom-3 left-3">
        <AdLabel variant="sponsored" />
      </div>
    </div>

    <!-- Body -->
    <div class="p-4">
      <p class="text-[10px] font-bold uppercase tracking-widest mb-1.5" :style="{ color: accent }">
        {{ ad.advertiser }}
      </p>
      <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-2">
        {{ ad.creative.headline }}
      </h4>
      <p v-if="ad.creative.subline" class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
        {{ ad.creative.subline }}
      </p>

      <a
        :href="ad.creative.cta.href"
        :target="ad.creative.cta.external ? '_blank' : undefined"
        :rel="ad.creative.cta.external ? 'noopener noreferrer' : undefined"
        class="block w-full py-2.5 rounded-xl text-xs font-bold text-white text-center transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95"
        :style="{ backgroundColor: accent }"
        @click="handleClick"
      >
        {{ ad.creative.cta.label }}
      </a>
    </div>

    <!-- Bottom accent bar -->
    <div class="h-0.5 w-full" :style="{ backgroundColor: accent }"></div>
  </div>
</template>
