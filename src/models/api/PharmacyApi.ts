/**
 * Pharmacy API Response Models
 * Based on actual API responses from /pharmacies/* and /pharmacy-prices/* endpoints
 */

export interface PharmacyLocationApiResponse {
  lat: number;
  lng: number;
}

export interface PharmacyBranchApiResponse {
  id: number;
  pharmacy_id: number;
  name?: string;
  branch_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_open?: boolean;
  location?: PharmacyLocationApiResponse;
}

export interface PharmacyApiResponse {
  id: number;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  image?: string;
  description?: string;
  rating?: number;
  distance?: string;
  is_open?: boolean;
  isOpen?: boolean; // Sometimes camelCase
  services?: string[];
  working_hours?: Record<string, string>;
  workingHours?: Record<string, string>; // Sometimes camelCase
  location?: PharmacyLocationApiResponse;
  pharmacy_branch_id?: number;
  branch_name?: string;
  branch_address?: string;
  created_at?: string;
  updated_at?: string;
}

// Response from /pharmacies (with or without drugs parameter)
export type PharmaciesApiResponse = 
  | PharmacyApiResponse[]
  | { data: PharmacyApiResponse[] }
  | { pharmacies: PharmacyApiResponse[] };

// Response from /pharmacies/:id
export type PharmacyDetailApiResponse = 
  | PharmacyApiResponse
  | { data: PharmacyApiResponse };

