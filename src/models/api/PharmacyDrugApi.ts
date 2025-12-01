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
  name: string; // Drug name with strength (e.g., "TOLBUTAMIDE 200MCG")
  description: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  category: string[];
  image: string | null;
  predefinedQuantities: string[]; // Array of strings like ["1", "2", "5", "10", "30"]
  brands: PharmacyDrugBrandApiResponse[];
  forms: PharmacyDrugFormApiResponse[];
  requiresPrescription: boolean;
}

// Response from /pharmacy-drugs
export type PharmacyDrugsApiResponse = 
  | PharmacyDrugApiResponse[]
  | { data: PharmacyDrugApiResponse[] };

