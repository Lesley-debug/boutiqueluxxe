<?php

namespace App\Http\Controllers;

use App\Models\Collection;
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
        ]);
    }
}
