<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Account/Wishlist', [
            'items' => $request->user()->wishlistItems()->with(['product.images'])->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
        ]);

        WishlistItem::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $data['product_id'],
        ]);

        return back()->with('success', 'Added to wishlist.');
    }

    public function destroy(Request $request, Product $product)
    {
        $request->user()->wishlistItems()->where('product_id', $product->id)->delete();

        return back()->with('success', 'Removed from wishlist.');
    }
}
