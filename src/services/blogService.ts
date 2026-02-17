import type { BlogPost, Comment, BlogCategory } from '@/types/blog';
import { apiService } from './api';
import { 
  unwrapApiResponse, 
  unwrapArrayResponse,
  transformBlogPost, 
  transformBlogPosts
} from '@/utils/responseTransformers';

export const blogService = {
  async getPosts(
    page = 1,
    limit = 9,
    category?: string,
    search?: string
  ): Promise<{ posts: BlogPost[]; total: number }> {
    let url = `/blog/posts?page=${page}&limit=${limit}`;
    if (category && category !== 'All') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    // The API likely returns a Laravel paginated response { data: [...], meta: { total: ... } }
    // but the component expects { posts: [...], total: ... }
    const response = await apiService.get<any>(url);

    // Check if it's a paginated response
    if (response.data && Array.isArray(response.data)) {
      return {
        posts: transformBlogPosts(response.data),
        total: response.meta?.total || response.total || response.data.length
      };
    }

    // Fallback for direct array or other structures
    if (Array.isArray(response)) {
      return {
        posts: transformBlogPosts(response),
        total: response.length
      };
    }

    // If it matches the expected structure already (unlikely for Laravel but possible)
    if (response.posts) {
      return {
        posts: transformBlogPosts(response.posts),
        total: response.total || response.posts.length
      };
    }

    return { posts: [], total: 0 };
  },

  async getPost(slug: string): Promise<BlogPost> {
    const response = await apiService.get<BlogPost>(`/blog/posts/${slug}`);
    return transformBlogPost(unwrapApiResponse(response));
  },

  async getRelatedPosts(slugOrId: string | number, limit?: number): Promise<BlogPost[]> {
    let url = `/blog/posts/${slugOrId}/related`;
    if (limit) {
      url += `?limit=${limit}`;
    }
    const response = await apiService.get<BlogPost[]>(url);
    return transformBlogPosts(unwrapArrayResponse(response));
  },

  async getCategories(): Promise<BlogCategory[]> {
    const response = await apiService.get<BlogCategory[]>('/blog/categories');
    return unwrapArrayResponse(response);
  },

  async getTags(): Promise<string[]> {
    const response = await apiService.get<string[]>('/blog/tags');
    return unwrapArrayResponse(response);
  },

  async getComments(postId: number): Promise<Comment[]> {
    const response = await apiService.get<Comment[]>(`/blog/posts/${postId}/comments`);
    return unwrapArrayResponse(response);
  },

  async likePost(postId: number): Promise<void> {
    return await apiService.postAuth<void>(`/blog/posts/${postId}/like`);
  },

  async commentOnPost(postId: number, comment: string): Promise<Comment> {
    const response = await apiService.postAuth<Comment>(`/blog/posts/${postId}/comments`, { comment });
    return unwrapApiResponse(response);
  },

  getAllPosts(): BlogPost[] {
    console.warn('getAllPosts() is deprecated. Use getPosts() instead.');
    return [];
  },

  getPostById(): BlogPost | undefined {
    console.warn('getPostById() is deprecated. Use getPost() with slug instead.');
    return undefined;
  },

  getAllTags(): string[] {
    console.warn('getAllTags() is deprecated. Use getTags() async method instead.');
    return [];
  },

  searchPosts(): BlogPost[] {
    console.warn('searchPosts() is deprecated. Use getPosts() with search parameter instead.');
    return [];
  }
};
