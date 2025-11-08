# FyndRx MVP Features and Innovation Plan

## 1. Overview
FyndRx is evolving into a full-featured ePharmacy and drug discovery platform that bridges the gap between patients and pharmacies. The MVP aims to create a seamless, trustworthy, and innovative system that simplifies drug discovery, prescription management, and purchasing — while maintaining strong collaboration between patients, pharmacies, and healthcare providers.

The focus of the MVP is on **trust, accessibility, and convenience**, setting the foundation for future AI-driven prescription interpretation and health insights.

---

## 2. Core MVP Features

### 2.1. Patient/User Features
1. **Smart Drug Search**
   - Patients can search for drugs using drug name, brand, or condition.
   - Results show nearby pharmacies with availability and price listings.
   - Option to sort/filter by price, distance, or pharmacy rating.

2. **Prescription Upload (AI-ready)**
   - Users can upload prescriptions (image or PDF).
   - Pharmacists verify and process uploaded prescriptions.
   - Future AI interpretation support for automated drug list generation.

3. **Cart and Checkout**
   - Standard eCommerce-style cart system.
   - Users can choose to pick up at the pharmacy or request delivery (where available).
   - Real-time stock confirmation from pharmacies before checkout.

4. **Order Tracking**
   - Track order status (Processing, Ready for Pickup, Out for Delivery, Completed).
   - Push notifications and SMS updates.

5. **User Profile and Medical History**
   - Users can view order history, saved prescriptions, and favorite pharmacies.
   - Option to add recurring prescription reminders.

6. **Discounts and Coupons (Revised)**
   - Traditional coupon system for specific pharmacies or campaigns.
   - No platform-wide mandatory discounts; pharmacies control their offers.
   - Coupons can be provided via QR code or digital voucher.

---

### 2.2. Pharmacy Staff Features (Web + Vue.js Access)
1. **Prescription Management**
   - View and process prescription uploads assigned to their pharmacy.
   - Approve, reject, or request clarification from patients.

2. **Order Management**
   - View new, ongoing, and completed orders.
   - Update order status and manage delivery coordination.

3. **Inventory Sync**
   - Simple inventory sync tools to mark drug availability.
   - Manual stock update or file upload (CSV/Excel).

4. **Performance Dashboard (Basic)**
   - Daily/weekly sales overview.
   - Pending orders, processed prescriptions, and customer feedback summary.

---

## 3. Payment Flow Strategy (MVP Phase)
Pharmacies may be hesitant to accept delayed payouts during the early stages. To handle this challenge, the MVP will use a **Hybrid Payment Model**:

### 3.1. Hybrid Payment Model
- **Direct Pay-to-Pharmacy Option**:
  - At checkout, patients can choose to pay directly to the pharmacy using Paystack’s **Split Payment** feature.
  - Funds are automatically routed to the pharmacy’s subaccount, with a small commission split for FyndRx.
  - Eliminates the need for monthly payouts.

- **FyndRx Wallet (Future Upgrade)**:
  - Introduce a wallet system in later phases to enable quick refunds and promotions.
  - Pharmacies can also withdraw funds via wallet balance.

### 3.2. Payment Flow Summary
1. Patient checks out.
2. FyndRx uses Paystack Split Payment → Pharmacy gets major share instantly.
3. FyndRx commission is auto-deducted.
4. Payment record synced to both pharmacy and patient dashboards.

---

## 4. Unique and Innovative Additions

1. **Prescription Intelligence (Phase 2)**
   - Use AI/ML to read and interpret uploaded prescriptions.
   - Suggest alternative drugs or generics available in the pharmacy’s stock.

2. **Pharmacy Locator with Live Availability**
   - Patients can view nearby pharmacies on a map with live inventory updates.
   - Integration with Google Maps API.

3. **Health Insights Dashboard**
   - Users receive personalized insights on frequently purchased drugs.
   - Automated reminders for refills and doctor checkups.

4. **Verified Pharmacy Badges**
   - Pharmacies can earn verified badges based on reviews, delivery speed, and authenticity.

5. **Pharmacy Partnership API (Future)**
   - Allow independent pharmacies to integrate their existing POS systems via API for automated sync.

6. **Prescription Refill Automation**
   - Patients can schedule recurring refills for chronic prescriptions.
   - Notification sent when it’s time to reorder.

7. **Health Campaigns and Awareness**
   - Pharmacies can promote health awareness campaigns on the FyndRx platform.
   - Patients get educational content on common conditions and treatments.

---

## 5. MVP Technical Summary

| Component | Framework | Description |
|------------|------------|--------------|
| **Frontend (User & Pharmacy Staff)** | Vue.js 3 + Tailwind CSS | SPA using Composition API with role-based views. |
| **Backend/Admin** | Laravel + Filament | Pharmacy & Super Admin management, analytics, and user control. |
| **API Integration** | Axios + Laravel Sanctum | Secure authentication and data communication. |
| **Payment** | Paystack Split Payment | Direct payment routing between patients and pharmacies. |
| **Database** | MySQL | Centralized schema for users, orders, pharmacies, and inventory. |

---

## 6. Next Steps
1. Finalize MVP user flows (patient + pharmacy staff).
2. Implement hybrid Paystack integration.
3. Redesign frontend to reflect new eCommerce flow.
4. Deploy feedback system for both users and pharmacies.
5. Begin early pharmacy onboarding for pilot testing.

