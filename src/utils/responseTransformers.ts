/**
 * Response Transformers
 * Maps API response models to UI models
 */

import type { User } from '@/models/User';
import type { Medication } from '@/models/Medication';
import type { Pharmacy, PharmacyWorkingHours } from '@/models/Pharmacy';
import type { PharmacyPrice } from '@/models/PharmacyPrice';
import type { Cart, CartItem } from '@/models/Cart';
import type { Order, OrderItem, OrderTracking } from '@/models/Order';
import type { Review, ReviewStats } from '@/models/Review';
import type { Prescription } from '@/models/Prescription';
import type { BlogPost, Comment } from '@/types/blog';

import type {
  UserApiResponse,
  MedicationApiResponse,
  PharmacyApiResponse,
  PharmacyPriceApiResponse,
  CartApiResponse,
  CartItemApiResponse,
  OrderApiResponse,
  OrderItemApiResponse,
  OrderTrackingApiResponse,
  ReviewApiResponse,
  ReviewStatsApiResponse,
  PrescriptionApiResponse,
} from '@/models/api';

/**
 * Helper to extract data from API response (handles wrapped responses)
 */
export function unwrapApiResponse<T>(response: T | { data: T } | { [key: string]: T }): T {
  if (response && typeof response === 'object') {
    // recursively unwrap 'data' property
    if ('data' in response && response.data !== undefined) {
      return unwrapApiResponse(response.data as any) as T;
    }
    // Handle paginated responses where data is an array but we want the wrapper or just the array? 
    // Usually T is the array or the object. If T is CartApiResponse, it has 'items'.
    // If response is { data: { items: [] } }, first unwrap gets { items: [] }, which is correct.
    
    // Handle object responses like { pharmacies: [...] } which might be a legacy format
    const keys = Object.keys(response);
    if (keys.length === 1 && Array.isArray((response as any)[keys[0]])) {
      // Be careful not to unwrap if the expected type T SHOULD have that key
      // But for generic unwrapping this acts as a heuristic
      return (response as any)[keys[0]] as T;
    }
  }
  return response as T;
}

/**
 * Transform array responses (handles various response formats)
 */
export function unwrapArrayResponse<T>(response: T[] | { data: T[] } | { [key: string]: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  const unwrapped = unwrapApiResponse(response);
  return Array.isArray(unwrapped) ? unwrapped : [];
}

/**
 * User Transformers
 */
export function transformUser(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id,
    firstname: apiUser.firstname,
    lastname: apiUser.lastname,
    fullname: apiUser.fullname,
    username: apiUser.username,
    dob: apiUser.dob,
    gender: apiUser.gender,
    email: apiUser.email,
    pharmacy_id: apiUser.pharmacy_id,
    pharmacy_branch_id: apiUser.pharmacy_branch_id,
    phone_number: apiUser.phone_number,
    status: apiUser.status,
    member_id: apiUser.member_id,
    address: apiUser.address,
    image: apiUser.image,
    profile_picture: apiUser.profile_picture,
    profile_picture_full: apiUser.profile_picture_full,
    saved_money: apiUser.saved_money,
    addresses: apiUser.addresses,
    medical_records: apiUser.medical_records,
  };
}

/**
 * Medication Transformers
 */
