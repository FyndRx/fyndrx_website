/**
 * Pharmacy Price API Response Models
 * Based on actual API responses from /pharmacy-prices/* endpoints
 */

import type { PharmacyApiResponse, PharmacyBranchApiResponse } from './PharmacyApi';
import type { PaginationMeta } from './ApiResponse';

export interface PharmacyPriceApiResponse {
  id: number;
  pharmacy_id: number;
  pharmacy_branch_id?: number;
  branch_id?: number | null; // Added for structured response
  branch_name?: string; // Added from updated endpoint
  drug_id?: number; // Legacy field
  medicationId?: number; // Sometimes camelCase
  drug_brand_id: number;
  drug_brand_form_id: number;
  dosage_id: number;
  strength_uom_id: number;
  price: number;
  normal_price?: number; // Added from actual API response
  discount_price?: number;
  discounted_price?: number; // Added from actual API response
  stock_quantity?: number;
  in_stock?: boolean;
  created_at: string;
  updated_at: string;

  // Nested pharmacy data (if included in response)
  pharmacy?: Partial<PharmacyApiResponse>;
  pharmacy_branch?: Partial<PharmacyBranchApiResponse>;

  // Flat pharmacy fields (if API returns flat structure)
  pharmacy_name?: string;
  pharmacy_logo?: string;
  pharmacy_address?: string;
  distance?: string;
  rating?: number;
  is_open?: boolean;

  // CamelCase variants (found in some endpoints)
  pharmacyId?: number;
  drugId?: number;
  formId?: number;
  strengthId?: number;
  uomId?: number;

  // Raw snake_case fields from some endpoints
  form_id?: number;
  strength_id?: number;
  uom_id?: number;

  discountPrice?: number;
  inStock?: boolean;

  // New fields from confirmed API response
  name?: string;
  drugName?: string;
  drug_image?: string;
  drugImage?: string;
  brand_name?: string;
  brandName?: string;
  form_name?: string;
  formName?: string;
  strength?: string;
  strengthValue?: string;
  uom?: string;
  uomValue?: string;

  // Confirmed fields from investigation
  brand_id?: number;
  uom_name?: string | { id: number; uom: string }; // Handle both old object and new string format just in case
}

// Response from /pharmacy-prices
export type PharmacyPricesApiResponse =
  | PharmacyPriceApiResponse[]
  | { data: PharmacyPriceApiResponse[] }
  | { prices: PharmacyPriceApiResponse[] };

// Response from /pharmacy-prices/:pharmacyId
export type PharmacyPricesByPharmacyApiResponse = PharmacyPricesApiResponse;

export interface DrugPriceMatchApiResponse {
  drug_id: number;
  name: string;
  brand: string;
  brand_id: number;
  generic_name?: string;
  form: string;
  form_id: number;
  strength: string;
  strength_id: number;
  uom: string;
  uom_id: number;
  image: string | null;
  description: string | null;
  requires_prescription: boolean;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  pharmacies: {
    data: Array<{
      pharmacy_id: number;
      pharmacy_name: string;
      logoPath: string | null;
      is_open: boolean;
      latitude: number | null;
      longitude: number | null;
      branch_id: number | null;
      branch_name: string | null;
      price: number;
      discount_price: number | null;
      in_stock: boolean;
      stock_quantity?: number;
    }>;
    meta: PaginationMeta;
  };
}

export interface DrugPriceRelatedApiResponse {
  drug_id: number;
  drug_name: string;
  name: string;
  brand: string;
  brand_id: number;
  form: string;
  form_id: number;
  strength: string;
  strength_id: number;
  uom: string;
  uom_id: number;
  pharmacy_id: number;
  pharmacy_name: string;
  logoPath: string | null;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
  branch_id: number | null;
  branch_name: string | null;
  price: number;
  discount_price: number | null;
  in_stock: boolean;
}

// Response from /api/v1/drugs/:id/related
export interface PaginatedRelatedDrugsResponse {
  data: DrugPriceRelatedApiResponse[];
  meta: PaginationMeta;
}

// Response from /api/v1/prices (formerly /pharmacy-prices/drug/:drugId)
export type PharmacyPricesByDrugApiResponse = {
  data: {
    exact_match: DrugPriceMatchApiResponse | null;
    related_drugs?: DrugPriceRelatedApiResponse[]; // legacy or merged
  };
};

