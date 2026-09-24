<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Store/Testimonials', [
            'testimonials' => Testimonial::active()
                ->orderBy('sort_order')
                ->latest('id')
                ->get(['id', 'customer_name', 'quote', 'rating']),
        ]);
    }
}
