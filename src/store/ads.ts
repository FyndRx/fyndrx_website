import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ad } from '@/types/Ad';
import { adsService } from '@/services/adsService';

const CACHE_KEY = 'fyndrx:ads-cache';
const REFRESH_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

interface AdsCache {
  ads: Ad[];
  cachedAt: number;
}

function readCache(): Ad[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdsCache;
    return parsed.ads ?? null;
  } catch {
    return null;
  }
}

function writeCache(ads: Ad[]): void {
  try {
    const cache: AdsCache = { ads, cachedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage unavailable/full — in-memory state still works
  }
}

export const useAdsStore = defineStore('ads', () => {
  const ads = ref<Ad[]>([]);
  const loaded = ref(false);
  const lastFetchedAt = ref(0);
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const load = async (force = false) => {
    if (!force && loaded.value && Date.now() - lastFetchedAt.value < REFRESH_INTERVAL_MS) {
      return;
    }
    try {
      const data = await adsService.getAds();
      ads.value = data.ads ?? [];
      lastFetchedAt.value = Date.now();
      writeCache(ads.value);
    } catch {
      // Network failure: fall back to last cached response if we don't
      // already have one in memory; otherwise fail closed (no ads).
      if (!loaded.value) {
        ads.value = readCache() ?? [];
      }
    } finally {
      loaded.value = true;
    }
  };

  // Call once at app startup to keep the catalog fresh without polling
  // tightly — refetches on an interval and whenever the app regains focus.
  const initAutoRefresh = () => {
    if (refreshTimer) return;
    refreshTimer = setInterval(() => load(), REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') load();
    });
  };

  return { ads, loaded, load, initAutoRefresh };
});
