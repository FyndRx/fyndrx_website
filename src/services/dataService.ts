import type { Medication, PharmacyMedicationPrice } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';
import type { Review } from '@/models/Review';

import medicationsData from '@/data/medications.json';
import pharmaciesData from '@/data/pharmacies.json';
import pharmacyPricesData from '@/data/pharmacyPrices.json';
import reviewsData from '@/data/reviews.json';

export const dataService = {
  getAllMedications(): Medication[] {
    return medicationsData as Medication[];
  },

  getMedicationById(id: number): Medication | undefined {
    const medications = medicationsData as Medication[];
    return medications.find(m => m.id === id);
  },

  searchMedications(query: string): Medication[] {
    const medications = medicationsData as Medication[];
    if (!query) return medications;
    
    const searchTerm = query.toLowerCase();
    return medications.filter(med =>
      med.drug_name.toLowerCase().includes(searchTerm) ||
      med.description.toLowerCase().includes(searchTerm) ||
      (Array.isArray(med.category) 
        ? med.category.some(cat => cat.toLowerCase().includes(searchTerm))
        : med.category.toLowerCase().includes(searchTerm)) ||
      med.brands.some(brand => brand.name.toLowerCase().includes(searchTerm))
    );
  },

  getMedicationsByCategory(category: string): Medication[] {
    const medications = medicationsData as Medication[];
    if (!category || category === 'all') return medications;
    return medications.filter(med => {
      if (Array.isArray(med.category)) {
        return med.category.includes(category);
      }
      return med.category === category;
    });
  },

  getAllPharmacies(): Pharmacy[] {
    return pharmaciesData as Pharmacy[];
  },

  getPharmacyById(id: number): Pharmacy | undefined {
    const pharmacies = pharmaciesData as Pharmacy[];
    return pharmacies.find(p => p.id === id);
  },

  searchPharmacies(query: string): Pharmacy[] {
    const pharmacies = pharmaciesData as Pharmacy[];
    if (!query) return pharmacies;
    
    const searchTerm = query.toLowerCase();
    return pharmacies.filter(pharmacy =>
      pharmacy.name.toLowerCase().includes(searchTerm) ||
      pharmacy.address.toLowerCase().includes(searchTerm) ||
      pharmacy.description.toLowerCase().includes(searchTerm) ||
      pharmacy.services.some(service => service.toLowerCase().includes(searchTerm))
    );
  },

  getPharmacyMedicationPrice(
    pharmacyId: number,
    medicationId: number,
    formId: number,
    strengthId: number,
    brandId?: number
  ): PharmacyMedicationPrice | undefined {
    const prices = pharmacyPricesData as PharmacyMedicationPrice[];
    return prices.find(p => 
      p.pharmacyId === pharmacyId && 
      p.medicationId === medicationId &&
      p.formId === formId &&
      p.strengthId === strengthId &&
      (brandId === undefined || p.brandId === brandId || p.brandId === undefined)
    );
  },

  getPharmaciesForMedication(medicationId: number, formId?: number, strengthId?: number): PharmacyMedicationPrice[] {
    const prices = pharmacyPricesData as PharmacyMedicationPrice[];
    let filtered = prices.filter(p => p.medicationId === medicationId);
    
    if (formId !== undefined) {
      filtered = filtered.filter(p => p.formId === formId);
    }
    if (strengthId !== undefined) {
      filtered = filtered.filter(p => p.strengthId === strengthId);
    }
    
    return filtered;
  },

  getMedicationsForPharmacy(pharmacyId: number): Medication[] {
    const prices = pharmacyPricesData as PharmacyMedicationPrice[];
    const pharmacyPrices = prices.filter(p => p.pharmacyId === pharmacyId);
    
    const medicationIds = new Set(pharmacyPrices.map(p => p.medicationId));
    const medications = medicationsData as Medication[];
    
    return medications.filter(med => medicationIds.has(med.id));
  },

  getAvailablePharmaciesForSelection(medicationId: number, formId: number, strengthId: number): number[] {
    const prices = pharmacyPricesData as PharmacyMedicationPrice[];
    const pharmacyIds = new Set(
      prices
        .filter(p => p.medicationId === medicationId && p.formId === formId && p.strengthId === strengthId)
        .map(p => p.pharmacyId)
    );
    return Array.from(pharmacyIds);
  },

  getPharmacyRating(pharmacyId: number): { average: number; count: number } {
    const reviews = reviewsData as Review[];
    const pharmacyReviews = reviews.filter(r => r.targetType === 'pharmacy' && r.targetId === String(pharmacyId));
    
    if (pharmacyReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const totalRating = pharmacyReviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: totalRating / pharmacyReviews.length,
      count: pharmacyReviews.length
    };
  },

  getMedicationRating(medicationId: number): { average: number; count: number } {
    const reviews = reviewsData as Review[];
    const medicationReviews = reviews.filter(r => r.targetType === 'medication' && r.targetId === String(medicationId));
    
    if (medicationReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const totalRating = medicationReviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: totalRating / medicationReviews.length,
      count: medicationReviews.length
    };
  }
};

