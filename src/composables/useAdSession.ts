// Session-level ad frequency capping (in-memory, no persistence).
// Counts impressions per ad id per session, respects per-zone caps.

const impressions = new Map<string, number>();
const dismissed = new Set<string>();

const ZONE_CAPS: Record<string, number> = {
  'Z6-dashboard-spotlight': 1,
  'Z7-post-checkout': 1,
  'Z9-mobile-sticky': 1,
};

export function useAdSession() {
  const recordImpression = (adId: string, zone: string) => {
    impressions.set(adId, (impressions.get(adId) ?? 0) + 1);
    // Emit analytics event (console stub — swap for real analytics)
    console.debug(`[ad:impression] ${adId} zone=${zone}`);
  };

  const recordClick = (adId: string, zone: string) => {
    console.debug(`[ad:click] ${adId} zone=${zone}`);
  };

  const dismiss = (adId: string) => {
    dismissed.add(adId);
  };

  const isDismissed = (adId: string) => dismissed.has(adId);

  const isOverCap = (adId: string, zone: string) => {
    const cap = ZONE_CAPS[zone];
    if (!cap) return false;
    return (impressions.get(adId) ?? 0) >= cap;
  };

  return { recordImpression, recordClick, dismiss, isDismissed, isOverCap };
}
