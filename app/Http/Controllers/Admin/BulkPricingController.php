<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BulkPricingController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/BulkPricing/Edit', [
            'products' => Product::with('variants:id,product_id,sku,price_override')
                ->orderBy('name')
                ->get(['id', 'name', 'brand', 'base_price', 'sale_price']),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'products' => ['required', 'array'],
            'products.*.id' => ['required', 'exists:products,id'],
            'products.*.base_price' => ['required', 'numeric', 'min:0'],
            'products.*.sale_price' => ['nullable', 'numeric', 'min:0'],
            'variants' => ['array'],
            'variants.*.id' => ['required', 'exists:product_variants,id'],
            'variants.*.price_override' => ['nullable', 'numeric', 'min:0'],
        ]);

        foreach ($data['products'] as $row) {
            Product::whereKey($row['id'])->update([
                'base_price' => $row['base_price'],
                'sale_price' => $row['sale_price'] ?? null,
            ]);
        }

        foreach ($data['variants'] ?? [] as $row) {
            ProductVariant::whereKey($row['id'])->update([
                'price_override' => $row['price_override'] ?? null,
            ]);
        }

        return back()->with('success', 'Prices updated.');
    }
}