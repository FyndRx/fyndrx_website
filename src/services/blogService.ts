import type { BlogPost, Comment } from '@/types/blog';

const API_URL = import.meta.env.VITE_API_URL;

export const blogService = {
  async getPosts(
    page = 1,
    limit = 9,
    category?: string,
    search?: string
  ): Promise<{ posts: BlogPost[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(search && { search }),
    });

    const response = await fetch(`${API_URL}/blog/posts?${params}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async getPost(slug: string): Promise<BlogPost> {
    const response = await fetch(`${API_URL}/blog/posts/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  async getRelatedPosts(postId: number, limit = 2): Promise<BlogPost[]> {
    const response = await fetch(`${API_URL}/blog/posts/${postId}/related?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch related posts');
    return response.json();
  },

  async addComment(postId: number, content: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/blog/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  async addReply(postId: number, commentId: number, content: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/blog/posts/${postId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) throw new Error('Failed to add reply');
    return response.json();
  },

  async likeComment(postId: number, commentId: number): Promise<void> {
    const response = await fetch(`${API_URL}/blog/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to like comment');
  },
};
