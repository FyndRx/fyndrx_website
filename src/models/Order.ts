export interface OrderItem {
  id: string;
  medicationId: number;
  medicationName: string;
  brandId?: number;
  brandName?: string;
  formId: number;
  formName: string;
  strengthId: number;
  strength: string;
  uomId: number;
  uom: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: number;
  pharmacyId: number;
  pharmacyName: string;
  pharmacyPhone: string;
  pharmacyAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'platform' | 'direct';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress?: string;
  deliveryMethod: 'pickup' | 'delivery';
  phoneNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  prescriptionRequired: boolean;
  prescriptionUploaded: boolean;
  prescriptionUrl?: string;
  notes?: string;
  estimatedReadyTime?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface OrderStatusHistory {
  status: Order['status'];
  timestamp: string;
  note?: string;
}

export interface OrderTracking {
  order: Order;
  statusHistory: OrderStatusHistory[];
  currentStep: number;
  estimatedDelivery?: string;
}

export type OrderStatus = Order['status'];
export type PaymentStatus = Order['paymentStatus'];
export type DeliveryMethod = Order['deliveryMethod'];
export type PaymentMethod = Order['paymentMethod'];

