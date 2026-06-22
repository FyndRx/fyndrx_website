export type AdFormat =
  | 'hero-banner'
  | 'inline-feed'
  | 'sidebar'
  | 'native-card'
  | 'sticky-bar'
  | 'spotlight-card';

export type AdZoneId =
  | 'Z1-hero-carousel'
  | 'Z2-home-midfeed'
  | 'Z3-meds-inline'
  | 'Z4-pharma-inline'
  | 'Z5-med-detail-sidebar'
  | 'Z6-dashboard-spotlight'
  | 'Z7-post-checkout'
  | 'Z8-blog-inline'
  | 'Z9-mobile-sticky';

export type AdTier = 'featured' | 'standard' | 'basic';

export type AdStatus = 'active' | 'paused' | 'scheduled' | 'expired';

export interface AdCreative {
  headline: string;
  subline?: string;
  imageUrl?: string;
  logoUrl?: string;
  accentColor?: string;
  cta: {
    label: string;
    href: string;
    external?: boolean;
  };
}

export interface AdTargeting {
  zones: AdZoneId[];
  routes: string[];
  authRequired?: boolean | null;
  categoryTags?: string[];
  excludeRoutes?: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface Ad {
  id: string;
  advertiser: string;
  tier: AdTier;
  format: AdFormat;
  priority: number;
  isActive: boolean;
  status: AdStatus;
  creative: AdCreative;
  targeting: AdTargeting;
  analytics: {
    impressionEvent: string;
    clickEvent: string;
  };
}

export interface AdsDataFile {
  version: string;
  updatedAt: string;
  ads: Ad[];
}

export interface AdResolveContext {
  zone: AdZoneId;
  route: string;
  isAuthed: boolean;
  categoryTags?: string[];
}
