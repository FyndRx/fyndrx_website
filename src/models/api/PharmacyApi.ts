/**
 * Pharmacy API Response Models
 * Based on actual API responses from /pharmacies/* and /pharmacy-prices/* endpoints
 */

export interface PharmacyLocationApiResponse {
  lat: number;
  lng: number;
}

export interface PharmacyServiceApiResponse {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface PharmacyServiceGroupApiResponse {
  category: string;
  label: string;
  services: PharmacyServiceApiResponse[];
}

export interface PharmacyBranchApiResponse {
  id: string;
  pharmacy_id: string;
  name?: string;
  branch_name?: string;
  description?: string | null;
  address?: string;
  city?: string | null;
  region?: string | null;
  phone?: string;
  whatsapp_number?: string | null;
  email?: string | null;
  website?: string | null;
  license_number?: string | null;
  digital_address?: string | null;
  manager?: { name: string; phone?: string | null; email?: string | null } | null;
  banner_image?: string | null;
  location?: PharmacyLocationApiResponse;
  rating?: number;
  total_reviews?: number;
  is_active?: boolean;
  is_open?: boolean;
  working_hours?: any;
  languages?: string[];
  special_storage?: string[];
  accepts_online_prescriptions?: boolean;
  services?: PharmacyServiceApiResponse[];
  delivery?: {
    available: boolean;
    radius_km?: number | null;
    base_fee?: number | null;
    fee_per_km?: number | null;
  };
  accepted_payment_methods?: ('platform' | 'direct')[];
  distance?: string;
}

export interface PharmacyWorkingDayApiResponse {
  day: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed?: boolean;
  is_24_hours?: boolean;
}

export interface PharmacyApiResponse {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string | null;
  license?: string | null;
  logo?: string;
  image?: string;
  description?: string;
  rating?: number;
  total_reviews?: number;
  distance?: string;
  is_open?: boolean;
  isOpen?: boolean; // Sometimes camelCase
  is_active?: boolean;
  services?: PharmacyServiceApiResponse[];
  working_hours?: PharmacyWorkingDayApiResponse[] | Record<string, string> | string[] | string;
  workingHours?: PharmacyWorkingDayApiResponse[] | Record<string, string> | string[] | string; // Sometimes camelCase
  location?: PharmacyLocationApiResponse;
  pharmacy_branch_id?: string;
  branch_name?: string;
  branch_address?: string;
  digital_address?: string;
  city?: string;
  region?: string;
  accepts_online_prescriptions?: boolean;
  special_storage?: string[];
  languages?: string[];
  branches_count?: number;
  branches?: PharmacyBranchApiResponse[];
  whatsapp_number?: string;
  delivery?: {
    available: boolean;
    radius_km?: number | null;
    base_fee?: number | null;
    fee_per_km?: number | null;
  };
  delivery_available?: boolean;
  accepted_payment_methods?: ('platform' | 'direct')[];
  accepted_payment_labels?: string[];
  created_at?: string;
  updated_at?: string;
}

// Response from /pharmacies/services
export type PharmacyServicesCatalogApiResponse = { data: PharmacyServiceGroupApiResponse[] };

// Response from /pharmacies (with or without drugs parameter)
export type PharmaciesApiResponse =
  | PharmacyApiResponse[]
  | { data: PharmacyApiResponse[] }
  | { pharmacies: PharmacyApiResponse[] };

// Response from /pharmacies/:id
export type PharmacyDetailApiResponse = 
  | PharmacyApiResponse
  | { data: PharmacyApiResponse };

