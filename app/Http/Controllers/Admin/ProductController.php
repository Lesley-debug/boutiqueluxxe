<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\LegacyCatalogHandoff;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request) { return LegacyCatalogHandoff::products($request); }
    public function create(Request $request) { return LegacyCatalogHandoff::products($request, 'create'); }
    public function store(Request $request) { return $this->create($request); }
    public function show(Request $request, Product $product) { return $this->edit($request, $product); }
    public function edit(Request $request, Product $product) { return LegacyCatalogHandoff::products($request, 'edit', $product); }
    public function update(Request $request, Product $product) { return $this->edit($request, $product); }
    public function destroy(Request $request, Product $product) { return $this->edit($request, $product); }
}
