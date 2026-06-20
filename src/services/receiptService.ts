import { apiService } from './api';

export interface ReceiptPharmacy {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PosReceipt {
  type: 'pos';
  id: string;
  reference: string | null;
  status: 'completed' | 'refunded' | 'voided';
  date: string;
  pharmacy: ReceiptPharmacy;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  discount_type: string | null;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  payment_method: string;
  payment_breakdown: Record<string, unknown>;
  cashier: string | null;
  register: string | null;
  notes: string | null;
}

export interface OnlineReceipt {
  type: 'online';
  reference: string;
  order_number: string | null;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  date: string;
  paid_at: string | null;
  pharmacy: ReceiptPharmacy;
  items: ReceiptItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  payment_method: string;
  payment_gateway: string | null;
  delivery_method: string | null;
  delivery_address: string | null;
  customer: { name: string; email: string } | null;
  refunded_at: string | null;
  refund_reason: string | null;
}

export type Receipt = PosReceipt | OnlineReceipt;

export async function fetchReceipt(reference: string): Promise<Receipt> {
  return apiService.get<Receipt>(`/receipt/${encodeURIComponent(reference)}`);
}
