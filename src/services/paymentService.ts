import { apiService } from './api';

export interface PaymentInitializationResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerification {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  paid_at?: string;
  order_id: string;
}

export interface Transaction {
  id: string;
  user_id: number;
  order_id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method: string;
  gateway_response?: any;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  order?: {
    order_number: string;
    pharmacy_name: string;
    pharmacy?: {
      logo: string;
      name: string;
    }
  };
  metadata?: {
    is_bulk?: boolean;
    [key: string]: any;
  };
}

export const paymentService = {
  async initializePayment(orderIds: string | string[]): Promise<PaymentInitializationResponse> {
    const payload = Array.isArray(orderIds) 
      ? { order_ids: orderIds } 
      : { order_id: orderIds };
      
    return await apiService.postAuth<PaymentInitializationResponse>('/payments/initialize', payload);
  },

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    return await apiService.getAuth<PaymentVerification>(`/payments/verify/${reference}`);
  },

  async getTransactions(): Promise<Transaction[]> {
    return await apiService.getAuth<Transaction[]>('/transactions');
  },

  async getTransaction(id: string): Promise<Transaction> {
    return await apiService.getAuth<Transaction>(`/transactions/${id}`);
  }
};


