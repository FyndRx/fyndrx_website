# FyndRX Mobile Application - Design Structure & Implementation Guide

**Version:** 1.0  
**Last Updated:** November 9, 2025  
**Target Platforms:** iOS & Android

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Design System](#design-system)
3. [Architecture](#architecture)
4. [Data Models](#data-models)
5. [Navigation Structure](#navigation-structure)
6. [Component Library](#component-library)
7. [State Management](#state-management)
8. [Services & API](#services--api)
9. [UI/UX Patterns](#uiux-patterns)
10. [Feature Specifications](#feature-specifications)
11. [Authentication Flow](#authentication-flow)
12. [Mobile-Specific Considerations](#mobile-specific-considerations)

---

## Project Overview

### About FyndRX

FyndRX is a comprehensive ePharmacy platform that connects users with pharmacies, enables medication browsing and ordering, prescription management, and provides a seamless healthcare experience.

### Core Features

- **Medication Discovery**: Browse, search, and compare medications across pharmacies
- **Pharmacy Finder**: Locate pharmacies with maps, filters, and real-time availability
- **Order Management**: Place orders, track status, and manage prescriptions
- **User Dashboard**: Personal health hub with prescriptions, orders, and favorites
- **Reviews & Ratings**: Community-driven feedback for medications and pharmacies
- **Shopping Cart**: Multi-pharmacy cart management
- **Prescription Upload**: Digital prescription management
- **Payment Integration**: Multiple payment options (Platform & Direct payment)

---

## Design System

### Brand Colors

#### Primary Color Palette
```
Primary Blue:
- primary-50:  #f0f9ff
- primary-100: #e0f2fe
- primary-200: #bae6fd
- primary-300: #7dd3fc
- primary-400: #38bdf8
- primary-500: #0ea5e9 (Main brand color)
- primary-600: #0284c7
- primary-700: #0369a1
- primary-800: #075985
- primary-900: #0c4a6e
```

#### Secondary Colors
```
Brand Orange: #FF6B35 (Used in logo and accents)

Success Green:
- green-50:  #f0fdf4
- green-500: #22c55e
- green-600: #16a34a

Warning Yellow:
- yellow-50:  #fffbeb
- yellow-400: #facc15
- yellow-500: #eab308

Danger Red:
- red-50:  #fef2f2
- red-500: #ef4444
- red-600: #dc2626

Info Cyan:
- cyan-50:  #ecfeff
- cyan-500: #06b6d4
- cyan-600: #0891b2
```

#### Neutral Colors
```
Gray Scale:
- gray-50:  #f9fafb
- gray-100: #f3f4f6
- gray-200: #e5e7eb
- gray-300: #d1d5db
- gray-400: #9ca3af
- gray-500: #6b7280
- gray-600: #4b5563
- gray-700: #374151
- gray-800: #1f2937
- gray-900: #111827

White: #ffffff
Black: #000000
```

### Typography

#### Font Family
```
Primary: System default (SF Pro for iOS, Roboto for Android)
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

#### Font Sizes
```
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)  [Body default]
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
```

#### Font Weights
```
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
font-extrabold: 800
```

#### Line Heights
```
leading-tight:  1.25
leading-snug:   1.375
leading-normal: 1.5
leading-relaxed: 1.625
leading-loose:  2
```

### Spacing System

Follow an 8px base unit system:

```
spacing-0:   0px
spacing-1:   4px   (0.25rem)
spacing-2:   8px   (0.5rem)
spacing-3:   12px  (0.75rem)
spacing-4:   16px  (1rem)
spacing-5:   20px  (1.25rem)
spacing-6:   24px  (1.5rem)
spacing-8:   32px  (2rem)
spacing-10:  40px  (2.5rem)
spacing-12:  48px  (3rem)
spacing-16:  64px  (4rem)
spacing-20:  80px  (5rem)
spacing-24:  96px  (6rem)
```

### Border Radius

```
rounded-none: 0px
rounded-sm:   0.125rem (2px)
rounded:      0.25rem  (4px)
rounded-md:   0.375rem (6px)
rounded-lg:   0.5rem   (8px)
rounded-xl:   0.75rem  (12px)
rounded-2xl:  1rem     (16px)
rounded-3xl:  1.5rem   (24px)
rounded-full: 9999px
```

### Shadows

```
shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:      0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Icons

Use **Heroicons** style (outline and solid variants) or system icons.

**Icon Sizes:**
```
icon-sm:  16px
icon-md:  20px (default)
icon-lg:  24px
icon-xl:  32px
icon-2xl: 48px
```

### Dark Mode

The app supports dark mode with the following adjustments:

- **Background**: Dark gray (#111827)
- **Surface**: Lighter gray (#1f2937)
- **Text**: Light gray (#f9fafb)
- **Borders**: Dark borders (#374151)
- **Maintain brand colors** with slight adjustments for contrast

---

## Architecture

### Technology Stack Reference (Web)

The web application is built with:
- **Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Backend**: Laravel 11 + Filament (Admin)

### Recommended Mobile Architecture

#### iOS
- **Framework**: SwiftUI
- **Architecture**: MVVM + Clean Architecture
- **State Management**: Combine + StateObject/ObservableObject
- **Networking**: URLSession + Async/Await
- **Local Storage**: CoreData / UserDefaults
- **Maps**: MapKit

#### Android
- **Framework**: Kotlin + Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **State Management**: StateFlow + ViewModel
- **Networking**: Retrofit + Coroutines
- **Local Storage**: Room Database / DataStore
- **Maps**: Google Maps SDK

### Layer Structure

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│   (Views, ViewModels, Components)   │
├─────────────────────────────────────┤
│         Domain Layer                │
│   (Use Cases, Entities, Interfaces) │
├─────────────────────────────────────┤
│         Data Layer                  │
│   (Repositories, API, Local Storage)│
└─────────────────────────────────────┘
```

---

## Data Models

### User Model

```typescript
interface User {
  id: number;
  firstname: string | null;
  lastname: string | null;
  fullname: string | null;
  username: string | null;
  dob: string | null;              // ISO date string
  email: string;
  phone_number: string;
  member_id: string;
  address: string | null;
  profile_picture: string | null;  // URL
  profile_picture_full: string | null; // Full URL
  saved_money: number;             // Total savings
  pharmacy_id: number | null;
  pharmacy_branch_id: number | null;
  status: string | null;
}
```

### Medication Model

```typescript
interface Medication {
  id: number;
  drug_name: string;
  description: string;
  brands: MedicationBrand[];
  forms: MedicationForm[];
  image: string;                    // Image URL
  predefinedQuantities: number[];   // e.g., [1, 2, 3, 5, 10]
  category: string;
  requiresPrescription: boolean;
}

interface MedicationBrand {
  id: number;
  name: string;
}

interface MedicationForm {
  id: number;
  form_name: string;                // e.g., "Tablet", "Capsule", "Syrup"
  strengths: MedicationStrength[];
}

interface MedicationStrength {
  id: number;
  strength: string;                 // e.g., "500mg", "250mg"
  uoms: MedicationUOM[];
}

interface MedicationUOM {
  id: number;
  uom: string;                      // Unit of measurement: "TAB", "CAP", "ML"
}

interface PharmacyMedicationPrice {
  pharmacyId: number;
  medicationId: number;
  brandId?: number;
  formId: number;
  strengthId: number;
  price: number;
  discountPrice?: number;
  inStock: boolean;
}
```

### Pharmacy Model

```typescript
interface Pharmacy {
  id: number;
  name: string;
  address: string;
  rating: number;                   // 0-5 scale
  reviews: PharmacyReview[];
  image: string;                    // Logo/image URL
  isOpen: boolean;
  distance: string;                 // e.g., "1.2 km"
  services: string[];               // e.g., ["Delivery", "24/7", "Consultation"]
  workingHours: PharmacyWorkingHours;
  phone: string;
  email: string;
  website: string;
  description: string;
  location: PharmacyLocation;
  medications: PharmacyMedication[];
}

interface PharmacyLocation {
  lat: number;
  lng: number;
}

interface PharmacyWorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  // Format: "8:00 AM - 6:00 PM" or "Closed"
}

interface PharmacyReview {
  id: number;
  rating: number;
  comment: string;
  user: string;
  date: string;                     // ISO date string
}
```

### Order Model

```typescript
interface Order {
  id: string;
  orderNumber: string;              // e.g., "ORD-2024-001"
  userId: number;
  pharmacyId: number;
  pharmacyName: string;
  pharmacyPhone: string;
  pharmacyAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'platform' | 'direct';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress?: string;
  deliveryMethod: 'pickup' | 'delivery';
  phoneNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 
          'out_for_delivery' | 'completed' | 'cancelled';
  createdAt: string;                // ISO date string
  updatedAt: string;
  prescriptionRequired: boolean;
  prescriptionUploaded: boolean;
  prescriptionUrl?: string;
  notes?: string;
  estimatedReadyTime?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

interface OrderItem {
  id: string;
  medicationId: number;
  medicationName: string;
  brandId?: number;
  brandName?: string;
  formId: number;
  formName: string;
  strengthId: number;
  strength: string;
  uomId: number;
  uom: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  image?: string;
}

interface OrderStatusHistory {
  status: Order['status'];
  timestamp: string;
  note?: string;
}

interface OrderTracking {
  order: Order;
  statusHistory: OrderStatusHistory[];
  currentStep: number;
  estimatedDelivery?: string;
}
```

### Cart Model

```typescript
interface CartItem {
  id: string;
  medicationId: number;
  medicationName: string;
  brandId?: number;
  brandName?: string;
  formId: number;
  formName: string;
  strengthId: number;
  strength: string;
  uomId: number;
  uom: string;
  quantity: number;
  price: number;
  discountPrice?: number;
  image?: string;
  pharmacyId: number;
  pharmacyName: string;
  pharmacyLogo?: string;
  requiresPrescription: boolean;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
}

interface CartPharmacyGroup {
  pharmacyId: number;
  pharmacyName: string;
  pharmacyLogo?: string;
  items: CartItem[];
  subtotal: number;
}
```

### Prescription Model

```typescript
interface Prescription {
  id: string;
  userId: number;
  patientName: string;
  doctorName?: string;
  hospitalName?: string;
  prescriptionDate?: string;
  fileUrl: string;                  // PDF or image URL
  fileName: string;
  fileType: 'pdf' | 'image';
  status: 'pending' | 'verified' | 'rejected';
  medications?: string[];
  notes?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}
```

### Blog Post Model

```typescript
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;                  // HTML content
  coverImage: string;
  category: string;
  date: string;
  author: Author;
  tags?: string[];
  readTime?: number;                // minutes
  likes?: number;
  views?: number;
  comments?: Comment[];
}

interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

interface Comment {
  id: number;
  author: Author;
  content: string;
  date: string;
  likes?: number;
  replies?: Comment[];
}
```

### Review Model

```typescript
interface Review {
  id: string;
  targetType: 'medication' | 'pharmacy';
  targetId: number;
  targetName: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;                   // 1-5 scale
  title: string;
  comment: string;
  images?: string[];
  orderId?: string;
  helpful: number;                  // helpful count
  createdAt: string;
  verifiedPurchase: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
```

### Payment Model

```typescript
interface PaymentMethod {
  id: string;
  type: 'platform' | 'direct';
  name: string;
  description: string;
  icon: string;
}

interface Transaction {
  id: string;
  orderId: string;
  userId: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  reference: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}
```

---

## Navigation Structure

### Main Navigation Hierarchy

```
┌─────────────────────────────────────────┐
│           Bottom Tab Bar                │
├─────────────────────────────────────────┤
│  Home  │  Browse  │  Cart  │  Profile   │
└─────────────────────────────────────────┘
```

### Navigation Tree

```
Root
│
├─ Home Tab
│  ├─ Home Screen
│  ├─ Search Results
│  ├─ Medication Detail
│  ├─ Pharmacy Detail
│  └─ Blog Post
│
├─ Browse Tab
│  ├─ Medications List
│  │  ├─ Medication Detail
│  │  ├─ Medication Comparison
│  │  └─ Quick View (Modal)
│  │
│  └─ Pharmacies List
│     ├─ Pharmacy Detail
│     └─ Pharmacy Map View
│
├─ Cart Tab
│  ├─ Shopping Cart
│  ├─ Checkout
│  │  ├─ Delivery Info
│  │  ├─ Payment Selection
│  │  └─ Order Confirmation
│  └─ Payment Callback
│
└─ Profile Tab
   ├─ Dashboard
   ├─ Edit Profile
   ├─ Favorites
   │  ├─ Medications Tab
   │  └─ Pharmacies Tab
   ├─ Orders
   │  └─ Order Detail
   ├─ Prescriptions
   │  ├─ Prescription List
   │  └─ Upload Prescription
   ├─ Transactions
   │  └─ Receipt
   ├─ Compare Medications
   ├─ Help Center
   ├─ FAQ
   ├─ Feedback
   ├─ Settings
   └─ Logout

Authentication (Overlay)
├─ Login
├─ Register
├─ Forgot Password
├─ Reset Password
└─ OTP Verification
```

### Screen Routes

#### Public Routes
```
/                         → Home
/medications             → Medications List
/medications/:id         → Medication Detail
/medications/compare     → Medication Comparison
/pharmacies              → Pharmacies List
/pharmacies/:id          → Pharmacy Detail
/blog                    → Blog List
/blog/:slug              → Blog Post
/about                   → About Us
/services                → Services
/contact                 → Contact
/faq                     → FAQ
/terms                   → Terms of Service
/privacy                 → Privacy Policy
```

#### Authentication Routes
```
/login                   → Login Screen
/register                → Register Screen
/forgot-password         → Forgot Password
/reset-password          → Reset Password
/verify-otp              → OTP Verification
```

#### Protected Routes (Require Authentication)
```
/dashboard               → User Dashboard
/profile                 → Profile View
/profile/edit            → Edit Profile
/favorites               → Favorites (Medications & Pharmacies)
/cart                    → Shopping Cart
/checkout                → Checkout Flow
/orders                  → Order History
/orders/:id              → Order Detail & Tracking
/prescriptions           → Prescription Management
/prescriptions/upload    → Upload Prescription
/transactions            → Transaction History
/transactions/:id        → Receipt View
/help                    → Help Center
/feedback                → Submit Feedback
```

---

## Component Library

### Core Components

#### 1. Buttons

**Primary Button**
```
Style: Solid background with brand color
Variants: primary, secondary, success, danger, warning
Sizes: small, medium, large
States: default, hover, active, disabled, loading
```

**Secondary Button**
```
Style: Outlined with border
Uses: Secondary actions, cancel buttons
```

**Icon Button**
```
Style: Icon only, circular or square
Uses: Actions like favorite, share, close
```

**Text Button**
```
Style: No background, text only
Uses: Tertiary actions, inline links
```

#### 2. Input Components

**Text Input**
```
Features:
- Label (optional)
- Placeholder
- Helper text
- Error state with message
- Icon prefix/suffix
- Character counter
- Multiline support (textarea)

Props:
- value: string
- label: string
- placeholder: string
- error: string
- disabled: boolean
- type: text | email | password | number | tel
```

**Custom Checkbox**
```
Variants:
1. Default: Traditional checkbox with checkmark
2. Switch: Toggle switch style
3. Card: Card-based selection

Features:
- Label
- Description (optional)
- Colors: default, success, warning, danger
- Sizes: small, medium, large
- Disabled state
- Animated transitions
```

**Radio Button**
```
Features:
- Single selection
- Group support
- Label support
- Disabled state
```

**Dropdown / Picker**
```
Features:
- Single/multiple selection
- Search functionality
- Custom option rendering
- Grouped options
- Native picker on mobile
```

**Date Picker**
```
Features:
- Calendar view
- Date range selection
- Min/max date constraints
- Custom format
```

#### 3. Cards

**Medication Card**
```
Content:
- Image
- Drug name
- Category badge
- Price (with discount)
- Quick actions (Add to cart, Favorite, Quick view)
- Prescription required badge

Interactions:
- Tap to view details
- Long press for quick actions
```

**Pharmacy Card**
```
Content:
- Logo/image
- Name
- Rating stars
- Distance
- Open/Closed status
- Services badges
- Quick actions (Call, Directions, View)

Interactions:
- Tap to view details
- Quick call action
```

**Order Card**
```
Content:
- Order number
- Pharmacy name
- Items summary
- Total amount
- Status badge
- Date

Interactions:
- Tap to view order detail
- Track order action
```

**Blog Card**
```
Content:
- Cover image
- Title
- Excerpt
- Category badge
- Author info
- Date
- Read time

Interactions:
- Tap to read post
```

#### 4. Lists & Data Display

**List Skeleton Loader**
```
Uses: Loading states for lists
Animated: Shimmer effect
Customizable: Number of items, card type
```

**Empty State**
```
Content:
- Illustration/icon
- Title
- Description
- Action button (optional)

Types:
- No data
- No search results
- No internet
- Error state
```

**Error State**
```
Types:
- Network error
- Server error
- Not found
- Permission denied
- Generic error

Features:
- Icon
- Title
- Description
- Retry button
```

#### 5. Navigation Components

**App Bar / Header**
```
Features:
- Title
- Back button
- Action buttons (search, filter, menu)
- Transparent/solid variants
```

**Bottom Tab Bar**
```
Tabs:
- Home
- Browse
- Cart (with badge count)
- Profile

Features:
- Active state indicator
- Icons + labels
- Badge support
```

**Search Bar**
```
Features:
- Search input
- Voice search (optional)
- Clear button
- Recent searches
- Autocomplete suggestions
```

**Filter Bar**
```
Features:
- Sort dropdown
- Filter chips
- Clear all button
- Filter count badge
```

#### 6. Feedback Components

**Rating Stars**
```
Features:
- Display rating (read-only)
- Interactive rating input
- Half-star support
- Custom size
- Custom colors
```

**Badge**
```
Uses: Status indicators, counts, labels
Variants: Dot, number, icon
Colors: All theme colors
Positions: Relative to parent
```

**Alert / Notification**
```
Types: success, error, warning, info
Features:
- Icon
- Title
- Message
- Action button
- Auto-dismiss timer
- Close button

Positions: Top, bottom, floating
```

**Toast / Snackbar**
```
Uses: Brief messages
Duration: 2-5 seconds
Position: Bottom (mobile default)
```

**Loading Indicator**
```
Types:
- Spinner (circular)
- Linear progress bar
- Skeleton loaders

Variants:
- Full screen overlay
- Inline
- Button loading state
```

#### 7. Modals & Overlays

**Bottom Sheet**
```
Uses: 
- Filters
- Quick actions
- Forms
- Confirmations

Features:
- Swipe to dismiss
- Backdrop tap to close
- Variable heights
```

**Dialog / Modal**
```
Types:
- Alert dialog
- Confirmation dialog
- Form dialog
- Full screen modal

Features:
- Title
- Content
- Actions (Cancel, Confirm)
- Close button
```

**Quick View Modal**
```
Use: Medication quick preview
Content:
- Image
- Name
- Price
- Description
- Forms selector
- Add to cart
- View full details link
```

**Medication Comparison Modal**
```
Use: Compare up to 3 medications
Content:
- Side-by-side comparison table
- Price, forms, description
- Add to cart actions
```

#### 8. Specialized Components

**Pharmacy Map**
```
Features:
- Google Maps / Apple Maps integration
- Pharmacy markers
- User location
- Directions
- Info window
```

**Recently Viewed**
```
Display: Horizontal scroll list
Content: Last 10 viewed medications
Storage: Local storage
```

**Favorites Button**
```
Types: Medication, Pharmacy
States: Default, Active (filled heart)
Animation: Scale + heart beat on toggle
```

**Add Review Modal**
```
Content:
- Star rating selector
- Title input
- Comment textarea
- Image upload (optional)
- Submit button
```

**Prescription Upload**
```
Features:
- Camera capture
- Gallery selection
- File browser (PDF)
- Preview
- Crop/rotate tools
- Multiple files
```

**Image Lazy Loading**
```
Features:
- Placeholder while loading
- Fade-in animation
- Error fallback image
- Progressive loading
```

---

## State Management

### Global State

#### Authentication State
```
Properties:
- user: User | null
- accessToken: string | null
- isAuthenticated: boolean
- loading: boolean
- error: string | null

Actions:
- login(credentials)
- register(credentials)
- logout()
- checkAuth()
- updateProfile(profile)
```

#### Cart State
```
Properties:
- items: CartItem[]
- totalItems: number
- subtotal: number
- discount: number
- total: number
- groupedByPharmacy: CartPharmacyGroup[]

Actions:
- addItem(item)
- removeItem(itemId)
- updateQuantity(itemId, quantity)
- clearCart()
- clearPharmacyItems(pharmacyId)
- loadFromStorage()
- saveToStorage()
```

#### Favorites State
```
Properties:
- medications: number[]
- pharmacies: number[]

Actions:
- toggleMedication(id)
- togglePharmacy(id)
- isFavorite(type, id)
- clearAll()
- loadFromStorage()
- saveToStorage()
```

#### Recently Viewed State
```
Properties:
- medications: Medication[]
- maxItems: 10

Actions:
- addMedication(medication)
- clear()
- loadFromStorage()
- saveToStorage()
```

### Local State (Per Screen)

Use local state for:
- Form inputs
- Loading states
- Error messages
- Pagination
- Filter selections
- Modal visibility

---

## Services & API

### Base Configuration

```
Base URL: https://api.fyndrx.com/api
Headers:
- Content-Type: application/json
- Accept: application/json
- Authorization: Bearer {access_token}
```

### Authentication Service

#### Endpoints
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-otp
GET    /auth/user
PUT    /auth/user/profile
```

#### Example: Login
```
POST /auth/login

Request:
{
  "login": "user@example.com",  // email or phone
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Medications Service

#### Endpoints
```
GET    /medications                    - List all medications
GET    /medications/:id                - Get medication details
GET    /medications/:id/prices         - Get prices by pharmacy
GET    /medications/search             - Search medications
GET    /medications/categories         - Get categories
POST   /medications/:id/reviews        - Add review
GET    /medications/:id/reviews        - Get reviews
```

#### Query Parameters
```
page: number
per_page: number
category: string
search: string
sort_by: price | name | rating
```

### Pharmacies Service

#### Endpoints
```
GET    /pharmacies                     - List pharmacies
GET    /pharmacies/:id                 - Get pharmacy details
GET    /pharmacies/nearby              - Get nearby pharmacies
GET    /pharmacies/:id/medications     - Get pharmacy medications
POST   /pharmacies/:id/reviews         - Add review
GET    /pharmacies/:id/reviews         - Get reviews
```

#### Query Parameters
```
lat: number
lng: number
radius: number (km)
services: string[]
is_open: boolean
sort_by: distance | rating | name
```

### Orders Service

#### Endpoints
```
POST   /orders                         - Create order
GET    /orders                         - List user orders
GET    /orders/:id                     - Get order details
GET    /orders/:id/tracking            - Get order tracking
PATCH  /orders/:id/cancel              - Cancel order
```

#### Create Order Request
```json
{
  "pharmacyId": 1,
  "items": [
    {
      "medicationId": 5,
      "brandId": 2,
      "formId": 1,
      "strengthId": 3,
      "uomId": 1,
      "quantity": 2,
      "price": 15.99
    }
  ],
  "deliveryMethod": "delivery",
  "deliveryAddress": "123 Main St, Accra",
  "phoneNumber": "+233245551234",
  "paymentMethod": "platform",
  "prescriptionUrl": "https://...",
  "notes": "Please call before delivery"
}
```

### Prescriptions Service

#### Endpoints
```
GET    /prescriptions                  - List user prescriptions
POST   /prescriptions/upload           - Upload prescription
GET    /prescriptions/:id              - Get prescription details
DELETE /prescriptions/:id              - Delete prescription
```

#### Upload Prescription Request
```
POST /prescriptions/upload
Content-Type: multipart/form-data

Form Data:
- file: File (PDF or Image)
- patientName: string
- doctorName: string (optional)
- hospitalName: string (optional)
- prescriptionDate: string (optional)
```

### Cart Service

#### Endpoints
```
GET    /cart                           - Get user cart
POST   /cart/items                     - Add item to cart
PUT    /cart/items/:id                 - Update item quantity
DELETE /cart/items/:id                 - Remove item
DELETE /cart                           - Clear cart
```

### Blog Service

#### Endpoints
```
GET    /blog/posts                     - List blog posts
GET    /blog/posts/:slug               - Get post by slug
GET    /blog/categories                - Get categories
GET    /blog/posts/:id/comments        - Get comments
POST   /blog/posts/:id/comments        - Add comment
```

### Reviews Service

#### Endpoints
```
POST   /reviews                        - Create review
GET    /reviews/:id                    - Get review
PUT    /reviews/:id                    - Update review
DELETE /reviews/:id                    - Delete review
POST   /reviews/:id/helpful            - Mark as helpful
```

### Payment Service

#### Endpoints
```
POST   /payments/initialize            - Initialize payment
GET    /payments/:reference/verify     - Verify payment
POST   /payments/webhook               - Payment webhook
GET    /transactions                   - List transactions
GET    /transactions/:id               - Get transaction
```

---

## UI/UX Patterns

### 1. Loading States

**Initial Load**
- Show skeleton loaders for lists
- Maintain layout structure
- Use shimmer animation

**Subsequent Loads (Pagination)**
- Show spinner at bottom
- Keep existing content visible
- Disable scroll during load

**Button Loading**
- Show spinner inside button
- Disable button
- Keep button size constant

**Pull to Refresh**
- Native pull-to-refresh gesture
- Show refresh indicator
- Brief success message

### 2. Error Handling

**Network Errors**
- Show error state component
- Provide retry action
- Cache data when possible

**Validation Errors**
- Inline field errors
- Scroll to first error
- Highlight error fields

**Permission Errors**
- Show permission rationale
- Link to settings
- Provide alternative action

### 3. Search & Filter

**Search**
- Debounced input (300ms)
- Show recent searches
- Autocomplete suggestions
- Clear button
- Cancel button returns to previous state

**Filters**
- Bottom sheet for mobile
- Show active filter count
- Clear all option
- Apply/Reset buttons

**Sort**
- Simple dropdown
- Remember last selection
- Icons for sort direction

### 4. Forms

**Layout**
- Stack fields vertically
- Group related fields
- Clear visual hierarchy
- Sticky submit button

**Validation**
- Real-time for format validation
- On blur for async validation
- Show errors inline
- Disable submit until valid

**Multi-step Forms**
- Progress indicator
- Back/Next navigation
- Save draft capability
- Review step before submit

### 5. Empty States

**No Data**
- Friendly illustration
- Encouraging message
- Call to action
- Example: "No orders yet? Start shopping!"

**No Search Results**
- Suggest alternatives
- Show popular items
- Offer to clear filters

**No Internet**
- Clear offline message
- Retry button
- Show cached data if available

### 6. Confirmation Dialogs

**Destructive Actions**
- Clear warning message
- Highlight danger
- Require explicit confirmation
- Examples: Delete, Cancel order

**Information Dialogs**
- Single action (OK/Close)
- Concise message
- Appropriate icon

### 7. Lists & Scrolling

**Infinite Scroll**
- Auto-load on reach bottom
- Show loading indicator
- Handle end of list

**Pagination**
- Show page numbers for web
- Load more button as fallback
- Remember scroll position

**Swipe Actions**
- Reveal actions on swipe
- Visual feedback
- Haptic feedback (iOS)
- Examples: Delete, Favorite

### 8. Navigation Patterns

**Hierarchical Navigation**
- Clear back button
- Breadcrumb alternative (web)
- Swipe back gesture (iOS)

**Tab Navigation**
- Bottom tabs on mobile
- Persistent across screens
- Badge for notifications

**Modal Navigation**
- Swipe down to dismiss
- Close button top-right
- Backdrop tap to close

### 9. Onboarding

**First Launch**
- Brief intro (3-5 screens)
- Swipeable slides
- Skip option
- Key value propositions

**Feature Discovery**
- Contextual tooltips
- Highlight new features
- Don't repeat after dismissed

### 10. Notifications

**In-App**
- Toast for quick messages
- Alerts for important info
- Bottom sheet for actions

**Push Notifications**
- Order updates
- Promotions
- Prescription reminders
- Permission request on relevant action

---

## Feature Specifications

### 1. Home Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  App Bar (Logo, Search, Notifications) │
├─────────────────────────────────────┤
│  Hero Section / Banner Carousel     │
├─────────────────────────────────────┤
│  Search Bar                         │
├─────────────────────────────────────┤
│  Categories (Horizontal Scroll)     │
├─────────────────────────────────────┤
│  Featured Medications (Grid)        │
├─────────────────────────────────────┤
│  Nearby Pharmacies (Horizontal)     │
├─────────────────────────────────────┤
│  Health Tips / Blog Posts           │
├─────────────────────────────────────┤
│  Quick Actions (Upload Rx, etc)     │
└─────────────────────────────────────┘
```

**Features:**
- Search bar prominent at top
- Category chips for quick filtering
- Featured medications grid (2 columns)
- Nearby pharmacies horizontal scroll
- Pull to refresh
- Deep link support

### 2. Medications Browse

**Layout:**
```
┌─────────────────────────────────────┐
│  Search Bar                         │
├─────────────────────────────────────┤
│  Filter Chips (Category, Form, etc) │
├─────────────────────────────────────┤
│  Sort Dropdown                      │
├─────────────────────────────────────┤
│  Medication Grid (2 columns)        │
│  ┌──────────┐ ┌──────────┐         │
│  │   Card   │ │   Card   │         │
│  └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐         │
│  │   Card   │ │   Card   │         │
│  └──────────┘ └──────────┘         │
└─────────────────────────────────────┘
```

**Features:**
- Real-time search
- Multiple filters (category, form, brand)
- Sort by price/name
- Quick view on long press
- Add to favorites
- Add to comparison (max 3)
- Prescription badge
- Infinite scroll

### 3. Medication Detail

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Back    Share   Favorite         │
├─────────────────────────────────────┤
│  Image Carousel                     │
├─────────────────────────────────────┤
│  Drug Name                          │
│  ⭐ 4.5 (123 reviews)              │
├─────────────────────────────────────┤
│  Price Section                      │
│  GH₵ 15.99  (from GH₵ 19.99)       │
├─────────────────────────────────────┤
│  Selectors:                         │
│  - Brand dropdown                   │
│  - Form dropdown                    │
│  - Strength dropdown                │
│  - Quantity stepper                 │
├─────────────────────────────────────┤
│  Pharmacy Selection                 │
│  ┌─────────────────────────────┐   │
│  │ Pharmacy A - GH₵ 15.99      │   │
│  │ Pharmacy B - GH₵ 17.50      │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Description (Expandable)           │
├─────────────────────────────────────┤
│  How to Use                         │
├─────────────────────────────────────┤
│  Side Effects                       │
├─────────────────────────────────────┤
│  Warnings                           │
├─────────────────────────────────────┤
│  Reviews Section                    │
│  ⭐⭐⭐⭐⭐ Progress bars          │
│  ┌─────────────────────────────┐   │
│  │ Review Card                 │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Similar Medications                │
│  (Horizontal scroll)                │
└─────────────────────────────────────┘
     ┌─────────────────────┐
     │   Add to Cart       │
     └─────────────────────┘
```

**Features:**
- Image zoom capability
- Price comparison across pharmacies
- Dynamic pricing based on selections
- Stock availability indicator
- Prescription requirement alert
- Add to cart from multiple pharmacies
- Share medication details
- Add review (if purchased)
- Recently viewed tracking

### 4. Shopping Cart

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Cart (3 items)                   │
├─────────────────────────────────────┤
│  Pharmacy A                         │
│  ☐ Select All                       │
│  ┌─────────────────────────────┐   │
│  │ ☑ Medication 1              │   │
│  │    GH₵ 15.99  [- 2 +]  ❌   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ☑ Medication 2              │   │
│  │    GH₵ 8.50   [- 1 +]  ❌   │   │
│  └─────────────────────────────┘   │
│  Subtotal: GH₵ 24.49                │
├─────────────────────────────────────┤
│  Pharmacy B                         │
│  ☐ Select All                       │
│  ┌─────────────────────────────┐   │
│  │ ☑ Medication 3              │   │
│  │    GH₵ 12.00  [- 1 +]  ❌   │   │
│  └─────────────────────────────┘   │
│  Subtotal: GH₵ 12.00                │
├─────────────────────────────────────┤
│  Order Summary                      │
│  Subtotal:        GH₵ 36.49         │
│  Savings:         GH₵ 5.00          │
│  Total:           GH₵ 36.49         │
└─────────────────────────────────────┘
     ┌─────────────────────┐
     │   Checkout          │
     └─────────────────────┘
```

**Features:**
- Grouped by pharmacy
- Individual item selection
- Select all per pharmacy
- Quantity adjustment
- Remove item (swipe or button)
- Move to favorites
- Continue shopping
- Prescription reminder
- Save for later
- Price updates notification

### 5. Checkout Flow

**Step 1: Delivery Information**
```
┌─────────────────────────────────────┐
│  Delivery Method                    │
│  ⚫ Pickup   ⚪ Delivery             │
├─────────────────────────────────────┤
│  Phone Number                       │
│  [+233 ___ ___ ___]                 │
├─────────────────────────────────────┤
│  Delivery Address (if delivery)     │
│  [Text input]                       │
│  📍 Use current location            │
├─────────────────────────────────────┤
│  Notes (optional)                   │
│  [Textarea]                         │
└─────────────────────────────────────┘
```

**Step 2: Prescription Upload (if required)**
```
┌─────────────────────────────────────┐
│  Prescription Required              │
├─────────────────────────────────────┤
│  Upload Prescription                │
│  ┌─────────────────────────────┐   │
│  │  📷 Take Photo              │   │
│  │  🖼️  Choose from Gallery    │   │
│  │  📄 Browse Files            │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Previously Uploaded:               │
│  ┌─────────────────────────────┐   │
│  │  ☑ Prescription_2024.pdf    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Step 3: Payment Method**
```
┌─────────────────────────────────────┐
│  Payment Method                     │
├─────────────────────────────────────┤
│  ⚫ Platform Payment                │
│     Pay securely through app        │
│     (Mobile Money, Card, etc)       │
├─────────────────────────────────────┤
│  ⚪ Direct Payment                  │
│     Pay at pharmacy                 │
└─────────────────────────────────────┘
```

**Step 4: Review & Confirm**
```
┌─────────────────────────────────────┐
│  Review Order                       │
├─────────────────────────────────────┤
│  Pharmacy A                         │
│  • Medication 1 × 2                 │
│  • Medication 2 × 1                 │
│                                     │
│  Delivery: Pickup                   │
│  Phone: +233 245 551 234            │
│  Payment: Platform                  │
├─────────────────────────────────────┤
│  Order Summary                      │
│  Subtotal:     GH₵ 36.49            │
│  Delivery:     GH₵ 0.00             │
│  Total:        GH₵ 36.49            │
├─────────────────────────────────────┤
│  ☑ I agree to Terms & Conditions    │
└─────────────────────────────────────┘
     ┌─────────────────────┐
     │   Place Order       │
     └─────────────────────┘
```

**Features:**
- Multi-step progress indicator
- Form validation
- Save delivery address
- Prescription upload with preview
- Secure payment integration
- Order confirmation screen
- Email/SMS confirmation

### 6. Order Tracking

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Order #ORD-2024-001              │
├─────────────────────────────────────┤
│  Status Timeline                    │
│  ✅ Pending                         │
│  │                                  │
│  ✅ Confirmed                       │
│  │                                  │
│  ⭕ Processing                      │
│  │                                  │
│  ⚪ Ready for Pickup                │
│  │                                  │
│  ⚪ Completed                       │
├─────────────────────────────────────┤
│  Estimated Ready: 2 hours           │
├─────────────────────────────────────┤
│  Pharmacy Details                   │
│  📍 Pharmacy A                      │
│  📞 +233 123 456 789               │
│  🗺️  View on Map                   │
├─────────────────────────────────────┤
│  Order Items                        │
│  ┌─────────────────────────────┐   │
│  │ Medication 1 × 2            │   │
│  │ GH₵ 15.99                   │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Payment                            │
│  Method: Platform                   │
│  Status: ✅ Paid                    │
│  Amount: GH₵ 36.49                  │
├─────────────────────────────────────┤
│  [Cancel Order] [Contact Pharmacy]  │
└─────────────────────────────────────┘
```

**Features:**
- Real-time status updates
- Push notifications on status change
- Call pharmacy directly
- Navigate to pharmacy
- Cancel order (if allowed)
- Reorder feature
- Add review after completion

### 7. Profile / Dashboard

**Layout:**
```
┌─────────────────────────────────────┐
│  Profile Header                     │
│  [Avatar]  John Doe                 │
│           john.doe@example.com      │
│           [Edit Profile]            │
├─────────────────────────────────────┤
│  Stats Cards                        │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Orders  │ │Saved   │ │Points  │  │
│  │  12    │ │GH₵150  │ │  450   │  │
│  └────────┘ └────────┘ └────────┘  │
├─────────────────────────────────────┤
│  Quick Actions                      │
│  ┌─────────────────────────────┐   │
│  │ 🛒 My Orders                │   │
│  │ 💊 Prescriptions            │   │
│  │ ❤️  Favorites               │   │
│  │ 💳 Transactions             │   │
│  │ 📊 Compare Medications      │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Recent Orders                      │
│  ┌─────────────────────────────┐   │
│  │ Order Card                  │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Support & Settings                 │
│  • Help Center                      │
│  • FAQ                              │
│  • Feedback                         │
│  • Settings                         │
│  • Logout                           │
└─────────────────────────────────────┘
```

**Features:**
- Profile picture upload
- Edit profile info
- View statistics
- Quick access to features
- Recently viewed medications
- Notification preferences
- Dark mode toggle
- Language selection (future)

### 8. Pharmacy Finder

**Layout:**
```
┌─────────────────────────────────────┐
│  🔍 Search pharmacies...            │
├─────────────────────────────────────┤
│  📍 Near me    Services ▾  Sort ▾   │
├─────────────────────────────────────┤
│  Map View                           │
│  ┌─────────────────────────────┐   │
│  │   [Google Maps / Apple Maps] │   │
│  │   📍 📍 📍                 │   │
│  └─────────────────────────────┘   │
│  [Switch to List View]              │
├─────────────────────────────────────┤
│  OR List View                       │
│  ┌─────────────────────────────┐   │
│  │ Pharmacy Card               │   │
│  │ ⭐ 4.5 • 1.2 km • Open     │   │
│  │ [Call] [Directions] [View]  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Features:**
- Location-based search
- Filter by services (24/7, Delivery, etc)
- Sort by distance/rating
- Map/List toggle
- Get directions
- Call pharmacy
- View working hours
- Check availability

### 9. Favorites

**Layout:**
```
┌─────────────────────────────────────┐
│  Favorites                          │
├─────────────────────────────────────┤
│  Medications | Pharmacies           │
│  ───────────                        │
├─────────────────────────────────────┤
│  Medications Tab:                   │
│  ┌─────────────────────────────┐   │
│  │ Medication Card             │   │
│  │ [Quick Add] [Remove]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Pharmacies Tab:                    │
│  ┌─────────────────────────────┐   │
│  │ Pharmacy Card               │   │
│  │ [View] [Remove]             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Features:**
- Tab navigation
- Quick add to cart
- Remove from favorites
- Empty state when no favorites
- Sync across devices (if logged in)

### 10. Medication Comparison

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Compare (2/3)                    │
├─────────────────────────────────────┤
│  Horizontal Scroll Table            │
│  ┌────────┬────────┬────────┐      │
│  │ Med A  │ Med B  │ [Add]  │      │
│  ├────────┼────────┼────────┤      │
│  │[Image] │[Image] │        │      │
│  ├────────┼────────┼────────┤      │
│  │Price:  │Price:  │        │      │
│  │GH₵15.99│GH₵18.50│        │      │
│  ├────────┼────────┼────────┤      │
│  │Forms:  │Forms:  │        │      │
│  │Tablet  │Capsule │        │      │
│  ├────────┼────────┼────────┤      │
│  │Rating: │Rating: │        │      │
│  │⭐ 4.5  │⭐ 4.2  │        │      │
│  └────────┴────────┴────────┘      │
├─────────────────────────────────────┤
│  [Add to Cart] [Remove All]         │
└─────────────────────────────────────┘
```

**Features:**
- Compare up to 3 medications
- Side-by-side comparison
- Key attributes displayed
- Add to cart from comparison
- Clear comparison

---

## Authentication Flow

### Registration Flow

```
1. Registration Screen
   ├─ Email/Phone input
   ├─ Password input
   ├─ Confirm password
   ├─ First name
   ├─ Last name
   ├─ Agree to terms checkbox
   └─ Submit
        ↓
2. OTP Verification
   ├─ 6-digit code input
   ├─ Resend option
   └─ Verify
        ↓
3. Profile Setup (Optional)
   ├─ Profile picture
   ├─ Date of birth
   ├─ Address
   └─ Skip/Complete
        ↓
4. Welcome Screen / Dashboard
```

### Login Flow

```
1. Login Screen
   ├─ Email/Phone input
   ├─ Password input
   ├─ Remember me checkbox
   ├─ Forgot password link
   └─ Submit
        ↓
2. Dashboard
```

### Forgot Password Flow

```
1. Forgot Password Screen
   ├─ Email/Phone input
   └─ Submit
        ↓
2. OTP Verification
   ├─ 6-digit code
   └─ Verify
        ↓
3. Reset Password
   ├─ New password
   ├─ Confirm password
   └─ Submit
        ↓
4. Login Screen
```

### Token Management

```
1. Store access token securely
   - iOS: Keychain
   - Android: EncryptedSharedPreferences

2. Include in API requests
   - Authorization: Bearer {token}

3. Handle expiration
   - Check expiry before requests
   - Auto-refresh if expired
   - Redirect to login if refresh fails

4. Logout
   - Clear token
   - Clear cached user data
   - Clear cart (optional)
   - Redirect to home/login
```

---

## Mobile-Specific Considerations

### 1. Performance Optimization

**Image Optimization**
- Use WebP format when possible
- Implement lazy loading
- Cache images locally
- Provide low-res placeholders
- Generate thumbnails server-side

**List Performance**
- Use virtualized/recycler views
- Implement pagination
- Limit initial load to 20-30 items
- Cache list data

**API Optimization**
- Implement request debouncing
- Cache responses locally
- Use compression
- Minimize payload size

### 2. Offline Support

**Essential Offline Features**
- View cached medications
- View order history
- View profile
- Browse favorites
- Read blog posts (cached)

**Sync Strategy**
- Queue actions when offline
- Sync when connection restored
- Show sync status
- Handle conflicts gracefully

**Local Storage**
- Cart items
- Favorites
- Recently viewed
- User preferences
- Cached images
- Authentication tokens

### 3. Platform-Specific Features

**iOS**
- Face ID / Touch ID for login
- 3D Touch / Haptic feedback
- Spotlight search integration
- Siri shortcuts
- Apple Pay integration
- Share sheet
- Universal links

**Android**
- Biometric authentication
- Material Design components
- App shortcuts
- Google Pay integration
- Share intent
- Deep links
- Widget support (future)

### 4. Gestures

**Common Gestures**
- Pull to refresh (lists)
- Swipe to delete (cart items)
- Swipe left/right (image carousel)
- Pinch to zoom (images)
- Long press (quick actions)
- Swipe down to dismiss (modals)

### 5. Notifications

**Push Notification Types**
```
Order Updates:
- Order confirmed
- Order ready
- Order out for delivery
- Order completed

Promotions:
- Special offers
- New medications
- Price drops

Reminders:
- Prescription renewal
- Medication refill
- Abandoned cart

System:
- App updates
- Account security
```

**In-App Notifications**
- Badge on cart icon
- Badge on profile/orders
- Toast messages
- Alert dialogs

### 6. Permissions

**Required Permissions**
- Internet (both)
- Location (for pharmacy finder)
- Camera (for prescription upload)
- Photo library (for prescription upload)
- Notifications (for order updates)
- File access (for prescription PDF)

**Permission Request Strategy**
- Request at point of use
- Explain why needed
- Provide alternatives if denied
- Don't block critical features

### 7. Accessibility

**Features to Implement**
- Screen reader support
- Dynamic type sizes
- High contrast mode
- Color blind friendly colors
- Keyboard navigation (Android)
- Voice control support
- Descriptive labels
- Minimum touch targets (44x44 dp)

### 8. Testing

**Key Test Areas**
- Authentication flow
- Cart & checkout
- Order placement
- Payment integration
- Push notifications
- Offline mode
- Network errors
- Deep links
- Biometric auth
- Image uploads
- Maps integration

**Device Testing**
- Multiple screen sizes
- Different OS versions
- Low memory devices
- Slow network conditions
- Low battery mode
- Airplane mode
- Rotation support

### 9. Analytics & Tracking

**Key Events to Track**
- Screen views
- User registration
- User login
- Medication views
- Add to cart
- Checkout started
- Order completed
- Search queries
- Filter usage
- Share actions
- Review submissions
- App crashes

**User Properties**
- User ID
- Registration date
- Total orders
- Favorite categories
- Location (city/region)
- App version
- Device type

### 10. Security

**Best Practices**
- HTTPS only
- Certificate pinning
- Token encryption
- Secure storage (Keychain/EncryptedPrefs)
- Input validation
- Prevent screenshots (sensitive screens)
- Biometric auth option
- Session timeout
- Two-factor authentication (future)

---

## Design Assets & Resources

### Logos & Branding

```
Available Logo Variants:
1. logo_blue_orange.png - Full color logo
2. logo_white_orange.png - White text with orange accent
3. logo_icon.png - Icon only (square)
4. logo_icon_plain_bg.png - Icon with background

Export Formats Required:
- iOS: @1x, @2x, @3x PNG
- Android: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi PNG
- SVG for scalable assets
```

### App Icons

```
iOS Sizes:
- 1024x1024 (App Store)
- 180x180 (@3x)
- 120x120 (@2x)
- 60x60 (@1x)

Android Sizes:
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

Adaptive Icon:
- Foreground: 108x108dp
- Background: 108x108dp
```

### Splash Screen

```
iOS:
- Use LaunchScreen.storyboard
- Show logo/brand

Android:
- 12+ : Use SplashScreen API
- Pre-12: Theme with windowBackground
```

### Color Palette Export

Export brand colors to:
- iOS: Assets.xcassets (Color Set)
- Android: colors.xml

### Icon Set

Use Heroicons or SF Symbols (iOS) / Material Icons (Android)

Common icons needed:
- Home, Search, Cart, Profile
- Heart (favorite), Star (rating)
- Plus, Minus, Close, Back
- Phone, Email, Location, Map
- Camera, Gallery, File
- Check, Warning, Error, Info
- Filter, Sort, Menu
- Share, Settings, Logout

---

## Development Checklist

### Pre-Development
- [ ] Review design structure document
- [ ] Set up project architecture
- [ ] Configure API endpoints
- [ ] Set up analytics
- [ ] Set up crash reporting
- [ ] Configure push notifications
- [ ] Set up CI/CD pipeline

### Core Features
- [ ] Authentication (Login, Register, OTP, Forgot Password)
- [ ] Home screen with all sections
- [ ] Medication browse & search
- [ ] Medication detail
- [ ] Pharmacy finder (Map & List)
- [ ] Pharmacy detail
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order placement
- [ ] Order history & tracking
- [ ] Profile management
- [ ] Prescription upload
- [ ] Favorites
- [ ] Recently viewed
- [ ] Medication comparison
- [ ] Reviews & ratings
- [ ] Blog posts
- [ ] Notifications

### Integrations
- [ ] Payment gateway (Platform)
- [ ] Maps integration
- [ ] Push notifications
- [ ] Deep linking
- [ ] Biometric authentication
- [ ] Social sharing
- [ ] Analytics tracking

### Polish
- [ ] Dark mode
- [ ] Animations & transitions
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Offline support
- [ ] Pull to refresh
- [ ] Accessibility
- [ ] Localization (future)

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] UI tests
- [ ] Manual testing
- [ ] Beta testing
- [ ] Performance testing
- [ ] Security audit

### Deployment
- [ ] App Store submission (iOS)
- [ ] Play Store submission (Android)
- [ ] App Store Optimization (ASO)
- [ ] Marketing assets
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Support documentation

---

## API Response Examples

### Medication List Response
```json
{
  "data": [
    {
      "id": 1,
      "drug_name": "Paracetamol",
      "description": "Pain reliever and fever reducer",
      "image": "https://api.fyndrx.com/storage/medications/paracetamol.jpg",
      "category": "Pain Relief",
      "requiresPrescription": false,
      "predefinedQuantities": [1, 2, 3, 5, 10],
      "brands": [
        {
          "id": 1,
          "name": "Panadol"
        },
        {
          "id": 2,
          "name": "Generic"
        }
      ],
      "forms": [
        {
          "id": 1,
          "form_name": "Tablet",
          "strengths": [
            {
              "id": 1,
              "strength": "500mg",
              "uoms": [
                {
                  "id": 1,
                  "uom": "TAB"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 20,
    "total": 200
  }
}
```

### Order Response
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "orderNumber": "ORD-2024-001",
    "userId": 1,
    "pharmacyId": 5,
    "pharmacyName": "HealthPlus Pharmacy",
    "pharmacyPhone": "+233 123 456 789",
    "pharmacyAddress": "123 Main St, Accra",
    "status": "confirmed",
    "paymentMethod": "platform",
    "paymentStatus": "paid",
    "deliveryMethod": "pickup",
    "phoneNumber": "+233 245 551 234",
    "prescriptionRequired": false,
    "prescriptionUploaded": false,
    "items": [
      {
        "id": "item-1",
        "medicationId": 1,
        "medicationName": "Paracetamol",
        "brandId": 1,
        "brandName": "Panadol",
        "formId": 1,
        "formName": "Tablet",
        "strengthId": 1,
        "strength": "500mg",
        "uomId": 1,
        "uom": "TAB",
        "quantity": 2,
        "price": 15.99,
        "image": "https://..."
      }
    ],
    "subtotal": 31.98,
    "deliveryFee": 0,
    "total": 31.98,
    "createdAt": "2024-11-09T10:30:00Z",
    "updatedAt": "2024-11-09T10:35:00Z",
    "estimatedReadyTime": "2024-11-09T12:30:00Z"
  }
}
```

---

## Contact & Support

For questions about this design structure or API integration:

- **Backend Team Lead**: [Contact info]
- **Design Team**: [Contact info]
- **Mobile Dev Lead**: [Contact info]
- **Documentation**: See `API_DOCUMENTATION.md` and `LARAVEL_BACKEND_GUIDE.md`
- **Postman Collection**: `FyndRX_API_Postman_Collection.json`

---

**Document Version:** 1.0  
**Last Updated:** November 9, 2025  
**Maintained By:** FyndRX Development Team


