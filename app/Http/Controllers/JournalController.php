<?php

namespace App\Http\Controllers;

use App\Models\JournalPost;
use Illuminate\Support\Str;
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

        return Inertia::render('Store/JournalPost', [
            'post' => $post,
            'seo' => [
                'title' => $post->title,
                'description' => Str::limit(
                    trim(strip_tags($post->excerpt ?: $post->content)),
                    160,
                    '',
                ),
                'canonical' => route('journal.show', $post->slug),
                'image' => $post->cover_image_url,
                'type' => 'article',
                'robots' => 'index,follow',
            ],
        ]);
    }
}
