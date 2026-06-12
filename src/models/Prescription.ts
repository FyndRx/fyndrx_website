export interface PrescriptionDrug {
  id: string;
  prescription_id: string;
  drug_id: number;
  product_id?: string;
  display_name?: string;
  name: string;
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
  id: string;
  title?: string;
  prescription_number: string;
  doctor_name: string;
  prescription_date: string;
  expiry_date?: string;
  status: "active" | "completed" | "cancelled" | "expired";
  notes?: string;
  prescription_picture?: string;
  has_request: boolean;
  origin?: string;
  user_id: string;
  pharmacy_id?: string;
  pharmacy_branch_id?: string;
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
