import type { BlogPost, Comment, BlogCategory } from '@/types/blog';
import { apiService } from './api';
import {
  unwrapApiResponse,
  unwrapArrayResponse,
  transformBlogPost,
  transformBlogPosts,
  transformComment,
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

    const response = await apiService.get<any>(url);

    if (response.data && Array.isArray(response.data)) {
      return {
        posts: transformBlogPosts(response.data),
        total: response.meta?.total ?? response.total ?? response.data.length,
      };
    }

    if (Array.isArray(response)) {
      return { posts: transformBlogPosts(response), total: response.length };
    }

    if (response.posts) {
      return {
        posts: transformBlogPosts(response.posts),
        total: response.total ?? response.posts.length,
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
    if (limit) url += `?limit=${limit}`;
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

  async getComments(postId: string | number): Promise<Comment[]> {
    const response = await apiService.get<any>(`/blog/posts/${postId}/comments`);
    const arr = unwrapArrayResponse(response) as any[];
    return arr.map(transformComment);
  },

  /** Toggle like. Returns the new like count and whether the post is now liked. */
  async likePost(postId: string | number): Promise<{ liked: boolean; likes: number }> {
    const response = await apiService.postAuth<any>(`/blog/posts/${postId}/like`);
    return response;
  },

  /** Toggle like on a comment. Returns new liked state and count. */
  async likeComment(commentId: string | number): Promise<{ liked: boolean; likes: number }> {
    const response = await apiService.postAuth<any>(`/blog/comments/${commentId}/like`);
    return response;
  },

  /** Post a top-level comment or a reply (pass parentId for replies). */
  async commentOnPost(postId: string | number, comment: string, parentId?: string | number): Promise<Comment> {
    const body: Record<string, unknown> = { comment };
    if (parentId != null) body.parent_id = parentId;
    const response = await apiService.postAuth<any>(`/blog/posts/${postId}/comments`, body);
    // Backend returns { message: '...', comment: { ...with user + replies } }
    const commentData = response?.comment ?? unwrapApiResponse(response);
    return transformComment(commentData);
  },
};
