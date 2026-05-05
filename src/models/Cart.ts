export interface CartItem {
  id: string;
  medicationId: number;
  medicationName: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyLogo?: string;
  pharmacyBranchId?: string;
  branchName?: string;
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
  inStock: boolean;
  requiresPrescription?: boolean;
  pharmacyDrugPriceId?: string;
  acceptedPaymentMethods?: ('platform' | 'direct')[];
  isOpen?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface CartPharmacyGroup {
  pharmacyId: string;
  pharmacyBranchId: string;
  pharmacyName: string;
  pharmacyLogo?: string;
  isOpen?: boolean;
  branchName?: string;
  latitude?: number;
  longitude?: number;
  items: CartItem[];
  subtotal: number;
  paymentMethod?: 'platform' | 'direct';
  acceptedPaymentMethods?: ('platform' | 'direct')[];
  acceptedPaymentLabels?: string[];
}

export interface CheckoutPaymentOption {
  method: 'platform' | 'direct';
  label: string;
  description: string;
  available: boolean;
}

export interface OrderItem {
  medicationId: number;
  brandId?: number;
  formId: number;
  strengthId: number;
  uomId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  pharmacyId: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'platform' | 'direct';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryAddress: string;
  deliveryMethod: 'pickup' | 'delivery';
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  prescriptionRequired: boolean;
  prescriptionUploaded?: boolean;
}

