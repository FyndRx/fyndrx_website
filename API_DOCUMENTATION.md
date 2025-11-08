# FyndRX API Documentation

## 📋 Overview

Base URL: `http://localhost:8000/api`  
Authentication: Bearer Token (Laravel Sanctum)  
Content-Type: `application/json`

---

## 🔐 Authentication

### Register User
**Endpoint:** `POST /register`

**Request:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone_number": "+233123456789",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response:** `201 Created`
```json
{
  "token": "1|abcdefg123456...",
  "user": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone_number": "+233123456789",
    "member_id": "MEM-ABC123",
    "profile_picture": null,
    "profile_picture_full": null,
    "saved_money": 0
  }
}
```

---

### Login
**Endpoint:** `POST /login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "1|abcdefg123456...",
  "user": { ... }
}
```

---

### Get Current User
**Endpoint:** `GET /user`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "id": 1,
  "firstname": "John",
  "lastname": "Doe",
  "fullname": "John Doe",
  "email": "john@example.com",
  ...
}
```

---

### Logout
**Endpoint:** `POST /logout`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## 💊 Medications

### Get All Medications
**Endpoint:** `GET /medications`

**Query Parameters:**
- `page` (int) - Page number
- `per_page` (int) - Items per page (default: 15)
- `category` (string) - Filter by category
- `q` (string) - Search query
- `requires_prescription` (boolean) - Filter by prescription requirement

**Example:** `GET /medications?page=1&per_page=15&category=Antibiotics`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "drug_name": "Amoxicillin",
      "slug": "amoxicillin",
      "description": "Broad-spectrum antibiotic...",
      "category": "Antibiotics",
      "image": "http://localhost:8000/storage/medications/amoxicillin.jpg",
      "requiresPrescription": true,
      "predefinedQuantities": [1, 2, 3, 5, 10],
      "brands": [
        {
          "id": 1,
          "name": "Amoxil"
        }
      ],
      "forms": [
        {
          "id": 1,
          "form_name": "Capsule",
          "strengths": [
            {
              "id": 1,
              "strength": "500mg",
              "uoms": [
                {
                  "id": 1,
                  "uom": "10 capsules"
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
    "per_page": 15,
    "total": 50
  }
}
```

---

### Get Medication by ID
**Endpoint:** `GET /medications/{id}`

**Response:** `200 OK` (Same structure as list item)

---

### Get Medication Prices
**Endpoint:** `GET /medications/{id}/prices`

**Query Parameters:**
- `form_id` (int) - Filter by form
- `strength_id` (int) - Filter by strength

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "pharmacy": {
        "id": 1,
        "name": "HealthPlus Pharmacy",
        "address": "123 High St, Accra",
        "distance": "2.5 km",
        "rating": 4.5,
        "isOpen": true
      },
      "price": 25.00,
      "discountPrice": 22.50,
      "inStock": true,
      "brandId": 1,
      "formId": 1,
      "strengthId": 1
    }
  ]
}
```

---

## 🏪 Pharmacies

### Get All Pharmacies
**Endpoint:** `GET /pharmacies`

**Query Parameters:**
- `page` (int)
- `per_page` (int)
- `q` (string) - Search query
- `is_open` (boolean) - Filter by open status
- `services` (array) - Filter by services

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "HealthPlus Pharmacy",
      "slug": "healthplus-pharmacy",
      "description": "Your trusted pharmacy...",
      "address": "123 High St, Accra",
      "phone": "+233123456789",
      "email": "info@healthplus.com",
      "website": "https://healthplus.com",
      "image": "http://localhost:8000/storage/pharmacies/healthplus.jpg",
      "isOpen": true,
      "distance": "2.5 km",
      "rating": 4.5,
      "services": ["24/7 Service", "Home Delivery", "Online Ordering"],
      "workingHours": {
        "monday": "8:00 AM - 10:00 PM",
        "tuesday": "8:00 AM - 10:00 PM",
        ...
      },
      "location": {
        "lat": 5.6037,
        "lng": -0.1870
      }
    }
  ]
}
```

---

### Get Nearby Pharmacies
**Endpoint:** `GET /pharmacies/nearby`

**Query Parameters:**
- `lat` (float) - Latitude
- `lng` (float) - Longitude
- `radius` (int) - Search radius in km (default: 10)

