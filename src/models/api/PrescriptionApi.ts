/**
 * Prescription API Response Models
 * Based on actual API responses from /prescriptions/* endpoints
 */

export interface PrescriptionApiResponse {
  id: string | number;
  user_id?: number;
  userId?: number; // Sometimes camelCase
  file_path?: string;
  filePath?: string; // Sometimes camelCase
  file_url?: string;
  fileUrl?: string; // Sometimes camelCase
  file_name?: string;
  fileName?: string; // Sometimes camelCase
  file_size?: number;
  fileSize?: number; // Sometimes camelCase
  mime_type?: string;
  mimeType?: string; // Sometimes camelCase
  status?: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  createdAt?: string; // Sometimes camelCase
  updated_at: string;
  updatedAt?: string; // Sometimes camelCase
}

// Response from /prescriptions
export type PrescriptionsApiResponse = 
  | PrescriptionApiResponse[]
  | { data: PrescriptionApiResponse[] };

// Response from /prescriptions/:id
export type PrescriptionDetailApiResponse = 
  | PrescriptionApiResponse
  | { data: PrescriptionApiResponse };

