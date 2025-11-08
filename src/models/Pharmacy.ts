export interface PharmacyLocation {
  lat: number;
  lng: number;
}

export interface PharmacyReview {
  id: number;
  rating: number;
  comment: string;
  user: string;
  date: string;
}

export interface PharmacyMedication {
  id: number;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  requiresPrescription: boolean;
}

export interface PharmacyWorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  rating: number;
  reviews: PharmacyReview[];
  image: string;
  isOpen: boolean;
  distance: string;
  services: string[];
  workingHours: PharmacyWorkingHours;
  phone: string;
  email: string;
  website: string;
  description: string;
  location: PharmacyLocation;
  medications: PharmacyMedication[];
}

export interface PharmacyFilters {
  searchQuery?: string;
  selectedServices?: string[];
  sortBy?: 'distance' | 'rating' | 'name';
  isOpenNow?: boolean;
}