export function transformMedication(apiMed: MedicationApiResponse): Medication {
  const brands = (apiMed.brands ?? []).map(brand => ({
    ...brand,
    image: brand.image ?? undefined
  }));

  // Use the drug image if available, otherwise fallback to the first brand's image
  const mainImage = apiMed.image || brands[0]?.image || '';

  return {
    id: apiMed.id,
    product_id: (apiMed as any).product_id ?? apiMed.id, // Fallback to id if not explicit
    name: apiMed.name,
    description: apiMed.description ?? '',
    brands: brands,
    forms: apiMed.forms ?? [],
    image: mainImage,
    predefinedQuantities: apiMed.predefined_quantities ?? apiMed.predefinedQuantities ?? [],
    category: apiMed.categories ?? apiMed.category ?? '',
    requiresPrescription: apiMed.requires_prescription ?? apiMed.requiresPrescription ?? false,
    pharmacy_count: apiMed.pharmacy_count ?? (apiMed as any).pharmacies_count ?? (apiMed as any).available_pharmacies_count,
    price: apiMed.price ?? (apiMed as any).starting_price,
    discount_price: apiMed.discount_price,
    brand_id: (apiMed as any).brand_id,
    brand_name: (apiMed as any).brand_name ?? (apiMed as any).brand?.name,
    form_id: (apiMed as any).form_id,
    form_name: (apiMed as any).form_name ?? (apiMed as any).form?.form_name,
    strength_id: (apiMed as any).strength_id,
    strength: (apiMed as any).strength ?? (apiMed as any).strength?.strength,
    uom_id: (apiMed as any).uom_id,
    uom: (apiMed as any).uom ?? (apiMed as any).uom?.uom,
    starting_price: (apiMed as any).starting_price
  };
}

export function transformMedications(apiMeds: MedicationApiResponse[]): Medication[] {
  return apiMeds.map(transformMedication);
}

/**
 * Transform Pharmacy Drug (from /pharmacy-drugs)
 */
export function transformPharmacyDrug(drug: any): Medication {
  // Parse predefinedQuantities from string array to number array if needed
  const parsedQuantities: number[] = (drug.predefinedQuantities || []).map((qty: any) => {
    if (typeof qty === 'number') return qty;
    const num = parseInt(String(qty).trim(), 10);
    return isNaN(num) ? 0 : num;
  }).filter((num: number) => num > 0);

  return {
    id: drug.drugId || drug.id,
    name: drug.name || '',
    description: drug.description || '',
    image: drug.image || '',
    requiresPrescription: drug.requiresPrescription ?? false,
    predefinedQuantities: parsedQuantities,
    price: drug.price,
    pharmacy_count: drug.pharmacy_count,
    category: Array.isArray(drug.category) ? drug.category : (drug.category ? [drug.category] : []),
    brands: (drug.brands || []).map((b: any) => ({
      id: b.id,
      brand_id: b.brand_id,
      name: b.name
    })),
    forms: (drug.forms || []).map((f: any) => ({
      id: f.id,
      form_id: f.form_id,
      form_name: f.form_name,
      strengths: [] // Not provided in this flat structure
    }))
  };
}

/**
 * Pharmacy Transformers
 */
export function transformPharmacy(apiPharmacy: PharmacyApiResponse): Pharmacy {
  const workingHoursSource = (apiPharmacy.working_hours || apiPharmacy.workingHours || {}) as Record<string, string | undefined>;
  const workingHours: PharmacyWorkingHours = {
    monday: workingHoursSource.monday ?? '',
    tuesday: workingHoursSource.tuesday ?? '',
    wednesday: workingHoursSource.wednesday ?? '',
    thursday: workingHoursSource.thursday ?? '',
    friday: workingHoursSource.friday ?? '',
    saturday: workingHoursSource.saturday ?? '',
    sunday: workingHoursSource.sunday ?? '',
  };

  return {
    id: apiPharmacy.id,
    name: apiPharmacy.name,
    address: apiPharmacy.address,
    rating: apiPharmacy.rating || 0,
    totalReviews: apiPharmacy.total_reviews || 0,
    reviews: [],
    image: apiPharmacy.image || apiPharmacy.logo || '',
    logo: apiPharmacy.logo || apiPharmacy.image || '',
    isOpen: apiPharmacy.is_open ?? apiPharmacy.isOpen ?? true,
    isActive: apiPharmacy.is_active ?? true,
    distance: apiPharmacy.distance || '',
    services: apiPharmacy.services || [],
    workingHours,
    phone: apiPharmacy.phone || '',
    email: apiPharmacy.email || '',
    website: apiPharmacy.website || '',
    description: apiPharmacy.description || '',
    location: apiPharmacy.location || {
      lat: (apiPharmacy as any).latitude || 0,
      lng: (apiPharmacy as any).longitude || 0
    },
    licenseNumber: apiPharmacy.license_number,
    license: apiPharmacy.license,
    branchesCount: apiPharmacy.branches_count || 0,
    branches: (apiPharmacy.branches || []).map((branch: any) => ({
      id: branch.id,
      pharmacyId: branch.pharmacy_id,
      branchName: branch.branch_name,
      phone: branch.phone,
      address: branch.address,
      latitude: branch.latitude,
      longitude: branch.longitude,
      licenseNumber: branch.license_number,
      managerName: branch.manager_name,
      managerPhone: branch.manager_phone,
      managerEmail: branch.manager_email,
      digitalAddress: branch.digital_address,
    })),
    medications: [],
  };
}

