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
  pharmacy_id?: number; // Top level pharmacy ID
  pharmacy_drug_price_id: number;
  quantity: number;
  price: number;
  discount_price?: number;
  created_at?: string;
  updated_at?: string;

  // Flattened fields from CartController@index
  drug_name?: string;
  brand_name?: string;
  form_name?: string;
  strength?: string | { strength: string }; // Handle both string and object
  strength_uom?: string | { uom: string }; // Handle both string and object
  image?: string; // Top-level image from Flattened response

  // Branch info
  branch_name?: string; // Flattened branch name
  pharmacy_branch?: {
    id: number;
    name?: string;
    branch_name?: string;
  };

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
    image?: string | null;
  };
  form?: {
    id: number;
    form_name: string;
  };
  strength_obj?: { // Renamed from strength to avoid conflict
    id: number;
    strength: string;
  };
  uom?: {
    id: number;
    uom: string;
  };
}

export interface CartApiResponse {
  items?: CartItemApiResponse[]; // Legacy or flattened
  pharmacies?: {
    pharmacy_id: number;
    pharmacy_name: string;
    pharmacy_logo?: string | null;
    items: CartItemApiResponse[];
    subtotal: number;
    payment_method?: string;
  }[];
  total_items?: number;
  totalItems?: number;
  subtotal: number;
  discount?: number;
  total: number;
  created_at?: string;
  updated_at?: string;
}

// Response from /cart
export type GetCartApiResponse = CartApiResponse | { data: CartApiResponse };

// Response from /cart/items (POST)
export type AddToCartApiResponse = {
  message: string;
  cart_item: CartItemApiResponse;
} | CartItemApiResponse;

// Response from /cart/items/:id (PUT)
export type UpdateCartItemApiResponse = {
  message: string;
  cart_item: CartItemApiResponse;
} | CartItemApiResponse;

