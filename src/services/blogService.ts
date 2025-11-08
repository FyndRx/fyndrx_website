import type { BlogPost, Comment } from '@/types/blog';
import blogsData from '@/data/blogs.json';

export const blogService = {
  async getPosts(
    page = 1,
    limit = 9,
    category?: string,
    search?: string
  ): Promise<{ posts: BlogPost[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let posts = blogsData as BlogPost[];
    
    if (category && category !== 'All') {
      posts = posts.filter(post => post.category === category);
    }
    
    if (search) {
      const query = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        post.author.name.toLowerCase().includes(query)
      );
    }
    
    posts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const total = posts.length;
    const start = (page - 1) * limit;
    const paginatedPosts = posts.slice(start, start + limit);
    
    return { posts: paginatedPosts, total };
  },

  async getPost(slug: string): Promise<BlogPost | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const posts = blogsData as BlogPost[];
    const post = posts.find(p => p.slug === slug);
    return post || null;
  },

  async getRelatedPosts(postId: number, limit = 3): Promise<BlogPost[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const posts = blogsData as BlogPost[];
    const currentPost = posts.find(p => p.id === postId);
    
    if (!currentPost) return [];
    
    const related = posts
      .filter(p => 
        p.id !== postId && 
        (p.category === currentPost.category || 
         p.tags?.some(tag => currentPost.tags?.includes(tag)))
      )
      .slice(0, limit);
    
    return related;
  },

  getAllPosts(): BlogPost[] {
    return blogsData as BlogPost[];
  },

  getPostById(id: number): BlogPost | undefined {
    const posts = blogsData as BlogPost[];
    return posts.find(p => p.id === id);
  },

  getCategories(): string[] {
    const posts = blogsData as BlogPost[];
    const categories = new Set<string>();
    posts.forEach(post => categories.add(post.category));
    return Array.from(categories);
  },

  getAllTags(): string[] {
    const posts = blogsData as BlogPost[];
    const tags = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  },

  searchPosts(query: string): BlogPost[] {
    if (!query) return blogsData as BlogPost[];
    
    const posts = blogsData as BlogPost[];
    const searchTerm = query.toLowerCase();
    
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.author.name.toLowerCase().includes(searchTerm)
    );
  }
};