export function transformPharmacies(apiPharmacies: PharmacyApiResponse[]): Pharmacy[] {
  return apiPharmacies.map(transformPharmacy);
}

/**
 * Pharmacy Price Transformers
 */
export function transformPharmacyPrice(apiPrice: PharmacyPriceApiResponse): PharmacyPrice {
  const pharmacyInfo = apiPrice.pharmacy;
  const branchInfo = (apiPrice as any).pharmacy_branch;

  return {
    id: apiPrice.id,
    pharmacy_id: apiPrice.pharmacy_id ?? 0,
    pharmacy_branch_id: apiPrice.pharmacy_branch_id ?? apiPrice.pharmacy?.branch_id,
    drug_id: apiPrice.drug_id ?? 0,
    brand_id: apiPrice.brand_id ?? 0,
    form_id: apiPrice.form_id ?? 0,
    strength_id: apiPrice.strength_id ?? 0,
    uom_id: apiPrice.uom_id ?? 0,
    price: apiPrice.price ?? 0,
    discount_price: apiPrice.discount_price ?? undefined,
    stock_quantity: apiPrice.stock_quantity,
    in_stock: apiPrice.in_stock ?? false,
    created_at: '',
    updated_at: '',
    pharmacy: pharmacyInfo ? {
      id: pharmacyInfo.id ?? apiPrice.pharmacy_id,
      name: pharmacyInfo.name || apiPrice.pharmacy_name,
      logo: pharmacyInfo.logo || apiPrice.pharmacy_logo || undefined,
      address: pharmacyInfo.address,
      rating: pharmacyInfo.rating,
      distance: pharmacyInfo.distance?.toString(),
      is_open: pharmacyInfo.is_open ?? apiPrice.is_open,
      pharmacy_branch_id: pharmacyInfo.branch_id ?? apiPrice.pharmacy_branch_id,
      branch_name: pharmacyInfo.branch_name || apiPrice.branch_name || '',
      branch_address: (pharmacyInfo as any).branch_address || (branchInfo as any)?.address || apiPrice.branch_name || '',
    } : undefined,
    pharmacy_name: apiPrice.pharmacy_name || apiPrice.pharmacy?.name || '',
    pharmacy_logo: apiPrice.pharmacy_logo || apiPrice.pharmacy?.logo || undefined,
    branch_name: apiPrice.branch_name || apiPrice.pharmacy?.branch_name || '',
    is_open: apiPrice.is_open ?? apiPrice.pharmacy?.is_open ?? false,
    name: apiPrice.name,
    brand_name: apiPrice.brand_name ?? '',
    form_name: apiPrice.form_name ?? '',
    strength: apiPrice.strength ?? '',
    uom: apiPrice.uom ?? '',
    branch_id: apiPrice.pharmacy_branch_id ?? apiPrice.pharmacy?.branch_id ?? 0,
    image: apiPrice.image ?? undefined,
  };
}

export function transformPharmacyPrices(apiPrices: PharmacyPriceApiResponse[]): PharmacyPrice[] {
  return apiPrices.map(transformPharmacyPrice);
}

/**
 * Cart Transformers
 */
