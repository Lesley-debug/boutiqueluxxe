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
        $category = null;
        $style = null;

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

        $props = [
            'products' => $products,
            'categories' => Category::topLevel()
                ->active()
                ->with(['children' => fn ($query) => $query->active()->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get(),
            'filters' => $request->only(['category', 'style', 'search', 'min_price', 'max_price', 'sort']),
        ];

        $queryKeys = array_keys($request->query());
        $categoryLanding = $category && $queryKeys === ['category'];
        $styleLanding = $style && $queryKeys === ['style'];
        $landing = $categoryLanding ? $category : ($styleLanding ? $style : null);

        if ($landing) {
            $parameter = $categoryLanding ? 'category' : 'style';
            $landingUrl = route('shop').'?'.http_build_query([$parameter => $landing->slug]);
            $props['seo'] = [
                'title' => $landing->name.' Luxury Pieces',
                'description' => "Explore {$landing->name} pieces selected by Boutique Luxxe, with personal support for every reservation.",
                'canonical' => $landingUrl,
                'image' => url(config('seo.default_image')),
                'type' => 'website',
                'robots' => 'index,follow',
                'schema' => [[
                    '@context' => 'https://schema.org',
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => url('/')],
                        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Shop', 'item' => route('shop')],
                        ['@type' => 'ListItem', 'position' => 3, 'name' => $landing->name, 'item' => $landingUrl],
                    ],
                ]],
            ];
        } elseif ($request->query()) {
            $props['seo'] = [
                ...config('seo.default'),
                ...config('seo.pages.shop'),
                'canonical' => route('shop'),
                'image' => url(config('seo.default_image')),
                'robots' => 'noindex,follow',
            ];
        }

        return Inertia::render('Store/Shop', $props);
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
