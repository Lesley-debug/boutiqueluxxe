<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Store/Collections', [
            'collections' => Collection::active()->orderBy('sort_order')->get(),
        ]);
    }

    public function show(string $slug)
    {
        $collection = Collection::active()
            ->where('slug', $slug)
            ->with([
                'products' => fn ($query) => $query
                    ->active()
                    ->with(['images', 'variants']),
            ])
            ->firstOrFail();

        $collectionUrl = route('collections.show', $collection->slug);
        $description = Str::limit(
            trim(strip_tags($collection->description ?: "Explore the {$collection->name} collection from Boutique Luxxe.")),
            160,
            '',
        );
        $itemList = $collection->products->take(24)->values()->map(
            fn ($product, $index) => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $product->name,
                'url' => route('products.show', $product->slug),
            ]
        )->all();
        $collectionSchema = array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            '@id' => $collectionUrl.'#collection',
            'name' => $collection->name,
            'url' => $collectionUrl,
            'description' => $description,
            'image' => $collection->hero_image_url,
            'mainEntity' => $itemList ? [
                '@type' => 'ItemList',
                'numberOfItems' => count($itemList),
                'itemListElement' => $itemList,
            ] : null,
        ], fn ($value) => $value !== null);
        $breadcrumbSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => url('/')],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Collections', 'item' => route('collections.index')],
                ['@type' => 'ListItem', 'position' => 3, 'name' => $collection->name, 'item' => $collectionUrl],
            ],
        ];

        return Inertia::render('Store/CollectionDetail', [
            'collection' => $collection,
            'seo' => [
                'title' => $collection->name,
                'description' => $description,
                'canonical' => $collectionUrl,
                'image' => $collection->hero_image_url,
                'type' => 'website',
                'robots' => 'index,follow',
                'schema' => [$collectionSchema, $breadcrumbSchema],
            ],
        ]);
    }
}
