import type { HowToUseData, HowToCategory, HowToGuide, HowToGuideFilters, HowToQuickStartItem } from '@/models/HowToGuide';
import { apiService } from './api';
import howToUseData from '@/data/howToUse.json';

let bundlePromise: Promise<HowToUseData> | null = null;

/**
 * Fetches the full how-to-use content bundle once per session and shares it across
 * getCategories/getQuickStart/getGuides — all three come from the same /how-to-use
 * endpoint, so there's no reason to hit the network three times. Falls back to the
 * bundled static JSON (the original mock content, now also the seed data behind the
 * live API) if the backend is unreachable, so the page still works during an outage.
 */
async function fetchBundle(): Promise<HowToUseData> {
  if (!bundlePromise) {
    bundlePromise = apiService.get<HowToUseData>('/how-to-use').catch((err) => {
      console.error('How to Use API unavailable, falling back to bundled content:', err);
      bundlePromise = null; // let the next call retry the API instead of caching the outage forever
      return howToUseData as HowToUseData;
    });
  }
  return bundlePromise;
}

export const howToUseService = {
  async getCategories(): Promise<HowToCategory[]> {
    return (await fetchBundle()).categories;
  },

  async getQuickStart(): Promise<HowToQuickStartItem[]> {
    return [...(await fetchBundle()).quickStart].sort((a, b) => a.order - b.order);
  },

  async getGuides(filters?: HowToGuideFilters): Promise<HowToGuide[]> {
    let guides = (await fetchBundle()).guides;

    if (filters?.category) {
      guides = guides.filter(g => g.category === filters.category);
    }

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      guides = guides.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.summary.toLowerCase().includes(query) ||
        g.steps.some(s => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
      );
    }

    return [...guides].sort((a, b) => a.order - b.order);
  },

  /**
   * A single guide by slug, for deep-linkable/shareable guide pages. Tries the
   * live endpoint first (so a guide edited in the admin panel shows up right away
   * without waiting for the whole bundle to be refetched); falls back to whatever
   * bundle is already loaded/cached if the direct lookup fails for any reason
   * other than a genuine 404.
   */
  async getGuideBySlug(slug: string): Promise<HowToGuide | null> {
    try {
      return await apiService.get<HowToGuide>(`/how-to-use/${slug}`);
    } catch (err: any) {
      if (err?.status === 404) return null;
      console.error('How to Use guide lookup failed, checking bundled fallback:', err);
      return (await fetchBundle()).guides.find(g => g.slug === slug) || null;
    }
  },

  /**
   * Up to `limit` other guides in the same category — powers a "related guides"
   * section on the single-guide detail page.
   */
  async getRelatedGuides(guide: HowToGuide, limit = 3): Promise<HowToGuide[]> {
    const guides = await this.getGuides({ category: guide.category });
    return guides.filter(g => g.slug !== guide.slug).slice(0, limit);
  },
};
