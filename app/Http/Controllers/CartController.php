<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Discount;
use App\Models\ProductVariant;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index()
    {
        $cart = $this->cartService->current()->load(['items.variant.product.images', 'discount']);

        return Inertia::render('Store/Cart', [
            'cart' => $cart,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'variant_id' => ['required', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $variant = ProductVariant::query()
            ->whereKey($data['variant_id'])
            ->whereHas('product', fn ($query) => $query->where('status', 'active'))
            ->firstOrFail();

        if ($variant->stock_quantity < $data['quantity']) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        $cart = $this->cartService->current();

        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
        ]);

        $newQuantity = ($item->exists ? $item->quantity : 0) + $data['quantity'];

        if ($newQuantity > 20) {
            return back()->withErrors(['quantity' => 'You can add a maximum of 20 units of one item.']);
        }

        if ($newQuantity > $variant->stock_quantity) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        $item->quantity = $newQuantity;
        $item->cart_id = $cart->id;
        $item->product_variant_id = $variant->id;
        $item->save();

        return back()->with('success', 'Added to cart.');
    }

    public function update(Request $request, CartItem $item)
    {
        $this->authorizeCartItem($item);

        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        if ($data['quantity'] > $item->variant->stock_quantity) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        $item->update(['quantity' => $data['quantity']]);

        return back()->with('success', 'Cart updated.');
    }

    public function destroy(CartItem $item)
    {
        $this->authorizeCartItem($item);

        $item->delete();

        return back()->with('success', 'Item removed.');
    }

    public function applyDiscount(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $cart = $this->cartService->current()->load('items');
        $discount = Discount::where('code', $data['code'])->first();

        if (! $discount) {
            return back()->withErrors(['code' => 'Invalid discount code.']);
        }

        if (! $discount->isValidFor($cart->subtotal)) {
            return back()->withErrors(['code' => 'This discount code is not valid for your order.']);
        }

        $cart->update(['discount_id' => $discount->id]);

        return back()->with('success', 'Discount applied.');
    }

    public function removeDiscount()
    {
        $cart = $this->cartService->current();
        $cart->update(['discount_id' => null]);

        return back()->with('success', 'Discount removed.');
    }

    private function authorizeCartItem(CartItem $item): void
    {
        abort_unless((int) $item->cart_id === (int) $this->cartService->current()->id, 404);
    }
}
