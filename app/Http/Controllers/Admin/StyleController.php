<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Style;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StyleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Style/Index', [
            'styles' => Style::withCount('products')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:styles,slug'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('styles', 'public');
        }

        Style::create($data);

        return back()->with('success', 'Style added.');
    }

    public function update(Request $request, Style $style)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:styles,slug,' . $style->id],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        if ($request->hasFile('image')) {
            if ($style->image) {
                Storage::disk('public')->delete($style->image);
            }
            $data['image'] = $request->file('image')->store('styles', 'public');
        }

        $style->update($data);

        return back()->with('success', 'Style updated.');
    }

    public function destroy(Style $style)
    {
        $style->delete(); // products.style_id nulls out automatically (nullOnDelete)

        return back()->with('success', 'Style removed.');
    }
}
