// Pharmacy Price Model - represents a price entry for a drug at a pharmacy
export interface PharmacyPrice {
  id: number;
  pharmacy_id: number;
  pharmacy_branch_id?: number;
  medicationId: number; // Primary field - medication ID from API (camelCase)
  drug_id?: number; // Legacy/fallback field
  drug_brand_id: number;
  drug_brand_form_id: number;
  dosage_id: number;
  strength_id?: number;
  strength_uom_id: number;
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

  // Optional drug details for display
  drug_name?: string;
  drug_image?: string;
  brand_name?: string;
  form_name?: string;
  strength?: string;
  uom?: string;
}

