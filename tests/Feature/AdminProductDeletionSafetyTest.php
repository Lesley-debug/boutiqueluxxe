<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class AdminProductDeletionSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_deletion_archives_and_preserves_order_history_and_media(): void
    {
        Storage::fake('public');
        $product = $this->createProduct();
        $variant = $this->createVariant($product);
        $image = ProductImage::create([
            'product_id' => $product->id,
            'path' => 'products/archive-test.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);
        Storage::disk('public')->put($image->path, 'image-data');

        $customer = User::factory()->create();
        $cart = Cart::create(['user_id' => $customer->id]);
        $cartItem = CartItem::create([
            'cart_id' => $cart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ]);
        $wishlist = WishlistItem::create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);
        $order = $this->createOrder($customer);
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_variant_id' => $variant->id,
            'product_name' => $product->name,
            'variant_label' => null,
            'sku' => $variant->sku,
            'unit_price' => 10000,
            'quantity' => 1,
            'line_total' => 10000,
        ]);

        $this->actingAs($this->admin())
            ->delete("/admin/products/{$product->id}")
            ->assertRedirect('/admin/products');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => 'archived',
            'featured' => false,
            'new_arrival' => false,
        ]);
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id]);
        $this->assertDatabaseHas('product_images', ['id' => $image->id]);
        $this->assertDatabaseHas('order_items', [
            'id' => $orderItem->id,
            'product_variant_id' => $variant->id,
        ]);
        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
        $this->assertDatabaseMissing('wishlist_items', ['id' => $wishlist->id]);
        Storage::disk('public')->assertExists($image->path);
    }

    public function test_failed_image_database_deletion_does_not_remove_the_file(): void
    {
        Storage::fake('public');
        $product = $this->createProduct();
        $image = ProductImage::create([
            'product_id' => $product->id,
            'path' => 'products/rollback-test.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);
        Storage::disk('public')->put($image->path, 'image-data');

        ProductImage::deleting(function (ProductImage $deleting) use ($image) {
            if ($deleting->is($image)) {
                throw new RuntimeException('Simulated database failure.');
            }
        });

        $this->withoutExceptionHandling();

        try {
            $this->actingAs($this->admin())
                ->delete("/admin/products/{$product->id}/images/{$image->id}");
            $this->fail('The simulated deletion failure was not thrown.');
        } catch (RuntimeException $exception) {
            $this->assertSame('Simulated database failure.', $exception->getMessage());
        }

        $this->assertDatabaseHas('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertExists($image->path);
    }

    public function test_successful_image_deletion_removes_file_and_promotes_next_image(): void
    {
        Storage::fake('public');
        $product = $this->createProduct();
        $primary = ProductImage::create([
            'product_id' => $product->id,
            'path' => 'products/primary.jpg',
            'sort_order' => 0,
            'is_primary' => true,
        ]);
        $next = ProductImage::create([
            'product_id' => $product->id,
            'path' => 'products/next.jpg',
            'sort_order' => 1,
            'is_primary' => false,
        ]);
        Storage::disk('public')->put($primary->path, 'primary-data');
        Storage::disk('public')->put($next->path, 'next-data');

        $this->actingAs($this->admin())
            ->delete("/admin/products/{$product->id}/images/{$primary->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('product_images', ['id' => $primary->id]);
        $this->assertTrue($next->fresh()->is_primary);
        Storage::disk('public')->assertMissing($primary->path);
        Storage::disk('public')->assertExists($next->path);
    }

    private function admin(): User
    {
        return User::factory()->create([
            'is_admin' => true,
            'role' => 'super_admin',
        ]);
    }

    private function createProduct(): Product
    {
        $category = Category::create([
            'name' => 'Deletion Test',
            'slug' => 'deletion-test-'.fake()->unique()->numerify('###'),
            'status' => 'active',
            'sort_order' => 0,
        ]);

        return Product::create([
            'category_id' => $category->id,
            'name' => 'Deletion Test Product',
            'slug' => 'deletion-test-product-'.fake()->unique()->numerify('###'),
            'base_price' => 10000,
            'status' => 'active',
            'featured' => true,
            'new_arrival' => true,
        ]);
    }

    private function createVariant(Product $product): ProductVariant
    {
        return ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'DELETE-'.fake()->unique()->numerify('######'),
            'stock_quantity' => 10,
        ]);
    }

    private function createOrder(User $customer): Order
    {
        return Order::create([
            'user_id' => $customer->id,
            'status' => 'pending',
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '600000000',
            'shipping_address' => 'Test address',
            'city' => 'Douala',
            'subtotal' => 10000,
            'shipping_cost' => 0,
            'total' => 10000,
        ]);
    }
}
