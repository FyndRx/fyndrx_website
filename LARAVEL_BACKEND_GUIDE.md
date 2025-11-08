# FyndRX Laravel/Filament Backend Development Guide

## 📋 Table of Contents

1. [Project Setup](#project-setup)
2. [Database Schema](#database-schema)
3. [Models & Relationships](#models--relationships)
4. [API Endpoints](#api-endpoints)
5. [Filament Admin Panel](#filament-admin-panel)
6. [Authentication](#authentication)
7. [File Uploads](#file-uploads)
8. [Payment Integration](#payment-integration)
9. [Deployment Checklist](#deployment-checklist)

---

## 🚀 Project Setup

### **1. Laravel Installation**

```bash
composer create-project laravel/laravel fyndrx-backend
cd fyndrx-backend
```

### **2. Required Packages**

```bash
# Filament Admin Panel
composer require filament/filament:"^3.0"

# API Resources
composer require laravel/sanctum

# Image Processing
composer require intervention/image

# Payment Gateway (Paystack for Ghana)
composer require unicodeveloper/laravel-paystack

# Additional Utilities
composer require spatie/laravel-permission
composer require spatie/laravel-query-builder
composer require spatie/laravel-medialibrary
```

### **3. Environment Configuration**

```env
APP_NAME=FyndRX
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fyndrx
DB_USERNAME=root
DB_PASSWORD=

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Paystack
PAYSTACK_PUBLIC_KEY=your_public_key
PAYSTACK_SECRET_KEY=your_secret_key
PAYSTACK_MERCHANT_EMAIL=your@email.com

# File Storage
FILESYSTEM_DISK=public

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
```

---

## 🗄️ Database Schema

### **Core Tables**

#### **1. users**
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('firstname');
    $table->string('lastname');
    $table->string('username')->unique()->nullable();
    $table->string('email')->unique();
    $table->string('phone_number')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->date('dob')->nullable();
    $table->text('address')->nullable();
    $table->string('profile_picture')->nullable();
    $table->string('member_id')->unique();
    $table->decimal('saved_money', 10, 2)->default(0);
    $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
    $table->foreignId('pharmacy_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('pharmacy_branch_id')->nullable()->constrained('pharmacy_branches')->nullOnDelete();
    $table->rememberToken();
    $table->timestamps();
    $table->softDeletes();
});
```

#### **2. pharmacies**
```php
Schema::create('pharmacies', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description');
    $table->text('address');
    $table->string('phone');
    $table->string('email');
    $table->string('website')->nullable();
    $table->string('image');
    $table->decimal('latitude', 10, 8);
    $table->decimal('longitude', 11, 8);
    $table->boolean('is_open')->default(false);
    $table->decimal('rating', 3, 2)->default(0);
    $table->json('working_hours'); // {monday: "9:00 AM - 9:00 PM", ...}
    $table->json('services'); // ["24/7 Service", "Home Delivery", ...]
    $table->boolean('is_verified')->default(false);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();
});
```

#### **3. medications**
```php
Schema::create('medications', function (Blueprint $table) {
    $table->id();
    $table->string('drug_name');
    $table->string('slug')->unique();
    $table->text('description');
    $table->string('category');
    $table->string('image');
    $table->boolean('requires_prescription')->default(false);
    $table->json('predefined_quantities')->default('[1, 2, 3, 5, 10]');
    $table->boolean('is_active')->default(true);
    $table->timestamps();
    $table->softDeletes();
});
```

#### **4. medication_brands**
```php
Schema::create('medication_brands', function (Blueprint $table) {
    $table->id();
    $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('manufacturer')->nullable();
    $table->timestamps();
});
```

#### **5. medication_forms**
```php
Schema::create('medication_forms', function (Blueprint $table) {
    $table->id();
    $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
    $table->string('form_name'); // Tablet, Capsule, Syrup, etc.
    $table->text('description')->nullable();
    $table->timestamps();
});
```

#### **6. medication_strengths**
```php
Schema::create('medication_strengths', function (Blueprint $table) {
    $table->id();
    $table->foreignId('form_id')->constrained('medication_forms')->cascadeOnDelete();
    $table->string('strength'); // 500mg, 250mg, etc.
    $table->timestamps();
});
```

#### **7. medication_uoms**
```php
Schema::create('medication_uoms', function (Blueprint $table) {
    $table->id();
    $table->foreignId('strength_id')->constrained('medication_strengths')->cascadeOnDelete();
    $table->string('uom'); // 10 tablets, 20 capsules, etc.
    $table->timestamps();
});
```

#### **8. pharmacy_medication_prices**
```php
Schema::create('pharmacy_medication_prices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('pharmacy_id')->constrained()->cascadeOnDelete();
    $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
    $table->foreignId('brand_id')->nullable()->constrained('medication_brands')->nullOnDelete();
    $table->foreignId('form_id')->constrained('medication_forms')->cascadeOnDelete();
    $table->foreignId('strength_id')->constrained('medication_strengths')->cascadeOnDelete();
    $table->decimal('price', 10, 2);
    $table->decimal('discount_price', 10, 2)->nullable();
    $table->boolean('in_stock')->default(true);
    $table->integer('stock_quantity')->default(0);
    $table->timestamps();
    
    $table->unique(['pharmacy_id', 'medication_id', 'form_id', 'strength_id', 'brand_id'], 'unique_pharmacy_medication');
});
```

#### **9. orders**
```php
Schema::create('orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('order_number')->unique();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('pharmacy_id')->constrained()->cascadeOnDelete();
    $table->json('items'); // Store order items as JSON
    $table->decimal('subtotal', 10, 2);
    $table->decimal('delivery_fee', 10, 2)->default(0);
    $table->decimal('total', 10, 2);
    $table->enum('payment_method', ['platform', 'direct']);
    $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
    $table->string('payment_reference')->nullable();
    $table->enum('delivery_method', ['pickup', 'delivery']);
    $table->text('delivery_address')->nullable();
    $table->string('phone_number');
    $table->enum('status', ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'completed', 'cancelled'])->default('pending');
    $table->boolean('prescription_required')->default(false);
    $table->boolean('prescription_uploaded')->default(false);
    $table->string('prescription_url')->nullable();
    $table->text('notes')->nullable();
    $table->timestamp('estimated_ready_time')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamp('cancelled_at')->nullable();
    $table->string('cancellation_reason')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

#### **10. prescriptions**
```php
Schema::create('prescriptions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
    $table->string('prescription_number')->unique();
    $table->string('file_path');
    $table->string('file_type'); // pdf, jpg, png
    $table->enum('status', ['pending', 'verified', 'rejected', 'used'])->default('pending');
    $table->text('rejection_reason')->nullable();
    $table->timestamp('verified_at')->nullable();
    $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
    $table->date('expiry_date')->nullable();
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

#### **11. reviews**
```php
Schema::create('reviews', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->morphs('reviewable'); // pharmacy_id/medication_id
    $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
    $table->integer('rating'); // 1-5
    $table->string('title');
    $table->text('comment');
    $table->json('images')->nullable();
    $table->boolean('verified_purchase')->default(false);
    $table->integer('helpful_count')->default(0);
    $table->integer('not_helpful_count')->default(0);
    $table->text('pharmacy_response')->nullable();
    $table->timestamp('responded_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

#### **12. blog_posts**
```php
Schema::create('blog_posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('excerpt');
    $table->longText('content');
    $table->string('cover_image');
    $table->string('category');
    $table->json('tags')->nullable();
    $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
    $table->integer('read_time')->default(5); // minutes
    $table->integer('likes_count')->default(0);
    $table->integer('views_count')->default(0);
    $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

#### **13. transactions**
```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
    $table->string('reference')->unique();
    $table->decimal('amount', 10, 2);
    $table->enum('type', ['payment', 'refund']);
    $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
    $table->string('payment_method')->nullable();
    $table->json('metadata')->nullable();
    $table->timestamps();
});
```

#### **14. favorites**
```php
Schema::create('favorites', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->morphs('favoritable'); // medications/pharmacies
    $table->timestamps();
    
    $table->unique(['user_id', 'favoritable_id', 'favoritable_type']);
});
```

#### **15. recently_viewed**
```php
Schema::create('recently_viewed', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
    $table->timestamp('viewed_at');
    $table->timestamps();
    
    $table->index(['user_id', 'viewed_at']);
});
```

---

## 🔐 Authentication

### **Sanctum Setup**

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
    'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1'
)),
```

### **CORS Configuration**

```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'supports_credentials' => true,
```

---

## 📡 API Endpoints

### **Authentication**

```
POST   /api/register
POST   /api/login
POST   /api/logout
GET    /api/user
PUT    /api/user/profile
POST   /api/user/profile/picture
POST   /api/verify-otp
POST   /api/resend-otp
POST   /api/forgot-password
POST   /api/reset-password
```

### **Medications**

```
GET    /api/medications
GET    /api/medications/{id}
GET    /api/medications/search?q={query}
GET    /api/medications/category/{category}
GET    /api/medications/{id}/prices
GET    /api/medications/{id}/reviews
POST   /api/medications/{id}/reviews
```

### **Pharmacies**

```
GET    /api/pharmacies
GET    /api/pharmacies/{id}
GET    /api/pharmacies/search?q={query}
GET    /api/pharmacies/nearby?lat={lat}&lng={lng}&radius={km}
GET    /api/pharmacies/{id}/medications
GET    /api/pharmacies/{id}/reviews
POST   /api/pharmacies/{id}/reviews
```

### **Orders**

```
GET    /api/orders
POST   /api/orders
GET    /api/orders/{id}
PUT    /api/orders/{id}/cancel
GET    /api/orders/{id}/track
POST   /api/orders/{id}/receipt
```

### **Cart**

```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/{id}
DELETE /api/cart/items/{id}
DELETE /api/cart/clear
POST   /api/cart/sync
```

### **Prescriptions**

```
GET    /api/prescriptions
POST   /api/prescriptions/upload
GET    /api/prescriptions/{id}
DELETE /api/prescriptions/{id}
GET    /api/prescriptions/{id}/download
```

### **Reviews**

```
GET    /api/reviews
POST   /api/reviews
PUT    /api/reviews/{id}
DELETE /api/reviews/{id}
POST   /api/reviews/{id}/helpful
POST   /api/reviews/{id}/report
GET    /api/reviews/stats?type={type}&id={id}
```

### **Blog**

```
GET    /api/blog/posts
GET    /api/blog/posts/{slug}
GET    /api/blog/posts/{id}/related
GET    /api/blog/categories
GET    /api/blog/tags
POST   /api/blog/posts/{id}/like
POST   /api/blog/posts/{id}/comment
```

### **Favorites**

```
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/{id}
GET    /api/favorites/medications
GET    /api/favorites/pharmacies
```

### **Recently Viewed**

```
GET    /api/recently-viewed
POST   /api/recently-viewed
```

### **Payments**

```
POST   /api/payments/initialize
GET    /api/payments/verify/{reference}
POST   /api/payments/webhook
GET    /api/transactions
GET    /api/transactions/{id}
```

---

## 🏗️ Models & Relationships

### **User Model**

```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'firstname', 'lastname', 'username', 'email', 'phone_number',
        'password', 'dob', 'address', 'profile_picture', 'member_id'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['fullname', 'profile_picture_full'];

    public function getFullnameAttribute()
    {
        return "{$this->firstname} {$this->lastname}";
    }

    public function getProfilePictureFullAttribute()
    {
        return $this->profile_picture 
            ? asset('storage/' . $this->profile_picture) 
            : null;
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function recentlyViewed()
    {
        return $this->hasMany(RecentlyViewed::class);
    }
}
```

### **Medication Model**

```php
class Medication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'drug_name', 'slug', 'description', 'category', 
        'image', 'requires_prescription', 'predefined_quantities'
    ];

    protected $casts = [
        'requires_prescription' => 'boolean',
        'predefined_quantities' => 'array',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image);
    }

    public function brands()
    {
        return $this->hasMany(MedicationBrand::class);
    }

    public function forms()
    {
        return $this->hasMany(MedicationForm::class);
    }

    public function prices()
    {
        return $this->hasMany(PharmacyMedicationPrice::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function favorites()
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }
}
```

### **Pharmacy Model**

```php
class Pharmacy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'description', 'address', 'phone', 'email',
        'website', 'image', 'latitude', 'longitude', 'is_open',
        'rating', 'working_hours', 'services'
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'working_hours' => 'array',
        'services' => 'array',
        'rating' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    protected $appends = ['image_url', 'location'];

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image);
    }

    public function getLocationAttribute()
    {
        return [
            'lat' => $this->latitude,
            'lng' => $this->longitude,
        ];
    }

    public function prices()
    {
        return $this->hasMany(PharmacyMedicationPrice::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function favorites()
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }

    public function medications()
    {
        return $this->belongsToMany(Medication::class, 'pharmacy_medication_prices')
            ->withPivot('price', 'discount_price', 'in_stock');
    }
}
```

### **Order Model**

```php
class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_number', 'user_id', 'pharmacy_id', 'items',
        'subtotal', 'delivery_fee', 'total', 'payment_method',
        'payment_status', 'delivery_method', 'delivery_address',
        'phone_number', 'status', 'prescription_required',
        'prescription_uploaded', 'prescription_url', 'notes'
    ];

    protected $casts = [
        'items' => 'array',
        'prescription_required' => 'boolean',
        'prescription_uploaded' => 'boolean',
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'estimated_ready_time' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($order) {
            $order->id = (string) Str::uuid();
            $order->order_number = 'ORD-' . strtoupper(Str::random(10));
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function prescription()
    {
        return $this->hasOne(Prescription::class);
    }
}
```

---

## 🎨 Filament Admin Panel Setup

### **Installation**

```bash
php artisan filament:install --panels

php artisan make:filament-user
```

### **Resources to Create**

```bash
php artisan make:filament-resource Medication --generate
php artisan make:filament-resource Pharmacy --generate
php artisan make:filament-resource Order --generate
php artisan make:filament-resource User --generate
php artisan make:filament-resource Prescription --generate
php artisan make:filament-resource Review --generate
php artisan make:filament-resource BlogPost --generate
php artisan make:filament-resource Transaction --generate
```

### **Medication Resource Example**

```php
// app/Filament/Resources/MedicationResource.php

class MedicationResource extends Resource
{
    protected static ?string $model = Medication::class;
    protected static ?string $navigationIcon = 'heroicon-o-beaker';
    protected static ?string $navigationGroup = 'Medications';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Basic Information')
                    ->schema([
                        Forms\Components\TextInput::make('drug_name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => 
                                $set('slug', Str::slug($state))
                            ),
                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->unique(ignoreRecord: true),
                        Forms\Components\Select::make('category')
                            ->required()
                            ->options([
                                'Antibiotics' => 'Antibiotics',
                                'Pain Relief' => 'Pain Relief',
                                'Vitamins' => 'Vitamins',
                                // Add more categories
                            ])
                            ->searchable()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')->required(),
                            ]),
                        Forms\Components\Textarea::make('description')
                            ->required()
                            ->rows(4),
                        Forms\Components\Toggle::make('requires_prescription')
                            ->label('Requires Prescription?'),
                        Forms\Components\FileUpload::make('image')
                            ->image()
                            ->directory('medications')
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Quantities')
                    ->schema([
                        Forms\Components\TagsInput::make('predefined_quantities')
                            ->placeholder('1, 2, 3, 5, 10')
                            ->separator(','),
                    ]),

                Forms\Components\Section::make('Brands')
                    ->schema([
                        Forms\Components\Repeater::make('brands')
                            ->relationship()
                            ->schema([
                                Forms\Components\TextInput::make('name')->required(),
                                Forms\Components\TextInput::make('manufacturer'),
                            ])
                            ->columns(2),
                    ]),

                Forms\Components\Section::make('Forms & Strengths')
                    ->schema([
                        Forms\Components\Repeater::make('forms')
                            ->relationship()
                            ->schema([
                                Forms\Components\TextInput::make('form_name')
                                    ->label('Form')
                                    ->required(),
                                Forms\Components\Repeater::make('strengths')
                                    ->relationship()
                                    ->schema([
                                        Forms\Components\TextInput::make('strength')->required(),
                                        Forms\Components\Repeater::make('uoms')
                                            ->relationship()
                                            ->schema([
                                                Forms\Components\TextInput::make('uom')
                                                    ->label('UOM (e.g., 10 tablets)')
                                                    ->required(),
                                            ])
                                            ->columns(1),
                                    ])
                                    ->columns(1),
                            ])
                            ->columns(1),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->circular(),
                Tables\Columns\TextColumn::make('drug_name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('category')
                    ->badge()
                    ->searchable(),
                Tables\Columns\IconColumn::make('requires_prescription')
                    ->boolean(),
                Tables\Columns\TextColumn::make('brands_count')
                    ->counts('brands')
                    ->label('Brands'),
                Tables\Columns\TextColumn::make('forms_count')
                    ->counts('forms')
                    ->label('Forms'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('category'),
                Tables\Filters\TernaryFilter::make('requires_prescription'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
```

### **Order Resource Example**

```php
class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Order Information')
                    ->schema([
                        Forms\Components\TextInput::make('order_number')
                            ->disabled(),
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'email')
                            ->searchable()
                            ->required(),
                        Forms\Components\Select::make('pharmacy_id')
                            ->relationship('pharmacy', 'name')
                            ->searchable()
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'confirmed' => 'Confirmed',
                                'processing' => 'Processing',
                                'ready' => 'Ready for Pickup',
                                'out_for_delivery' => 'Out for Delivery',
                                'completed' => 'Completed',
                                'cancelled' => 'Cancelled',
                            ])
                            ->required(),
                    ])->columns(2),

                Forms\Components\Section::make('Payment')
                    ->schema([
                        Forms\Components\Select::make('payment_method')
                            ->options([
                                'platform' => 'Pay on Platform',
                                'direct' => 'Pay at Pharmacy',
                            ]),
                        Forms\Components\Select::make('payment_status')
                            ->options([
                                'pending' => 'Pending',
                                'paid' => 'Paid',
                                'failed' => 'Failed',
                                'refunded' => 'Refunded',
                            ]),
                        Forms\Components\TextInput::make('payment_reference')
                            ->disabled(),
                    ])->columns(3),

                Forms\Components\Section::make('Delivery')
                    ->schema([
                        Forms\Components\Select::make('delivery_method')
                            ->options([
                                'pickup' => 'Pickup',
                                'delivery' => 'Home Delivery',
                            ]),
                        Forms\Components\Textarea::make('delivery_address'),
                        Forms\Components\TextInput::make('phone_number'),
                    ]),

                Forms\Components\Section::make('Prescription')
                    ->schema([
                        Forms\Components\Toggle::make('prescription_required'),
                        Forms\Components\Toggle::make('prescription_uploaded'),
                        Forms\Components\FileUpload::make('prescription_url')
                            ->image()
                            ->directory('prescriptions'),
                    ])->columns(3),

                Forms\Components\Section::make('Items')
                    ->schema([
                        Forms\Components\KeyValue::make('items')
                            ->disabled(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('order_number')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.fullname')
                    ->searchable(),
                Tables\Columns\TextColumn::make('pharmacy.name')
                    ->searchable(),
                Tables\Columns\TextColumn::make('total')
                    ->money('GHS')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'secondary' => 'pending',
                        'info' => 'confirmed',
                        'warning' => 'processing',
                        'success' => ['ready', 'completed'],
                        'primary' => 'out_for_delivery',
                        'danger' => 'cancelled',
                    ]),
                Tables\Columns\BadgeColumn::make('payment_status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'paid',
                        'danger' => 'failed',
                        'secondary' => 'refunded',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status'),
                Tables\Filters\SelectFilter::make('payment_status'),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from'),
                        Forms\Components\DatePicker::make('created_until'),
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ]);
    }
}
```

---

## 🎯 API Controllers

### **MedicationController Example**

```php
class MedicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Medication::with(['brands', 'forms.strengths.uoms']);

        // Search
        if ($request->has('q')) {
            $query->where('drug_name', 'like', "%{$request->q}%")
                  ->orWhere('description', 'like', "%{$request->q}%")
                  ->orWhere('category', 'like', "%{$request->q}%");
        }

        // Category filter
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Prescription filter
        if ($request->has('requires_prescription')) {
            $query->where('requires_prescription', $request->boolean('requires_prescription'));
        }

        return MedicationResource::collection(
            $query->paginate($request->per_page ?? 15)
        );
    }

    public function show($id)
    {
        $medication = Medication::with(['brands', 'forms.strengths.uoms', 'reviews'])
            ->findOrFail($id);

        return new MedicationResource($medication);
    }

    public function prices($id, Request $request)
    {
        $prices = PharmacyMedicationPrice::where('medication_id', $id)
            ->with('pharmacy')
            ->when($request->form_id, fn($q) => $q->where('form_id', $request->form_id))
            ->when($request->strength_id, fn($q) => $q->where('strength_id', $request->strength_id))
            ->get();

        return PharmacyPriceResource::collection($prices);
    }
}
```

### **OrderController Example**

```php
class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pharmacy_id' => 'required|exists:pharmacies,id',
            'items' => 'required|array',
            'items.*.medication_id' => 'required|exists:medications,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_method' => 'required|in:pickup,delivery',
            'delivery_address' => 'required_if:delivery_method,delivery',
            'phone_number' => 'required|string',
            'payment_method' => 'required|in:platform,direct',
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            // Calculate totals
            $subtotal = $this->calculateSubtotal($validated['items']);
            $deliveryFee = $validated['delivery_method'] === 'delivery' ? 10 : 0;

            $order = Order::create([
                'user_id' => auth()->id(),
                'pharmacy_id' => $validated['pharmacy_id'],
                'items' => $validated['items'],
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => $subtotal + $deliveryFee,
                'payment_method' => $validated['payment_method'],
                'delivery_method' => $validated['delivery_method'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'phone_number' => $validated['phone_number'],
                'prescription_required' => $this->checkPrescriptionRequired($validated['items']),
            ]);

            // Send notification to pharmacy
            // event(new OrderCreated($order));

            return $order;
        });

        return new OrderResource($order);
    }

    public function track($id)
    {
        $order = Order::with('pharmacy')->findOrFail($id);
        
        $this->authorize('view', $order);

        $statusHistory = [
            ['status' => 'pending', 'timestamp' => $order->created_at],
            // Add more status history from order_status_logs table if needed
        ];

        return response()->json([
            'order' => new OrderResource($order),
            'status_history' => $statusHistory,
            'current_step' => $this->getCurrentStep($order->status),
        ]);
    }
}
```

---

## 💳 Payment Integration (Paystack)

### **PaymentController**

```php
class PaymentController extends Controller
{
    public function initialize(Request $request)
    {
        $order = Order::findOrFail($request->order_id);
        
        $this->authorize('pay', $order);

        $paystack = new Paystack();
        
        $response = $paystack->getAuthorizationUrl([
            'email' => auth()->user()->email,
            'amount' => $order->total * 100, // Convert to pesewas
            'reference' => $order->order_number,
            'callback_url' => env('FRONTEND_URL') . '/payment/callback',
            'metadata' => [
                'order_id' => $order->id,
                'user_id' => auth()->id(),
            ],
        ]);

        return response()->json([
            'authorization_url' => $response->authorization_url,
            'access_code' => $response->access_code,
            'reference' => $response->reference,
        ]);
    }

    public function verify($reference)
    {
        $paystack = new Paystack();
        $response = $paystack->getPaymentData($reference);

        if ($response->data->status === 'success') {
            $order = Order::where('order_number', $reference)->first();
            
            $order->update([
                'payment_status' => 'paid',
                'payment_reference' => $reference,
            ]);

            Transaction::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'reference' => $reference,
                'amount' => $order->total,
                'type' => 'payment',
                'status' => 'success',
                'payment_method' => 'paystack',
                'metadata' => $response->data,
            ]);

            return response()->json([
                'status' => 'success',
                'order' => new OrderResource($order),
            ]);
        }

        return response()->json(['status' => 'failed'], 400);
    }

    public function webhook(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        
        if ($signature !== hash_hmac('sha512', $request->getContent(), env('PAYSTACK_SECRET_KEY'))) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = $request->event;
        $data = $request->data;

        if ($event === 'charge.success') {
            // Update order payment status
            $order = Order::where('order_number', $data['reference'])->first();
            
            if ($order) {
                $order->update(['payment_status' => 'paid']);
            }
        }

        return response()->json(['status' => 'success']);
    }
}
```

---

## 📤 File Upload Handler

### **PrescriptionUploadController**

```php
class PrescriptionController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'prescription' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB
            'order_id' => 'nullable|exists:orders,id',
        ]);

        $file = $request->file('prescription');
        $path = $file->store('prescriptions', 'public');

        $prescription = Prescription::create([
            'user_id' => auth()->id(),
            'order_id' => $request->order_id,
            'prescription_number' => 'RX-' . strtoupper(Str::random(10)),
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
            'status' => 'pending',
        ]);

        if ($request->order_id) {
            Order::find($request->order_id)->update([
                'prescription_uploaded' => true,
                'prescription_url' => asset('storage/' . $path),
            ]);
        }

        return response()->json([
            'prescription' => $prescription,
            'url' => asset('storage/' . $path),
        ]);
    }

    public function download($id)
    {
        $prescription = Prescription::findOrFail($id);
        
        $this->authorize('view', $prescription);

        return response()->download(
            storage_path('app/public/' . $prescription->file_path)
        );
    }
}
```

---

## 🔍 Search & Filtering

### **QueryBuilder Example**

```php
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class PharmacyController extends Controller
{
    public function index(Request $request)
    {
        $pharmacies = QueryBuilder::for(Pharmacy::class)
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::partial('name'),
                AllowedFilter::partial('address'),
                AllowedFilter::exact('is_open'),
                AllowedFilter::scope('near', 'nearLocation'),
                AllowedFilter::callback('services', function ($query, $value) {
                    $query->whereJsonContains('services', $value);
                }),
            ])
            ->allowedSorts(['name', 'rating', 'created_at'])
            ->with('prices.medication')
            ->paginate($request->per_page ?? 15);

        return PharmacyResource::collection($pharmacies);
    }

    public function nearby(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric|min:1|max:50',
        ]);

        $pharmacies = Pharmacy::select('*')
            ->selectRaw(
                '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [$request->lat, $request->lng, $request->lat]
            )
            ->having('distance', '<', $request->radius ?? 10)
            ->orderBy('distance')
            ->get();

        return PharmacyResource::collection($pharmacies);
    }
}
```

---

## 📊 API Resources

### **MedicationResource**

```php
class MedicationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'drug_name' => $this->drug_name,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'image' => $this->image_url,
            'requiresPrescription' => $this->requires_prescription,
            'predefinedQuantities' => $this->predefined_quantities,
            'brands' => MedicationBrandResource::collection($this->whenLoaded('brands')),
            'forms' => MedicationFormResource::collection($this->whenLoaded('forms')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### **OrderResource**

```php
class OrderResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'userId' => $this->user_id,
            'pharmacyId' => $this->pharmacy_id,
            'pharmacyName' => $this->pharmacy->name,
            'pharmacyPhone' => $this->pharmacy->phone,
            'pharmacyAddress' => $this->pharmacy->address,
            'items' => $this->items,
            'subtotal' => (float) $this->subtotal,
            'deliveryFee' => (float) $this->delivery_fee,
            'total' => (float) $this->total,
            'paymentMethod' => $this->payment_method,
            'paymentStatus' => $this->payment_status,
            'deliveryMethod' => $this->delivery_method,
            'deliveryAddress' => $this->delivery_address,
            'phoneNumber' => $this->phone_number,
            'status' => $this->status,
            'prescriptionRequired' => $this->prescription_required,
            'prescriptionUploaded' => $this->prescription_uploaded,
            'prescriptionUrl' => $this->prescription_url,
            'notes' => $this->notes,
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at->toISOString(),
        ];
    }
}
```

---

## 🔔 Notifications

### **Order Status Notification**

```php
class OrderStatusChanged extends Notification
{
    public function __construct(public Order $order)
    {
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $statusMessages = [
            'confirmed' => 'Your order has been confirmed!',
            'processing' => 'Your order is being prepared',
            'ready' => 'Your order is ready for pickup',
            'out_for_delivery' => 'Your order is on the way',
            'completed' => 'Your order has been delivered',
        ];

        return (new MailMessage)
            ->subject('Order Update - ' . $this->order->order_number)
            ->line($statusMessages[$this->order->status] ?? 'Order status updated')
            ->action('View Order', url('/orders/' . $this->order->id))
            ->line('Thank you for using FyndRX!');
    }

    public function toArray($notifiable)
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'message' => 'Your order status has been updated',
        ];
    }
}
```

---

## 🛡️ Policies

### **OrderPolicy**

```php
class OrderPolicy
{
    public function view(User $user, Order $order)
    {
        return $user->id === $order->user_id;
    }

