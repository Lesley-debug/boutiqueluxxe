<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Style;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StyleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Styles/Index', [
            'styles' => Style::withCount('products')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:styles,slug'],
        ]);

        Style::create($data);

        return back()->with('success', 'Style added.');
    }

    public function destroy(Style $style)
    {
        $style->delete(); // products.style_id nulls out automatically (nullOnDelete)

        return back()->with('success', 'Style removed.');
    }
}
