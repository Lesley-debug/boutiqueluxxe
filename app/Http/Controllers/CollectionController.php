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

        return Inertia::render('Store/CollectionDetail', [
            'collection' => $collection,
            'seo' => [
                'title' => $collection->name,
                'description' => Str::limit(
                    trim(strip_tags($collection->description ?: "Explore the {$collection->name} collection from Boutique Luxxe.")),
                    160,
                    '',
                ),
                'canonical' => route('collections.show', $collection->slug),
                'image' => $collection->hero_image_url,
                'type' => 'website',
                'robots' => 'index,follow',
            ],
        ]);
    }
}
