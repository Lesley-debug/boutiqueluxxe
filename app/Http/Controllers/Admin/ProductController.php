<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Style;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Products/Index', [
            'products' => Product::with('category')->latest()->paginate(15),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Form', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'styles' => Style::orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'style_id' => ['nullable', 'exists:styles,id'],
            'brand' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:base_price'],
            'status' => ['required', 'in:draft,active,archived'],
            'featured' => ['boolean'],
            'new_arrival' => ['boolean'],
        ]);

        Product::create($data);

        return redirect()->route('admin.products.index')->with('success', 'Product created.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => $product->load(['variants', 'images' => fn($q) => $q->orderBy('sort_order')]),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'styles' => Style::orderBy('name')->get(['id', 'name', 'slug']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'style_id' => ['nullable', 'exists:styles,id'],
            'brand' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug,' . $product->id],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:base_price'],
            'status' => ['required', 'in:draft,active,archived'],
            'featured' => ['boolean'],
            'new_arrival' => ['boolean'],
        ]);

        $product->update($data);

        return redirect()->route('admin.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }
}
