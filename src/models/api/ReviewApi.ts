/**
 * Review API Response Models
 * Based on actual API responses from /reviews/* endpoints
 */

export interface ReviewUserApiResponse {
  id: number;
  name?: string;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  profile_picture?: string;
  avatar?: string;
}

export interface PharmacyResponseApiResponse {
  responded_by?: string;
  respondedBy?: string; // Sometimes camelCase
  message: string;
  responded_at?: string;
  respondedAt?: string; // Sometimes camelCase
}

export interface ReviewApiResponse {
  id: string | number;
  user_id?: number;
  userId?: number; // Sometimes camelCase
  user?: ReviewUserApiResponse;
  target_type: 'pharmacy' | 'medication' | 'order';
  targetType?: 'pharmacy' | 'medication' | 'order'; // Sometimes camelCase
  target_id: string | number;
  targetId?: string | number; // Sometimes camelCase
  target_name?: string;
  targetName?: string; // Sometimes camelCase
  order_id?: string | number;
  orderId?: string | number; // Sometimes camelCase
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verified?: boolean;
  helpful_count?: number;
  helpfulCount?: number; // Sometimes camelCase
  not_helpful_count?: number;
  notHelpfulCount?: number; // Sometimes camelCase
  helpful?: number; // Sometimes just helpful
  not_helpful?: number; // Sometimes just not_helpful
  pharmacy_response?: PharmacyResponseApiResponse;
  pharmacyResponse?: PharmacyResponseApiResponse; // Sometimes camelCase
  created_at: string;
  createdAt?: string; // Sometimes camelCase
  updated_at: string;
  updatedAt?: string; // Sometimes camelCase
}

export interface ReviewStatsApiResponse {
  average_rating?: number;
  averageRating?: number; // Sometimes camelCase
  total_reviews?: number;
  totalReviews?: number; // Sometimes camelCase
  rating_distribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }; // Sometimes camelCase
}

// Response from /reviews
export type ReviewsApiResponse = 
  | ReviewApiResponse[]
  | { data: ReviewApiResponse[] };

// Response from /reviews/stats
export type ReviewStatsDetailApiResponse = 
  | ReviewStatsApiResponse
  | { data: ReviewStatsApiResponse };

