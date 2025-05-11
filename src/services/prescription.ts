import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface PrescriptionUploadData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  prescription_picture: File;
}

export const prescriptionService = {
  async uploadPrescription(data: PrescriptionUploadData) {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('phone_number', data.phone_number);
    formData.append('prescription_picture', data.prescription_picture);

    const response = await axios.post(`${API_URL}/prescription/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}; 