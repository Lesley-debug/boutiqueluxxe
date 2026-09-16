<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CollectionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Collections/Index', [
            'collections' => Collection::withCount('products')->orderBy('sort_order')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Collections/Form', [
            'products' => Product::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $productIds = $request->input('product_ids', []);

        if ($request->hasFile('hero_image')) {
            $data['hero_image'] = $request->file('hero_image')->store('collections', 'public');
        }

        $collection = Collection::create($data);
        $collection->products()->sync($productIds);

        return redirect()->route('admin.collections.index')->with('success', 'Collection created.');
    }

    public function edit(Collection $collection)
    {
        return Inertia::render('Admin/Collections/Form', [
            'collection' => $collection->load('products:id'),
            'products' => Product::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Collection $collection)
    {
        $data = $this->validated($request, $collection->id);
        $productIds = $request->input('product_ids', []);

        if ($request->hasFile('hero_image')) {
            if ($collection->hero_image) {
                Storage::disk('public')->delete($collection->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('collections', 'public');
        }

        $collection->update($data);
        $collection->products()->sync($productIds);

        return redirect()->route('admin.collections.index')->with('success', 'Collection updated.');
    }

    public function destroy(Collection $collection)
    {
        if ($collection->hero_image) {
            Storage::disk('public')->delete($collection->hero_image);
        }
        $collection->delete();

        return redirect()->route('admin.collections.index')->with('success', 'Collection deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:collections,slug' . ($ignoreId ? ",{$ignoreId}" : '')],
            'description' => ['nullable', 'string'],
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);
    }
}
