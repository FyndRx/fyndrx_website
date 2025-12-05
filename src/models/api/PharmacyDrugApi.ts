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
  pharmacy_id: number;
  branch_id: number;
  drug_id: number;
  drug: {
    id: number;
    drug_name: string;
    description: string | null;
    image: string | null;
    requires_prescription: boolean;
  };
  brand: {
    id: number;
    name: string;
  } | null;
  form: {
    id: number;
    form_name: string;
  } | null;
  strength: {
    id: number;
    strength: string;
  } | null;
  uom: {
    id: number;
    uom: string;
  } | null;
  normal_price: number;
  discounted_price: number;
  max_discounted_price: string;
  is_active: number;
  predefinedQuantities?: string[]; // Optional as it wasn't in the curl output but might be there
}

// Response from /pharmacy-drugs
export type PharmacyDrugsApiResponse =
  | PharmacyDrugApiResponse[]
  | { data: PharmacyDrugApiResponse[] };

