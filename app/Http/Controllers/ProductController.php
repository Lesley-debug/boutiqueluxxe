<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(string $slug)
    {
        $product = Product::active()
            ->with(['category', 'images', 'variants'])
            ->where('slug', $slug)
            ->firstOrFail();

        $related = Product::active()
            ->with(['images', 'variants'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        $wishlistProductIds = $related->pluck('id')->push($product->id);
        $wishlistedIds = Auth::check()
            ? Auth::user()
                ->wishlistItems()
                ->whereIn('product_id', $wishlistProductIds)
                ->pluck('product_id')
                ->all()
            : [];

        $product->setAttribute(
            'is_wishlisted',
            in_array($product->id, $wishlistedIds, true)
        );

        $related->each(fn (Product $item) => $item->setAttribute(
            'is_wishlisted',
            in_array($item->id, $wishlistedIds, true)
        ));

        return Inertia::render('Store/ProductDetail', [
            'product' => $product,
            'related' => $related,
        ]);
    }
}
