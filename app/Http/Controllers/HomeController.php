<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\HomepageContent;
use App\Models\Product;
use App\Models\Style;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Store/Home', [
            'heroSlides' => HeroSlide::active()->orderBy('sort_order')->get(),
            'categories' => $this->categoryCardData(),
            'featuredProducts' => $this->withWishlistFlag(
                Product::active()
                    ->featured()
                    ->with(['images', 'variants'])
                    ->latest()
                    ->limit(2)
                    ->get()
            ),
            'newArrivals' => $this->withWishlistFlag(
                Product::active()
                    ->newArrivals()
                    ->with(['images', 'variants'])
                    ->latest()
                    ->limit(4)
                    ->get()
            ),
            'content' => HomepageContent::current(),
            'styles' => Style::whereNotNull('image')
                ->whereHas('products', fn($q) => $q->active())
                ->orderBy('name')
                ->limit(3)
                ->get(['id', 'name', 'slug', 'image']),
            'testimonials' => Testimonial::active()->orderBy('sort_order')->limit(3)->get(),
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

    private function categoryCardData()
    {
        return Category::topLevel()
            ->active()
            ->with(['products' => fn($q) => $q->active()->with(['images', 'variants'])->latest()->limit(1)])
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
