// Pharmacy Price Model - represents a price entry for a drug at a pharmacy
export interface PharmacyPrice {
  id: string;
  pharmacy_id: string;
  pharmacy_branch_id?: string;
  branch_id?: string;
  product_id?: string;
  drug_id: number; // drugs table not migrated — stays number
  brand_id: number;
  strength_id?: number;
  uom_id?: number;
  price: number;
  discount_price?: number;
  discount_percentage?: number;
  stock_quantity?: number;
  in_stock?: boolean;
  created_at: string;
  updated_at: string;

  // Optional nested pharmacy data (if included in response)
  pharmacy?: {
    id: string;
    name?: string;
    logo?: string;
    address?: string;
    rating?: number;
    distance?: string;
    is_open?: boolean;
    pharmacy_branch_id?: string;
    branch_name?: string;
    branch_address?: string;
  };
  pharmacy_branch?: {
    id: string;
    name?: string;
    address?: string;
    pharmacy_id?: string;
  };

  // Optional flat fields (if API returns flat structure)
  pharmacy_name?: string;
  pharmacy_logo?: string;
  pharmacy_address?: string;
  distance?: string;
  rating?: number;
  branch_name?: string; // Flattened branch name
  is_open?: boolean;
  latitude?: number;
  longitude?: number;
  branch_location?: { lat: number; lng: number };

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

