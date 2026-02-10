export interface PrescriptionDrug {
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

export interface Prescription {
  id: number;
  title?: string;
  prescription_number: string;
  doctor_name: string;
  prescription_date: string;
  expiry_date?: string;
  status: "active" | "completed" | "cancelled" | "expired";
  notes?: string;
  prescription_picture?: string;
  has_request: boolean;
  user_id: number;
  pharmacy_id?: number;
  pharmacy_branch_id?: number;
  created_at: string;
  updated_at: string;
  drugs: PrescriptionDrug[];
}

// Deprecated interfaces kept for compatibility if needed, but should be phased out
export interface Medication {
  id: string;
  name: string;
  genericName: string;
  description: string;
  category: string;
  sideEffects?: string[];
  contraindications?: string[];
}
