/**
 * Order API Response Models
 * Based on actual API responses from /orders/* endpoints
 */

export interface OrderItemApiResponse {
  id: string | number;
  drug_id: number;
  drug_brand_id?: number;
  drug_brand_form_id: number;
  dosage_id: number;
  strength_uom_id: number;
  quantity: number;
  price: number;
  discount_price?: number;
  created_at?: string;
  updated_at?: string;
  
  // Optional nested medication data
  medication?: {
    id: number;
    drug_name: string;
    image?: string;
  };
  brand?: {
    id: number;
    name: string;
    image?: string | null;
  };
  form?: {
    id: number;
    form_name: string;
  };
  strength?: {
    id: number;
    strength: string;
  };
  uom?: {
    id: number;
    uom: string;
  };
}

export interface OrderApiResponse {
  id: string | number;
  order_number?: string;
  orderNumber?: string; // Sometimes camelCase
  user_id?: number;
  userId?: number; // Sometimes camelCase
  pharmacy_id: number;
  pharmacyId?: number; // Sometimes camelCase
  pharmacy_branch_id?: number;
  pharmacyBranchId?: number; // Sometimes camelCase
  pharmacy_name?: string;
  pharmacyName?: string; // Sometimes camelCase
  pharmacy_phone?: string;
  pharmacyPhone?: string; // Sometimes camelCase
  pharmacy_address?: string;
  pharmacyAddress?: string; // Sometimes camelCase
  items: OrderItemApiResponse[];
  subtotal: number;
  delivery_fee?: number;
  deliveryFee?: number; // Sometimes camelCase
  total: number;
  payment_method: 'platform' | 'direct';
  paymentMethod?: 'platform' | 'direct'; // Sometimes camelCase
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'; // Sometimes camelCase
  delivery_method: 'pickup' | 'delivery';
  deliveryMethod?: 'pickup' | 'delivery'; // Sometimes camelCase
  delivery_address?: string;
  deliveryAddress?: string; // Sometimes camelCase
  delivery_lat?: number;
  deliveryLat?: number; // Sometimes camelCase
  delivery_lng?: number;
  deliveryLng?: number; // Sometimes camelCase
  phone_number: string;
  phoneNumber?: string; // Sometimes camelCase
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
  prescription_required?: boolean;
  prescriptionRequired?: boolean; // Sometimes camelCase
  prescription_uploaded?: boolean;
  prescriptionUploaded?: boolean; // Sometimes camelCase
  prescription_url?: string;
  prescriptionUrl?: string; // Sometimes camelCase
  notes?: string;
  estimated_ready_time?: string;
  estimatedReadyTime?: string; // Sometimes camelCase
  completed_at?: string;
  completedAt?: string; // Sometimes camelCase
  cancelled_at?: string;
  cancelledAt?: string; // Sometimes camelCase
  cancellation_reason?: string;
  cancellationReason?: string; // Sometimes camelCase
  created_at: string;
  createdAt?: string; // Sometimes camelCase
  updated_at: string;
  updatedAt?: string; // Sometimes camelCase
  status_history?: OrderStatusHistoryApiResponse[];
  statusHistory?: OrderStatusHistoryApiResponse[]; // Sometimes camelCase
}

export interface OrderStatusHistoryApiResponse {
  status: OrderApiResponse['status'];
  timestamp: string;
  note?: string;
}

export interface OrderTrackingApiResponse {
  order: OrderApiResponse;
  status_history?: OrderStatusHistoryApiResponse[];
  statusHistory?: OrderStatusHistoryApiResponse[]; // Sometimes camelCase
  current_step?: number;
  currentStep?: number; // Sometimes camelCase
  estimated_delivery?: string;
  estimatedDelivery?: string; // Sometimes camelCase
}

// Response from /orders
export type OrdersApiResponse = 
  | OrderApiResponse[]
  | { data: OrderApiResponse[] };

// Response from /orders/:id
export type OrderDetailApiResponse = 
  | OrderApiResponse
  | { data: OrderApiResponse };

// Response from /orders/:id/track
export type OrderTrackingDetailApiResponse = 
  | OrderTrackingApiResponse
  | { data: OrderTrackingApiResponse };

