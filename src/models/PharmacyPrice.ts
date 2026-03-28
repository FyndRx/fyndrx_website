// Pharmacy Price Model - represents a price entry for a drug at a pharmacy
export interface PharmacyPrice {
  id: number;
  pharmacy_id: number;
  pharmacy_branch_id?: number;
  branch_id?: number; // Alias for pharmacy_branch_id or from new exact_match response
  drug_id: number; // Legacy/fallback field
  brand_id: number;
  strength_id?: number;
  uom_id?: number;
  price: number;
  discount_price?: number;
  stock_quantity?: number;
  in_stock?: boolean;
  created_at: string;
  updated_at: string;

  // Optional nested pharmacy data (if included in response)
  pharmacy?: {
    id: number;
    name?: string;
    logo?: string;
    address?: string;
    rating?: number;
    distance?: string;
    is_open?: boolean;
    pharmacy_branch_id?: number;
    branch_name?: string;
    branch_address?: string;
  };
  pharmacy_branch?: {
    id: number;
    name?: string;
    address?: string;
    pharmacy_id?: number;
  };

  // Optional flat fields (if API returns flat structure)
  pharmacy_name?: string;
  pharmacy_logo?: string;
  pharmacy_address?: string;
  distance?: string;
  rating?: number;
  branch_name?: string; // Flattened branch name

  // Display and metadata fields
  name?: string;
  drug_image?: string;
  medication_image?: string; // Additional alias for consistency
  brand_name?: string;
  form_name?: string;
  strength?: string;
  uom?: string;
  requires_prescription?: boolean;
  price_id?: number;
  form_id?: number;
  image?: string;
}

