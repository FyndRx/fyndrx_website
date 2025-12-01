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
  discount_price?: number;
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
  discountPrice?: number;
  inStock?: boolean;
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

