/**
 * Order API Response Models
 * Based on OrderResource output from /orders/* endpoints
 */

export interface OrderItemApiResponse {
  id: string | number;
  product_id: string | null;
  drug_id: number | null;
  brand_id: number | null;
  form_id: number | null;
  strength_id: number | null;
  uom_id: number | null;
  name: string;
  image?: string | null;
  quantity: number;
  price: number;
  discount_price?: number | null;
  subtotal: number;
}

export interface OrderApiResponse {
  id: string | number;
  order_number: string;
  user_id: string;
  pharmacy_id: string;
  pharmacy_name?: string;
  pharmacy_phone?: string;
  pharmacy_address?: string;
  pharmacy_logo?: string | null;
  pharmacy_banner?: string | null;
  branch_name?: string;
  items: OrderItemApiResponse[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: 'platform' | 'direct';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  delivery_method: 'pickup' | 'delivery';
  delivery_provider?: 'pharmacy' | 'fyndrx' | null;
  delivery_address?: string;
  delivery_lat?: number | string | null;
  delivery_lng?: number | string | null;
  pharmacy_lat?: number | string | null;
  pharmacy_lng?: number | string | null;
  phone_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
  prescription_required: boolean;
  prescription_uploaded: boolean;
  prescription_url?: string;
  notes?: string;
  estimated_ready_time?: string;
  completed_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  status_history?: OrderStatusHistoryApiResponse[];
}

export interface OrderStatusHistoryApiResponse {
  status: OrderApiResponse['status'];
  timestamp: string;
  note?: string;
}

export interface OrderTrackingApiResponse {
  order: OrderApiResponse;
  status_history?: OrderStatusHistoryApiResponse[];
  current_step?: number;
  estimated_delivery?: string;
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
