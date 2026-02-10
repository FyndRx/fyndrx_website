/**
 * Prescription API Response Models
 * Based on actual API responses from /prescriptions/* endpoints
 */

export interface PrescriptionDrugApiResponse {
  id: number;
  prescription_id: number;
  drug_id: number;
  drug_name: string;
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
  id: number;
  title?: string;
  prescription_number: string;
  doctor_name: string;
  prescription_date: string;
  expiry_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  notes?: string;
  prescription_picture?: string;
  has_request: boolean;
  user_id: number;
  pharmacy_id?: number;
  pharmacy_branch_id?: number;
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
