<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmationMail;
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
        $cart = $this->cartService->current()->load(['items.variant.product', 'discount']);

        if ($cart->items->isEmpty()) {
            return redirect('/cart')->withErrors(['cart' => 'Your cart is empty.']);
        }

        return Inertia::render('Store/Checkout', [
            'cart' => $cart,
            'user' => Auth::user(),
            'addresses' => Auth::check() ? Auth::user()->addresses()->orderByDesc('is_default')->get() : [],
            'pickupLocation' => [
                'name' => 'Designer Bags Boutique',
                'address' => 'Commercial Avenue, Bamenda, North-West Region',
                'hours' => 'Mon–Sat, 9am–6pm',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'fulfillment_method' => ['required', 'in:delivery,pickup'],
            'shipping_address' => ['required_if:fulfillment_method,delivery', 'nullable', 'string', 'max:255'],
            'city' => ['required_if:fulfillment_method,delivery', 'nullable', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $cart = $this->cartService->current()->load('items');

        if ($cart->items->isEmpty()) {
            return redirect('/cart')->withErrors(['cart' => 'Your cart is empty.']);
        }

        try {
            $result = DB::transaction(function () use ($cart, $data) {
                $variantIds = $cart->items->pluck('product_variant_id');
                $variants = ProductVariant::whereIn('id', $variantIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $subtotal = 0;
                $lineItems = [];
                $lowStockVariants = [];

                foreach ($cart->items as $cartItem) {
                    $variant = $variants[$cartItem->product_variant_id];

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

                if ($cart->discount_id) {
                    $discount = Discount::whereKey($cart->discount_id)->lockForUpdate()->first();

                    if ($discount && $discount->isValidFor($subtotal)) {
                        $discountAmount = $discount->calculateDiscountAmount($subtotal);
                        $discountCode = $discount->code;
                        $discount->increment('uses_count');
                    }
                }

                $isPickup = $data['fulfillment_method'] === 'pickup';
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
                    'shipping_address' => $isPickup ? null : $data['shipping_address'],
                    'city' => $isPickup ? null : $data['city'],
                    'region' => $isPickup ? null : ($data['region'] ?? null),
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

                $cart->items()->delete();
                $cart->update(['discount_id' => null]);

                return ['order' => $order, 'lowStockVariants' => $lowStockVariants];
            });
        } catch (\RuntimeException $e) {
            return back()->withErrors(['stock' => $e->getMessage()]);
        }

        $order = $result['order'];

        Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));

        $admins = User::where('is_admin', true)->get();
        Notification::send($admins, new NewOrderNotification($order));

        foreach ($result['lowStockVariants'] as $variant) {
            Notification::send($admins, new LowStockNotification($variant));
        }

        return redirect("/orders/{$order->order_number}/confirmation");
    }
}
