<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HeroSlideController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/HeroSlides/Index', [
            'slides' => HeroSlide::orderBy('sort_order')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/HeroSlides/Form');
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('hero', 'public');
        }

        HeroSlide::create($data);

        return redirect()->route('admin.hero-slides.index')->with('success', 'Slide created.');
    }

    public function edit(HeroSlide $heroSlide)
    {
        return Inertia::render('Admin/HeroSlides/Form', ['slide' => $heroSlide]);
    }

    public function update(Request $request, HeroSlide $heroSlide)
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            if ($heroSlide->image) {
                Storage::disk('public')->delete($heroSlide->image);
            }
            $data['image'] = $request->file('image')->store('hero', 'public');
        }

        $heroSlide->update($data);

        return redirect()->route('admin.hero-slides.index')->with('success', 'Slide updated.');
    }

    public function destroy(HeroSlide $heroSlide)
    {
        if ($heroSlide->image) {
            Storage::disk('public')->delete($heroSlide->image);
        }
        $heroSlide->delete();

        return redirect()->route('admin.hero-slides.index')->with('success', 'Slide deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'primary_cta_text' => ['nullable', 'string', 'max:50'],
            'primary_cta_url' => ['nullable', 'string', 'max:255'],
            'secondary_cta_text' => ['nullable', 'string', 'max:50'],
            'secondary_cta_url' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
            'active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);
    }
}
