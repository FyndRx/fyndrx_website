import { apiService as api } from './api';
import type {
    Consultation,
    ConsultationStats,
    CreateConsultationPayload,
    ConsultationFilters
} from '@/types/consultation';

export const consultationService = {
    async getConsultations(filters: ConsultationFilters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        const response = await api.getAuth<{ data: Consultation[]; meta: any }>(`/consultations?${params.toString()}`);
        return response;
    },

    async getConsultationStats() {
        const response = await api.getAuth<ConsultationStats>('/consultations/stats');
        return response;
    },

    async getConsultationById(id: number) {
        const response = await api.getAuth<Consultation>(`/consultations/${id}`);
        return response;
    },

    async createConsultation(payload: CreateConsultationPayload) {
        if (payload.attachments && payload.attachments.length > 0) {
            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                if (key === 'attachments') {
                    (value as File[]).forEach(file => formData.append('attachments[]', file));
                } else if (key === 'vitals' && value) {
                    // Handle nested vitals object
                    Object.entries(value).forEach(([vitalKey, vitalValue]) => {
                        if (vitalValue !== undefined && vitalValue !== null && vitalValue !== '') {
                            formData.append(`vitals[${vitalKey}]`, String(vitalValue));
                        }
                    });
                } else if (value !== undefined && value !== null && value !== '') {
                    // Convert boolean/numbers to string, explicit check to avoid "undefined" string
                    formData.append(key, String(value));
                }
            });
            
            const response = await api.postAuth<Consultation>('/consultations', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        }

        // For non-multipart requests, we can just pass the payload directly
        // The API should handle the JSON structure for vitals
        const response = await api.postAuth<Consultation>('/consultations', payload);
        return response;
    },

    async updateConsultation(id: number, payload: Partial<CreateConsultationPayload>) {
        const response = await api.putAuth<Consultation>(`/consultations/${id}`, payload);
        return response;
    },

    async cancelConsultation(id: number, reason: string) {
        const response = await api.postAuth<Consultation>(`/consultations/${id}/cancel`, { reason });
        return response;
    },

    async rateConsultation(id: number, rating: number, feedback?: string) {
        const response = await api.postAuth<Consultation>(`/consultations/${id}/rate`, { rating, feedback });
        return response;
    }
};