**Example:** `GET /pharmacies/nearby?lat=5.6037&lng=-0.1870&radius=5`

**Response:** Same as Get All Pharmacies, sorted by distance

---

## 🛒 Orders

### Create Order
**Endpoint:** `POST /orders`  
**Auth:** Required

**Request:**
```json
{
  "pharmacy_id": 1,
  "items": [
    {
      "medication_id": 1,
      "brand_id": 1,
      "form_id": 1,
      "strength_id": 1,
      "uom_id": 1,
      "quantity": 2,
      "price": 25.00
    }
  ],
  "delivery_method": "delivery",
  "delivery_address": "123 Main St, Accra",
  "phone_number": "+233123456789",
  "payment_method": "platform",
  "notes": "Please call before delivery"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-here",
  "orderNumber": "ORD-ABC123XYZ",
  "userId": 1,
  "pharmacyId": 1,
  "pharmacyName": "HealthPlus Pharmacy",
  "pharmacyPhone": "+233123456789",
  "pharmacyAddress": "123 High St, Accra",
  "items": [...],
  "subtotal": 50.00,
  "deliveryFee": 10.00,
  "total": 60.00,
  "paymentMethod": "platform",
  "paymentStatus": "pending",
  "deliveryMethod": "delivery",
  "deliveryAddress": "123 Main St, Accra",
  "phoneNumber": "+233123456789",
  "status": "pending",
  "prescriptionRequired": true,
  "prescriptionUploaded": false,
  "createdAt": "2024-11-08T10:30:00Z",
  "updatedAt": "2024-11-08T10:30:00Z"
}
```

---

### Get My Orders
**Endpoint:** `GET /orders`  
**Auth:** Required

**Query Parameters:**
- `status` (string) - Filter by status
- `page` (int)

**Response:** Array of orders

---

### Track Order
**Endpoint:** `GET /orders/{id}/track`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "order": { ... },
  "status_history": [
    {
      "status": "pending",
      "timestamp": "2024-11-08T10:30:00Z",
      "note": "Order received"
    },
    {
      "status": "confirmed",
      "timestamp": "2024-11-08T10:35:00Z",
      "note": "Pharmacy confirmed order"
    }
  ],
  "current_step": 2,
  "estimated_delivery": "2024-11-08T14:00:00Z"
}
```

---

### Cancel Order
**Endpoint:** `PUT /orders/{id}/cancel`  
**Auth:** Required

**Request:**
```json
{
  "cancellation_reason": "Changed my mind"
}
```

**Response:** `200 OK`

---

## 📄 Prescriptions

### Upload Prescription
**Endpoint:** `POST /prescriptions/upload`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `prescription` (file) - PDF, JPG, PNG (max 5MB)
- `order_id` (int, optional)

**Response:** `201 Created`
```json
{
  "id": 1,
  "prescription_number": "RX-ABC123XYZ",
  "file_path": "prescriptions/abc123.pdf",
  "status": "pending",
  "url": "http://localhost:8000/storage/prescriptions/abc123.pdf",
  "created_at": "2024-11-08T10:30:00Z"
}
```

---

### Get My Prescriptions
**Endpoint:** `GET /prescriptions`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "prescription_number": "RX-ABC123XYZ",
      "status": "verified",
      "file_type": "pdf",
      "url": "http://localhost:8000/storage/prescriptions/abc123.pdf",
      "expiry_date": "2025-11-08",
      "verified_at": "2024-11-08T11:00:00Z",
      "created_at": "2024-11-08T10:30:00Z"
    }
  ]
}
```

---

## ⭐ Reviews

### Create Review
**Endpoint:** `POST /reviews`  
**Auth:** Required

**Request:**
```json
{
  "reviewable_type": "pharmacy",
  "reviewable_id": 1,
  "order_id": 1,
  "rating": 5,
  "title": "Excellent Service",
  "comment": "Fast delivery and great customer service!",
  "images": ["base64_encoded_image"]
}
```

**Response:** `201 Created`

---

### Get Reviews
**Endpoint:** `GET /reviews`

