/**
 * Cart API Response Models
 * Based on actual API responses from /cart/* endpoints
 */

export interface CartItemApiResponse {
  id: string | number;
  drug_id: number;
  drug_brand_id: number;
  drug_brand_form_id: number;
  dosage_id: number;
  strength_uom_id: number;
  pharmacy_branch_id: number;
  pharmacy_drug_price_id: number;
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
    requires_prescription?: boolean;
  };

  // Optional nested pharmacy data
  pharmacy?: {
    id: number;
    name: string;
    logo?: string;
  };

  // Optional nested brand/form/strength data
  brand?: {
    id: number;
    name: string;
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

export interface CartApiResponse {
  items: CartItemApiResponse[];
  total_items?: number;
  totalItems?: number; // Sometimes camelCase
  subtotal: number;
  discount?: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

// Response from /cart
export type GetCartApiResponse = CartApiResponse | { data: CartApiResponse };

// Response from /cart/items (POST)
export type AddToCartApiResponse = CartItemApiResponse | { data: CartItemApiResponse };

// Response from /cart/items/:id (PUT)
export type UpdateCartItemApiResponse = CartItemApiResponse | { data: CartItemApiResponse };

