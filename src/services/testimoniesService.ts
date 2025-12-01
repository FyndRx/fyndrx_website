import type { Testimony, TestimonyFilters, TestimonyStats } from '@/models/Testimony';
import testimoniesData from '@/data/testimonies.json';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const testimoniesService = {
  async getTestimonies(filters?: TestimonyFilters): Promise<Testimony[]> {
    await delay(300);
    
    let testimonies = testimoniesData as Testimony[];
    
    if (filters?.featured !== undefined) {
      testimonies = testimonies.filter(t => t.featured === filters.featured);
    }
    
    if (filters?.minRating) {
      testimonies = testimonies.filter(t => t.rating >= filters.minRating!);
    }
    
    if (filters?.location) {
      testimonies = testimonies.filter(t => 
        t.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.role) {
      testimonies = testimonies.filter(t => 
        t.role.toLowerCase().includes(filters.role!.toLowerCase())
      );
    }
    
    return testimonies.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  async getFeaturedTestimonies(limit = 6): Promise<Testimony[]> {
    const featured = await this.getTestimonies({ featured: true });
    return featured.slice(0, limit);
  },

  async getTestimonyById(id: number): Promise<Testimony | null> {
    await delay(200);
    const testimonies = testimoniesData as Testimony[];
    return testimonies.find(t => t.id === id) || null;
  },

  async getTestimoniesStats(): Promise<TestimonyStats> {
    await delay(200);
    const testimonies = testimoniesData as Testimony[];
    
    const total = testimonies.length;
    const totalRating = testimonies.reduce((sum, t) => sum + t.rating, 0);
    const averageRating = total > 0 ? totalRating / total : 0;
    const verifiedCount = testimonies.filter(t => t.verified).length;
    const featuredCount = testimonies.filter(t => t.featured).length;
    
    return {
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      verifiedCount,
      featuredCount
    };
  },

  async getTestimoniesByRole(role: string): Promise<Testimony[]> {
    return await this.getTestimonies({ role });
  },

  async getTestimoniesByLocation(location: string): Promise<Testimony[]> {
    return await this.getTestimonies({ location });
  },

  async getRandomTestimonies(count = 3): Promise<Testimony[]> {
    await delay(200);
    const testimonies = [...testimoniesData as Testimony[]];
    const shuffled = testimonies.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  getRoles(): string[] {
    const testimonies = testimoniesData as Testimony[];
    const roles = new Set(testimonies.map(t => t.role));
    return Array.from(roles).sort();
  },

  getLocations(): string[] {
    const testimonies = testimoniesData as Testimony[];
    const locations = new Set(testimonies.map(t => t.location));
    return Array.from(locations).sort();
  }
};

