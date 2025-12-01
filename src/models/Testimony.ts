export interface Testimony {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string | null;
  rating: number;
  testimony: string;
  date: string;
  verified: boolean;
  featured: boolean;
}

export interface TestimonyFilters {
  featured?: boolean;
  minRating?: number;
  location?: string;
  role?: string;
}

export interface TestimonyStats {
  total: number;
  averageRating: number;
  verifiedCount: number;
  featuredCount: number;
}

