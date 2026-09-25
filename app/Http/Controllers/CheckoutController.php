<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmationMail;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Discount;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Notifications\LowStockNotification;
use App\Notifications\NewOrderNotification;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function show()
    {
        $cart = $this->cartService->current()->load(['items.variant.product.images', 'discount']);

        if ($cart->items->isEmpty()) {
            return redirect('/cart')->withErrors(['cart' => 'Your cart is empty.']);
        }

        return Inertia::render('Store/Checkout', [
            'cart' => $cart,
            'user' => Auth::user(),
            'addresses' => Auth::check() ? Auth::user()->addresses()->orderByDesc('is_default')->get() : [],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'fulfillment_method' => ['required', 'in:delivery'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $cart = $this->cartService->current();

        try {
            $result = DB::transaction(function () use ($cart, $data) {
                // Serialize checkout attempts for this cart. A duplicate request
                // waits here and sees an empty cart after the first one commits.
                $lockedCart = Cart::whereKey($cart->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $cartItems = CartItem::where('cart_id', $lockedCart->id)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                if ($cartItems->isEmpty()) {
                    throw new \RuntimeException('Your cart is empty or this order has already been placed.');
                }

                // Stable lock ordering reduces deadlock risk when different carts
                // contain the same variants in a different order.
                $variantIds = $cartItems->pluck('product_variant_id')
                    ->unique()
                    ->sort()
                    ->values();

                $variants = ProductVariant::whereIn('id', $variantIds)
                    ->with('product')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                if ($variants->count() !== $variantIds->count()) {
                    throw new \RuntimeException('One or more products in your cart are no longer available.');
                }

                $subtotal = 0;
                $lineItems = [];
                $lowStockVariants = [];

                foreach ($cartItems as $cartItem) {
                    $variant = $variants->get($cartItem->product_variant_id);

                    if (! $variant || ! $variant->product || $variant->product->status !== 'active') {
                        throw new \RuntimeException('One or more products in your cart are no longer available.');
                    }

                    if ($variant->stock_quantity < $cartItem->quantity) {
                        throw new \RuntimeException("Not enough stock for SKU {$variant->sku}.");
                    }

                    $unitPrice = (float) ($variant->price_override ?? $variant->product->display_price);
                    $lineTotal = $unitPrice * $cartItem->quantity;
                    $subtotal += $lineTotal;

                    $label = collect([$variant->color, $variant->size, $variant->material])
                        ->filter()
                        ->implode(' / ');

                    $lineItems[] = [
                        'product_variant_id' => $variant->id,
                        'product_name' => $variant->product->name,
                        'variant_label' => $label ?: null,
                        'sku' => $variant->sku,
                        'unit_price' => $unitPrice,
                        'quantity' => $cartItem->quantity,
                        'line_total' => $lineTotal,
                    ];

                    $variant->decrement('stock_quantity', $cartItem->quantity);

                    if ($variant->fresh()->stock_quantity <= 5) {
                        $lowStockVariants[] = $variant->fresh(['product']);
                    }
                }

                $discountCode = null;
                $discountAmount = 0;

                if ($lockedCart->discount_id) {
                    $discount = Discount::whereKey($lockedCart->discount_id)
                        ->lockForUpdate()
                        ->first();

                    if ($discount && $discount->isValidFor($subtotal)) {
                        $discountAmount = $discount->calculateDiscountAmount($subtotal);
                        $discountCode = $discount->code;
                        $discount->increment('uses_count');
                    }
                }

                $shippingCost = 0;
                $total = max(0, $subtotal + $shippingCost - $discountAmount);

                $order = Order::create([
                    'user_id' => Auth::id(),
                    'status' => 'pending',
                    'fulfillment_method' => $data['fulfillment_method'],
                    'payment_status' => 'pending',
                    'customer_name' => $data['customer_name'],
                    'customer_email' => $data['customer_email'],
                    'customer_phone' => $data['customer_phone'],
                    'shipping_address' => $data['shipping_address'],
                    'city' => $data['city'],
                    'region' => $data['region'] ?? null,
                    'notes' => $data['notes'] ?? null,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'discount_code' => $discountCode,
                    'discount_amount' => $discountAmount,
                    'total' => $total,
                ]);

                foreach ($lineItems as $line) {
                    $order->items()->create($line);
                }

                CartItem::whereIn('id', $cartItems->pluck('id'))->delete();
                $lockedCart->update(['discount_id' => null]);

                return ['order' => $order, 'lowStockVariants' => $lowStockVariants];
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['checkout' => $e->getMessage()]);
        }

        $order = $result['order'];

        session()->push('guest_order_ids', $order->id);

        try {
            Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));
        } catch (\Throwable $exception) {
            report($exception);
        }

        try {
            $admins = User::where('is_admin', true)->get();
            Notification::send($admins, new NewOrderNotification($order));

            foreach ($result['lowStockVariants'] as $variant) {
                Notification::send($admins, new LowStockNotification($variant));
            }
        } catch (\Throwable $exception) {
            report($exception);
        }

        return redirect("/orders/{$order->order_number}/confirmation");
    }
}