    public function update(User $user, Order $order)
    {
        return $user->id === $order->user_id && 
               in_array($order->status, ['pending', 'confirmed']);
    }

    public function cancel(User $user, Order $order)
    {
        return $user->id === $order->user_id && 
               !in_array($order->status, ['completed', 'cancelled']);
    }
}
```

---

## 📱 Real-time Updates (Broadcasting)

### **Order Status Event**

```php
class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function broadcastOn()
    {
        return new PrivateChannel('orders.' . $this->order->id);
    }

    public function broadcastWith()
    {
        return [
            'order' => new OrderResource($this->order),
            'status' => $this->order->status,
            'timestamp' => now()->toISOString(),
        ];
    }
}
```

---

## 🧪 Testing

### **Feature Test Example**

```php
class MedicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_medications_list()
    {
        Medication::factory()->count(5)->create();

        $response = $this->getJson('/api/medications');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'drug_name', 'category', 'image']
                     ]
                 ]);
    }

    public function test_can_search_medications()
    {
        Medication::factory()->create(['drug_name' => 'Amoxicillin']);
        Medication::factory()->create(['drug_name' => 'Ibuprofen']);

        $response = $this->getJson('/api/medications?q=Amoxicillin');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data');
    }
}
```

---

## 📦 Seeders

### **DatabaseSeeder**

```php
class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            PharmacySeeder::class,
            MedicationSeeder::class,
            PharmacyMedicationPriceSeeder::class,
            BlogPostSeeder::class,
        ]);
    }
}
```

---

## 🚀 Deployment Checklist

### **Server Requirements**
- PHP >= 8.1
- MySQL >= 8.0
- Composer
- Node.js & NPM
- Redis (for queues/cache)

### **Optimization**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### **Queue Workers**
```bash
php artisan queue:work --daemon
```

### **Scheduled Tasks**
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('orders:check-status')->everyFiveMinutes();
    $schedule->command('prescriptions:check-expiry')->daily();
    $schedule->command('pharmacy:update-opening-status')->hourly();
}
```

---

## 🔒 Security Best Practices

1. **API Rate Limiting**
```php
Route::middleware('throttle:60,1')->group(function () {
    // API routes
});
```

2. **Input Validation**
- Always validate user input
- Use Form Requests for complex validation
- Sanitize HTML content

3. **SQL Injection Prevention**
- Use Eloquent ORM
- Use parameter binding for raw queries
- Never concatenate user input in queries

4. **File Upload Security**
- Validate file types
- Scan for malware
- Store outside public directory
- Generate unique filenames

---

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Filament Documentation](https://filamentphp.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Paystack API](https://paystack.com/docs/api)

---

**Version:** 1.0  
**Last Updated:** November 8, 2025  
**Framework:** Laravel 10.x + Filament 3.x  
**Database:** MySQL 8.0  

