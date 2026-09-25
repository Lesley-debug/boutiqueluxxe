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
        $staticFiles = [
            resource_path('js/pages/Store/Home.tsx'),
            resource_path('js/pages/Store/Contact.tsx'),
            resource_path('js/pages/Store/Faqs.tsx'),
            resource_path('js/pages/Store/PrivacyPolicy.tsx'),
            resource_path('js/pages/Store/TermsOfService.tsx'),
            resource_path('js/pages/Store/CookiePolicy.tsx'),
        ];
        $timestamps = array_map(
            fn (string $path) => file_exists($path) ? filemtime($path) : 0,
            $staticFiles,
        );
        $staticLastModified = date('Y-m-d', max($timestamps) ?: time());

        $urls = collect([
            ['loc' => url('/'), 'lastmod' => $staticLastModified],
            ['loc' => route('shop'), 'lastmod' => $staticLastModified],
            ['loc' => route('collections.index'), 'lastmod' => $staticLastModified],
            ['loc' => route('journal.index'), 'lastmod' => $staticLastModified],
            ['loc' => route('about'), 'lastmod' => $staticLastModified],
            ['loc' => route('categories.browse'), 'lastmod' => $staticLastModified],
            ['loc' => route('contact'), 'lastmod' => $staticLastModified],
            ['loc' => route('faqs'), 'lastmod' => $staticLastModified],
            ['loc' => route('privacy'), 'lastmod' => $staticLastModified],
            ['loc' => route('terms'), 'lastmod' => $staticLastModified],
            ['loc' => route('cookies'), 'lastmod' => $staticLastModified],
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
