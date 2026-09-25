<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminNestedProductResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_variant_cannot_be_updated_through_another_product(): void
    {
        [$firstProduct, $secondProduct] = $this->createProducts();
        $variant = $this->createVariant($secondProduct, 'SECOND-SKU');

        $this->actingAs($this->admin())
            ->put("/admin/products/{$firstProduct->id}/variants/{$variant->id}", [
                'sku' => 'CHANGED-SKU',
                'stock_quantity' => 5,
            ])
            ->assertNotFound();

        $this->assertDatabaseHas('product_variants', [
            'id' => $variant->id,
            'product_id' => $secondProduct->id,
            'sku' => $variant->sku,
        ]);
    }

    public function test_variant_cannot_be_deleted_through_another_product(): void
    {
        [$firstProduct, $secondProduct] = $this->createProducts();
        $variant = $this->createVariant($secondProduct, 'DELETE-SKU');

        $this->actingAs($this->admin())
            ->delete("/admin/products/{$firstProduct->id}/variants/{$variant->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('product_variants', ['id' => $variant->id]);
    }

    public function test_image_cannot_be_promoted_or_deleted_through_another_product(): void
    {
        Storage::fake('public');
        [$firstProduct, $secondProduct] = $this->createProducts();
        $firstImage = $this->createImage($firstProduct, 'products/first.jpg', true);
        $secondImage = $this->createImage($secondProduct, 'products/second.jpg', false);
        Storage::disk('public')->put($secondImage->path, 'image-data');
        $admin = $this->admin();

        $this->actingAs($admin)
            ->patch("/admin/products/{$firstProduct->id}/images/{$secondImage->id}/primary")
            ->assertNotFound();

        $this->assertTrue($firstImage->fresh()->is_primary);
        $this->assertFalse($secondImage->fresh()->is_primary);

        $this->actingAs($admin)
            ->delete("/admin/products/{$firstProduct->id}/images/{$secondImage->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('product_images', ['id' => $secondImage->id]);
        Storage::disk('public')->assertExists($secondImage->path);
    }

    public function test_image_reorder_rejects_ids_from_another_product(): void
    {
        [$firstProduct, $secondProduct] = $this->createProducts();
        $firstImage = $this->createImage($firstProduct, 'products/first.jpg', true);
        $secondImage = $this->createImage($secondProduct, 'products/second.jpg', true);

        $this->actingAs($this->admin())
            ->from("/admin/products/{$firstProduct->id}/edit")
            ->post("/admin/products/{$firstProduct->id}/images/reorder", [
                'order' => [$firstImage->id, $secondImage->id],
            ])
            ->assertSessionHasErrors('order.1');

        $this->assertSame(0, $secondImage->fresh()->sort_order);
    }

    private function admin(): User
    {
        return User::factory()->create([
            'is_admin' => true,
            'role' => 'super_admin',
        ]);
    }

    private function createProducts(): array
    {
        $category = Category::create([
            'name' => 'Security Test',
            'slug' => 'security-test-'.fake()->unique()->numerify('###'),
            'status' => 'active',
            'sort_order' => 0,
        ]);

        return [
            $this->createProduct($category, 'first-product'),
            $this->createProduct($category, 'second-product'),
        ];
    }

    private function createProduct(Category $category, string $slug): Product
    {
        return Product::create([
            'category_id' => $category->id,
            'name' => str($slug)->replace('-', ' ')->title()->toString(),
            'slug' => $slug.'-'.fake()->unique()->numerify('###'),
            'base_price' => 10000,
            'status' => 'active',
        ]);
    }

    private function createVariant(Product $product, string $sku): ProductVariant
    {
        return ProductVariant::create([
            'product_id' => $product->id,
            'sku' => $sku.'-'.fake()->unique()->numerify('###'),
            'stock_quantity' => 10,
        ]);
    }

    private function createImage(Product $product, string $path, bool $primary): ProductImage
    {
        return ProductImage::create([
            'product_id' => $product->id,
            'path' => $path,
            'sort_order' => 0,
            'is_primary' => $primary,
        ]);
    }
}
