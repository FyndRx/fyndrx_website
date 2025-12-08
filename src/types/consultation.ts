export type ConsultationStatus = 'pending' | 'in_review' | 'responded' | 'completed' | 'cancelled';
export type ConsultationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ConsultationType = 'general' | 'medication_review' | 'chronic_disease' | 'acute_illness' | 'wellness' | 'vaccination';

export interface Consultation {
    id: number;
    consultation_number: string;
    user_id: number;
    pharmacy_id: number;
    pharmacy_branch_id?: number;
    consultation_type: ConsultationType;
    subject: string;
    symptoms?: string;
    medical_history?: string;
    current_medications?: string;
    allergies?: string;
    consultation_notes?: string;
    priority: ConsultationPriority;
    status: ConsultationStatus;
    patient_name: string;
    patient_email: string;
    patient_phone: string;
    patient_date_of_birth?: string;
    patient_gender?: 'male' | 'female' | 'other';
    scheduled_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    pharmacist_notes?: string;
    recommendations?: string;
    requires_followup: boolean;
    followup_date?: string;
    followup_notes?: string;
    rating?: number;
    rating_feedback?: string;
    source: string;
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
    attachments?: string[];
}

export interface ConsultationStats {
    total: number;
    pending: number;
    in_review: number;
    responded: number;
    completed: number;
    cancelled: number;
    requires_followup: number;
    average_rating: number;
    total_rated: number;
}

export interface CreateConsultationPayload {
    consultation_type: ConsultationType;
    subject: string;
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
    patient_gender?: 'male' | 'female';
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
