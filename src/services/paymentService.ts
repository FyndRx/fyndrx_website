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
}

export const paymentService = {
  async initializePayment(orderId: string): Promise<PaymentInitializationResponse> {
    return await apiService.postAuth<PaymentInitializationResponse>('/payments/initialize', {
      order_id: orderId
    });
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


