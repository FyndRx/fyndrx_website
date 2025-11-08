export interface Transaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod: 'platform' | 'direct';
  paymentGateway?: 'paystack' | 'cash';
  reference: string;
  paidAt?: string;
  createdAt: string;
  metadata?: {
    pharmacyName: string;
    itemsCount: number;
    customerEmail?: string;
    customerPhone?: string;
  };
  refundedAt?: string;
  refundReason?: string;
}

export interface PaymentCallback {
  reference: string;
  status: 'success' | 'failed' | 'cancelled';
  message?: string;
  transactionId?: string;
}

export interface Receipt {
  orderId: string;
  orderNumber: string;
  transactionId: string;
  transactionReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pharmacyName: string;
  pharmacyAddress: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt?: string;
  issuedAt: string;
}

