import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Medication } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';
import type { PharmacyPrice } from '@/models/PharmacyPrice';

/**
 * Data Cache Store
 * Caches medications, pharmacies, and pharmacy prices to minimize API calls
 */
export const useDataCacheStore = defineStore('dataCache', () => {
  // Medications cache
  const medications = ref<Map<number, Medication>>(new Map());
  const medicationsLoading = ref<Set<number>>(new Set());
  
  // Pharmacies cache
  const pharmacies = ref<Map<number, Pharmacy>>(new Map());
  const pharmaciesLoading = ref<Set<number>>(new Set());
  
  // Pharmacy prices cache
  const pharmacyPrices = ref<PharmacyPrice[]>([]);
  const pharmacyPricesByPharmacy = ref<Map<number, PharmacyPrice[]>>(new Map());
  const pharmacyPricesByDrug = ref<Map<number, PharmacyPrice[]>>(new Map());
  
  // Computed getters
  const getMedication = computed(() => (id: number): Medication | undefined => {
    return medications.value.get(id);
  });
  
  const getPharmacy = computed(() => (id: number): Pharmacy | undefined => {
    return pharmacies.value.get(id);
  });
  
  const getPharmacyPrices = computed(() => (pharmacyId?: number, drugId?: number): PharmacyPrice[] => {
    if (pharmacyId) {
      return pharmacyPricesByPharmacy.value.get(pharmacyId) || [];
    }
    if (drugId) {
      return pharmacyPricesByDrug.value.get(drugId) || [];
    }
    return pharmacyPrices.value;
  });
  
  // Actions
  const setMedication = (medication: Medication) => {
    medications.value.set(medication.id, medication);
  };
  
  const setMedications = (meds: Medication[]) => {
    meds.forEach(med => medications.value.set(med.id, med));
  };
  
  const setPharmacy = (pharmacy: Pharmacy) => {
    pharmacies.value.set(pharmacy.id, pharmacy);
  };
  
  const setPharmacies = (pharms: Pharmacy[]) => {
    // Ensure pharms is an array
    if (!Array.isArray(pharms)) {
      console.warn('setPharmacies received non-array:', pharms);
      return;
    }
    pharms.forEach(pharm => {
      if (pharm && pharm.id) {
        pharmacies.value.set(pharm.id, pharm);
      }
    });
  };
  
  const setPharmacyPrices = (prices: PharmacyPrice[]) => {
    // Ensure prices is an array
    if (!Array.isArray(prices)) {
      console.warn('setPharmacyPrices received non-array:', prices);
      return;
    }
    
    // Merge prices instead of replacing - avoid duplicates by price.id
    const existingPriceIds = new Set(pharmacyPrices.value.map(p => p.id));
    const newPrices = prices.filter(p => !existingPriceIds.has(p.id));
    
    // Add new prices to the main array
    pharmacyPrices.value = [...pharmacyPrices.value, ...newPrices];
    
    // Update indexes without clearing - merge into existing indexes
    prices.forEach(price => {
      const pharmacyId = price.pharmacy_id;
      
      // Only add if not already in the index
      if (pharmacyId) {
        if (!pharmacyPricesByPharmacy.value.has(pharmacyId)) {
          pharmacyPricesByPharmacy.value.set(pharmacyId, []);
        }
        const pharmacyPricesList = pharmacyPricesByPharmacy.value.get(pharmacyId)!;
        // Check if price already exists in this pharmacy's list
        if (!pharmacyPricesList.some(p => p.id === price.id)) {
          pharmacyPricesList.push(price);
        }
      }
      
      // Use medicationId (primary) or drug_id (fallback) for indexing
      const medicationId = (price as any).medicationId ?? price.drug_id;
      if (medicationId) {
        if (!pharmacyPricesByDrug.value.has(medicationId)) {
          pharmacyPricesByDrug.value.set(medicationId, []);
        }
        const drugPricesList = pharmacyPricesByDrug.value.get(medicationId)!;
        // Check if price already exists in this drug's list
        if (!drugPricesList.some(p => p.id === price.id)) {
          drugPricesList.push(price);
        }
      }
    });
  };
  
  const addPharmacyPrice = (price: PharmacyPrice) => {
    pharmacyPrices.value.push(price);
    
    // Update pharmacy index
    const pharmacyId = price.pharmacy_id;
    if (!pharmacyPricesByPharmacy.value.has(pharmacyId)) {
      pharmacyPricesByPharmacy.value.set(pharmacyId, []);
    }
    pharmacyPricesByPharmacy.value.get(pharmacyId)!.push(price);
    
    // Update drug index - use medicationId (primary) or drug_id (fallback)
    const medicationId = (price as any).medicationId ?? price.drug_id;
    if (medicationId) {
      if (!pharmacyPricesByDrug.value.has(medicationId)) {
        pharmacyPricesByDrug.value.set(medicationId, []);
      }
      pharmacyPricesByDrug.value.get(medicationId)!.push(price);
    }
  };
  
  // Extract unique pharmacies from pharmacy prices
  const extractPharmaciesFromPrices = (prices: PharmacyPrice[]): Pharmacy[] => {
    const pharmacyMap = new Map<number, Pharmacy>();
    
    prices.forEach(price => {
      const pharmacyId = price.pharmacy_id;
      if (!pharmacyId || isNaN(Number(pharmacyId))) return;
      
      const id = Number(pharmacyId);
      
      // Check if already in cache
      if (pharmacies.value.has(id)) {
        pharmacyMap.set(id, pharmacies.value.get(id)!);
        return;
      }
      
      // Build pharmacy from price data
      if (!pharmacyMap.has(id)) {
        const pharmacy: Pharmacy = {
          id: id,
          name: price.pharmacy?.name || price.pharmacy_name || `Pharmacy ${id}`,
          image: price.pharmacy?.logo || price.pharmacy_logo || '',
          address: price.pharmacy?.address || price.pharmacy_address || '',
          rating: price.pharmacy?.rating || price.rating || 0,
          distance: price.pharmacy?.distance || price.distance || '',
          isOpen: price.pharmacy?.is_open !== undefined ? price.pharmacy.is_open : true,
          services: [],
          phone: '',
          email: '',
          website: '',
          description: '',
          workingHours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: ''
          },
          location: {
            lat: 0,
            lng: 0
          },
          reviews: [],
          medications: []
        };
        pharmacyMap.set(id, pharmacy);
      }
    });
    
    return Array.from(pharmacyMap.values());
  };
  
  // Clear cache
  const clearCache = () => {
    medications.value.clear();
    pharmacies.value.clear();
    pharmacyPrices.value = [];
    pharmacyPricesByPharmacy.value.clear();
    pharmacyPricesByDrug.value.clear();
  };
  
  return {
    // State
    medications,
    pharmacies,
    pharmacyPrices,
    medicationsLoading,
    pharmaciesLoading,
    
    // Getters
    getMedication,
    getPharmacy,
    getPharmacyPrices,
    
    // Actions
    setMedication,
    setMedications,
    setPharmacy,
    setPharmacies,
    setPharmacyPrices,
    addPharmacyPrice,
    extractPharmaciesFromPrices,
    clearCache
  };
});

