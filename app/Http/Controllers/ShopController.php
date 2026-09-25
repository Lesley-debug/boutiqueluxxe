<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->active()->with(['category', 'images', 'variants']);

        if ($request->filled('category')) {
            $category = Category::active()->where('slug', $request->string('category'))->first();
            if ($category) {
                $ids = $category->children()->active()->pluck('id')->push($category->id);
                $query->whereIn('category_id', $ids);
            }
        }

        if ($request->filled('style')) {
            $style = \App\Models\Style::where('slug', $request->string('style'))->first();
            if ($style) {
                $query->where('style_id', $style->id);
            }
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('brand', 'like', "%{$term}%");
            });
        }

        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->float('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->float('max_price'));
        }

        match ($request->string('sort')->value()) {
            'price_asc' => $query->orderBy('base_price', 'asc'),
            'price_desc' => $query->orderBy('base_price', 'desc'),
            'newest' => $query->latest(),
            default => $query->orderByDesc('featured')->latest(),
        };

        $products = $query->paginate(12)->withQueryString();
        $this->withWishlistFlag($products->getCollection());

        return Inertia::render('Store/Shop', [
            'products' => $products,
            'categories' => Category::topLevel()
                ->active()
                ->with(['children' => fn ($query) => $query->active()->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get(),
            'filters' => $request->only(['category', 'style', 'search', 'min_price', 'max_price', 'sort']),
        ]);
    }

    private function withWishlistFlag($products)
    {
        if (! Auth::check()) {
            return $products->each(fn ($p) => $p->is_wishlisted = false);
        }
        $wishlistedIds = Auth::user()->wishlistItems()->pluck('product_id')->toArray();
        return $products->each(fn ($p) => $p->is_wishlisted = in_array($p->id, $wishlistedIds));
    }
}
