<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $categories = Category::topLevel()
            ->active()
            ->with(['products' => fn($q) => $q->active()->with('images')->latest()->limit(1)])
            ->orderBy('sort_order')
            ->get()
            ->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->products->first()?->images->first()?->url,
            ]);

        $featured = Product::active()->featured()->with('images')->latest()->limit(4)->get();
        $newArrivals = Product::active()->newArrivals()->with('images')->latest()->limit(8)->get();

        return Inertia::render('Store/Home', [
            'categories' => $categories,
            'featuredProducts' => $featured,
            'newArrivals' => $newArrivals,
        ]);
    }
}
