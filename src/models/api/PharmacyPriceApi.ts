/**
 * Pharmacy Price API Response Models
 * Based on PharmacyDrugPriceResource output from /prices/* endpoints
 */

import type { PaginationMeta } from './ApiResponse';

// Direct output of PharmacyDrugPriceResource
export interface PharmacyPriceApiResponse {
  id: string;
  pharmacy_id: string;
  pharmacy_branch_id: string;
  product_id: string | null;
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

  // Pricing & stock — API returns normal_price/discounted_price
  normal_price?: number;
  discounted_price?: number | null;
  max_discounted_price?: number | null;
  price?: number; // legacy / other endpoints
  discount_price?: number | null; // legacy
  is_active?: boolean;
  in_stock: boolean;
  stock_quantity: number;

  // Display strings
  brand_name?: string | null;
  form_name?: string | null;
  strength?: string | null;
  uom?: string | null;
  drug_name?: string | null;

  // Flattened pharmacy & branch info
  pharmacy_name?: string;
  pharmacy_logo?: string | null;
  is_open?: boolean;
  branch_id?: string | null;
  branch_name?: string | null;
  branch_location?: { lat: number; lng: number } | null;
  latitude?: number;
  longitude?: number;

  // Optional nested pharmacy (when withPharmacy() is called)
  pharmacy?: {
    id: string;
    name: string;
    logo?: string | null;
    address?: string;
    rating?: number;
    is_open?: boolean;
    distance?: number | string;
    branch_id?: string;
    branch_name?: string;
    latitude?: number;
    longitude?: number;
  };
}

// Response from /prices
export type PharmacyPricesApiResponse =
  | PharmacyPriceApiResponse[]
  | { data: PharmacyPriceApiResponse[] };

export type PharmacyPricesByPharmacyApiResponse = PharmacyPricesApiResponse;

// Response from /api/v1/prices?product_id=X (PriceSearchController)
export interface DrugPriceMatchApiResponse {
  id: string;
  name: string;
  description?: string | null;
  brand_id: number | null;
  brand_name?: string | null;
  drug_id: number | null;
  drug_name?: string | null;
  form_id: number | null;
  form_name?: string | null;
  strength_id: number | null;
  strength?: string | null;
  uom_id: number | null;
  uom?: string | null;
  image?: string | null;
  requires_prescription: boolean;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  pharmacies: {
    data: PharmacyPriceApiResponse[];
    meta: PaginationMeta;
  };
}

export interface DrugPriceRelatedApiResponse {
  id: string;
  name: string;
  drug_id: number | null;
  drug_name?: string | null;
  brand_id: number | null;
  brand_name?: string | null;
  form_id: number | null;
  form_name?: string | null;
  strength_id: number | null;
  strength?: string | null;
  uom_id: number | null;
  uom?: string | null;
  image?: string | null;
  price: number;
  discount_price?: number | null;
  in_stock: boolean;
  pharmacy_id: string;
  pharmacy_name?: string;
  pharmacy_logo?: string | null;
  branch_id?: string | null;
  branch_name?: string | null;
}

// Response from /api/v1/drugs/:id/related
export interface PaginatedRelatedDrugsResponse {
  data: DrugPriceRelatedApiResponse[];
  meta: PaginationMeta;
}

// Response from /api/v1/prices
export interface PharmacyPricesByDrugApiResponse {
  data: {
    exact_match: DrugPriceMatchApiResponse | null;
    related_drugs?: DrugPriceRelatedApiResponse[];
  };
}
