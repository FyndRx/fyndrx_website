import { computed, getCurrentScope, onScopeDispose, ref } from 'vue';
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

type Session = ReturnType<typeof useAdSession>;

/** Everything that decides whether an ad may run in a zone, independent of ranking. */
function isEligible(ad: Ad, ctx: AdResolveContext, isAuthed: boolean, session: Session): boolean {
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
}

/** Contextual match score (desc), then priority (desc). */
const byRelevance = (ctx: AdResolveContext) => (a: Ad, b: Ad) => {
  const scoreDiff = contextScore(b, ctx) - contextScore(a, ctx);
  return scoreDiff !== 0 ? scoreDiff : b.priority - a.priority;
};

function pickTop(
  ads: Ad[],
  ctx: AdResolveContext,
  isAuthed: boolean,
  session: Session,
  exclude: ReadonlySet<string> = new Set(),
): Ad | null {
  const candidates = ads
    .filter(ad => !exclude.has(ad.id) && isEligible(ad, ctx, isAuthed, session))
    .sort(byRelevance(ctx));
  return candidates[0] ?? null;
}

// ── Page-level de-duplication ────────────────────────────────────────────────
// A backend ad can target several zones on one route, and each zone picks its best ad independently,
// so the same ad could be shown twice on a page. Zones therefore register themselves here, and a zone
// skips any ad already being shown by a more prominent zone on the same route. Prominence follows the
// zone number (Z1 beats Z2 …). An ad that is the only candidate still shows once, in the top zone.
interface ZoneRegistration {
  id: number;
  ctx: AdResolveContext;
}

// Entries are compared by id (not identity): items read back from a reactive array are proxies.
let nextRegistrationId = 0;
const registry = ref<ZoneRegistration[]>([]);
const zoneRank = (zone: string) => Number(/^Z(\d+)/.exec(zone)?.[1] ?? 99);

function adsTakenByMoreProminentZones(
  ctx: AdResolveContext,
  ads: Ad[],
  isAuthed: boolean,
  session: Session,
): Set<string> {
  const taken = new Set<string>();
  const seenZones = new Set<string>();
  const higher = registry.value
    .map(r => r.ctx)
    .filter(c => c.route === ctx.route && zoneRank(c.zone) < zoneRank(ctx.zone))
    .sort((a, b) => zoneRank(a.zone) - zoneRank(b.zone));

  for (const zoneCtx of higher) {
    if (seenZones.has(zoneCtx.zone)) continue;
    seenZones.add(zoneCtx.zone);
    const ad = pickTop(ads, zoneCtx, isAuthed, session, taken);
    if (ad) taken.add(ad.id);
  }
  return taken;
}

/**
 * Resolve the single best ad for a zone.
 * Pass `allowRepeat: true` in the context to opt a zone out of page-level de-duplication.
 */
export function useAds(ctx: AdResolveContext & { allowRepeat?: boolean }) {
  const adsStore = useAdsStore();
  const authStore = useAuthStore();
  const session = useAdSession();

  const registrationId = nextRegistrationId++;
  registry.value.push({ id: registrationId, ctx });
  if (getCurrentScope()) {
    onScopeDispose(() => {
      registry.value = registry.value.filter(r => r.id !== registrationId);
    });
  }

  const resolved = computed((): Ad | null => {
    const isAuthed = authStore.isAuthenticated;
    const exclude = ctx.allowRepeat
      ? new Set<string>()
      : adsTakenByMoreProminentZones(ctx, adsStore.ads, isAuthed, session);
    return pickTop(adsStore.ads, ctx, isAuthed, session, exclude);
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
      .filter(ad => isEligible(ad, ctx, isAuthed, session))
      .sort(byRelevance(ctx))
      .slice(0, limit);
  });

  return { resolvedMany };
}
