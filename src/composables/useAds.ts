import { computed } from 'vue';
import { useAdsStore } from '@/store/ads';
import { useAuthStore } from '@/store/auth';
import { useAdSession } from '@/composables/useAdSession';
import type { Ad, AdResolveContext } from '@/types/Ad';

const today = () => new Date().toISOString().slice(0, 10);

function isDateActive(ad: Ad): boolean {
  const t = today();
  return t >= ad.targeting.dateRange.start && t <= ad.targeting.dateRange.end;
}

function contextScore(ad: Ad, ctx: AdResolveContext): number {
  const tags = ctx.categoryTags ?? [];
  if (!tags.length || !ad.targeting.categoryTags?.length) return 0;
  return ad.targeting.categoryTags.filter(t => tags.includes(t)).length;
}

export function useAds(ctx: AdResolveContext) {
  const adsStore = useAdsStore();
  const authStore = useAuthStore();
  const session = useAdSession();

  const resolved = computed((): Ad | null => {
    const isAuthed = authStore.isAuthenticated;

    const candidates = adsStore.ads.filter(ad => {
      if (!ad.isActive) return false;
      if (!isDateActive(ad)) return false;
      if (!ad.targeting.zones.includes(ctx.zone)) return false;
      if (!ad.targeting.routes.includes(ctx.route)) return false;
      if (ad.targeting.excludeRoutes?.includes(ctx.route)) return false;
      if (ad.targeting.authRequired === true && !isAuthed) return false;
      if (ad.targeting.authRequired === false && isAuthed) return false;
      if (session.isDismissed(ad.id)) return false;
      if (session.isOverCap(ad.id, ctx.zone)) return false;
      return true;
    });

    if (!candidates.length) return null;

    // Sort: contextual match score (desc) then priority (desc)
    candidates.sort((a, b) => {
      const scoreDiff = contextScore(b, ctx) - contextScore(a, ctx);
      return scoreDiff !== 0 ? scoreDiff : b.priority - a.priority;
    });

    return candidates[0];
  });

  return { resolved };
}

// Resolve multiple ads for a zone (e.g. inject 2 native cards)
export function useAdsMulti(ctx: AdResolveContext, limit = 2) {
  const adsStore = useAdsStore();
  const authStore = useAuthStore();
  const session = useAdSession();

  const resolvedMany = computed((): Ad[] => {
    const isAuthed = authStore.isAuthenticated;

    return adsStore.ads
      .filter(ad => {
        if (!ad.isActive) return false;
        if (!isDateActive(ad)) return false;
        if (!ad.targeting.zones.includes(ctx.zone)) return false;
        if (!ad.targeting.routes.includes(ctx.route)) return false;
        if (ad.targeting.excludeRoutes?.includes(ctx.route)) return false;
        if (ad.targeting.authRequired === true && !isAuthed) return false;
        if (ad.targeting.authRequired === false && isAuthed) return false;
        if (session.isDismissed(ad.id)) return false;
        if (session.isOverCap(ad.id, ctx.zone)) return false;
        return true;
      })
      .sort((a, b) => {
        const scoreDiff = contextScore(b, ctx) - contextScore(a, ctx);
        return scoreDiff !== 0 ? scoreDiff : b.priority - a.priority;
      })
      .slice(0, limit);
  });

  return { resolvedMany };
}
