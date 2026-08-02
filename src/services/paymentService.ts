import { apiService } from './api';

import { unwrapArrayResponse } from '@/utils/responseTransformers';

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
  message?: string;
  orders?: Array<{ id: string; order_number?: string; total?: number; pharmacy?: { logo?: string | null; name: string } }>;
  is_bulk?: boolean;
  orderId?: string;
  order?: { id: string };
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

export interface TransactionTotals {
  paid: number;
  pending: number;
}

export interface TransactionCounts {
  all: number;
  success: number;
  pending: number;
  failed: number;
  refunded: number;
}

export interface GetTransactionsParams {
  status?: 'success' | 'pending' | 'failed' | 'refunded';
  order_id?: string;
  page?: number;
  per_page?: number;
}

export interface GetTransactionsResult {
  transactions: Transaction[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    totals: TransactionTotals;
    counts: TransactionCounts;
  } | null;
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

  /** Server-filtered/paginated transaction history, with status counts and paid/pending totals. */
  async getTransactions(params?: GetTransactionsParams): Promise<GetTransactionsResult> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.order_id) searchParams.set('order_id', params.order_id);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    const qs = searchParams.toString();

    const response = await apiService.getAuth<any>(`/transactions${qs ? `?${qs}` : ''}`);
    return {
      transactions: unwrapArrayResponse(response),
      meta: response?.meta ?? null,
    };
  },

  async getTransaction(id: string): Promise<Transaction> {
    return await apiService.getAuth<Transaction>(`/transactions/${id}`);
  }
};


