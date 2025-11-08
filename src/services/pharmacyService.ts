import axios from 'axios';
import type { Pharmacy, PharmacyFilters, PharmacyReview } from '@/models/Pharmacy';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fyndrx.com/v1';

// Demo data for development
const demoPharmacies: Pharmacy[] = [
  {
    id: 1,
    name: 'MedPlus Pharmacy',
    address: '123 Health Street, Medical District',
    rating: 4.8,
    reviews: [
      {
        id: 1,
        user: 'John Doe',
        rating: 5,
        comment: 'Excellent service! The staff is very knowledgeable and helpful.',
        date: '2024-03-15',
      },
      {
        id: 2,
        user: 'Jane Smith',
        rating: 4,
        comment: 'Great pharmacy with quick service. Would recommend!',
        date: '2024-03-10',
      },
    ],
    image: '/src/assets/pharmacy-placeholder.jpg',
    isOpen: true,
    distance: '0.5 miles',
    services: ['Prescription Delivery', '24/7 Service', 'Online Ordering'],
    workingHours: {
      monday: '8:00 AM - 10:00 PM',
      tuesday: '8:00 AM - 10:00 PM',
      wednesday: '8:00 AM - 10:00 PM',
      thursday: '8:00 AM - 10:00 PM',
      friday: '8:00 AM - 10:00 PM',
      saturday: '9:00 AM - 8:00 PM',
      sunday: '10:00 AM - 6:00 PM',
    },
    phone: '+1 (555) 123-4567',
    email: 'contact@medplus.com',
    website: 'www.medplus.com',
    description:
      'MedPlus Pharmacy is a full-service pharmacy committed to providing exceptional healthcare services to our community.',
    location: {
      lat: 37.7749,
      lng: -122.4194,
    },
    medications: [
      {
        id: 1,
        name: 'Amoxicillin',
        description: 'Antibiotic used to treat bacterial infections',
        price: '15.99',
        inStock: true,
        requiresPrescription: true,
      },
      {
        id: 2,
        name: 'Ibuprofen',
        description: 'Non-steroidal anti-inflammatory drug (NSAID)',
        price: '8.99',
        inStock: true,
        requiresPrescription: false,
      },
    ],
  },
  // Add more demo pharmacies as needed
];

export const pharmacyService = {
  // Get all pharmacies with filters
  async getPharmacies(filters: PharmacyFilters): Promise<Pharmacy[]> {
    try {
      if (import.meta.env.DEV) {
        // Use demo data in development
        return demoPharmacies;
      }

      const response = await axios.get(`${API_BASE_URL}/pharmacies`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      throw error;
    }
  },

  // Get a single pharmacy by ID
  async getPharmacy(id: number): Promise<Pharmacy> {
    try {
      if (import.meta.env.DEV) {
        // Use demo data in development
        const pharmacy = demoPharmacies.find(p => p.id === id);
        if (!pharmacy) throw new Error('Pharmacy not found');
        return pharmacy;
      }

      const response = await axios.get(`${API_BASE_URL}/pharmacies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy:', error);
      throw error;
    }
  },

  // Upload prescription
  async uploadPrescription(
    pharmacyId: number,
    file: File
  ): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('prescription', file);

      if (import.meta.env.DEV) {
        // Simulate API call in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Prescription uploaded successfully' };
      }

      const response = await axios.post(
        `${API_BASE_URL}/pharmacies/${pharmacyId}/prescriptions`,
        formData
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading prescription:', error);
      throw error;
    }
  },

  // Schedule pickup
  async schedulePickup(
    pharmacyId: number,
    date: string,
    time: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (import.meta.env.DEV) {
        // Simulate API call in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Pickup scheduled successfully' };
      }

      const response = await axios.post(`${API_BASE_URL}/pharmacies/${pharmacyId}/pickups`, {
        date,
        time,
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      throw error;
    }
  },

  // Add review
  async addReview(pharmacyId: number, review: Omit<PharmacyReview, 'id'>): Promise<PharmacyReview> {
    try {
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          id: Math.floor(Math.random() * 1000),
          ...review,
        };
      }

      const response = await axios.post(`${API_BASE_URL}/pharmacies/${pharmacyId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },
};