**Query Parameters:**
- `type` (string) - pharmacy|medication|order
- `id` (int) - Target ID
- `page` (int)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "1",
      "userId": "1",
      "userName": "John Doe",
      "userAvatar": "http://...",
      "targetType": "pharmacy",
      "targetId": "1",
      "rating": 5,
      "title": "Excellent Service",
      "comment": "Fast delivery...",
      "verified": true,
      "helpful": 10,
      "notHelpful": 1,
      "createdAt": "2024-11-08T10:30:00Z"
    }
  ]
}
```

---

### Get Review Stats
**Endpoint:** `GET /reviews/stats`

**Query Parameters:**
- `type` (string) - pharmacy|medication
- `id` (int) - Target ID

**Response:** `200 OK`
```json
{
  "averageRating": 4.5,
  "totalReviews": 150,
  "ratingDistribution": {
    "1": 5,
    "2": 10,
    "3": 20,
    "4": 45,
    "5": 70
  }
}
```

---

### Mark Review Helpful
**Endpoint:** `POST /reviews/{id}/helpful`  
**Auth:** Required

**Response:** `200 OK`

---

## 📝 Blog

### Get All Posts
**Endpoint:** `GET /blog/posts`

**Query Parameters:**
- `page` (int)
- `limit` (int) - Default: 9
- `category` (string)
- `search` (string)

**Response:** `200 OK`
```json
{
  "posts": [
    {
      "id": 1,
      "title": "Understanding Antibiotic Resistance",
      "slug": "understanding-antibiotic-resistance",
      "excerpt": "Learn about the growing concern...",
      "content": "<h2>What is Antibiotic Resistance?</h2>...",
      "coverImage": "http://...",
      "category": "Drug Information",
      "date": "2024-11-05",
      "author": {
        "name": "Alhassan Latifa",
        "avatar": "http://...",
        "bio": "Clinical Pharmacist..."
      },
      "tags": ["Antibiotics", "Drug Safety"],
      "readTime": 8,
      "likes": 156,
      "views": 2340
    }
  ],
  "total": 12
}
```

---

### Get Post by Slug
**Endpoint:** `GET /blog/posts/{slug}`

**Response:** `200 OK` (Single post object)

---

### Get Related Posts
**Endpoint:** `GET /blog/posts/{id}/related`

**Query Parameters:**
- `limit` (int) - Default: 3

**Response:** Array of related posts

---

### Like Post
**Endpoint:** `POST /blog/posts/{id}/like`  
**Auth:** Optional

**Response:** `200 OK`
```json
{
  "likes": 157
}
```

---

## 🛍️ Cart

### Get Cart
**Endpoint:** `GET /cart`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "cart-item-123",
      "medicationId": 1,
      "medicationName": "Amoxicillin",
      "pharmacyId": 1,
      "pharmacyName": "HealthPlus",
      "pharmacyLogo": "http://...",
      "brandId": 1,
      "brandName": "Amoxil",
      "formId": 1,
      "formName": "Capsule",
      "strengthId": 1,
      "strength": "500mg",
      "uomId": 1,
      "uom": "10 capsules",
      "quantity": 2,
      "price": 25.00,
      "discountPrice": 22.50,
      "image": "http://...",
      "inStock": true,
      "requiresPrescription": true
    }
  ],
  "totalItems": 2,
  "subtotal": 45.00,
  "discount": 5.00,
  "total": 45.00
}
```

---

### Add to Cart
**Endpoint:** `POST /cart/items`  
**Auth:** Required

**Request:**
```json
{
  "medication_id": 1,
  "pharmacy_id": 1,
  "brand_id": 1,
  "form_id": 1,
  "strength_id": 1,
  "uom_id": 1,
  "quantity": 2
}
```

**Response:** `201 Created` (Full cart object)

---

### Update Cart Item
**Endpoint:** `PUT /cart/items/{item_id}`  
**Auth:** Required

**Request:**
```json
{
  "quantity": 5
}
```

**Response:** `200 OK` (Full cart object)

---

### Remove from Cart
**Endpoint:** `DELETE /cart/items/{item_id}`  
**Auth:** Required

**Response:** `200 OK`

---

### Clear Cart
**Endpoint:** `DELETE /cart/clear`  
**Auth:** Required

**Response:** `200 OK`

---

## 💳 Payments

### Initialize Payment
**Endpoint:** `POST /payments/initialize`  
**Auth:** Required

**Request:**
```json
{
  "order_id": "uuid-here"
}
```

