/**
 * Prescription API Response Models
 * Based on actual API responses from /prescriptions/* endpoints
 */

export interface PrescriptionDrugApiResponse {
  id: string;
  prescription_id: string;
  drug_id: number;
  product_id?: string;
  display_name?: string;
  drug_name?: string;
  name?: string;
  brand_id?: number;
  brand_name?: string;
  form_id: number;
  form_name: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  uom_id: number;
  uom: string;
  instruction?: string;
  image?: string;
  created_at: string;
}

export interface PrescriptionApiResponse {
  id: string;
  title?: string;
  prescription_number: string;
  doctor_name: string;
  prescription_date: string;
  expiry_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  prescription_picture?: string;
  has_request: boolean;
  origin?: string;
  user_id: string;
  pharmacy_id?: string;
  pharmacy_branch_id?: string;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  drugs: PrescriptionDrugApiResponse[];
}

// Response from /prescriptions
export type PrescriptionsApiResponse = 
  | PrescriptionApiResponse[]
  | { data: PrescriptionApiResponse[] };

// Response from /prescriptions/:id
export type PrescriptionDetailApiResponse = 
  | PrescriptionApiResponse
  | { data: PrescriptionApiResponse };
