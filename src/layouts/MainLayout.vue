<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Header from '@/views/Home/landing/Header.vue';
import Footer from '@/views/Home/landing/Footer.vue';
import MaintenanceBanner from '@/components/MaintenanceBanner.vue';
import StickyBarAd from '@/components/ads/formats/StickyBarAd.vue';
import { useAds } from '@/composables/useAds';
import { useAdsStore } from '@/store/ads';

const route = useRoute();
const adsStore = useAdsStore();
adsStore.load();

const routeName = computed(() => (route.name as string) ?? '');

const STICKY_EXCLUDED = ['checkout', 'cart', 'payment-callback'];
const showSticky = computed(() => !STICKY_EXCLUDED.includes(routeName.value));

const { resolved: stickyAd } = useAds({
  zone: 'Z9-mobile-sticky',
  route: routeName.value,
  isAuthed: false,
});
</script>

<script lang="ts">
export default {
  name: 'MainLayout'
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <MaintenanceBanner />
    <Header />
    <main class="flex-grow">
      <slot></slot>
    </main>
    <Footer />

    <!-- Z9: Global mobile sticky ad -->
    <StickyBarAd
      v-if="stickyAd && showSticky"
      :ad="stickyAd"
      zone="Z9-mobile-sticky"
    />
  </div>
</template>

<style scoped>
/* Component-specific styles will go here */
</style> 