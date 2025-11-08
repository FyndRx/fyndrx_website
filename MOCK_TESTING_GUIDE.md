# FyndRx Mock Testing Guide

All API endpoints have been replaced with mock services using local JSON data. You can now fully test the application without needing a backend server.

---

## 🔑 Mock Login Credentials

### Default User (Patient)
- **Email**: `john.mensah@example.com`
- **Phone**: `+233245551234` (or `+233 24 555 1234`)
- **Password**: `password123`
- **Role**: `patient` (redirects to user dashboard)

### Additional Test Users (in users.json)
1. Sarah Owusu - `sarah.owusu@example.com`
2. Kwame Asante - `kwame.asante@example.com`

---

## 📝 Mock OTP for Registration/Verification
- **OTP Code**: `123456` (works for all OTP verifications)

---

## 🧪 Testing Flows

### 1. **Authentication Flow**

#### Login
1. Go to `/login`
2. Enter email: `john.mensah@example.com`
3. Enter password: `password123`
4. Click "Sign In"
5. ✅ You'll be redirected to dashboard with user data
6. ✅ Notice the Sign In/Register buttons are replaced with your user avatar in the header

#### Register (Optional)
1. Go to `/register`
2. Fill in any details
3. Submit form
4. Use OTP: `123456` for verification
5. ✅ Registration simulated successfully

#### Logout
1. Click user avatar in header
2. Click "Logout"
3. ✅ Logged out and redirected to login

---

### 2. **Shopping & Cart Flow**

#### Browse Medications
1. Navigate to `/medications`
2. Search or filter by category
3. Click any medication card
4. ✅ See medication details with pharmacy prices

#### Add to Cart
1. On medication detail page, select:
   - Brand (if multiple)
   - Form (e.g., Tablets, Capsules)
   - Strength (e.g., 500mg, 250mg)
   - Quantity (use dropdown or quick add buttons)
2. Click "Add to Cart"
3. ✅ Item added to cart (badge updates in header)

#### View Cart
1. Click shopping cart icon in header
2. ✅ See all cart items grouped by pharmacy
3. Try:
   - Increasing/decreasing quantities
   - Removing items
   - Selecting specific pharmacies for checkout

---

### 3. **Checkout Flow**

#### Place Order
1. In cart, select pharmacy/pharmacies
2. Click "Proceed to Checkout"
3. On checkout page:
   - Select delivery method (Pickup or Delivery)
   - Enter phone number
   - If delivery: Enter address
   - If items require prescription: Upload prescription (optional for pickup, required for delivery)
   - Select payment method (Pay Online or Pay at Pharmacy)
4. Click "Place Order"
5. ✅ Order created and added to order history

#### Mock Payment
- If "Pay Online" is selected, the system will simulate payment initiation
- For testing, payment will appear as "Pending"
- Real Paystack integration would redirect to payment page

---

### 4. **Order Tracking Flow**

#### View Order History
1. Click user avatar → "My Orders"
2. ✅ See all orders with filters (All, Active, Completed, Cancelled)
3. Try filtering orders by status

#### Track Order
1. Click any order card
2. ✅ See detailed order tracking page with:
   - Visual progress timeline
   - Order items with images
   - Delivery information
   - Pharmacy details
   - Order summary

#### Cancel Order
1. On order detail page (only for Pending/Confirmed orders)
2. Click "Cancel Order"
3. Optionally provide cancellation reason
4. Confirm cancellation
5. ✅ Order status updated to "Cancelled"

---

### 5. **Dashboard Overview**

1. Go to `/dashboard`
2. ✅ See overview with:
   - Total Orders count
   - Active Orders count
   - Cart Items count
   - Total Spent amount
   - Recent 3 orders
   - Quick action buttons
   - Help/support card

---

### 6. **Pharmacy & Medication Search**

#### Browse Pharmacies
1. Navigate to `/pharmacies`
2. Try:
   - Searching by name
   - Filtering by "Open Now"
   - Filtering by services
   - Sorting options
3. Click any pharmacy card
4. ✅ See pharmacy details

