<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\LegacyCatalogHandoff;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function store(Request $request, Product $product)
    {
        return LegacyCatalogHandoff::products($request, 'edit', $product);
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        LegacyCatalogHandoff::authorize($request);
        abort_unless((int) $variant->product_id === (int) $product->id, 404);
        return LegacyCatalogHandoff::products($request, 'edit', $product);
    }

    public function destroy(Request $request, Product $product, ProductVariant $variant)
    {
        return $this->update($request, $product, $variant);
    }
}
