export interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

export interface BlogPost {
  id: number;
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
  comments?: Comment[];
}

export interface Comment {
  id: number;
  author: Author;
  content: string;
  date: string;
  likes?: number;
  replies?: Comment[];
}
