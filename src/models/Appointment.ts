export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  date: Date;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  type: "consultation" | "follow-up" | "emergency" | "routine";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentSlot {
  providerId: string;
  date: Date;
  availableTimes: string[];
}

export interface AppointmentRequest {
  patientId: string;
  providerId: string;
  preferredDate: Date;
  preferredTime: string;
  type: Appointment["type"];
  notes?: string;
}
