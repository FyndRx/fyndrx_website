export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  date: string;
  author: Author;
  tags?: string[];
  readTime?: number;
  likes?: number;
  views?: number;
  liked?: boolean;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  date: string;
  likes?: number;
  liked?: boolean;
  replies?: Comment[];
}

export interface BlogCategory {
  category: string;
  count: number;
}
