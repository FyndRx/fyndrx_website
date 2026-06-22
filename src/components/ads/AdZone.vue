<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdsStore } from '@/store/ads';
import { useAds } from '@/composables/useAds';
import type { AdZoneId } from '@/types/Ad';

import HeroBannerAd from '@/components/ads/formats/HeroBannerAd.vue';
import InlineFeedAd from '@/components/ads/formats/InlineFeedAd.vue';
import SidebarAd from '@/components/ads/formats/SidebarAd.vue';
import NativeCardAd from '@/components/ads/formats/NativeCardAd.vue';
import StickyBarAd from '@/components/ads/formats/StickyBarAd.vue';
import SpotlightCardAd from '@/components/ads/formats/SpotlightCardAd.vue';

const FORMAT_COMPONENTS = {
  'hero-banner': HeroBannerAd,
  'inline-feed': InlineFeedAd,
  'sidebar': SidebarAd,
  'native-card': NativeCardAd,
  'sticky-bar': StickyBarAd,
  'spotlight-card': SpotlightCardAd,
} as const;

const props = defineProps<{
  zone: AdZoneId;
  route: string;
  categoryTags?: string[];
  class?: string;
}>();

const adsStore = useAdsStore();
const { resolved } = useAds({
  zone: props.zone,
  route: props.route,
  isAuthed: false, // resolved live inside useAds from authStore
  categoryTags: props.categoryTags,
});

onMounted(() => adsStore.load());
</script>

<template>
  <div v-if="resolved" :class="props.class">
    <component
      :is="FORMAT_COMPONENTS[resolved.format]"
      :ad="resolved"
      :zone="zone"
    />
  </div>
</template>
