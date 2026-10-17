<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\ProductController as LegacyProductController;
use App\Models\{Category,Product,ProductImage,ProductVariant,Style,User};
use App\Services\StaffProductEditor;
use App\Support\LegacyCatalogHandoff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\{DB,Mail,Storage};
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StaffLegacyCatalogHandoffTest extends TestCase
{
    use RefreshDatabase;

    private User $actor;
    private Product $product;
    private ProductVariant $variant;
    private ProductImage $image;
    private ProductImage $secondImage;
    private Style $style;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth_features.email_verification_required'=>true]);
        Storage::fake('public'); Mail::fake();
        $this->actor=User::factory()->create(['role'=>'manager','is_admin'=>true]);
        $category=Category::create(['name'=>'Legacy catalog','slug'=>'legacy-catalog','status'=>'active']);
        $this->style=Style::create(['name'=>'Original style','slug'=>'original-style','image'=>'styles/original.jpg']);
        $this->product=Product::create(['category_id'=>$category->id,'style_id'=>$this->style->id,'name'=>'Original bag','slug'=>'original-bag','base_price'=>'100.00','status'=>'active','featured'=>true,'new_arrival'=>true,'reviews_count'=>3,'rating'=>'4.00']);
        $this->variant=$this->product->variants()->create(['sku'=>'ORIGINAL-SKU','stock_quantity'=>8,'color'=>'Black']);
        $this->image=$this->product->images()->create(['path'=>'products/original.jpg','sort_order'=>0,'is_primary'=>true]);
        $this->secondImage=$this->product->images()->create(['path'=>'products/second.jpg','sort_order'=>1,'is_primary'=>false]);
        foreach ([$this->image->path,$this->secondImage->path,$this->style->image] as $path) { Storage::disk('public')->put($path,'retained original bytes'); }
    }

    private function edit(): string { return '/staff/products/'.$this->product->id.'/edit'; }
    private function styleEdit(): string { return '/staff/styles/'.$this->style->id.'/edit'; }

    private function reads(): array
    {
        return [
            ['/admin/products','/staff/products'],
            ['/admin/products/create','/staff/products/create'],
            ['/admin/products/'.$this->product->id,$this->edit()],
            ['/admin/products/'.$this->product->id.'/edit',$this->edit()],
            ['/admin/styles','/staff/styles'],
        ];
    }

    private function writes(): array
    {
        $p='/admin/products/'.$this->product->id;$v=$p.'/variants/'.$this->variant->id;$i=$p.'/images/'.$this->image->id;$s='/admin/styles/'.$this->style->id;
        return [
            ['POST','/admin/products','/staff/products/create'],
            ['PUT',$p,$this->edit()], ['PATCH',$p,$this->edit()], ['DELETE',$p,$this->edit()],
            ['POST',$p.'/variants',$this->edit()], ['PUT',$v,$this->edit()], ['DELETE',$v,$this->edit()],
            ['POST',$p.'/images',$this->edit()], ['PATCH',$i.'/primary',$this->edit()],
            ['POST',$p.'/images/reorder',$this->edit()], ['DELETE',$i,$this->edit()],
            ['POST','/admin/styles','/staff/styles/create'], ['PUT',$s,$this->styleEdit()], ['DELETE',$s,$this->styleEdit()],
        ];
    }

    private function payload(): array
    {
        return ['name'=>'FORGED OLD FORM PAYLOAD','slug'=>'changed-slug','sku'=>'FORGED-SKU','stock_quantity'=>99999,'base_price'=>'0','status'=>'archived','path'=>'products/untrusted.jpg','image'=>'products/untrusted.jpg','order'=>[$this->secondImage->id,$this->image->id],'redirect'=>'https://other.example','role'=>'super_admin'];
    }

    private function snapshot(): array
    {
        $out=[];
        foreach (['products','product_variants','product_images','styles','categories','orders','order_items','carts','cart_items','wishlist_items','collection_product','user_activity_logs','notifications'] as $table) {
            $out[$table]=DB::table($table)->get()->map(fn($row)=>(array)$row)->all();
        }
        $files=Storage::disk('public')->allFiles();sort($files);
        foreach($files as $file) {$out['files'][$file]=hash('sha256',Storage::disk('public')->get($file));}
        return $out;
    }

    public function test_manager_and_owner_old_read_links_open_matching_native_pages(): void
    {
        foreach (['manager','super_admin'] as $role) {
            $this->actingAs(User::factory()->create(['role'=>$role,'is_admin'=>true]));
            foreach($this->reads() as [$old,$new]) {$this->get($old)->assertRedirect($new);}
        }
    }

    public function test_old_read_links_survive_stale_inertia_asset_versions(): void
    {
        $this->actingAs($this->actor);
        foreach($this->reads() as [$old,$new]) {$this->withHeaders(['X-Inertia'=>'true','X-Inertia-Version'=>'obsolete'])->get($old)->assertStatus(409)->assertHeader('X-Inertia-Location',url($new));}
    }

    public function test_every_plain_old_write_is_noop_and_hands_off_without_replay(): void
    {
        $this->actingAs($this->actor);$before=$this->snapshot();
        foreach($this->writes() as [$method,$old,$new]) {
            $this->call($method,$old,$this->payload())->assertRedirect($new);
            $this->assertSame($before,$this->snapshot(),$method.' '.$old.' must not mutate catalog/history/files.');
        }
        Mail::assertNothingSent(); Mail::assertNothingQueued();
    }

    public function test_every_inertia_old_write_is_noop_even_with_stale_assets(): void
    {
        $this->actingAs($this->actor);$before=$this->snapshot();
        foreach($this->writes() as [$method,$old,$new]) {
            // Low-level call() does not merge withHeaders() defaults. Pass
            // the actual HTTP headers explicitly as Symfony server variables.
            $this->call($method,$old,$this->payload(),[],[],[
                'HTTP_X_INERTIA'=>'true',
                'HTTP_X_INERTIA_VERSION'=>'obsolete',
            ])->assertStatus(409)->assertHeader('X-Inertia-Location',url($new));
            $this->assertSame($before,$this->snapshot());
        }
    }

    public function test_support_customer_and_inactive_accounts_cannot_use_any_old_catalog_route(): void
    {
        $accounts=[['role'=>'support_staff','is_admin'=>true],['role'=>null,'is_admin'=>false],['role'=>'manager','is_admin'=>false]];
        $before=$this->snapshot();
        foreach($accounts as $data) {
            $this->actingAs(User::factory()->create($data));
            foreach($this->reads() as [$old,$new]) {$this->get($old)->assertForbidden();}
            foreach($this->writes() as [$method,$old,$new]) {$this->call($method,$old,$this->payload())->assertForbidden();}
        }
        $this->assertSame($before,$this->snapshot());
    }

    public function test_guest_and_unverified_staff_still_follow_existing_login_and_verification(): void
    {
        $this->get('/admin/products')->assertRedirect(route('login'));
        $u=User::factory()->create(['role'=>'manager','is_admin'=>true,'email_verified_at'=>null]);
        $this->actingAs($u)->get('/admin/products')->assertRedirect(route('verification.notice'));
        $before=$this->snapshot();$this->put('/admin/products/'.$this->product->id,$this->payload())->assertRedirect(route('verification.notice'));$this->assertSame($before,$this->snapshot());
    }

    public function test_uploaded_images_and_style_replacements_are_not_stored(): void
    {
        $this->actingAs($this->actor);$before=$this->snapshot();
        $this->post('/admin/products/'.$this->product->id.'/images',['images'=>[UploadedFile::fake()->create('new-photo.jpg',1,'image/jpeg')]])->assertRedirect($this->edit());
        $this->put('/admin/styles/'.$this->style->id,['name'=>'FORGED','image'=>UploadedFile::fake()->create('new-style.jpg',1,'image/jpeg')])->assertRedirect($this->styleEdit());
        $this->assertSame($before,$this->snapshot());
    }

    public function test_retired_product_delete_preserves_cart_wishlist_and_history_instead_of_archiving(): void
    {
        $cart=\App\Models\Cart::create(['user_id'=>$this->actor->id]);
        \App\Models\CartItem::create(['cart_id'=>$cart->id,'product_variant_id'=>$this->variant->id,'quantity'=>1]);
        \App\Models\WishlistItem::create(['user_id'=>$this->actor->id,'product_id'=>$this->product->id]);
        $order=\App\Models\Order::create(['user_id'=>$this->actor->id,'customer_name'=>'Test customer','customer_email'=>'test@example.com','customer_phone'=>'600000000','shipping_address'=>'Test address','city'=>'Douala','subtotal'=>100,'shipping_cost'=>0,'total'=>100,'status'=>'pending']);
        \App\Models\OrderItem::create(['order_id'=>$order->id,'product_variant_id'=>$this->variant->id,'product_name'=>$this->product->name,'sku'=>$this->variant->sku,'unit_price'=>100,'quantity'=>1,'line_total'=>100]);
        $before=$this->snapshot();$this->actingAs($this->actor)->delete('/admin/products/'.$this->product->id)->assertRedirect($this->edit());$this->assertSame($before,$this->snapshot());
    }

    public function test_cross_product_bound_ids_and_reorder_payload_stay_rejected(): void
    {
        $other=Product::create(['category_id'=>$this->product->category_id,'name'=>'Other','slug'=>'other-product','base_price'=>100,'status'=>'draft']);
        $v=$other->variants()->create(['sku'=>'OTHER','stock_quantity'=>2]);$img=$other->images()->create(['path'=>'products/other.jpg']);
        $this->actingAs($this->actor);$before=$this->snapshot();$p='/admin/products/'.$this->product->id;
        $this->put($p.'/variants/'.$v->id,$this->payload())->assertNotFound();$this->delete($p.'/variants/'.$v->id)->assertNotFound();
        $this->patch($p.'/images/'.$img->id.'/primary')->assertNotFound();$this->delete($p.'/images/'.$img->id)->assertNotFound();
        $this->post($p.'/images/reorder',['order'=>[$this->image->id,$img->id]])->assertSessionHasErrors('order.1');$this->assertSame($before,$this->snapshot());
    }

    public function test_missing_bound_records_remain_not_found(): void
    {
        $this->actingAs($this->actor)->get('/admin/products/999999/edit')->assertNotFound();$this->delete('/admin/styles/999999')->assertNotFound();
    }

    public function test_cached_demoted_actor_is_refused_even_on_direct_controller_call(): void
    {
        $cached=$this->actor;User::whereKey($cached->id)->update(['is_admin'=>false]);
        $request=Request::create('/admin/products/'.$this->product->id,'PUT',$this->payload());$request->setUserResolver(fn()=>$cached);$before=$this->snapshot();
        try {(new LegacyProductController)->update($request,$this->product);$this->fail('Cached demoted actor must be denied.');} catch(HttpException $e) {$this->assertSame(403,$e->getStatusCode());}
        $this->assertSame($before,$this->snapshot());
    }

    public function test_native_editor_can_still_change_and_archive_products(): void
    {
        $editor=app(StaffProductEditor::class);$data=$editor->formData($this->product);$data['base_price']='120.00';$this->actingAs($this->actor);$updated=$editor->save($this->actor,$data,$this->product);
        $this->assertSame('120.00',$updated->base_price);$this->assertSame('ORIGINAL-SKU',$updated->variants->first()->sku);$this->assertSame(8,$updated->variants->first()->stock_quantity);
        $editor->archive($this->actor,$updated);$this->assertSame('archived',$updated->fresh()->status);Storage::disk('public')->assertExists($this->image->path);
    }
}
