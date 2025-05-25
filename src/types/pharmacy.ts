export interface Pharmacy {
  id: string | number;
  name: string;
  address: string;
  rating: number;
  reviews: Array<{
    id: string | number;
    rating: number;
    comment: string;
    user: string;
    date: string;
  }>;
  image: string;
  isOpen: boolean;
  distance: string;
  services: string[];
  workingHours: WorkingHours;
  phone: string;
  email: string;
  website: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  medications: Medication[];
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface WorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Medication {
  id: number;
  name: string;
  description: string;
  price: string;
  inStock: boolean;
  requiresPrescription: boolean;
}

export interface PharmacyFilters {
  searchQuery: string;
  selectedServices: string[];
  sortBy: 'distance' | 'rating' | 'name';
  isOpenNow: boolean;
}
