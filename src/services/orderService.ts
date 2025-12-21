import type { Order, OrderTracking } from '@/models/Order';
import { apiService } from './api';
import type { 
  OrderDetailApiResponse,
  OrdersApiResponse,
  OrderTrackingDetailApiResponse 
} from '@/models/api';
import { 
  unwrapApiResponse,
  unwrapArrayResponse,
  transformOrder,
  transformOrders,
  transformOrderTracking 
} from '@/utils/responseTransformers';

export interface CreateOrderPayload {
  pharmacy_branch_id: number;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  phone_number: string;
  payment_method: 'platform' | 'direct';
  notes?: string;
}

// Helper function to get user location
export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { timeout: 10000 }
    );
  });
};

export interface GetOrdersParams {
  status?: string;
  per_page?: number;
  page?: number;
}

export const orderService = {
  /**
   * Create a new order
   * @param payload - Order creation payload
   * @returns Created order
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiService.postAuth<OrderDetailApiResponse>('/orders', payload);
    const apiOrder = unwrapApiResponse(response);
    return transformOrder(apiOrder);
  },

  /**
   * Get user's orders
   * @param params - Optional query parameters
   * @returns Array of orders
   */
  async getOrders(params?: GetOrdersParams): Promise<Order[]> {
    let url = '/orders';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await apiService.getAuth<OrdersApiResponse>(url);
    const apiOrders = unwrapArrayResponse(response);
    return transformOrders(apiOrders);
  },

  /**
   * Get order by ID
   * @param orderId - Order ID
   * @returns Order details
   */
  async getOrder(orderId: string | number): Promise<Order> {
    const response = await apiService.getAuth<OrderDetailApiResponse>(`/orders/${orderId}`);
    const apiOrder = unwrapApiResponse(response);
    return transformOrder(apiOrder);
  },

  /**
   * Track order status
   * @param orderId - Order ID
   * @returns Order tracking information
   */
  async trackOrder(orderId: string | number): Promise<OrderTracking> {
    const response = await apiService.getAuth<OrderTrackingDetailApiResponse>(
      `/orders/${orderId}/track`
    );
    const apiTracking = unwrapApiResponse(response);
    return transformOrderTracking(apiTracking);
  },

  /**
   * Cancel an order
   * @param orderId - Order ID
   * @param cancellationReason - Reason for cancellation
   */
  async cancelOrder(orderId: string | number, cancellationReason: string): Promise<void> {
    return await apiService.putAuth<void>(`/orders/${orderId}/cancel`, {
      cancellation_reason: cancellationReason
    });
  },

  /**
   * Upload prescription for an order
   * @param orderId - Order ID
   * @param file - Prescription file
   */
  async uploadPrescription(orderId: string | number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('prescription', file);
    return await apiService.postAuth<void>(`/orders/${orderId}/prescription`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

