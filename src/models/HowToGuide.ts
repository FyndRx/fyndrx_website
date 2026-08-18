export interface HowToCategory {
  id: string | number;
  name: string;
  slug: string;
  icon: string;
}

export interface HowToStep {
  order: number;
  title: string;
  description: string;
}

export interface HowToGuideCta {
  label: string;
  to: string;
}

export interface HowToGuide {
  id: string | number;
  slug: string;
  category: string;
  order: number;
  title: string;
  summary: string;
  estimatedTime: string;
  steps: HowToStep[];
  tip: string;
  cta: HowToGuideCta;
}

export interface HowToQuickStartItem {
  order: number;
  title: string;
  description: string;
  icon: string;
}

export interface HowToUseData {
  categories: HowToCategory[];
  quickStart: HowToQuickStartItem[];
  guides: HowToGuide[];
}

export interface HowToGuideFilters {
  category?: string;
  query?: string;
}
