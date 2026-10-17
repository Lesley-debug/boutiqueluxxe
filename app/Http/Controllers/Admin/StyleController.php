<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Style;
use App\Support\LegacyCatalogHandoff;
use Illuminate\Http\Request;

class StyleController extends Controller
{
    public function index(Request $request) { return LegacyCatalogHandoff::styles($request); }
    public function store(Request $request) { return LegacyCatalogHandoff::styles($request, 'create'); }
    public function update(Request $request, Style $style) { return LegacyCatalogHandoff::styles($request, 'edit', $style); }
    public function destroy(Request $request, Style $style) { return LegacyCatalogHandoff::styles($request, 'edit', $style); }
}
