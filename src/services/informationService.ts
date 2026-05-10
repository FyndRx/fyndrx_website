import { apiService } from './api';

export interface LegalDocument {
  title: string;
  slug: string;
  content: string;
  updated_at: string;
}

export interface HelpCategory {
  id: number;
  name: string;
  slug: string;
  articles: HelpArticle[];
}

export interface HelpArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  category?: string;
  is_faq: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  website: string;
  type: string;
}

export interface AppSettings {
  contact: {
    email: string;
    phone: string;
    address: string;
    tamaleAddress?: string;
    hours?: string;
  };
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  links: {
    play_store?: string;
    app_store?: string;
  };
  about: {
    description: string;
    mission: string;
    vision: string;
  };
}

export interface FeedbackData {
  name: string;
  email: string;
  subject: string;
  message: string;
  rating: number;
}

export const informationService = {
  /**
   * Retrieve a specific legal document by its slug.
   */
  async getLegalDocument(slug: string): Promise<LegalDocument> {
    const response = await apiService.get<{ data: LegalDocument }>('/legal/' + slug);
    return response.data;
  },

  /**
   * Returns all help center articles and FAQs, grouped by category.
   */
  async getHelpCenter(): Promise<HelpCategory[]> {
    const response = await apiService.get<{ data: Record<string, any[]> }>('/help-center');
    // Transform from Record<string, any[]> to HelpCategory[]
    return Object.entries(response.data).map(([name, articles]) => ({
      id: Math.random(), 
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      articles: articles.map(article => ({
        id: article.id,
        title: article.question,
        content: article.answer,
        category: name,
        slug: article.id.toString(),
        is_faq: article.is_faq
      }))
    }));
  },

  /**
   * Specifically retrieves items flagged as FAQs.
   */
  async getFAQs(): Promise<HelpArticle[]> {
    const response = await apiService.get<{ data: Record<string, any[]> }>('/faqs');
    const articles: HelpArticle[] = [];
    
    Object.entries(response.data).forEach(([category, list]) => {
      list.forEach(item => {
        articles.push({
          id: item.id,
          title: item.question,
          content: item.answer,
          category: category,
          slug: item.id.toString(),
          is_faq: item.is_faq
        });
      });
    });
    
    return articles;
  },

  /**
   * List all team members.
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await apiService.get<{ data: TeamMember[] }>('/team');
    return response.data;
  },

  /**
   * List all active partners.
   */
  async getPartners(): Promise<Partner[]> {
    const response = await apiService.get<{ data: any[] }>('/partners');
    return response.data.map(partner => ({
      id: partner.id,
      name: partner.name,
      logo: partner.logo,
      website: partner.website_url, // Map website_url to website
      type: partner.type || 'General'
    }));
  },

  /**
   * Retrieve global public app settings.
   */
  async getAppSettings(): Promise<AppSettings> {
    const response = await apiService.get<{ data: Record<string, any> }>('/app-settings');
    const data = response.data;

    return {
      contact: {
        email: data.contact_email,
        phone: data.contact_phone,
        address: data.office_address,
        tamaleAddress: data.tamale_office_address,
        hours: data.office_hours
      },
      socials: {
        facebook: data.facebook_url,
        twitter: data.twitter_url,
        instagram: data.instagram_url,
        linkedin: data.linkedin_url,
        youtube: data.youtube_url,
        tiktok: data.tiktok_url
      },
      links: {
        play_store: data.play_store_url,
        app_store: data.app_store_url
      },
      about: {
        description: data.about_us_text,
        mission: data.mission_statement,
        vision: data.vision_statement
      }
    };
  },

  /**
   * Submit user feedback or inquiry.
   */
  async submitFeedback(data: FeedbackData): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/feedback', data);
  }
};
