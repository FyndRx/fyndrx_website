/**
 * Cart API Response Models
 * Based on PharmacyDrugPriceResource output embedded in CartController@index
 */

// A single cart item: PharmacyDrugPrice fields + cart overlay (cart_item_id, quantity, subtotal)
export interface CartItemApiResponse {
  // Cart overlay fields
  cart_item_id: string | number;
  quantity: number;
  subtotal: number;

  // From PharmacyDrugPriceResource
  id: string | number;           // pharmacy_drug_price_id
  pharmacy_id: number;
  pharmacy_branch_id: number | null;
  product_id: number | null;
  drug_id: number | null;
  brand_id: number | null;
  form_id: number | null;
  strength_id: number | null;
  uom_id: number | null;

  // Flattened product metadata
  name: string;
  description?: string | null;
  image?: string | null;
  requires_prescription: boolean;

  // Pricing
  price: number;
  discount_price?: number | null;
  in_stock: boolean;
  stock_quantity: number;

  // Display strings
  brand_name?: string | null;
  form_name?: string | null;
  strength?: string | null;
  uom?: string | null;

  // Pharmacy & Branch Info (Flattened from API)
  pharmacy_name?: string;
  pharmacy_logo?: string | null;
  is_open?: boolean;
  branch_name?: string;

  // Optional nested pharmacy (when included)
  pharmacy?: {
    id: number;
    name: string;
    logo?: string | null;
    address?: string;
    is_open?: boolean;
    distance?: number | string;
    branch_id?: number;
    branch_name?: string;
    accepted_payment_methods?: ('platform' | 'direct')[];
    accepted_payment_labels?: string[];
  };
}

export interface CartPharmacyGroup {
  pharmacy_id: number;
  pharmacy_branch_id: number;
  pharmacy_name?: string;
  pharmacy_logo?: string | null;
  is_open?: boolean;
  branch_name?: string;
  accepted_payment_methods: ('platform' | 'direct')[];
  accepted_payment_labels: string[];
  items: CartItemApiResponse[];
  subtotal: number;
}

export interface CartApiResponse {
  pharmacies: CartPharmacyGroup[];
  total_items: number;
  subtotal: number;
  total: number;
}

// Response from /cart
export type GetCartApiResponse = CartApiResponse | { data: CartApiResponse };

// Response from /cart/items (POST)
export type AddToCartApiResponse = {
  message: string;
  cart_item: CartItemApiResponse;
};

// Response from /cart/items/:id (PUT)
export type UpdateCartItemApiResponse = {
  message: string;
  cart_item: CartItemApiResponse;
};
