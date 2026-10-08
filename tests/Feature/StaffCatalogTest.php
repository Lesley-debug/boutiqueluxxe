<?php

namespace Tests\Feature;

use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\ProductResource;
use App\Filament\Resources\Styles\StyleResource;
use App\Filament\Widgets\StaffQuickLinks;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Style;
use App\Models\User;
use App\Models\WishlistItem;
use App\Services\CatalogUpload;
use App\Services\StaffProductEditor;
use App\Services\StaffStyleEditor;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use RuntimeException;
use Tests\TestCase;

class StaffCatalogTest extends TestCase
{
    use RefreshDatabase;

    private User $manager;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth_features.email_verification_required' => true]);
        Storage::fake('public');
        $this->manager = User::factory()->create(['is_admin' => true, 'role' => 'manager']);
        $this->category = Category::create(['name' => 'Bags', 'slug' => 'bags', 'status' => 'active']);
        Filament::setCurrentPanel(Filament::getPanel('staff'));
    }

    private function photo(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4/fASAAVZAp+CZz2gAAAAAElFTkSuQmCC'));
    }

    private function data(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Everyday Tote', 'category_id' => $this->category->id,
            'style_id' => null, 'brand' => 'Boutique Luxxe', 'description' => 'A practical bag.',
            'base_price' => 100, 'sale_price' => null, 'status' => 'draft',
            'featured' => false, 'new_arrival' => false,
            'variant_rows' => [['color' => 'Black', 'size' => null, 'material' => 'Leather', 'initial_stock' => 8]],
            'new_photos' => [], 'image_rows' => [], 'cover_image_id' => null,
        ], $overrides);
    }

    private function product(array $overrides = []): Product
    {
        return app(StaffProductEditor::class)->save($this->manager, $this->data($overrides));
    }

    private function invalid(callable $action): ValidationException
    {
        try { $action(); } catch (ValidationException $exception) { return $exception; }
        $this->fail('Expected a validation failure.');
    }

    public function test_staff_catalog_resources_are_registered_and_manager_pages_render(): void
    {
        $this->assertContains(ProductResource::class, Filament::getPanel('staff')->getResources());
        $this->assertContains(StyleResource::class, Filament::getPanel('staff')->getResources());
        $product = $this->product();
        $style = app(StaffStyleEditor::class)->save($this->manager, ['name' => 'Tote Bags']);
        foreach (['/staff/products', '/staff/products/create', '/staff/products/'.$product->id.'/edit', '/staff/styles', '/staff/styles/create', '/staff/styles/'.$style->id.'/edit'] as $path) {
            $this->actingAs($this->manager)->get($path)->assertOk()->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }
        $links = collect(app(StaffQuickLinks::class)->links())->keyBy('label');
        $this->assertSame('/staff/products', $links['Products']['path']);
        $this->assertSame('/staff/styles', $links['Styles']['path']);
        $this->assertSame('/admin/orders', $links['Orders']['path']);
    }

    public function test_support_staff_cannot_view_catalog_or_call_editor_services(): void
    {
        $support = User::factory()->create(['is_admin' => true, 'role' => 'support_staff']);
        $this->actingAs($support)->get('/staff/products')->assertForbidden();
        $this->get('/staff/styles/create')->assertForbidden();
        $this->assertFalse(Gate::forUser($support)->allows('create', Product::class));
        $this->assertFalse(Gate::forUser($support)->allows('create', Style::class));
        $this->expectException(AuthorizationException::class);
        app(StaffProductEditor::class)->save($support, $this->data());
    }

    public function test_customer_and_demoted_staff_cannot_access_catalog(): void
    {
        $customer = User::factory()->create();
        $this->actingAs($customer)->get('/staff/products')->assertForbidden();
        $oldManager = clone $this->manager;
        $this->manager->update(['is_admin' => false]);
        $this->assertFalse(Gate::forUser($oldManager)->allows('create', Product::class));
        $this->expectException(AuthorizationException::class);
        app(StaffStyleEditor::class)->save($oldManager, ['name' => 'Tote Bags']);
    }

    public function test_creation_saves_photos_options_stock_and_unique_name_based_urls(): void
    {
        $style = Style::create(['name' => 'Tote', 'slug' => 'tote']);
        $first = $this->product(['status' => 'active', 'style_id' => $style->id, 'new_photos' => [$this->photo('bag.png')]]);
        $second = $this->product(['style_id' => $style->id]);
        $this->assertSame('everyday-tote', $first->slug);
        $this->assertSame('everyday-tote-2', $second->slug);
        $this->assertNotSame($style->slug, $first->slug);
        $this->assertSame(8, $first->variants->first()->stock_quantity);
        $this->assertStringStartsWith('BLX-', $first->variants->first()->sku);
        $this->assertSame(0, $first->reviews_count);
        $this->assertNull($first->rating);
        $this->assertTrue($first->images->first()->is_primary);
        Storage::disk('public')->assertExists($first->images->first()->path);
    }

    public function test_renaming_preserves_urls_sku_and_factual_rating_fields(): void
    {
        $product = $this->product();
        $product->update(['rating' => 4.5, 'reviews_count' => 2]);
        $data = app(StaffProductEditor::class)->formData($product->fresh());
        $data['name'] = 'Renamed Bag'; $data['slug'] = 'replace-url';
        $data['rating'] = 5; $data['reviews_count'] = 100;
        $data['variant_rows'][0]['sku'] = 'REPLACE-SKU';
        $saved = app(StaffProductEditor::class)->save($this->manager, $data, $product);
        $this->assertSame('everyday-tote', $saved->slug);
        $this->assertSame($product->variants->first()->sku, $saved->variants->first()->sku);
        $this->assertSame(2, $saved->reviews_count);
        $this->assertSame('4.50', $saved->rating);
    }

    public function test_draft_is_allowed_without_photos_but_publishing_requires_them(): void
    {
        $product = $this->product();
        $data = app(StaffProductEditor::class)->formData($product);
        $data['status'] = 'active';
        $exception = $this->invalid(fn () => app(StaffProductEditor::class)->save($this->manager, $data, $product));
        $this->assertArrayHasKey('new_photos', $exception->errors());
        $this->assertSame('draft', $product->fresh()->status);
    }

    public function test_publication_requires_positive_price_and_active_category(): void
    {
        $this->invalid(fn () => $this->product(['status' => 'active', 'base_price' => 0, 'new_photos' => [$this->photo('bag.png')]]));
        $this->category->update(['status' => 'inactive']);
        $this->invalid(fn () => $this->product(['status' => 'active', 'new_photos' => [$this->photo('bag.png')]]));
        $this->assertDatabaseCount('products', 0);
        $this->assertSame([], Storage::disk('public')->allFiles('products'));
    }

    public function test_invalid_sale_price_duplicate_sku_and_negative_initial_stock_are_rejected(): void
    {
        $this->invalid(fn () => $this->product(['sale_price' => 100]));
        $this->product(['variant_rows' => [['sku' => 'ONE-SKU', 'initial_stock' => 3]]]);
        $this->invalid(fn () => $this->product(['variant_rows' => [['sku' => 'ONE-SKU', 'initial_stock' => 3]]]));
        $this->invalid(fn () => $this->product(['variant_rows' => [['initial_stock' => -1]]]));
        $this->assertDatabaseCount('products', 1);
    }

    public function test_foreign_variant_photo_and_cover_ids_cannot_be_submitted(): void
    {
        $own = $this->product();
        $foreign = $this->product(['name' => 'Foreign Bag', 'new_photos' => [$this->photo('foreign.png')]]);
        $editor = app(StaffProductEditor::class);
        $data = $editor->formData($own); $data['variant_rows'][0]['id'] = $foreign->variants->first()->id;
        $this->invalid(fn () => $editor->save($this->manager, $data, $own));
        $data = $editor->formData($own); $data['image_rows'] = [['id' => $foreign->images->first()->id, 'alt_text' => 'Changed']];
        $this->invalid(fn () => $editor->save($this->manager, $data, $own));
        $data = $editor->formData($own); $data['cover_image_id'] = $foreign->images->first()->id;
        $this->invalid(fn () => $editor->save($this->manager, $data, $own));
        $this->assertSame(8, $foreign->variants->first()->fresh()->stock_quantity);
        $this->assertSame('Foreign Bag', $foreign->images->first()->fresh()->alt_text);
    }

    public function test_stale_inventory_adjustment_does_not_overwrite_checkout_stock(): void
    {
        $product = $this->product();
        $editor = app(StaffProductEditor::class); $data = $editor->formData($product);
        $product->variants->first()->update(['stock_quantity' => 6]);
        $data['name'] = 'Should roll back'; $data['variant_rows'][0]['stock_adjustment'] = 5;
        $this->invalid(fn () => $editor->save($this->manager, $data, $product));
        $this->assertSame(6, $product->variants->first()->fresh()->stock_quantity);
        $this->assertSame('Everyday Tote', $product->fresh()->name);
    }

    public function test_non_stock_edit_preserves_latest_checkout_quantity(): void
    {
        $product = $this->product(); $editor = app(StaffProductEditor::class); $data = $editor->formData($product);
        $product->variants->first()->update(['stock_quantity' => 6]);
        $data['name'] = 'Updated Bag';
        $saved = $editor->save($this->manager, $data, $product);
        $this->assertSame(6, $saved->variants->first()->stock_quantity);
        $this->assertSame('Updated Bag', $saved->name);
    }

    public function test_inventory_adjustment_applies_once_for_the_same_stock_snapshot(): void
    {
        $product = $this->product(); $editor = app(StaffProductEditor::class); $data = $editor->formData($product);
        $data['variant_rows'][0]['stock_adjustment'] = 4;
        $saved = $editor->save($this->manager, $data, $product);
        $this->assertSame(12, $saved->variants->first()->stock_quantity);
        $this->invalid(fn () => $editor->save($this->manager, $data, $product));
        $this->assertSame(12, $product->variants->first()->fresh()->stock_quantity);
        $data = $editor->formData($product->fresh()); $data['variant_rows'][0]['stock_adjustment'] = -13;
        $this->invalid(fn () => $editor->save($this->manager, $data, $product));
        $this->assertSame(12, $product->variants->first()->fresh()->stock_quantity);
    }

    public function test_omitted_existing_variants_are_preserved(): void
    {
        $product = $this->product(['variant_rows' => [['color' => 'Black', 'initial_stock' => 8], ['color' => 'Brown', 'initial_stock' => 4]]]);
        $editor = app(StaffProductEditor::class); $data = $editor->formData($product);
        array_pop($data['variant_rows']);
        $saved = $editor->save($this->manager, $data, $product);
        $this->assertCount(2, $saved->variants);
        $this->assertSame(12, (int) $saved->variants->sum('stock_quantity'));
    }

    public function test_photo_order_cover_and_descriptions_can_be_edited_without_deleting_files(): void
    {
        $product = $this->product(['new_photos' => [$this->photo('first.png'), $this->photo('second.png')]]);
        $editor = app(StaffProductEditor::class); $data = $editor->formData($product);
        $data['image_rows'] = array_reverse($data['image_rows']);
        $data['image_rows'][0]['alt_text'] = 'Bag rear view';
        $data['cover_image_id'] = $data['image_rows'][0]['id'];
        $saved = $editor->save($this->manager, $data, $product);
        $this->assertSame('Bag rear view', $saved->images->first()->alt_text);
        $this->assertTrue($saved->images->first()->is_primary);
        $this->assertSame(1, $saved->images->where('is_primary', true)->count());
        foreach ($saved->images as $image) { Storage::disk('public')->assertExists($image->path); }
    }

    public function test_submitted_existing_paths_and_svg_uploads_are_not_accepted(): void
    {
        Storage::disk('public')->put('products/other.png', 'keep-this');
        $this->invalid(fn () => $this->product(['new_photos' => ['products/other.png']]));
        $svg = UploadedFile::fake()->createWithContent('bad.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
        $this->invalid(fn () => $this->product(['new_photos' => [$svg]]));
        $this->assertDatabaseCount('products', 0);
        Storage::disk('public')->assertExists('products/other.png');
    }

    public function test_failed_second_upload_rolls_back_database_and_removes_only_new_files(): void
    {
        $real = new CatalogUpload;
        $this->app->instance(CatalogUpload::class, new class($real) {
            public int $calls = 0;
            public function __construct(private CatalogUpload $real) {}
            public function store(UploadedFile $file, string $directory): string {
                if (++$this->calls === 2) { throw new RuntimeException('Simulated upload failure.'); }
                return $this->real->store($file, $directory);
            }
            public function discard(array $paths): void { $this->real->discard($paths); }
        });
        Storage::disk('public')->put('products/keep.png', 'existing');
        try {
            $this->product(['new_photos' => [$this->photo('one.png'), $this->photo('two.png')]]);
            $this->fail('Expected upload failure.');
        } catch (RuntimeException $exception) { $this->assertSame('Simulated upload failure.', $exception->getMessage()); }
        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('product_variants', 0);
        $this->assertDatabaseCount('product_images', 0);
        $this->assertSame(['products/keep.png'], Storage::disk('public')->allFiles('products'));
    }

    public function test_archive_preserves_order_history_photos_and_removes_active_references(): void
    {
        $product = $this->product(['new_photos' => [$this->photo('bag.png')]]);
        $customer = User::factory()->create(); $variant = $product->variants->first();
        $cart = Cart::create(['user_id' => $customer->id]);
        $cartItem = CartItem::create(['cart_id' => $cart->id, 'product_variant_id' => $variant->id, 'quantity' => 1]);
        $wishlist = WishlistItem::create(['user_id' => $customer->id, 'product_id' => $product->id]);
        $order = Order::create(['order_number' => 'CATALOG-ORDER', 'user_id' => $customer->id, 'status' => 'pending', 'customer_name' => $customer->name, 'customer_email' => $customer->email, 'shipping_address' => 'Test road', 'city' => 'Douala', 'subtotal' => 100, 'shipping_cost' => 0, 'total' => 100]);
        $item = OrderItem::create(['order_id' => $order->id, 'product_variant_id' => $variant->id, 'product_name' => $product->name, 'sku' => $variant->sku, 'unit_price' => 100, 'quantity' => 1, 'line_total' => 100]);
        app(StaffProductEditor::class)->archive($this->manager, $product);
        $this->assertSame('archived', $product->fresh()->status);
        $this->assertDatabaseHas('order_items', ['id' => $item->id, 'product_variant_id' => $variant->id]);
        $this->assertDatabaseHas('product_variants', ['id' => $variant->id]);
        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
        $this->assertDatabaseMissing('wishlist_items', ['id' => $wishlist->id]);
        Storage::disk('public')->assertExists($product->images->first()->path);
        $this->assertFalse(Gate::forUser($this->manager)->allows('delete', $product));
    }

    public function test_style_creation_editing_and_images_preserve_slug_and_old_file(): void
    {
        $editor = app(StaffStyleEditor::class);
        $style = $editor->save($this->manager, ['name' => 'Tote Bags', 'new_image' => $this->photo('old.png')]);
        $duplicate = $editor->save($this->manager, ['name' => 'Tote Bags']);
        $this->assertSame('tote-bags-2', $duplicate->slug);
        $oldPath = $style->image;
        $saved = $editor->save($this->manager, ['name' => 'Renamed Style', 'slug' => 'replace-url', 'new_image' => $this->photo('new.png')], $style);
        $this->assertSame('tote-bags', $saved->slug);
        $this->assertNotSame($oldPath, $saved->image);
        Storage::disk('public')->assertExists($oldPath);
        Storage::disk('public')->assertExists($saved->image);
        $this->assertFalse(Gate::forUser($this->manager)->allows('delete', $saved));
    }

    public function test_livewire_product_creation_uses_editor_and_does_not_fabricate_reviews(): void
    {
        $this->actingAs($this->manager);
        Livewire::test(CreateProduct::class)->fillForm($this->data())->call('create')->assertHasNoFormErrors();
        $this->assertDatabaseHas('products', ['name' => 'Everyday Tote', 'status' => 'draft', 'reviews_count' => 0]);
        $this->assertDatabaseCount('product_variants', 1);
    }

    public function test_livewire_edit_clears_stock_adjustment_after_saving(): void
    {
        $product = $this->product(); $data = app(StaffProductEditor::class)->formData($product);
        $data['variant_rows'][0]['stock_adjustment'] = 2;
        $this->actingAs($this->manager);
        $component = Livewire::test(EditProduct::class, ['record' => $product->id])->fillForm($data)->call('save', false)->assertHasNoFormErrors();
        $this->assertSame(10, $product->variants->first()->fresh()->stock_quantity);
        $component->call('save', false)->assertHasNoFormErrors();
        $this->assertSame(10, $product->variants->first()->fresh()->stock_quantity);
    }
}
