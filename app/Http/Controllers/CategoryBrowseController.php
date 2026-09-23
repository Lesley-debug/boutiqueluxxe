<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Inertia\Inertia;

class CategoryBrowseController extends Controller
{
    public function index()
    {
        return Inertia::render('Store/CategoryBrowse', [
            'categories' => Category::topLevel()
                ->active()
                ->withCount(['products' => fn($q) => $q->active()])
                ->with(['products' => fn($q) => $q->active()->with('images')->latest()->limit(1)])
                ->orderBy('sort_order')
                ->get()
                ->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'products_count' => $c->products_count,
                    'image' => $c->products->first()?->images->first()?->url,
                ]),
        ]);
    }
}
