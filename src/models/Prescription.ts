export interface Prescription {
  id: string;
  patientId: string;
  providerId: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  refills: number;
  status: "active" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  description: string;
  category: string;
  sideEffects?: string[];
  contraindications?: string[];
}

export interface PrescriptionRequest {
  patientId: string;
  providerId: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  refills: number;
  notes?: string;
}
