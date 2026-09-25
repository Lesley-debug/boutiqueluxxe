<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoAndPrivacyReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_page_renders_server_side_metadata(): void
    {
        $response = $this->get('/contact');

        $response->assertOk();
        $response->assertSee('<meta name="description" content="Contact Boutique Luxxe', false);
        $response->assertSee('<link rel="canonical" href="'.url('/contact').'">', false);
        $response->assertSee('<meta property="og:title"', false);
        $response->assertSee('application/ld+json', false);
    }

    public function test_product_page_renders_dynamic_metadata(): void
    {
        $category = Category::create([
            'name' => 'SEO Test',
            'slug' => 'seo-test',
            'status' => 'active',
            'sort_order' => 0,
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Metadata Handbag',
            'slug' => 'metadata-handbag',
            'description' => 'A distinctive handbag used to verify server-rendered product metadata.',
            'base_price' => 10000,
            'status' => 'active',
        ]);

        $response = $this->get("/products/{$product->slug}");

        $response->assertOk();
        $response->assertSee('Metadata Handbag — Boutique Luxxe', false);
        $response->assertSee('A distinctive handbag used to verify server-rendered product metadata.', false);
        $response->assertSee(route('products.show', $product->slug), false);
    }

    public function test_private_and_transactional_pages_send_noindex_header(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        $this->get('/shop')
            ->assertOk()
            ->assertHeaderMissing('X-Robots-Tag');
    }

    public function test_robots_file_blocks_private_routes(): void
    {
        $robots = file_get_contents(public_path('robots.txt'));

        $this->assertStringContainsString('Disallow: /admin', $robots);
        $this->assertStringContainsString('Disallow: /account', $robots);
        $this->assertStringContainsString('Disallow: /checkout', $robots);
        $this->assertStringContainsString('Sitemap: https://boutiqueluxxe.com/sitemap.xml', $robots);
    }

    public function test_cookie_policy_is_public_and_included_in_sitemap(): void
    {
        $this->get('/cookie-policy')
            ->assertOk()
            ->assertInertia(
                fn (\Inertia\Testing\AssertableInertia $page) => $page
                    ->component('Store/CookiePolicy'),
            );

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertSee(route('cookies'), false);
    }
}
