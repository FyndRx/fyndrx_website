# FyndRX Backend Quick Start Guide

## 🚀 Get Started in 30 Minutes

This guide will help you set up the Laravel/Filament backend for FyndRX quickly.

---

## 📦 Step 1: Create Laravel Project

```bash
composer create-project laravel/laravel fyndrx-backend
cd fyndrx-backend
```

---

## 🔧 Step 2: Install Dependencies

```bash
# Core packages
composer require filament/filament:"^3.0"
composer require laravel/sanctum
composer require intervention/image
composer require unicodeveloper/laravel-paystack

# Utilities
composer require spatie/laravel-permission
composer require spatie/laravel-query-builder
composer require spatie/laravel-medialibrary

# Development
composer require --dev laravel/pint
composer require --dev barryvdh/laravel-debugbar
```

---

## ⚙️ Step 3: Configure Environment

```env
# .env
APP_NAME=FyndRX
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_DATABASE=fyndrx
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_MERCHANT_EMAIL=admin@fyndrx.com
```

---

## 🗄️ Step 4: Create Migrations (Copy & Paste)

### Create all migrations at once:

```bash
php artisan make:migration create_pharmacies_table
php artisan make:migration create_medications_table
php artisan make:migration create_medication_brands_table
php artisan make:migration create_medication_forms_table
php artisan make:migration create_medication_strengths_table
php artisan make:migration create_medication_uoms_table
php artisan make:migration create_pharmacy_medication_prices_table
php artisan make:migration create_orders_table
php artisan make:migration create_prescriptions_table
php artisan make:migration create_reviews_table
php artisan make:migration create_transactions_table
php artisan make:migration create_blog_posts_table
php artisan make:migration create_favorites_table
php artisan make:migration create_recently_viewed_table
```

See `LARAVEL_BACKEND_GUIDE.md` for complete migration code.

---

## 🏗️ Step 5: Create Models

```bash
php artisan make:model Medication
php artisan make:model Pharmacy
php artisan make:model Order
php artisan make:model Prescription
php artisan make:model Review
php artisan make:model Transaction
php artisan make:model BlogPost
php artisan make:model Favorite
php artisan make:model MedicationBrand
php artisan make:model MedicationForm
php artisan make:model MedicationStrength
php artisan make:model MedicationUOM
php artisan make:model PharmacyMedicationPrice
```

---

## 🎨 Step 6: Install Filament Admin

```bash
php artisan filament:install --panels
php artisan make:filament-user

# Create admin resources
php artisan make:filament-resource Medication --generate
php artisan make:filament-resource Pharmacy --generate
php artisan make:filament-resource Order --generate
php artisan make:filament-resource User --generate
php artisan make:filament-resource Prescription --generate
php artisan make:filament-resource Review --generate
php artisan make:filament-resource BlogPost --generate
```

Access admin at: `http://localhost:8000/admin`

---

## 🛣️ Step 7: Create API Routes

Create file: `routes/api.php`

```php
use App\Http\Controllers\Api\{
    AuthController,
    MedicationController,
    PharmacyController,
    OrderController,
    PrescriptionController,
    ReviewController,
    BlogController,
    FavoriteController,
    PaymentController
};

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public browsing
Route::get('/medications', [MedicationController::class, 'index']);
Route::get('/medications/{id}', [MedicationController::class, 'show']);
Route::get('/pharmacies', [PharmacyController::class, 'index']);
Route::get('/pharmacies/{id}', [PharmacyController::class, 'show']);
Route::get('/blog/posts', [BlogController::class, 'index']);
Route::get('/blog/posts/{slug}', [BlogController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('prescriptions', PrescriptionController::class);
    Route::apiResource('reviews', ReviewController::class);
    Route::apiResource('favorites', FavoriteController::class);
    
    Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
    Route::get('/payments/verify/{reference}', [PaymentController::class, 'verify']);
});
```

---

## 🎮 Step 8: Create Controllers

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/MedicationController --api
php artisan make:controller Api/PharmacyController --api
php artisan make:controller Api/OrderController --api
php artisan make:controller Api/PrescriptionController --api
php artisan make:controller Api/ReviewController --api
php artisan make:controller Api/BlogController --api
php artisan make:controller Api/FavoriteController --api
php artisan make:controller Api/PaymentController
```

---

## 📝 Step 9: Create API Resources

```bash
php artisan make:resource MedicationResource
php artisan make:resource PharmacyResource
php artisan make:resource OrderResource
php artisan make:resource UserResource
php artisan make:resource BlogPostResource
```

---

## 🌱 Step 10: Seed Database

```bash
php artisan make:seeder PharmacySeeder
php artisan make:seeder MedicationSeeder
php artisan make:seeder BlogPostSeeder

