import type { Pharmacy } from '@/types/pharmacy';

export const mockPharmacies: Pharmacy[] = [
  {
    id: 1,
    name: "CVS Pharmacy",
    address: "123 Main St, San Francisco, CA 94105",
    rating: 4.5,
    reviews: [
      {
        id: 1,
        rating: 5,
        comment: "Great service and fast delivery!",
        user: "John D.",
        date: "2024-03-15"
      },
      {
        id: 2,
        rating: 4,
        comment: "Good prices but sometimes busy",
        user: "Sarah M.",
        date: "2024-03-10"
      }
    ],
    image: "/images/pharmacies/cvs.jpg",
    isOpen: true,
    distance: "0.5 miles",
    services: ["Prescription Delivery", "24/7 Service", "Online Ordering", "Vaccination"],
    workingHours: {
      monday: "8:00 AM - 10:00 PM",
      tuesday: "8:00 AM - 10:00 PM",
      wednesday: "8:00 AM - 10:00 PM",
      thursday: "8:00 AM - 10:00 PM",
      friday: "8:00 AM - 10:00 PM",
      saturday: "9:00 AM - 9:00 PM",
      sunday: "9:00 AM - 9:00 PM"
    },
    phone: "(415) 555-0123",
    email: "sf@cvs.com",
    website: "https://www.cvs.com",
    description: "Full-service pharmacy offering prescription medications, health products, and wellness services.",
    location: {
      lat: 37.7749,
      lng: -122.4194
    },
    medications: [
      {
        id: 1,
        name: "Amoxicillin 500mg",
        description: "Antibiotic for bacterial infections",
        price: "$15.99",
        inStock: true,
        requiresPrescription: true
      },
      {
        id: 2,
        name: "Ibuprofen 200mg",
        description: "Pain reliever and fever reducer",
        price: "$8.99",
        inStock: true,
        requiresPrescription: false
      }
    ]
  },
  {
    id: 2,
    name: "Walgreens",
    address: "456 Market St, San Francisco, CA 94103",
    rating: 4.3,
    reviews: [
      {
        id: 3,
        rating: 4,
        comment: "Convenient location and good selection",
        user: "Mike R.",
        date: "2024-03-12"
      }
    ],
    image: "/images/pharmacies/walgreens.jpg",
    isOpen: true,
    distance: "1.2 miles",
    services: ["Home Delivery", "Health Consultations", "Emergency Service"],
    workingHours: {
      monday: "24/7",
      tuesday: "24/7",
      wednesday: "24/7",
      thursday: "24/7",
      friday: "24/7",
      saturday: "24/7",
      sunday: "24/7"
    },
    phone: "(415) 555-0124",
    email: "sf@walgreens.com",
    website: "https://www.walgreens.com",
    description: "24/7 pharmacy with drive-thru service and comprehensive health services.",
    location: {
      lat: 37.7879,
      lng: -122.4075
    },
    medications: [
      {
        id: 3,
        name: "Lisinopril 10mg",
        description: "Blood pressure medication",
        price: "$12.99",
        inStock: true,
        requiresPrescription: true
      },
      {
        id: 4,
        name: "Acetaminophen 500mg",
        description: "Pain reliever and fever reducer",
        price: "$7.99",
        inStock: true,
        requiresPrescription: false
      }
    ]
  },
  {
    id: 3,
    name: "Rite Aid",
    address: "789 Mission St, San Francisco, CA 94103",
    rating: 4.1,
    reviews: [
      {
        id: 4,
        rating: 4,
        comment: "Friendly staff and good prices",
        user: "Lisa K.",
        date: "2024-03-08"
      }
    ],
    image: "/images/pharmacies/rite-aid.jpg",
    isOpen: false,
    distance: "0.8 miles",
    services: ["Online Ordering", "Vaccination", "Health Consultations"],
    workingHours: {
      monday: "8:00 AM - 9:00 PM",
      tuesday: "8:00 AM - 9:00 PM",
      wednesday: "8:00 AM - 9:00 PM",
      thursday: "8:00 AM - 9:00 PM",
      friday: "8:00 AM - 9:00 PM",
      saturday: "9:00 AM - 8:00 PM",
      sunday: "9:00 AM - 8:00 PM"
    },
    phone: "(415) 555-0125",
    email: "sf@riteaid.com",
    website: "https://www.riteaid.com",
    description: "Neighborhood pharmacy offering prescription services and health products.",
    location: {
      lat: 37.7848,
      lng: -122.4094
    },
    medications: [
      {
        id: 5,
        name: "Metformin 500mg",
        description: "Diabetes medication",
        price: "$9.99",
        inStock: true,
        requiresPrescription: true
      },
      {
        id: 6,
        name: "Aspirin 81mg",
        description: "Blood thinner and pain reliever",
        price: "$5.99",
        inStock: true,
        requiresPrescription: false
      }
    ]
  }
]; 