/**
 * Base API Response Types
 * These types represent the actual structure returned by the Laravel API
 */

// Generic API Response wrapper (Laravel pagination style)
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Standard success response
export interface SuccessResponse {
  message: string;
}

// Error response
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

