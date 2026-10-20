<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\JournalPost;
use App\Models\Product;
use App\Models\ProductVariant;
use DOMDocument;
use DOMXPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoStructuredDataOwnershipTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function product(?string $brand = 'Example Brand', string $name = 'Ownership Handbag'): Product
    {
        $category = Category::create([
            'name' => 'Handbags', 'slug' => 'ownership-handbags',
            'status' => 'active', 'sort_order' => 0,
        ]);
        $product = Product::create([
            'category_id' => $category->id, 'name' => $name,
            'slug' => 'ownership-handbag', 'description' => 'A factual metadata fixture.',
            'brand' => $brand, 'base_price' => 1250, 'status' => 'active',
        ]);
        ProductVariant::create([
            'product_id' => $product->id, 'sku' => 'OWNERSHIP-001', 'stock_quantity' => 2,
        ]);

        return $product;
    }

    private function schemas(string $html): array
    {
        $document = new DOMDocument();
        $this->assertTrue($document->loadHTML($html, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING));
        $nodes = (new DOMXPath($document))->query('//head/script[@type="application/ld+json"]');
        $this->assertNotFalse($nodes);
        $schemas = [];
        foreach ($nodes as $node) {
            $schemas[] = [
                'data' => json_decode($node->textContent, true, 512, JSON_THROW_ON_ERROR),
                'owner' => $node->getAttribute('data-inertia'),
            ];
        }

        return $schemas;
    }

    private function only(array $schemas, string $type): array
    {
        $matches = array_values(array_filter($schemas, fn (array $item): bool => $item['data']['@type'] === $type));
        $this->assertCount(1, $matches, 'Expected exactly one initial '.$type.' node.');

        return $matches[0];
    }

    public function test_initial_product_schema_has_matching_client_ownership_and_factual_values(): void
    {
        $product = $this->product();
        $schemas = $this->schemas($this->get('/products/'.$product->slug)->assertOk()->getContent());
        $this->assertCount(4, $schemas);
        $node = $this->only($schemas, 'Product');
        $this->assertSame('structured-data-0', $node['owner']);
        $this->assertSame(route('products.show', $product->slug).'#product', $node['data']['@id']);
        $this->assertSame(['@type' => 'Brand', 'name' => 'Example Brand'], $node['data']['brand']);
        $this->assertSame('1250.00', $node['data']['offers']['price']);
        $this->assertSame('USD', $node['data']['offers']['priceCurrency']);
        $this->assertSame('https://schema.org/InStock', $node['data']['offers']['availability']);
        $this->assertArrayNotHasKey('aggregateRating', $node['data']);
        $this->assertArrayNotHasKey('review', $node['data']);
        $this->assertSame('structured-data-1', $this->only($schemas, 'BreadcrumbList')['owner']);
        $this->assertSame('', $this->only($schemas, 'Organization')['owner']);
        $this->assertSame('', $this->only($schemas, 'WebSite')['owner']);
    }

    public function test_unbranded_product_does_not_gain_invented_brand_reviews_or_policies(): void
    {
        $product = $this->product(null);
        $schemas = $this->schemas($this->get('/products/'.$product->slug)->assertOk()->getContent());
        $node = $this->only($schemas, 'Product');
        $this->assertSame('structured-data-0', $node['owner']);
        $this->assertArrayNotHasKey('brand', $node['data']);
        $this->assertArrayNotHasKey('aggregateRating', $node['data']);
        $this->assertArrayNotHasKey('hasMerchantReturnPolicy', $node['data']['offers']);
        $this->assertArrayNotHasKey('shippingDetails', $node['data']['offers']);
    }

    public function test_article_and_breadcrumb_fallbacks_have_matching_client_ownership(): void
    {
        $post = JournalPost::create([
            'title' => 'Ownership Care Guide', 'slug' => 'ownership-care-guide',
            'excerpt' => 'A factual guide.', 'content' => '<p>Care guide content.</p>',
            'status' => 'published', 'published_at' => now()->subDay(),
        ]);
        $schemas = $this->schemas($this->get('/journal/'.$post->slug)->assertOk()->getContent());
        $this->assertCount(4, $schemas);
        $this->assertSame('structured-data-0', $this->only($schemas, 'Article')['owner']);
        $this->assertSame('structured-data-1', $this->only($schemas, 'BreadcrumbList')['owner']);
        $this->assertSame('', $this->only($schemas, 'Organization')['owner']);
        $this->assertSame('', $this->only($schemas, 'WebSite')['owner']);
    }

    public function test_json_ld_keeps_script_breakout_characters_escaped(): void
    {
        $name = 'Bag </script><script>window.__schemaXss=1</script>';
        $product = $this->product('Example Brand', $name);
        $html = $this->get('/products/'.$product->slug)->assertOk()->getContent();
        $schemas = $this->schemas($html);
        $this->assertCount(4, $schemas);
        $this->assertSame($name, $this->only($schemas, 'Product')['data']['name']);
        $this->assertStringNotContainsString('<script>window.__schemaXss=1</script>', $html);
    }
}