# Run migrations and seed
php artisan migrate:fresh --seed
```

---

## 🔒 Step 11: Configure CORS

Update `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

---

## 🏃 Step 12: Run the Application

```bash
# Start server
php artisan serve

# In another terminal - Run queue worker
php artisan queue:work

# In another terminal - Run scheduler (if needed)
php artisan schedule:work
```

API available at: `http://localhost:8000/api`  
Admin panel: `http://localhost:8000/admin`

---

## ✅ Step 13: Test Your API

### Using Postman:
1. Import `FyndRX_API_Postman_Collection.json`
2. Set `base_url` variable to `http://localhost:8000/api`
3. Test authentication endpoints
4. Token auto-saves to collection variable

### Using cURL:

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"John","lastname":"Doe","email":"john@test.com","phone_number":"+233123456789","password":"password123","password_confirmation":"password123"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Get medications (with token)
curl -X GET http://localhost:8000/api/medications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Critical Files to Create

### 1. AuthController.php (Most Important)

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'phone_number' => 'required|string|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'firstname' => $validated['firstname'],
            'lastname' => $validated['lastname'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'member_id' => 'MEM-' . strtoupper(substr(md5(time()), 0, 10)),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
```

---

## 📊 Sample Data Structure

### Medication JSON Structure:
```json
{
  "drug_name": "Amoxicillin",
  "category": "Antibiotics",
  "description": "Broad-spectrum antibiotic...",
  "requires_prescription": true,
  "brands": [{"name": "Amoxil"}],
  "forms": [
    {
      "form_name": "Capsule",
      "strengths": [
        {
          "strength": "500mg",
          "uoms": [{"uom": "10 capsules"}, {"uom": "20 capsules"}]
        }
      ]
    }
  ]
}
```

---

## 🔍 Testing Checklist

- [ ] User can register
- [ ] User can login and receive token
- [ ] Token authenticates protected routes
- [ ] Can fetch medications list
- [ ] Can search medications
- [ ] Can fetch pharmacies
- [ ] Can create order
- [ ] Can upload prescription
- [ ] Can add review
- [ ] Payment initialization works
- [ ] Cart operations work
- [ ] Favorites CRUD works

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution:** Check `config/cors.php` and add frontend URL to allowed origins

### Issue: 419 CSRF Token Mismatch
**Solution:** Add frontend domain to `SANCTUM_STATEFUL_DOMAINS` in `.env`

### Issue: 500 Error on File Upload
**Solution:** 
```bash
php artisan storage:link
chmod -R 775 storage
```

### Issue: Queue not processing
**Solution:**
```bash
php artisan queue:restart
php artisan queue:work
```

---

## 📚 Folder Structure

```
fyndrx-backend/
├── app/
│   ├── Filament/
│   │   └── Resources/
│   │       ├── MedicationResource.php
│   │       ├── PharmacyResource.php
│   │       └── OrderResource.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── MedicationController.php
│   │   │       └── OrderController.php
│   │   └── Resources/
│   │       ├── MedicationResource.php
│   │       └── OrderResource.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Medication.php
│   │   ├── Pharmacy.php
│   │   └── Order.php
│   └── Policies/
│       └── OrderPolicy.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── storage/
    └── app/
        └── public/
            ├── medications/
            ├── pharmacies/
            └── prescriptions/
```

---

## 🎯 Priority Development Order

### Week 1: Foundation
1. Setup Laravel project
2. Configure database & migrations
3. Create User authentication
4. Setup Filament admin panel
5. Create basic models

### Week 2: Core Features
6. Medications CRUD API
7. Pharmacies CRUD API
8. Price management system
9. Image upload handling
10. Search functionality

### Week 3: Ordering System
11. Cart management API
12. Order creation & management
13. Payment integration (Paystack)
14. Prescription upload/verification
15. Order status tracking

### Week 4: Enhancements
16. Reviews & ratings system
17. Blog CMS
18. Favorites & recently viewed
19. Email notifications
20. Performance optimization

---

## 💡 Quick Tips

### Artisan Commands You'll Use Often:

```bash
# Make new migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh migrations with seed
php artisan migrate:fresh --seed

# Create model with migration and controller
php artisan make:model ModelName -mcr

# Create Filament resource
php artisan make:filament-resource ModelName --generate

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 🔗 Important Links

- **Laravel Docs:** https://laravel.com/docs
- **Filament Docs:** https://filamentphp.com/docs
- **Sanctum:** https://laravel.com/docs/sanctum
- **Paystack API:** https://paystack.com/docs
- **Intervention Image:** http://image.intervention.io

---

## 🎨 Filament Dashboard Features

Once setup, you'll have:

### Medications Management:
- Add/Edit/Delete medications
- Manage brands, forms, strengths
- Upload medication images
- Set categories
- Toggle prescription requirement

### Pharmacy Management:
- CRUD operations for pharmacies
- Set working hours (JSON field)
- Manage services list
- Upload pharmacy images
- Set location (lat/lng)
- Toggle open/closed status

### Order Management:
- View all orders
- Update order status
- Process payments
- View order items
- Track delivery
- Handle cancellations

### User Management:
- View all users
- Edit user profiles
- Manage permissions
- View user orders
- Suspend/activate accounts

### Content Management:
- Create/edit blog posts
- Manage categories & tags
- Upload images
- Publish/unpublish posts
- View analytics

---

## 📊 Sample Seeder Data

```php
// database/seeders/MedicationSeeder.php
public function run()
{
    $medication = Medication::create([
        'drug_name' => 'Amoxicillin',
        'slug' => 'amoxicillin',
        'category' => 'Antibiotics',
        'description' => 'Broad-spectrum antibiotic effective against...',
        'image' => 'medications/amoxicillin.jpg',
        'requires_prescription' => true,
    ]);

    // Add brand
    $brand = $medication->brands()->create([
        'name' => 'Amoxil',
        'manufacturer' => 'GSK',
    ]);

    // Add form
    $form = $medication->forms()->create([
        'form_name' => 'Capsule',
    ]);

    // Add strength
    $strength = $form->strengths()->create([
        'strength' => '500mg',
    ]);

    // Add UOMs
    $strength->uoms()->create(['uom' => '10 capsules']);
    $strength->uoms()->create(['uom' => '20 capsules']);
    $strength->uoms()->create(['uom' => '30 capsules']);
}
```

---

## 🚦 API Response Standards

### Success Response:
```json
{
  "data": { ... },
  "message": "Operation successful",
  "status": 200
}
```

### Error Response:
```json
{
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  },
  "status": 422
}
```

---

## 🔒 Security Checklist

- [ ] Enable HTTPS in production
- [ ] Set strong APP_KEY
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Sanitize file uploads
- [ ] Use prepared statements
- [ ] Enable CSRF protection
- [ ] Set proper CORS headers
- [ ] Use Laravel's authorization policies

---

## 📱 Frontend Integration

In your Vue app (`apiService.ts`):

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get medications
export async function getMedications(page = 1) {
  const response = await fetch(`${API_URL}/medications?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Accept': 'application/json',
    }
  });
  return response.json();
}
```

---

## 🎓 Learning Path

If you're new to Laravel:

1. **Day 1-2:** Laravel basics (routing, controllers, models)
2. **Day 3-4:** Eloquent ORM & relationships
3. **Day 5-6:** API development with Sanctum
4. **Day 7-8:** Filament admin panel
5. **Day 9-10:** File uploads & media handling
6. **Day 11-12:** Payment integration
7. **Day 13-14:** Testing & deployment

---

## 🆘 Need Help?

### Resources:
- Laracasts: https://laracasts.com
- Laravel Daily: https://laraveldaily.com
- Filament Examples: https://github.com/filamentphp

### Community:
- Laravel Discord
- Stack Overflow (tag: laravel)
- Filament Discord

---

## 📦 Deployment (Production)

```bash
# Optimize for production
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Setup supervisor for queues
sudo supervisorctl start fyndrx-worker:*

# Enable scheduler
# Add to crontab: * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🎉 You're Ready!

Follow these steps and you'll have a fully functional FyndRX backend in no time!

**Estimated Setup Time:** 2-3 hours  
**Estimated Development Time:** 3-4 weeks  
**Difficulty:** Intermediate

Good luck! 🚀

---

**Created:** November 8, 2025  
**For:** FyndRX Backend Team  
**Framework:** Laravel 10.x + Filament 3.x

