<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials' => Testimonial::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Testimonial::create($this->validated($request));

        return back()->with('success', 'Testimonial added.');
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $testimonial->update($this->validated($request));

        return back()->with('success', 'Testimonial updated.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        return back()->with('success', 'Testimonial removed.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'quote' => ['required', 'string', 'max:1000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'active' => ['boolean'],
            'sort_order' => ['nullable', 'integer'],
        ]);
    }
}
