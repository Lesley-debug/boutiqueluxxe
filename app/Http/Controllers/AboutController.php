<?php

namespace App\Http\Controllers;

use App\Models\AboutPage;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function index()
    {
        return Inertia::render('Store/About', [
            'aboutPage' => AboutPage::current(),
        ]);
    }
}
