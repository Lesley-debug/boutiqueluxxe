<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\JournalPost;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedSeoVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_outputs_factual_product_offer_and_breadcrumb_schema(): void
    {
        $category = Category::create(['name' => 'Handbags', 'slug' => 'handbags', 'status' => 'active', 'sort_order' => 0]);
        $product = Product::create([
            'category_id' => $category->id,
            'brand' => 'Example Brand',
            'name' => 'Structured Handbag',
            'slug' => 'structured-handbag',
            'description' => 'A product used to verify factual structured data.',
            'base_price' => 1250,
            'status' => 'active',
        ]);
        ProductVariant::create(['product_id' => $product->id, 'sku' => 'STRUCT-001', 'stock_quantity' => 2]);
        ProductImage::create(['product_id' => $product->id, 'path' => 'products/structured.jpg', 'alt_text' => 'Structured handbag front view', 'sort_order' => 0, 'is_primary' => true]);

        $response = $this->get('/products/structured-handbag');

        $response->assertOk();
        $response->assertSee('"@type":"Product"', false);
        $response->assertSee('"@type":"Offer"', false);
        $response->assertSee('"priceCurrency":"USD"', false);
        $response->assertSee('"price":"1250.00"', false);
        $response->assertSee('https://schema.org/InStock', false);
        $response->assertSee('"@type":"BreadcrumbList"', false);
        $response->assertDontSee('AggregateRating', false);
        $response->assertDontSee('Review', false);
    }

    public function test_journal_post_outputs_article_schema(): void
    {
        $post = JournalPost::create([
            'title' => 'Luxury Care Guide',
            'slug' => 'luxury-care-guide',
            'excerpt' => 'A practical guide to caring for selected pieces.',
            'content' => '<p>Guide content.</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $this->get("/journal/{$post->slug}")
            ->assertOk()
            ->assertSee('"@type":"Article"', false)
            ->assertSee('"headline":"Luxury Care Guide"', false)
            ->assertSee('"datePublished":', false)
            ->assertSee('"@type":"BreadcrumbList"', false);
    }

    public function test_category_only_shop_url_is_an_indexable_landing_page(): void
    {
        Category::create(['name' => 'Handbags', 'slug' => 'handbags', 'status' => 'active', 'sort_order' => 0]);

        $this->get('/shop?category=handbags')
            ->assertOk()
            ->assertHeaderMissing('X-Robots-Tag')
            ->assertSee('Handbags Luxury Pieces', false)
            ->assertSee('content="index,follow"', false)
            ->assertSee(url('/shop').'?category=handbags', false);
    }

    public function test_search_and_utility_filters_are_noindex_follow(): void
    {
        $this->get('/shop?search=bag&sort=price_asc')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, follow')
            ->assertSee('content="noindex,follow"', false)
            ->assertSee('<link rel="canonical" href="'.route('shop').'">', false);
    }

    public function test_image_sitemap_and_social_preview_are_ready(): void
    {
        $category = Category::create(['name' => 'Watches', 'slug' => 'watches', 'status' => 'active', 'sort_order' => 0]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'Image Watch', 'slug' => 'image-watch', 'base_price' => 400, 'status' => 'active']);
        ProductImage::create(['product_id' => $product->id, 'path' => 'products/watch.jpg', 'alt_text' => 'Image Watch', 'sort_order' => 0, 'is_primary' => true]);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertSee('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"', false)
            ->assertSee('<image:image>', false)
            ->assertSee('<image:title>Image Watch</image:title>', false);

        $imagePath = public_path('images/boutique-luxxe-social.png');
        $this->assertFileExists($imagePath);
        [$width, $height] = getimagesize($imagePath);
        $this->assertSame(1200, $width);
        $this->assertSame(630, $height);
        $this->assertSame('/images/boutique-luxxe-social.png', config('seo.default_image'));
    }
}
