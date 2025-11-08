export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: 'pharmacy' | 'medication' | 'order';
  targetId: string;
  targetName?: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  pharmacyResponse?: PharmacyResponse;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyResponse {
  respondedBy: string;
  message: string;
  respondedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface AddReviewRequest {
  targetType: 'pharmacy' | 'medication' | 'order';
  targetId: string;
  targetName?: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: File[];
}

