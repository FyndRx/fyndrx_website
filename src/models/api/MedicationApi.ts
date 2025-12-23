/**
 * Medication API Response Models
 * Based on actual API responses from /drug/* and /drugs/* endpoints
 */

import type { PaginatedResponse } from './ApiResponse';

export interface DrugBrandApiResponse {
  id: number;
  name: string;
  image?: string | null;
}

export interface DrugUomApiResponse {
  id: number;
  uom: string;
}

export interface DrugStrengthApiResponse {
  id: number;
  strength: string;
  uoms: DrugUomApiResponse[];
}

export interface DrugFormApiResponse {
  id: number;
  form_name: string;
  strengths: DrugStrengthApiResponse[];
}

export interface MedicationApiResponse {
  id: number;
  drug_name: string;
  description?: string | null;
  category?: string | string[];
  image?: string | null;
  requires_prescription?: boolean;
  requiresPrescription?: boolean;
  predefined_quantities?: number[];
  predefinedQuantities?: number[];
  brands?: DrugBrandApiResponse[];
  forms?: DrugFormApiResponse[];
  created_at?: string;
  updated_at?: string;
}

// Response from /drug/live-search
export type LiveSearchApiResponse = MedicationApiResponse[] | PaginatedResponse<MedicationApiResponse>;

// Response from /drugs/:id
export type MedicationDetailApiResponse = MedicationApiResponse | { data: MedicationApiResponse };

// Response from /drugs/show/multiple
export type MultipleMedicationsApiResponse = 
  | MedicationApiResponse[]
  | { data: MedicationApiResponse[] }
  | Record<number, MedicationApiResponse>;

