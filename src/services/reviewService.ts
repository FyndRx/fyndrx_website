import type { Review, ReviewStats } from '@/models/Review';
import { apiService } from './api';
import type { 
  ReviewsApiResponse,
  ReviewStatsDetailApiResponse,
  ReviewApiResponse,
  ReviewStatsApiResponse 
} from '@/models/api';
import { 
  unwrapApiResponse,
  unwrapArrayResponse,
  transformReview,
  transformReviews,
  transformReviewStats 
} from '@/utils/responseTransformers';

export interface GetReviewsParams {
  type?: 'medication' | 'pharmacy';
  id?: number;
  rating?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateReviewRequest {
  reviewable_type: 'pharmacy' | 'medication';
  reviewable_id: number;
  rating: number;
  title: string;
  comment: string;
  order_id?: number;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface MarkHelpfulRequest {
  is_helpful: boolean;
}

class ReviewService {
  /**
   * Get reviews with optional filters
   * @param params - Query parameters for filtering reviews
   * @returns Array of reviews
   */
  async getReviews(params?: GetReviewsParams): Promise<Review[]> {
    let url = '/reviews';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.type) queryParams.append('type', params.type);
      if (params.id) queryParams.append('id', params.id.toString());
      if (params.rating) queryParams.append('rating', params.rating.toString());
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await apiService.get<ReviewsApiResponse>(url);
    const apiReviews = unwrapArrayResponse(response);
    return transformReviews(apiReviews);
  }

  /**
   * Get review statistics for a target
   * @param type - Target type (medication or pharmacy)
   * @param id - Target ID
   * @returns Review statistics
   */
  async getReviewStats(type: 'medication' | 'pharmacy', id: number): Promise<ReviewStats> {
    const response = await apiService.get<ReviewStatsDetailApiResponse>(
      `/reviews/stats?type=${type}&id=${id}`
    );
    const apiStats = unwrapApiResponse(response);
    return transformReviewStats(apiStats);
  }

  /**
   * Add a new review
   * @param review - Review data
   * @returns Created review
   */
  async addReview(review: CreateReviewRequest): Promise<Review> {
    const response = await apiService.postAuth<ReviewApiResponse | { data: ReviewApiResponse }>(
      '/reviews', 
      review
    );
    const apiReview = unwrapApiResponse(response);
    return transformReview(apiReview);
  }

  /**
   * Update an existing review
   * @param reviewId - Review ID
   * @param data - Updated review data
   * @returns Updated review
   */
  async updateReview(reviewId: string | number, data: UpdateReviewRequest): Promise<Review> {
    const response = await apiService.putAuth<ReviewApiResponse | { data: ReviewApiResponse }>(
      `/reviews/${reviewId}`, 
      data
    );
    const apiReview = unwrapApiResponse(response);
    return transformReview(apiReview);
  }

  /**
   * Delete a review
   * @param reviewId - Review ID
   */
  async deleteReview(reviewId: string | number): Promise<void> {
    return await apiService.deleteAuth<void>(`/reviews/${reviewId}`);
  }

  /**
   * Mark a review as helpful or not helpful
   * @param reviewId - Review ID
   * @param isHelpful - Whether the review is helpful
   */
  async markHelpful(reviewId: string | number, isHelpful: boolean): Promise<void> {
    return await apiService.postAuth<void>(`/reviews/${reviewId}/helpful`, {
      is_helpful: isHelpful
    });
  }

  /**
   * Get reviews for a specific target (convenience method)
   * @param targetType - Target type (medication or pharmacy)
   * @param targetId - Target ID
   * @param params - Additional query parameters
   * @returns Array of reviews
   */
  async getReviewsByTarget(
    targetType: 'medication' | 'pharmacy', 
    targetId: number, 
    params?: Omit<GetReviewsParams, 'type' | 'id'>
  ): Promise<Review[]> {
    return this.getReviews({
      type: targetType,
      id: targetId,
      ...params
    });
  }
}

export const reviewService = new ReviewService();

