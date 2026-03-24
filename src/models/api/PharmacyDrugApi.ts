/**
 * Pharmacy Drug API Response Models
 * Based on /pharmacy-drugs endpoint response
 */

export interface PharmacyDrugBrandApiResponse {
  id: number;
  brand_id: number;
  name: string;
}

export interface PharmacyDrugFormApiResponse {
  id: number;
  form_id: number;
  form_name: string;
}

export interface PharmacyDrugApiResponse {
  id: number;
  drugId: number;
  drug_price_id: number;
  name: string;
  description: string | null;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  category: string[];
  image: string | null;
  predefinedQuantities: number[];
  brands: Array<{
    id: number;
    brand_id: number;
    name: string;
  }>;
  forms: Array<{
    id: number;
    form_id: number;
    form_name: string;
  }>;
  requiresPrescription: boolean;
}

// Response from /pharmacy-drugs
export type PharmacyDrugsApiResponse = {
  data: PharmacyDrugApiResponse[];
  meta?: any;
};

