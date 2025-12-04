import type { BlogPost, Comment } from '@/types/blog';
import { apiService } from './api';

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
    return await apiService.get<{ posts: BlogPost[]; total: number }>(url);
  },

  async getPost(slug: string): Promise<BlogPost> {
    return await apiService.get<BlogPost>(`/blog/posts/${slug}`);
  },

  async getRelatedPosts(postId: number, limit = 3): Promise<BlogPost[]> {
    return await apiService.get<BlogPost[]>(`/blog/posts/${postId}/related?limit=${limit}`);
  },

  async getCategories(): Promise<string[]> {
    return await apiService.get<string[]>('/blog/categories');
  },

  async getTags(): Promise<string[]> {
    return await apiService.get<string[]>('/blog/tags');
  },

  async getComments(postId: number): Promise<Comment[]> {
    return await apiService.get<Comment[]>(`/blog/posts/${postId}/comments`);
  },

  async likePost(postId: number): Promise<void> {
    return await apiService.postAuth<void>(`/blog/posts/${postId}/like`);
  },

  async commentOnPost(postId: number, comment: string): Promise<Comment> {
    return await apiService.postAuth<Comment>(`/blog/posts/${postId}/comments`, { comment });
  },

  getAllPosts(): BlogPost[] {
    console.warn('getAllPosts() is deprecated. Use getPosts() instead.');
    return [];
  },

  getPostById(id: number): BlogPost | undefined {
    console.warn('getPostById() is deprecated. Use getPost() with slug instead.');
    return undefined;
  },

  getAllTags(): string[] {
    console.warn('getAllTags() is deprecated. Use getTags() async method instead.');
    return [];
  },

  searchPosts(query: string): BlogPost[] {
    console.warn('searchPosts() is deprecated. Use getPosts() with search parameter instead.');
    return [];
  }
};
