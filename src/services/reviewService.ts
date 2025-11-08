import type { Review, ReviewStats, AddReviewRequest } from '@/models/Review';
import reviewsData from '@/data/reviews.json';

class ReviewService {
  async getReviewsByTarget(targetType: string, targetId: string): Promise<Review[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const reviews = reviewsData as Review[];
    return reviews.filter(r => r.targetType === targetType && r.targetId === targetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReviewStats(targetType: string, targetId: string): Promise<ReviewStats> {
    const reviews = await this.getReviewsByTarget(targetType, targetId);
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = reviews.reduce((dist, r) => {
      dist[r.rating as keyof typeof dist]++;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution
    };
  }

  async addReview(reviewData: AddReviewRequest): Promise<Review> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userId: 'current-user',
      userName: 'Current User',
      targetType: reviewData.targetType,
      targetId: reviewData.targetId,
      targetName: reviewData.targetName,
      orderId: reviewData.orderId,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      verified: !!reviewData.orderId,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newReview;
  }

  async markHelpful(reviewId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Marked review as helpful:', reviewId);
  }

  async markNotHelpful(reviewId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Marked review as not helpful:', reviewId);
  }
}

export const reviewService = new ReviewService();

