<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Style;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Store/Home', [
            'categories' => $this->categoryCardData(),
            'featuredProducts' => Product::active()->featured()->with('images')->latest()->limit(4)->get(),
            'newArrivals' => Product::active()->newArrivals()->with('images')->latest()->limit(8)->get(),
        ]);
    }

    private function categoryCardData()
    {
        return Category::topLevel()
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
    }
}
