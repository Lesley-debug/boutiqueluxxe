<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\DiscountController as AdminDiscountController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\ProductImageController;

// Public homepage
Route::get('/', function () {
    return Inertia::render('Store/Home');
});

// Public shop + product pages
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

// Cart — open to guests and logged-in users alike
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::post('/cart/items', [CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{item}', [CartController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{item}', [CartController::class, 'destroy'])->name('cart.items.destroy');

// Checkout — also open to guests (guest checkout), user_id is nullable on orders
Route::get('/checkout', [CheckoutController::class, 'show'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/orders/{orderNumber}/confirmation', [OrderController::class, 'confirmation'])->name('orders.confirmation');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

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
    });

    Route::middleware('permission:orders.manage')->group(function () {
        Route::get('orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
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

//cart
Route::post('/cart/discount', [CartController::class, 'applyDiscount'])->name('cart.discount.apply');
Route::delete('/cart/discount', [CartController::class, 'removeDiscount'])->name('cart.discount.remove');
