<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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

        $productUrl = route('products.show', $product->slug);
        $description = Str::limit(
            trim(strip_tags($product->description ?: "Discover {$product->name}, selected by Boutique Luxxe.")),
            160,
            '',
        );
        $productImages = $product->images->pluck('url')->filter()->values()->all();
        $sku = $product->variants->pluck('sku')->filter()->first();
        $productSchema = array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            '@id' => $productUrl.'#product',
            'name' => $product->name,
            'url' => $productUrl,
            'description' => $description,
            'image' => $productImages,
            'sku' => $sku,
            'brand' => $product->brand ? ['@type' => 'Brand', 'name' => $product->brand] : null,
            'category' => $product->category?->name,
            'offers' => [
                '@type' => 'Offer',
                'url' => $productUrl,
                'priceCurrency' => config('commerce.currency', 'USD'),
                'price' => number_format($product->display_price, 2, '.', ''),
                'availability' => $product->in_stock
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'seller' => ['@id' => url('/').'#organization'],
            ],
        ], fn ($value) => $value !== null && $value !== []);
        $breadcrumbSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => url('/')],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Shop', 'item' => route('shop')],
                ['@type' => 'ListItem', 'position' => 3, 'name' => $product->name, 'item' => $productUrl],
            ],
        ];

        return Inertia::render('Store/ProductDetail', [
            'product' => $product,
            'related' => $related,
            'seo' => [
                'title' => $product->name,
                'description' => $description,
                'canonical' => $productUrl,
                'image' => $product->images->first()?->url,
                'type' => 'product',
                'robots' => 'index,follow',
                'schema' => [$productSchema, $breadcrumbSchema],
            ],
        ]);
    }
}