**Response:** `200 OK`
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "abc123xyz",
  "reference": "ORD-ABC123XYZ"
}
```

---

### Verify Payment
**Endpoint:** `GET /payments/verify/{reference}`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "status": "success",
  "order": { ... },
  "transaction": {
    "id": 1,
    "reference": "ORD-ABC123XYZ",
    "amount": 60.00,
    "status": "success"
  }
}
```

---

### Get Transactions
**Endpoint:** `GET /transactions`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "reference": "ORD-ABC123XYZ",
      "amount": 60.00,
      "type": "payment",
      "status": "success",
      "payment_method": "paystack",
      "order_id": "uuid-here",
      "created_at": "2024-11-08T10:30:00Z"
    }
  ]
}
```

---

## 💝 Favorites

### Get Favorites
**Endpoint:** `GET /favorites`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "favoritable_type": "medication",
      "favoritable_id": 1,
      "favoritable": {
        "id": 1,
        "drug_name": "Amoxicillin",
        "category": "Antibiotics",
        "image": "http://..."
      },
      "created_at": "2024-11-08T10:30:00Z"
    }
  ]
}
```

---

### Add Favorite
**Endpoint:** `POST /favorites`  
**Auth:** Required

**Request:**
```json
{
  "favoritable_type": "medication",
  "favoritable_id": 1
}
```

**Response:** `201 Created`

---

### Remove Favorite
**Endpoint:** `DELETE /favorites/{id}`  
**Auth:** Required

**Response:** `200 OK`

---

### Get Favorite Medications
**Endpoint:** `GET /favorites/medications`  
**Auth:** Required

**Response:** Array of medication objects

---

### Get Favorite Pharmacies
**Endpoint:** `GET /favorites/pharmacies`  
**Auth:** Required

**Response:** Array of pharmacy objects

---

## 🕐 Recently Viewed

### Get Recently Viewed
**Endpoint:** `GET /recently-viewed`  
**Auth:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "medication": {
        "id": 1,
        "drug_name": "Amoxicillin",
        "category": "Antibiotics",
        "image": "http://..."
      },
      "viewed_at": "2024-11-08T10:30:00Z"
    }
  ]
}
```

---

### Add to Recently Viewed
**Endpoint:** `POST /recently-viewed`  
**Auth:** Required

**Request:**
```json
{
  "medication_id": 1
}
```

**Response:** `201 Created`

---

## 🚨 Error Responses

### Validation Error
**Status:** `422 Unprocessable Entity`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

### Unauthorized
**Status:** `401 Unauthorized`
```json
{
  "message": "Unauthenticated."
}
```

---

### Not Found
**Status:** `404 Not Found`
```json
{
  "message": "Resource not found."
}
```

---

### Server Error
**Status:** `500 Internal Server Error`
```json
{
  "message": "Server Error",
  "error": "Detailed error message (only in development)"
}
```

---

## 📊 Pagination

All list endpoints return paginated results:

```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 75
  },
  "links": {
    "first": "http://localhost:8000/api/medications?page=1",
    "last": "http://localhost:8000/api/medications?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/medications?page=2"
  }
}
```

---

## 🔑 Authentication Headers

All authenticated requests must include:

```
Authorization: Bearer {access_token}
Accept: application/json
Content-Type: application/json
```

---

## 📱 Frontend Integration Example

```javascript
// API Service (apiService.ts)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🎯 Implementation Priority

### Phase 1 - Core Features:
1. ✅ User Authentication
2. ✅ Medications CRUD
3. ✅ Pharmacies CRUD
4. ✅ Order Management
5. ✅ Payment Integration

### Phase 2 - Enhanced Features:
6. ✅ Reviews & Ratings
7. ✅ Prescription Management
8. ✅ Cart Management
9. ✅ Blog System

### Phase 3 - Personalization:
10. ✅ Favorites
11. ✅ Recently Viewed
12. ✅ Notifications
13. ✅ Search & Filters

### Phase 4 - Advanced:
14. Real-time order tracking
15. Analytics dashboard
16. SMS notifications
17. Push notifications

---

## 📞 Support

For API questions or issues:
- Email: dev@fyndrx.com
- Documentation: https://api.fyndrx.com/docs
- Status: https://status.fyndrx.com

---

**Version:** 1.0.0  
**Last Updated:** November 8, 2025  
**Maintained By:** FyndRX Development Team

