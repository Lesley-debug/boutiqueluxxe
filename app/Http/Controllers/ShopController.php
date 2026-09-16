<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->active()->with(['category', 'images', 'variants']);

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->string('category'))->first();
            if ($category) {
                $ids = $category->children()->pluck('id')->push($category->id);
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

        return Inertia::render('Store/Shop', [
            'products' => $products,
            'categories' => Category::topLevel()->active()->with('children')->orderBy('sort_order')->get(),
            'filters' => $request->only(['category', 'style', 'search', 'min_price', 'max_price', 'sort']),
        ]);
    }
}
