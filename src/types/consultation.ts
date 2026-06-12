export type ConsultationStatus = 'pending' | 'in_review' | 'responded' | 'completed' | 'cancelled';
export type ConsultationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ConsultationType = 'general' | 'medication_review' | 'chronic_disease' | 'acute_illness' | 'wellness' | 'vaccination';

/** Measured by pharmacy staff during the encounter — not patient self-report. */
export interface Vitals {
    blood_pressure_systolic?: string | number;
    blood_pressure_diastolic?: string | number;
    heart_rate?: string | number;
    temperature?: string | number;
    oxygen_saturation?: string | number;
    respiratory_rate?: string | number;
    weight?: string | number;
    height?: string | number;
}

export interface Diagnosis {
    id: number;
    name: string;
    type: string;
    category: string;
    icd_code?: string;
}

export interface Drug {
    id: string;
    prescription_id: string;
    drug_id?: number;
    display_name?: string;
    drug_name?: string;
    name: string;
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
    id: string;
    title?: string | null;
    prescription_number: string;
    doctor_name?: string;
    prescription_date: string;
    expiry_date?: string | null;
    status: string;
    notes?: string | null;
    prescription_picture?: string | null;
    has_request: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
    drugs: Drug[];
    pdf_url?: string;
}

export interface ConsultationRef {
    id: string;
    consultation_number: string;
    status: ConsultationStatus;
    created_at: string;
}

export interface Consultation {
    id: string;
    consultation_number: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    user_id?: string;
    parent_consultation_id?: string | null;
    parent_consultation?: ConsultationRef;
    follow_up_consultations?: ConsultationRef[];
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    patient_date_of_birth?: string | null;
    patient_gender?: string | null;
    vitals?: Vitals;
    consultation_type: ConsultationType;
    consultation_type_label?: string;
    /** Plain-language reason submitted by the patient at booking. */
    chief_complaint?: string | null;
    /** Structured clinical presentation documented by staff. */
    symptoms?: string | null;
    medical_history?: string | null;
    current_medications?: string | null;
    allergies?: string | null;
    diagnoses?: Diagnosis[];
    consultation_notes?: string;
    pharmacist_notes?: string | null;
    recommendations?: string;
    prescription?: Prescription;
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
        id: string;
        name: string;
        logo?: string;
    };
    assigned_pharmacist?: {
        id: string;
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

/** Fields patients may submit when booking a consultation. */
export interface PatientConsultationIntake {
    consultation_type: ConsultationType;
    chief_complaint: string;
    consultation_notes?: string;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    patient_date_of_birth?: string;
    patient_gender?: string;
    pharmacy_id?: string;
    pharmacy_branch_id?: string;
    scheduled_at?: string;
    source?: string;
    attachments?: File[];
    user_id?: string;
    parent_consultation_id?: string;
}

/** @deprecated Use PatientConsultationIntake — kept for gradual migration */
export type CreateConsultationPayload = PatientConsultationIntake;

export interface ConsultationFilters {
    status?: ConsultationStatus;
    priority?: ConsultationPriority;
    type?: ConsultationType;
    pharmacy_id?: string;
    requires_followup?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

export interface PublicConsultationSearchResponse {
    id: string;
    consultation_number: string;
    user: { id: string; name: string; email: string } | null;
    patient_name: string;
    patient_email: string | null;
    patient_phone: string | null;
    patient_date_of_birth: string | null;
    patient_gender: string | null;
    vitals: Vitals | null;
    consultation_type: ConsultationType;
    consultation_type_label: string;
    chief_complaint: string | null;
    symptoms: string | null;
    medical_history: string | null;
    current_medications: string | null;
    allergies: string | null;
    diagnoses: Diagnosis[];
    consultation_notes: string | null;
    pharmacist_notes: string | null;
    recommendations: string | null;
    prescription: Prescription | null;
    status: ConsultationStatus;
    status_label: string;
    priority: ConsultationPriority;
    priority_label: string;
    responded_at: string | null;
    completed_at: string | null;
    scheduled_at: string | null;
    response_time_minutes: number | null;
    requires_followup: boolean;
    followup_date: string | null;
    followup_notes: string | null;
    rating: number | null;
    feedback: string | null;
    rated_at: string | null;
    attachments: string[] | null;
    source: string;
    created_at: string;
    updated_at: string;
}
