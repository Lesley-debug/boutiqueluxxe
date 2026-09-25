<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\JournalPost;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = collect([
            ['loc' => url('/'), 'lastmod' => now()->toDateString()],
            ['loc' => route('shop'), 'lastmod' => now()->toDateString()],
            ['loc' => route('collections.index'), 'lastmod' => now()->toDateString()],
            ['loc' => route('journal.index'), 'lastmod' => now()->toDateString()],
            ['loc' => route('about'), 'lastmod' => now()->toDateString()],
            ['loc' => route('privacy'), 'lastmod' => now()->toDateString()],
            ['loc' => route('terms'), 'lastmod' => now()->toDateString()],
        ]);

        Product::active()->select(['slug', 'updated_at'])->chunk(250, function ($products) use ($urls) {
            foreach ($products as $product) $urls->push(['loc' => route('products.show', $product->slug), 'lastmod' => $product->updated_at->toDateString()]);
        });
        Collection::active()->select(['slug', 'updated_at'])->chunk(250, function ($collections) use ($urls) {
            foreach ($collections as $collection) $urls->push(['loc' => route('collections.show', $collection->slug), 'lastmod' => $collection->updated_at->toDateString()]);
        });
        JournalPost::published()->select(['slug', 'updated_at'])->chunk(250, function ($posts) use ($urls) {
            foreach ($posts as $post) $urls->push(['loc' => route('journal.show', $post->slug), 'lastmod' => $post->updated_at->toDateString()]);
        });

        $xml = view('sitemap', ['urls' => $urls])->render();
        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
