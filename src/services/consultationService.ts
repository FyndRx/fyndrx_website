import api from './api';
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

        const response = await api.get<{ data: Consultation[]; meta: any }>(`/consultations?${params.toString()}`);
        return response.data;
    },

    async getConsultationStats() {
        const response = await api.get<ConsultationStats>('/consultations/stats');
        return response.data;
    },

    async getConsultationById(id: number) {
        const response = await api.get<Consultation>(`/consultations/${id}`);
        return response.data;
    },

    async createConsultation(payload: CreateConsultationPayload) {
        const response = await api.post<Consultation>('/consultations', payload);
        return response.data;
    },

    async updateConsultation(id: number, payload: Partial<CreateConsultationPayload>) {
        const response = await api.put<Consultation>(`/consultations/${id}`, payload);
        return response.data;
    },

    async cancelConsultation(id: number, reason: string) {
        const response = await api.post<Consultation>(`/consultations/${id}/cancel`, { reason });
        return response.data;
    },

    async rateConsultation(id: number, rating: number, feedback?: string) {
        const response = await api.post<Consultation>(`/consultations/${id}/rate`, { rating, feedback });
        return response.data;
    }
};
