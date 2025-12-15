/**
 * Pharmacy Price API Response Models
 * Based on actual API responses from /pharmacy-prices/* endpoints
 */

import type { PharmacyApiResponse, PharmacyBranchApiResponse } from './PharmacyApi';

export interface PharmacyPriceApiResponse {
  id: number;
  pharmacy_id: number;
  pharmacy_branch_id?: number;
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
  drug_name?: string;
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

// Response from /pharmacy-prices/drug/:drugId
export type PharmacyPricesByDrugApiResponse = PharmacyPricesApiResponse;

