import { apiService } from './api';
import type { Prescription } from '@/models/Prescription';
import type { 
  PrescriptionsApiResponse,
  PrescriptionDetailApiResponse 
} from '@/models/api';
import { 
  unwrapApiResponse,
  unwrapArrayResponse,
  transformPrescription,
  transformPrescriptions 
} from '@/utils/responseTransformers';

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreatePrescriptionRequest {
  prescription_picture?: File | null;
  prescriptionImage?: string | null;
  prescriptionNumber?: string;
  patientName?: string;
  doctorName?: string;
  prescriptionDate?: string;
  expiryDate?: string;
  status?: string;
  medications?: MedicationItem[];
  notes?: string;
  title?: string;
}

export interface UpdatePrescriptionRequest {
  status?: string;
  medications?: MedicationItem[];
  prescriptionImage?: string;
  notes?: string;
  title?: string;
}

export const prescriptionService = {
  /**
   * Get user's prescriptions
   * @returns Array of prescriptions
   */
  async getPrescriptions(): Promise<Prescription[]> {
    const response = await apiService.getAuth<PrescriptionsApiResponse>('/prescriptions');
    const apiPrescriptions = unwrapArrayResponse(response);
    return transformPrescriptions(apiPrescriptions);
  },

  /**
   * Get prescription by ID
   * @param id - Prescription ID
   * @returns Prescription details
   */
  async getPrescriptionById(id: string | number): Promise<Prescription> {
    const response = await apiService.getAuth<PrescriptionDetailApiResponse>(
      `/prescriptions/${id}`
    );
    const apiPrescription = unwrapApiResponse(response);
    return transformPrescription(apiPrescription);
  },

  /**
   * Create a new prescription
   * @param data - Prescription data
   * @returns Created prescription
   */
  async createPrescription(data: CreatePrescriptionRequest): Promise<Prescription> {
    if (data.prescription_picture) {
      const formData = new FormData();
      if (data.prescription_picture instanceof File) {
        formData.append('prescription_picture', data.prescription_picture);
      }
      if (data.prescriptionImage) formData.append('prescriptionImage', data.prescriptionImage);
      if (data.prescriptionNumber) formData.append('prescriptionNumber', data.prescriptionNumber);
      if (data.patientName) formData.append('patientName', data.patientName);
      if (data.doctorName) formData.append('doctorName', data.doctorName);
      if (data.prescriptionDate) formData.append('prescriptionDate', data.prescriptionDate);
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
      if (data.status) formData.append('status', data.status);
      if (data.medications) formData.append('medications', JSON.stringify(data.medications));
      if (data.notes) formData.append('notes', data.notes);
      if (data.title) formData.append('title', data.title);

      const response = await apiService.postAuth<PrescriptionDetailApiResponse>(
        '/prescriptions', 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const apiPrescription = unwrapApiResponse(response);
      return transformPrescription(apiPrescription);
    } else {
      const response = await apiService.postAuth<PrescriptionDetailApiResponse>(
        '/prescriptions', 
        data
      );
      const apiPrescription = unwrapApiResponse(response);
      return transformPrescription(apiPrescription);
    }
  },

  /**
   * Update a prescription
   * @param id - Prescription ID
   * @param data - Updated prescription data
   * @returns Updated prescription
   */
  async updatePrescription(id: string | number, data: UpdatePrescriptionRequest): Promise<Prescription> {
    const response = await apiService.putAuth<PrescriptionDetailApiResponse>(
      `/prescriptions/${id}`, 
      data
    );
    const apiPrescription = unwrapApiResponse(response);
    return transformPrescription(apiPrescription);
  },

  /**
   * Delete a prescription
   * @param id - Prescription ID
   */
  async deletePrescription(id: string | number): Promise<void> {
    return await apiService.deleteAuth<void>(`/prescriptions/${id}`);
  },

  /**
   * Upload prescription (public endpoint)
   * @param file - Prescription file
   * @returns Upload response
   */
  async uploadPrescriptionPublic(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('prescription', file);
    return await apiService.post<any>('/prescription/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
