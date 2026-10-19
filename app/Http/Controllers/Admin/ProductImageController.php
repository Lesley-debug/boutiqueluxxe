<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Support\LegacyCatalogHandoff;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductImageController extends Controller
{
    public function store(Request $request, Product $product)
    {
        // Uploaded files/payloads are deliberately ignored, never stored.
        return LegacyCatalogHandoff::products($request, 'edit', $product);
    }

    public function setPrimary(Request $request, Product $product, ProductImage $image)
    {
        LegacyCatalogHandoff::authorize($request);
        abort_unless((int) $image->product_id === (int) $product->id, 404);
        return LegacyCatalogHandoff::products($request, 'edit', $product);
    }

    public function reorder(Request $request, Product $product)
    {
        LegacyCatalogHandoff::authorize($request);
        // Retain the cross-product ownership regression check only. Valid input
        // still performs NO reorder; it opens the canonical editor instead.
        $request->validate([
            'order' => ['required', 'array', 'max:1000'],
            'order.*' => ['integer', 'distinct', Rule::exists('product_images', 'id')->where(fn ($query) => $query->where('product_id', $product->id))],
        ]);
        return LegacyCatalogHandoff::products($request, 'edit', $product);
    }

    public function destroy(Request $request, Product $product, ProductImage $image)
    {
        return $this->setPrimary($request, $product, $image);
    }
}
