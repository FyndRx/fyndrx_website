import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ad } from '@/types/Ad';

export const useAdsStore = defineStore('ads', () => {
  const ads = ref<Ad[]>([]);
  const loaded = ref(false);

  const load = async () => {
    if (loaded.value) return;
    try {
      const data = await import('@/data/ads.json');
      ads.value = (data.ads ?? []) as Ad[];
    } catch {
      ads.value = [];
    } finally {
      loaded.value = true;
    }
  };

  return { ads, loaded, load };
});
