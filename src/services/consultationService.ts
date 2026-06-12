import { apiService as api } from './api';
import type {
    Consultation,
    ConsultationStats,
    PatientConsultationIntake,
    ConsultationFilters,
    PublicConsultationSearchResponse
} from '@/types/consultation';

const PATIENT_INTAKE_KEYS: (keyof PatientConsultationIntake)[] = [
    'consultation_type',
    'chief_complaint',
    'consultation_notes',
    'patient_name',
    'patient_email',
    'patient_phone',
    'patient_date_of_birth',
    'patient_gender',
    'pharmacy_id',
    'pharmacy_branch_id',
    'scheduled_at',
    'source',
    'user_id',
    'parent_consultation_id',
];

export function buildPatientIntakePayload(
    form: Partial<PatientConsultationIntake> & { symptoms?: string }
): Record<string, string | number | undefined> {
    const payload: Record<string, string | number | undefined> = {};

    for (const key of PATIENT_INTAKE_KEYS) {
        const value = form[key];
        if (value !== undefined && value !== null && value !== '') {
            payload[key] = value as string | number;
        }
    }

    if (!payload.chief_complaint && form.symptoms) {
        payload.chief_complaint = form.symptoms;
    }

    return payload;
}

function appendIntakeToFormData(formData: FormData, payload: Record<string, string | number | undefined>) {
    Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
        }
    });
}

export const consultationService = {
    async getConsultations(filters: ConsultationFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        return api.getAuth<{ data: Consultation[]; meta: unknown }>(`/consultations?${params.toString()}`);
    },

    async getConsultationStats() {
        return api.getAuth<ConsultationStats>('/consultations/stats');
    },

    async getConsultationById(id: string | number) {
        return api.getAuth<Consultation>(`/consultations/${id}`);
    },

    async createConsultation(payload: PatientConsultationIntake) {
        const body = buildPatientIntakePayload(payload);

        if (payload.attachments && payload.attachments.length > 0) {
            const formData = new FormData();
            appendIntakeToFormData(formData, body);
            payload.attachments.forEach((file) => formData.append('attachments[]', file));

            return api.postAuth<Consultation>('/consultations', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        return api.postAuth<Consultation>('/consultations', body);
    },

    async updateConsultation(id: string | number, payload: Partial<PatientConsultationIntake>) {
        const body = buildPatientIntakePayload(payload);
        return api.putAuth<Consultation>(`/consultations/${id}`, body);
    },

    async cancelConsultation(id: string | number, reason: string) {
        return api.postAuth<Consultation>(`/consultations/${id}/cancel`, { reason });
    },

    async rateConsultation(id: string | number, rating: number, feedback?: string) {
        return api.postAuth<Consultation>(`/consultations/${id}/rate`, { rating, feedback });
    },

    async createPublicConsultation(payload: PatientConsultationIntake) {
        const body = buildPatientIntakePayload(payload);

        if (payload.attachments && payload.attachments.length > 0) {
            const formData = new FormData();
            appendIntakeToFormData(formData, body);
            payload.attachments.forEach((file) => formData.append('attachments[]', file));

            return api.post<Consultation>('/consultations', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        return api.post<Consultation>('/consultations', body);
    },

    async searchPublicConsultation(params: {
        consultation_number: string;
        patient_phone?: string;
        patient_email?: string;
    }) {
        const response = await api.get<{ data: PublicConsultationSearchResponse }>('/consultations/search', { params });
        return response.data;
    },
};
