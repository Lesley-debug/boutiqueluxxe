<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Discount;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestCartMergeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cart_is_merged_into_the_authenticated_cart(): void
    {
        $user = User::factory()->create();
        $variant = $this->createVariant(stock: 10);
        $discount = Discount::create([
            'code' => 'MERGE10',
            'type' => 'percentage',
            'value' => 10,
            'active' => true,
            'uses_count' => 0,
        ]);

        $userCart = Cart::create(['user_id' => $user->id]);
        $guestCart = Cart::create([
            'user_id' => null,
            'session_id' => 'guest-session-id',
            'discount_id' => $discount->id,
        ]);

        CartItem::create([
            'cart_id' => $userCart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 4,
        ]);
        CartItem::create([
            'cart_id' => $guestCart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3,
        ]);

        app(CartService::class)->mergeGuestCartIntoUser('guest-session-id', $user->id);

        $this->assertDatabaseMissing('carts', ['id' => $guestCart->id]);
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $userCart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 7,
        ]);
        $this->assertSame($discount->id, $userCart->fresh()->discount_id);
    }

    public function test_merge_caps_quantity_at_stock_and_cart_limit(): void
    {
        $user = User::factory()->create();
        $variant = $this->createVariant(stock: 8);
        $userCart = Cart::create(['user_id' => $user->id]);
        $guestCart = Cart::create(['session_id' => 'stock-limited-session']);

        CartItem::create([
            'cart_id' => $userCart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 6,
        ]);
        CartItem::create([
            'cart_id' => $guestCart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 6,
        ]);

        app(CartService::class)->mergeGuestCartIntoUser('stock-limited-session', $user->id);

        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $userCart->id,
            'product_variant_id' => $variant->id,
            'quantity' => 8,
        ]);
    }

    public function test_database_rejects_two_carts_for_the_same_user(): void
    {
        $user = User::factory()->create();
        Cart::create(['user_id' => $user->id]);

        $this->expectException(QueryException::class);
        Cart::create(['user_id' => $user->id]);
    }

    private function createVariant(int $stock): ProductVariant
    {
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category-'.fake()->unique()->numerify('###'),
            'status' => 'active',
            'sort_order' => 0,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product-'.fake()->unique()->numerify('###'),
            'base_price' => 10000,
            'status' => 'active',
        ]);

        return ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-'.fake()->unique()->numerify('######'),
            'stock_quantity' => $stock,
        ]);
    }
}
