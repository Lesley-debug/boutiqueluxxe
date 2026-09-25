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

        $postUrl = route('journal.show', $post->slug);
        $description = Str::limit(trim(strip_tags($post->excerpt ?: $post->content)), 160, '');
        $articleSchema = array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            '@id' => $postUrl.'#article',
            'headline' => $post->title,
            'description' => $description,
            'url' => $postUrl,
            'image' => $post->cover_image_url,
            'datePublished' => $post->published_at?->toIso8601String(),
            'dateModified' => $post->updated_at?->toIso8601String(),
            'author' => ['@id' => url('/').'#organization'],
            'publisher' => ['@id' => url('/').'#organization'],
            'mainEntityOfPage' => $postUrl,
        ], fn ($value) => $value !== null);
        $breadcrumbSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => url('/')],
                ['@type' => 'ListItem', 'position' => 2, 'name' => 'Journal', 'item' => route('journal.index')],
                ['@type' => 'ListItem', 'position' => 3, 'name' => $post->title, 'item' => $postUrl],
            ],
        ];

        return Inertia::render('Store/JournalPost', [
            'post' => $post,
            'seo' => [
                'title' => $post->title,
                'description' => $description,
                'canonical' => $postUrl,
                'image' => $post->cover_image_url,
                'type' => 'article',
                'robots' => 'index,follow',
                'schema' => [$articleSchema, $breadcrumbSchema],
            ],
        ]);
    }
}