export function transformCartItem(apiItem: CartItemApiResponse, acceptedPaymentMethods?: ('platform' | 'direct')[]): CartItem {
  return {
    id: String(apiItem.cart_item_id),
    medicationId: apiItem.drug_id ?? 0,
    medicationName: apiItem.name,
    pharmacyId: apiItem.pharmacy_id,
    pharmacyName: apiItem.pharmacy_name ?? apiItem.pharmacy?.name ?? '',
    pharmacyLogo: apiItem.pharmacy_logo ?? apiItem.pharmacy?.logo ?? undefined,
    isOpen: apiItem.is_open ?? apiItem.pharmacy?.is_open ?? false,
    pharmacyBranchId: apiItem.pharmacy_branch_id ?? apiItem.pharmacy?.branch_id,
    branchName: apiItem.branch_name ?? apiItem.pharmacy?.branch_name ?? '',
    brandId: apiItem.brand_id ?? 0,
    brandName: apiItem.brand_name ?? '',
    formId: apiItem.form_id ?? 0,
    formName: apiItem.form_name ?? '',
    strengthId: apiItem.strength_id ?? 0,
    strength: apiItem.strength ?? '',
    uomId: apiItem.uom_id ?? 0,
    uom: apiItem.uom ?? '',
    quantity: apiItem.quantity,
    price: apiItem.price,
    discountPrice: apiItem.discount_price ?? undefined,
    image: apiItem.image ?? undefined,
    inStock: apiItem.in_stock,
    requiresPrescription: apiItem.requires_prescription,
    pharmacyDrugPriceId: Number(apiItem.id),
    acceptedPaymentMethods: acceptedPaymentMethods || apiItem.pharmacy?.accepted_payment_methods,
  };
}

export function transformCart(apiCart: CartApiResponse): Cart {
  // Flatten all pharmacy groups into a single items list
  const items: CartItem[] = (apiCart.pharmacies ?? []).flatMap(group => {
    return group.items.map(apiItem => {
      // Inject group-level pharmacy info if missing on item
      const item = transformCartItem(apiItem, group.accepted_payment_methods);
      if (!item.pharmacyName) item.pharmacyName = group.pharmacy_name || '';
      if (!item.pharmacyLogo) item.pharmacyLogo = group.pharmacy_logo || undefined;
      if (item.isOpen === undefined) item.isOpen = group.is_open ?? false;
      if (!item.pharmacyBranchId) item.pharmacyBranchId = group.pharmacy_branch_id;
      if (!item.branchName) item.branchName = group.branch_name || '';
      return item;
    });
  });

  return {
    items,
    totalItems: apiCart.total_items ?? items.length,
    subtotal: apiCart.subtotal ?? 0,
    discount: 0,
    total: apiCart.total ?? 0,
  };
}

/**
 * Order Transformers
 */
// Debug log to see actual API response structure
// console.log('transformOrderItem apiItem:', apiItem);

export function transformOrderItem(apiItem: OrderItemApiResponse): OrderItem {
  return {
    id: String(apiItem.id),
    medicationId: apiItem.drug_id ?? 0,
    medicationName: apiItem.name,
    brandId: apiItem.brand_id ?? undefined,
    brandName: '',
    formId: apiItem.form_id ?? 0,
    formName: '',
    strengthId: apiItem.strength_id ?? 0,
    strength: '',
    uomId: apiItem.uom_id ?? 0,
    uom: '',
    quantity: Number(apiItem.quantity),
    price: Number(apiItem.price),
    discountPrice: apiItem.discount_price ? Number(apiItem.discount_price) : undefined,
    image: apiItem.image ?? undefined,
  };
}

