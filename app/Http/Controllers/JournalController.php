<?php

namespace App\Http\Controllers;

use App\Models\JournalPost;
use Inertia\Inertia;

class JournalController extends Controller
{
    public function index()
    {
        return Inertia::render('Store/Journal', [
            'posts' => JournalPost::published()->latest('published_at')->get(),
        ]);
    }

    public function show(string $slug)
    {
        $post = JournalPost::published()->where('slug', $slug)->firstOrFail();

        return Inertia::render('Store/JournalPost', ['post' => $post]);
    }
}
