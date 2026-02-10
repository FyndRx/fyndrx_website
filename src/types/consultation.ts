export type ConsultationStatus = 'pending' | 'in_review' | 'responded' | 'completed' | 'cancelled';
export type ConsultationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ConsultationType = 'general' | 'medication_review' | 'chronic_disease' | 'acute_illness' | 'wellness' | 'vaccination';

export interface Vitals {
    blood_pressure_systolic?: string; // JSON shows string "120"
    blood_pressure_diastolic?: string;
    heart_rate?: string;
    temperature?: string;
    oxygen_saturation?: string;
    respiratory_rate?: string;
    weight?: string;
    height?: string;
}

export interface Diagnosis {
    id: number;
    name: string;
    type: string;
    category: string;
    icd_code?: string;
}

export interface Drug {
    id: number;
    prescription_id: number;
    drug_id?: number;
    drug_name: string;
    brand_id?: number | null;
    brand_name?: string | null;
    form_id?: number;
    form_name?: string;
    dose: string;
    frequency: string;
    duration: string;
    quantity: number;
    uom_id?: number;
    uom?: string;
    instruction?: string;
    image?: string | null;
    created_at: string;
}

export interface Prescription {
    id: number;
    title?: string | null;
    prescription_number: string;
    doctor_name?: string;
    prescription_date: string;
    expiry_date?: string | null;
    status: string;
    notes?: string | null;
    prescription_picture?: string | null;
    has_request: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
    drugs: Drug[];
    pdf_url?: string; // Kept for backward compatibility if needed, though not in JSON
}

export interface Consultation {
    id: number;
    consultation_number: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    user_id?: number; // Kept for payload compatibility
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    patient_date_of_birth?: string | null;
    patient_gender?: string | null;
    vitals?: Vitals;
    consultation_type: ConsultationType;
    consultation_type_label?: string;
    symptoms?: string;
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
    diagnoses?: Diagnosis[];
    consultation_notes?: string;
    pharmacist_notes?: string | null;
    recommendations?: string;
    prescription?: Prescription; // JSON has singular object
    // prescriptions?: Prescription[]; // Keeping commented out just in case of conflict with other parts of app temporarily
    status: ConsultationStatus;
    status_label?: string;
    priority: ConsultationPriority;
    priority_label?: string;
    responded_at?: string | null;
    completed_at?: string | null;
    scheduled_at?: string | null;
    response_time_minutes?: number | null;
    requires_followup: boolean;
    followup_date?: string | null;
    followup_notes?: string | null;
    rating?: number | null;
    feedback?: string | null;
    rated_at?: string | null;
    attachments?: string[] | null;
    source?: string;
    created_at: string;
    updated_at: string;
    pharmacy?: {
        id: number;
        name: string;
        logo?: string;
    };
    assigned_pharmacist?: {
        id: number;
        name: string;
        email: string;
        phone_number: string;
    };
    cancellation_reason?: string;
}

export interface ConsultationStats {
    total: number;
    pending: number;
    in_review: number;
    responded: number;
    completed: number;
    cancelled: number;
    requires_followup: number;
    average_rating: number | null;
    total_rated: number;
}

export interface CreateConsultationPayload {
    consultation_type: ConsultationType;
    symptoms?: string;
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
    consultation_notes?: string;
    priority: ConsultationPriority;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    patient_date_of_birth?: string;
    patient_gender: string;
    vitals?: Vitals;
    pharmacy_id: number;
    pharmacy_branch_id?: number;
    scheduled_at?: string;
    source?: string;
    attachments?: File[];
    user_id: number;
}

export interface ConsultationFilters {
    status?: ConsultationStatus;
    priority?: ConsultationPriority;
    type?: ConsultationType;
    pharmacy_id?: number;
    requires_followup?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}