// Safe mapping helper
export function transformOrder(apiOrder: OrderApiResponse): Order {
  if (!apiOrder) {
    console.warn('transformOrder received invalid data');
    const now = new Date().toISOString();
    return {
      id: '0',
      orderNumber: '',
      userId: 0,
      pharmacyId: 0,
      pharmacyName: '',
      pharmacyPhone: '',
      pharmacyAddress: '',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      paymentMethod: 'platform',
      paymentStatus: 'pending',
      deliveryMethod: 'pickup',
      phoneNumber: '',
      status: 'pending',
      prescriptionRequired: false,
      prescriptionUploaded: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    id: String(apiOrder.id),
    orderNumber: apiOrder.order_number,
    userId: apiOrder.user_id,
    pharmacyId: apiOrder.pharmacy_id,
    pharmacyName: apiOrder.pharmacy_name ?? '',
    pharmacyPhone: apiOrder.pharmacy_phone ?? '',
    pharmacyAddress: apiOrder.pharmacy_address ?? '',
    pharmacyImage: undefined,
    items: (apiOrder.items ?? []).map(transformOrderItem),
    subtotal: Number(apiOrder.subtotal),
    deliveryFee: Number(apiOrder.delivery_fee ?? 0),
    total: Number(apiOrder.total),
    paymentMethod: apiOrder.payment_method,
    paymentStatus: apiOrder.payment_status,
    deliveryAddress: apiOrder.delivery_address,
    deliveryMethod: apiOrder.delivery_method,
    phoneNumber: apiOrder.phone_number,
    status: apiOrder.status,
    prescriptionRequired: apiOrder.prescription_required,
    prescriptionUploaded: apiOrder.prescription_uploaded,
    prescriptionUrl: apiOrder.prescription_url,
    notes: apiOrder.notes,
    estimatedReadyTime: apiOrder.estimated_ready_time,
    completedAt: apiOrder.completed_at,
    cancelledAt: undefined,
    cancellationReason: apiOrder.cancellation_reason,
    createdAt: apiOrder.created_at,
    updatedAt: apiOrder.updated_at,
    statusHistory: (apiOrder.status_history ?? []).map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      note: history.note,
    })),
  };
}

export function transformOrders(apiOrders: OrderApiResponse[]): Order[] {
  if (!Array.isArray(apiOrders)) {
    console.warn('transformOrders received non-array:', apiOrders);
    return [];
  }
  return apiOrders.map(transformOrder);
}

export function transformOrderTracking(apiTracking: OrderTrackingApiResponse): OrderTracking {
  return {
    order: transformOrder(apiTracking.order),
    statusHistory: (apiTracking.status_history ?? []).map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      note: history.note,
    })),
    currentStep: apiTracking.current_step ?? 0,
    estimatedDelivery: apiTracking.estimated_delivery,
  };
}

/**
 * Review Transformers
 */
