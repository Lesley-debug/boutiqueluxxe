<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicCatalogVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_collection_page_excludes_inactive_products(): void
    {
        $category = $this->createCategory('active-category');
        $activeProduct = $this->createProduct($category, 'visible-product', 'active');
        $inactiveProduct = $this->createProduct($category, 'hidden-product', 'inactive');
        $collection = Collection::create([
            'name' => 'Visible Collection',
            'slug' => 'visible-collection',
            'active' => true,
        ]);
        $collection->products()->attach([$activeProduct->id, $inactiveProduct->id]);

        $response = $this->get('/collections/visible-collection');

        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Store/CollectionDetail')
                ->has('collection.products', 1)
                ->where('collection.products.0.slug', 'visible-product'),
        );
    }

    public function test_inactive_collection_is_not_publicly_accessible(): void
    {
        Collection::create([
            'name' => 'Hidden Collection',
            'slug' => 'hidden-collection',
            'active' => false,
        ]);

        $this->get('/collections/hidden-collection')->assertNotFound();
    }

    public function test_sitemap_contains_only_active_collections(): void
    {
        Collection::create([
            'name' => 'Published Collection',
            'slug' => 'published-collection',
            'active' => true,
        ]);
        Collection::create([
            'name' => 'Draft Collection',
            'slug' => 'draft-collection',
            'active' => false,
        ]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertSee('/collections/published-collection', false);
        $response->assertDontSee('/collections/draft-collection', false);
    }

    public function test_shop_excludes_inactive_child_categories_and_their_products(): void
    {
        $parent = $this->createCategory('parent-category');
        $activeChild = $this->createCategory('active-child', 'active', $parent->id);
        $inactiveChild = $this->createCategory('inactive-child', 'inactive', $parent->id);
        $visibleProduct = $this->createProduct($activeChild, 'visible-child-product', 'active');
        $hiddenProduct = $this->createProduct($inactiveChild, 'hidden-child-product', 'active');

        $response = $this->get('/shop?category=parent-category');

        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Store/Shop')
                ->has('products.data', 1)
                ->where('products.data.0.id', $visibleProduct->id)
                ->has('categories.0.children', 1)
                ->where('categories.0.children.0.slug', 'active-child'),
        );
    }

    private function createCategory(string $slug, string $status = 'active', ?int $parentId = null): Category
    {
        return Category::create([
            'parent_id' => $parentId,
            'name' => str($slug)->replace('-', ' ')->title()->toString(),
            'slug' => $slug,
            'status' => $status,
            'sort_order' => 0,
        ]);
    }

    private function createProduct(Category $category, string $slug, string $status): Product
    {
        return Product::create([
            'category_id' => $category->id,
            'name' => str($slug)->replace('-', ' ')->title()->toString(),
            'slug' => $slug,
            'base_price' => 10000,
            'status' => $status,
        ]);
    }
}