#### Search Medications
1. Use Quick Search on homepage
2. Enter medication name (e.g., "Paracetamol")
3. ✅ Redirected to filtered medications page

---

## 📦 Mock Data Available

### Orders (4 pre-loaded orders)
- `ORD-2024-001`: Completed order
- `ORD-2024-002`: Out for delivery
- `ORD-2024-003`: Ready for pickup
- `ORD-2024-004`: Processing

### Medications (15+ items)
Including:
- Amoxicillin
- Paracetamol
- Ibuprofen
- Omeprazole
- Metformin
- Lisinopril
- Atorvastatin
- Levothyroxine
- Albuterol
- And more...

### Pharmacies (15+ locations)
Across Ghana including:
- HealthPlus Pharmacy (Tema)
- MediCare Pharmacy (Spintex, Accra)
- PharmAccess Limited (Ring Road, Accra)
- And more...

---

## 🔄 Data Persistence

**Important Notes:**
- Mock data is stored in memory during the session
- New orders you create will appear in order history
- Cart data persists in localStorage
- Refreshing the page will reset mock orders to initial state
- User authentication persists until logout

---

## 🐛 Testing Edge Cases

### Test Scenarios

1. **Empty Cart Checkout**
   - Try proceeding to checkout with empty cart
   - ✅ Should show warning notification

2. **Prescription Validation**
   - Add prescription medication to cart
   - Try delivery without uploading prescription
   - ✅ Should show error

3. **Multiple Pharmacy Orders**
   - Add items from different pharmacies
   - Select multiple pharmacies for checkout
   - ✅ Each pharmacy gets separate order

4. **Network Simulation**
   - Mock services include artificial delays (300-1000ms)
   - Loading states should display properly

5. **Invalid Credentials**
   - Try logging in with wrong password
   - ✅ Should show error message with hint

---

## 🎯 Key Features to Test

### ✅ Completed & Ready to Test
- [x] User authentication (login, register, logout)
- [x] Browse medications with search & filters
- [x] View medication details with dynamic pricing
- [x] Add items to cart with quantity selection
- [x] Cart management (update quantities, remove items)
- [x] Pharmacy selection for checkout
- [x] Checkout with flexible payment options
- [x] Prescription upload (conditional based on delivery method)
- [x] Order creation
- [x] Order history with filters
- [x] Order detail & tracking with visual timeline
- [x] Order cancellation
- [x] Dashboard overview with stats
- [x] Responsive design (mobile, tablet, desktop)
- [x] Dark mode support

### 🔜 Not Yet Implemented (Requires Backend)
- [ ] Real-time order status updates from pharmacy
- [ ] Actual payment processing (Paystack integration)
- [ ] Email/SMS notifications
- [ ] Prescription verification by pharmacist
- [ ] Pharmacy staff dashboard
- [ ] Real-time inventory sync
- [ ] Order delivery tracking with GPS

---

## 💡 Tips for Testing

1. **Test Dark Mode**: Toggle dark mode using the moon icon in header
2. **Test Responsiveness**: Resize browser window or use mobile view
3. **Test Different Orders**: View orders with different statuses
4. **Test Cart Persistence**: Add items, close browser, reopen
5. **Test Notifications**: Look for toast notifications on actions
6. **Monitor Console**: Open browser console to see mock service logs

---

## 🚀 Ready for API Integration

When the Laravel backend is ready, you can easily switch from mock to real API by:

1. Updating `src/services/auth.service.ts` to use real API endpoints
2. Updating `src/services/cartService.ts` to use real API endpoints
3. Updating `src/services/orderService.ts` to use real API endpoints
4. Setting `VITE_API_BASE_URL` in `.env` file

The interfaces and data structures are already aligned with the expected backend responses!

---

## 📞 Need Help?

If you encounter any issues during testing:
1. Check browser console for error messages
2. Verify you're using correct mock credentials
3. Clear localStorage if experiencing auth issues: `localStorage.clear()`
4. Ensure all dependencies are installed: `npm install`

Happy Testing! 🎉