export function transformReview(apiReview: ReviewApiResponse): Review {
  const user = apiReview.user;
  const userName = user?.fullname || user?.name ||
    (user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : '') ||
    'Anonymous';

  return {
    id: String(apiReview.id),
    userId: String(apiReview.user_id || apiReview.userId || user?.id || ''),
    userName,
    userAvatar: user?.profile_picture || user?.avatar,
    targetType: apiReview.target_type || apiReview.targetType || 'medication',
    targetId: String(apiReview.target_id || apiReview.targetId || ''),
    targetName: apiReview.target_name || apiReview.targetName,
    orderId: apiReview.order_id || apiReview.orderId ? String(apiReview.order_id || apiReview.orderId) : undefined,
    rating: apiReview.rating,
    title: apiReview.title || '',
    comment: apiReview.comment,
    images: apiReview.images,
    verified: apiReview.verified || false,
    helpful: apiReview.helpful || apiReview.helpful_count || apiReview.helpfulCount || 0,
    notHelpful: apiReview.not_helpful || apiReview.not_helpful_count || apiReview.notHelpfulCount || 0,
    pharmacyResponse: apiReview.pharmacy_response || apiReview.pharmacyResponse ? {
      respondedBy: (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.responded_by ||
        (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.respondedBy || '',
      message: (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.message || '',
      respondedAt: (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.responded_at ||
        (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.respondedAt || '',
    } : undefined,
    createdAt: apiReview.created_at || apiReview.createdAt || new Date().toISOString(),
    updatedAt: apiReview.updated_at || apiReview.updatedAt || new Date().toISOString(),
  };
}

export function transformReviews(apiReviews: ReviewApiResponse[]): Review[] {
  return apiReviews.map(transformReview);
}

export function transformReviewStats(apiStats: ReviewStatsApiResponse): ReviewStats {
  return {
    averageRating: apiStats.average_rating || apiStats.averageRating || 0,
    totalReviews: apiStats.total_reviews || apiStats.totalReviews || 0,
    ratingDistribution: apiStats.rating_distribution || apiStats.ratingDistribution || {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  };
}

const normalizePrescriptionStatus = (status?: string | null): Prescription['status'] => {
  if (!status) {
    return 'active';
  }
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'approved') {
    return 'completed';
  }
  if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'rejected') {
    return 'cancelled';
  }
  return 'active';
};

/**
 * Prescription Transformers
 */
export function transformPrescription(apiPrescription: PrescriptionApiResponse): Prescription {
  return {
    id: apiPrescription.id,
    title: apiPrescription.title,
    prescription_number: apiPrescription.prescription_number,
    doctor_name: apiPrescription.doctor_name,
    prescription_date: apiPrescription.prescription_date,
    expiry_date: apiPrescription.expiry_date,
    status: normalizePrescriptionStatus(apiPrescription.status),
    notes: apiPrescription.notes,
    prescription_picture: apiPrescription.prescription_picture,
    has_request: apiPrescription.has_request,
    user_id: apiPrescription.user_id,
    pharmacy_id: apiPrescription.pharmacy_id,
    pharmacy_branch_id: apiPrescription.pharmacy_branch_id,
    drugs: (apiPrescription.drugs || []).map(drug => ({
      id: drug.id,
      prescription_id: drug.prescription_id,
      drug_id: drug.drug_id,
      name: drug.name,
      brand_id: drug.brand_id,
      brand_name: drug.brand_name,
      form_id: drug.form_id,
      form_name: drug.form_name,
      dose: drug.dose,
      frequency: drug.frequency,
      duration: drug.duration,
      quantity: drug.quantity,
      uom_id: drug.uom_id,
      uom: drug.uom,
      instruction: drug.instruction,
      image: drug.image,
      created_at: drug.created_at,
    })),
    created_at: (new Date(apiPrescription.created_at || apiPrescription.createdAt || new Date())).toISOString(),
    updated_at: (new Date(apiPrescription.updated_at || apiPrescription.updatedAt || new Date())).toISOString(),
  };
}

export function transformPrescriptions(apiPrescriptions: PrescriptionApiResponse[]): Prescription[] {
  return apiPrescriptions.map(transformPrescription);
}

/**
 * Blog Transformers
 */
export function transformBlogPost(apiPost: any): BlogPost {
  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    excerpt: apiPost.excerpt || apiPost.summary || '',
    content: apiPost.content || apiPost.body || '',
    coverImage: apiPost.cover_image || apiPost.coverImage || apiPost.image || '',
    category: apiPost.category?.name || apiPost.category || 'Uncategorized',
    date: apiPost.date || apiPost.created_at || apiPost.createdAt || new Date().toISOString(),
    author: {
      name: apiPost.author?.name || apiPost.user?.name || 'Anonymous',
      avatar: apiPost.author?.avatar || apiPost.user?.avatar || apiPost.author?.profile_picture || '',
      bio: apiPost.author?.bio || ''
    },
    tags: apiPost.tags || [],
    readTime: apiPost.read_time || apiPost.readTime || 5, // Default to 5 min if missing
    likes: apiPost.likes || apiPost.likes_count || 0,
    views: apiPost.views || apiPost.views_count || 0,
    comments: Array.isArray(apiPost.comments) ? apiPost.comments.map(transformComment) : []
  };
}

export function transformBlogPosts(apiPosts: any[]): BlogPost[] {
  return apiPosts.map(transformBlogPost);
}

export function transformComment(apiComment: any): Comment {
  return {
    id: apiComment.id,
    author: {
      name: apiComment.author?.name || apiComment.user?.name || 'Anonymous',
      avatar: apiComment.author?.avatar || apiComment.user?.avatar || '',
    },
    content: apiComment.content || apiComment.body || '',
    date: apiComment.date || apiComment.created_at || new Date().toISOString(),
    likes: apiComment.likes || 0,
    replies: Array.isArray(apiComment.replies) ? apiComment.replies.map(transformComment) : []
  };
}


