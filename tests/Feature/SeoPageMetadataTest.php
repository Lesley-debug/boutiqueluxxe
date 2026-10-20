<?php

namespace Tests\Feature;

use DOMDocument;
use DOMXPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SeoPageMetadataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public static function pageCases(): array
    {
        return [
            'shop stays correct' => ['/shop', 'Shop Luxury Pieces', 'Browse curated luxury bags, watches, accessories, and new arrivals from Boutique Luxxe.'],
            'dotted category route' => ['/categories', 'Shop by Category', 'Explore Boutique Luxxe products by category and discover your next distinctive piece.'],
            'dotted collection route' => ['/collections', 'Curated Collections', 'Explore carefully curated Boutique Luxxe collections and distinctive luxury pieces.'],
            'dotted journal route' => ['/journal', 'Journal', 'Read Boutique Luxxe style guides, care advice, and stories about distinctive luxury pieces.'],
            'about stays correct' => ['/about', 'About Us', 'Learn about Boutique Luxxe, our considered selection, personal service, and international client support.'],
            'faq stays correct' => ['/faqs', 'Frequently Asked Questions', 'Answers about Boutique Luxxe reservations, payment discussions, delivery, authenticity, and support.'],
        ];
    }

    #[DataProvider('pageCases')]
    public function test_page_specific_metadata_is_shared_and_present_in_initial_html(string $path, string $title, string $description): void
    {
        $response = $this->get($path);
        $response->assertOk();
        $page = $response->viewData('page');
        $this->assertSame($title, $page['props']['seo']['title']);
        $this->assertSame($description, $page['props']['seo']['description']);
        $this->assertSame(url($path), $page['props']['seo']['canonical']);
        $this->assertSame('index,follow', $page['props']['seo']['robots']);

        $head = $this->metadataDocument($response->getContent());
        $this->assertSame($title.' — Boutique Luxxe', $head->evaluate('string((//head/title)[1])'));
        $this->assertSame($description, $head->evaluate('string((//head/meta[@name="description"])[1]/@content)'));
        $this->assertSame(url($path), $head->evaluate('string((//head/link[@rel="canonical"])[1]/@href)'));
    }

    public function test_missing_route_specific_metadata_keeps_the_default_fallback(): void
    {
        config(['seo.pages' => []]);
        $response = $this->get('/collections');
        $response->assertOk();
        $page = $response->viewData('page');
        $this->assertSame(config('seo.default.title'), $page['props']['seo']['title']);
        $this->assertSame(config('seo.default.description'), $page['props']['seo']['description']);
        $this->assertSame(url('/collections'), $page['props']['seo']['canonical']);
        $this->assertSame('index,follow', $page['props']['seo']['robots']);
    }

    public function test_private_login_page_remains_noindex_and_keeps_its_canonical(): void
    {
        $response = $this->get('/login');
        $response->assertOk();
        $page = $response->viewData('page');
        $this->assertSame('noindex,nofollow,noarchive', $page['props']['seo']['robots']);
        $this->assertSame(url('/login'), $page['props']['seo']['canonical']);
        $head = $this->metadataDocument($response->getContent());
        $this->assertSame('noindex,nofollow,noarchive', $head->evaluate('string((//head/meta[@name="robots"])[1]/@content)'));
    }

    private function metadataDocument(string $html): DOMXPath
    {
        $previous = libxml_use_internal_errors(true);
        try {
            $document = new DOMDocument();
            $this->assertTrue($document->loadHTML($html, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING));
            return new DOMXPath($document);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }
}
