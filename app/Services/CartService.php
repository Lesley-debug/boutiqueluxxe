<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class CartService
{
    public function current(): Cart
    {
        if (Auth::check()) {
            return Cart::firstOrCreate(['user_id' => Auth::id()]);
        }

        $sessionId = Session::getId();

        return Cart::firstOrCreate(['session_id' => $sessionId, 'user_id' => null]);
    }

    public function mergeGuestCartIntoUser(string $guestSessionId, int $userId): void
    {
        if ($guestSessionId === '') {
            return;
        }

        DB::transaction(function () use ($guestSessionId, $userId) {
            $guestCart = Cart::query()
                ->whereNull('user_id')
                ->where('session_id', $guestSessionId)
                ->first();

            if (! $guestCart) {
                return;
            }

            $userCart = Cart::firstOrCreate(
                ['user_id' => $userId],
                ['session_id' => null],
            );

            $lockedCarts = Cart::query()
                ->whereIn('id', [$guestCart->id, $userCart->id])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $guestCart = $lockedCarts->get($guestCart->id);
            $userCart = $lockedCarts->get($userCart->id);

            if (! $guestCart || ! $userCart || $guestCart->is($userCart)) {
                return;
            }

            $guestItems = CartItem::query()
                ->where('cart_id', $guestCart->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($guestItems as $guestItem) {
                $variant = ProductVariant::query()
                    ->with('product')
                    ->whereKey($guestItem->product_variant_id)
                    ->first();

                if (! $variant || ! $variant->product || $variant->product->status !== 'active' || $variant->stock_quantity < 1) {
                    continue;
                }

                $existingItem = CartItem::query()
                    ->where('cart_id', $userCart->id)
                    ->where('product_variant_id', $variant->id)
                    ->lockForUpdate()
                    ->first();

                $combinedQuantity = ($existingItem?->quantity ?? 0) + $guestItem->quantity;
                $safeQuantity = min(20, $variant->stock_quantity, $combinedQuantity);

                if ($existingItem) {
                    $existingItem->update(['quantity' => $safeQuantity]);
                } else {
                    CartItem::create([
                        'cart_id' => $userCart->id,
                        'product_variant_id' => $variant->id,
                        'quantity' => $safeQuantity,
                    ]);
                }
            }

            if (! $userCart->discount_id && $guestCart->discount_id) {
                $userCart->update(['discount_id' => $guestCart->discount_id]);
            }

            $guestCart->delete();
        });
    }

}
