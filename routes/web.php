<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Account\AddressController;
use App\Http\Controllers\Admin\AboutPageController;
use App\Http\Controllers\CategoryBrowseController;
use App\Http\Controllers\Account\WishlistController;
use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\DiscountController as AdminDiscountController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\CollectionController as AdminCollectionController;
use App\Http\Controllers\Admin\JournalPostController as AdminJournalPostController;
use App\Http\Controllers\Admin\StyleController as AdminStyleController;
use App\Http\Controllers\Account\DashboardController as AccountDashboardController;
use App\Http\Controllers\Admin\BulkPricingController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\Admin\HomepageContentController;
use App\Http\Controllers\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\Auth\GoogleAuthController;


// Public homepage
Route::get('/', [HomeController::class, 'index']);

// Public shop + product pages
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/categories', [CategoryBrowseController::class, 'index'])->name('categories.browse');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

// Public info pages
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/faqs', fn () => Inertia::render('Store/Faqs'))->name('faqs');
Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact')->name('contact.store');
Route::get('/privacy-policy', fn () => Inertia::render('Store/PrivacyPolicy'))->name('privacy');
Route::get('/terms-of-service', fn () => Inertia::render('Store/TermsOfService'))->name('terms');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/collections', [CollectionController::class, 'index'])->name('collections.index');
Route::get('/collections/{slug}', [CollectionController::class, 'show'])->name('collections.show');
Route::get('/journal', [JournalController::class, 'index'])->name('journal.index');
Route::get('/journal/{slug}', [JournalController::class, 'show'])->name('journal.show');

Route::post('/newsletter', [NewsletterController::class, 'store'])->middleware('throttle:newsletter')->name('newsletter.store');

// Cart — open to guests and logged-in users alike
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart/items', [CartController::class, 'store'])->middleware('throttle:cart')->name('cart.items.store');
Route::patch('/cart/items/{item}', [CartController::class, 'update'])->middleware('throttle:cart')->name('cart.items.update');
Route::delete('/cart/items/{item}', [CartController::class, 'destroy'])->middleware('throttle:cart')->name('cart.items.destroy');
Route::post('/cart/discount', [CartController::class, 'applyDiscount'])->middleware('throttle:cart')->name('cart.discount.apply');
Route::delete('/cart/discount', [CartController::class, 'removeDiscount'])->name('cart.discount.remove');

// Checkout — also open to guests (guest checkout), user_id is nullable on orders
Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout.store');
Route::get('/orders/{orderNumber}/confirmation', [OrderController::class, 'confirmation'])->middleware('throttle:confirmation')->name('orders.confirmation');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:registration');
    Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->middleware('throttle:oauth')->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('throttle:oauth')->name('google.callback');

    // Password Reset Routes
    Route::get('/forgot-password', function () {
        return Inertia::render('Auth/ForgotPassword');
    })->name('password.request');
    
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->middleware('throttle:password-reset-request')->name('password.email');
    
    Route::get('/reset-password/{token}', function (string $token) {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => request('email', ''),
        ]);
    })->name('password.reset');
    
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset')->name('password.update');
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// Customer account — requires login, no admin flag needed
Route::middleware('auth')->prefix('account')->name('account.')->group(function () {
    Route::get('/', [AccountDashboardController::class, 'index'])->name('dashboard');
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    Route::resource('addresses', AddressController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('wishlist/{product}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

    Route::get('orders', [AccountOrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [AccountOrderController::class, 'show'])->name('orders.show');
    
    // User notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllRead');
    
    // User activity
    Route::get('activity', function () {
        return Inertia::render('Account/Activity');
    })->name('activity.index');

});

//Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::middleware('permission:dashboard.view')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    });

    Route::middleware('permission:products.manage')->group(function () {
        Route::resource('categories', AdminCategoryController::class);
        Route::resource('products', AdminProductController::class);

        Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('products.variants.store');
        Route::put('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('products.variants.update');
        Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('products.variants.destroy');

        Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
        Route::patch('products/{product}/images/{image}/primary', [ProductImageController::class, 'setPrimary'])->name('products.images.primary');
        Route::post('products/{product}/images/reorder', [ProductImageController::class, 'reorder'])->name('products.images.reorder');
        Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');

        Route::resource('styles', AdminStyleController::class)->only(['index', 'store', 'destroy']);
        Route::resource('collections', AdminCollectionController::class);
        Route::resource('journal', AdminJournalPostController::class);

        Route::get('about-page', [AboutPageController::class, 'edit'])->name('about-page.edit');
        Route::put('about-page', [AboutPageController::class, 'update'])->name('about-page.update');

        Route::get('homepage', [HomepageContentController::class, 'edit'])->name('homepage.edit');
        Route::put('homepage', [HomepageContentController::class, 'update'])->name('homepage.update');
        Route::resource('testimonials', AdminTestimonialController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('newsletter', [AdminNewsletterController::class, 'index'])->name('newsletter.index');
        Route::put('styles/{style}', [AdminStyleController::class, 'update'])->name('styles.update');

        Route::get('bulk-pricing', [BulkPricingController::class, 'edit'])->name('bulk-pricing.edit');
        Route::put('bulk-pricing', [BulkPricingController::class, 'update'])->name('bulk-pricing.update');
        Route::resource('hero-slides', HeroSlideController::class);
    });

    Route::middleware('permission:orders.manage')->group(function () {
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
        Route::patch('orders/{order}/payment', [AdminOrderController::class, 'updatePaymentStatus'])->name('orders.payment');
    });

    Route::middleware('permission:customers.view')->group(function () {
        Route::get('customers', [AdminCustomerController::class, 'index'])->name('customers.index');
        Route::get('customers/{email}', [AdminCustomerController::class, 'show'])->name('customers.show');
    });

    Route::middleware('permission:discounts.manage')->group(function () {
        Route::resource('discounts', AdminDiscountController::class)->except(['show']);
    });

    Route::middleware('permission:notifications.view')->group(function () {
        Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
        Route::patch('notifications/{id}/read', [AdminNotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('notifications/read-all', [AdminNotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
    });

    Route::middleware('permission:admins.manage')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::patch('users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.role');
    });

});