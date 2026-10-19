<?php
namespace Tests\Feature;
use App\Models\{User,Category,Product,ProductVariant,UserActivityLog};
use App\Services\StaffBulkPricing;
use App\Filament\Pages\BulkPricing;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;
class StaffBulkPricingTest extends TestCase
{
    use RefreshDatabase;
    private User $actor;
    protected function setUp(): void { parent::setUp(); config(['auth_features.email_verification_required'=>true]); Mail::fake(); $this->actor=User::factory()->create(['is_admin'=>true,'role'=>'manager']); Filament::setCurrentPanel(Filament::getPanel('staff')); }
    private function product(): Product
    {
        $n=Product::count()+1; $category=Category::firstOrCreate(['slug'=>'bags'],['name'=>'Bags','status'=>'active']);
        $p=Product::create(['category_id'=>$category->id,'name'=>'Bag '.$n,'slug'=>'bag-'.$n,'base_price'=>'100.00','sale_price'=>'90.00','status'=>'draft','reviews_count'=>2,'rating'=>'4.00']); $p->variants()->create(['sku'=>'SKU-'.$n,'stock_quantity'=>8,'price_override'=>null,'color'=>'Black']);return $p;
    }
    private function load(array $products): array { return app(StaffBulkPricing::class)->load($this->actor,array_map(fn($p)=>$p->id,$products)); }
    private function save(array $batch,array $confirmation=['reason'=>'Reviewed local prices','confirmed'=>true]): int { return app(StaffBulkPricing::class)->save($this->actor,$batch['rows'],$batch['snapshot'],$confirmation); }
    private function rejected(callable $f): void { try { $f();$this->fail('Expected validation refusal'); } catch (ValidationException $e) { $this->assertNotEmpty($e->errors()); } }
    public function test_manager_owner_can_view_and_support_customer_are_denied(): void
    {
        foreach (['manager','super_admin'] as $role) { $u=User::factory()->create(['role'=>$role,'is_admin'=>true]);$this->actingAs($u)->get('/staff/bulk-pricing')->assertOk()->assertHeader('X-Robots-Tag','noindex, nofollow, noarchive'); }
        foreach ([['role'=>'support_staff','is_admin'=>true],['role'=>null,'is_admin'=>false]] as $a) { $this->actingAs(User::factory()->create($a))->get('/staff/bulk-pricing')->assertForbidden(); }
    }
    public function test_confirmed_batch_saves_prices_only_and_logs_one_private_audit(): void
    {
        $p=$this->product();$v=$p->variants()->first();$before=$p->getRawOriginal();$batch=$this->load([$p]);$batch['rows'][0]['base_price']='120.50';$batch['rows'][0]['sale_price']='110.00';$batch['rows'][0]['variants'][0]['price_override']='115.25';$batch['rows'][0]['name']='FORGED';$batch['rows'][0]['status']='active';$batch['rows'][0]['variants'][0]['sku']='FORGED';$batch['rows'][0]['variants'][0]['stock_quantity']=999;
        $this->assertSame(1,$this->save($batch));$this->assertSame('120.50',$p->fresh()->base_price);$this->assertSame('110.00',$p->fresh()->sale_price);$this->assertSame('115.25',$v->fresh()->price_override);$this->assertSame(8,$v->fresh()->stock_quantity);$this->assertSame('SKU-1',$v->fresh()->sku);$this->assertSame($before['name'],$p->fresh()->name);$this->assertSame('draft',$p->fresh()->status);$this->assertSame($before['slug'],$p->fresh()->slug);$this->assertSame(2,$p->fresh()->reviews_count);
        $log=UserActivityLog::where('activity_type','bulk_prices_updated')->sole();$this->assertSame($this->actor->id,$log->user_id);$this->assertCount(1,$log->metadata['changes']);$this->assertSame('Reviewed local prices',$log->metadata['reason']);Mail::assertNothingSent();
    }
    public function test_noop_and_reordered_option_keys_do_not_write_audit(): void
    {
        $p=$this->product();$p->variants()->create(['sku'=>'SKU-extra','stock_quantity'=>1]);$batch=$this->load([$p]);$batch['rows'][0]['variants']=array_reverse($batch['rows'][0]['variants']);$this->assertSame(0,$this->save($batch));$this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_all_price_validation_finishes_before_any_write(): void
    {
        $a=$this->product();$b=$this->product();$batch=$this->load([$a,$b]);$batch['rows'][0]['base_price']='125.00';$batch['rows'][1]['sale_price']='101.00';$this->rejected(fn()=>$this->save($batch));$this->assertSame('100.00',$a->fresh()->base_price);$this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_money_precision_bounds_and_published_zero_prices_are_rejected(): void
    {
        $p=$this->product();$p->update(['status'=>'active']);
        foreach (['-1','1.234','1e2','100000000.00','0'] as $price) { $batch=$this->load([$p]);$batch['rows'][0]['base_price']=$price;$this->rejected(fn()=>$this->save($batch)); }
        $batch=$this->load([$p]);$batch['rows'][0]['variants'][0]['price_override']='0';$this->rejected(fn()=>$this->save($batch));$this->assertSame('100.00',$p->fresh()->base_price);
    }
    public function test_blank_sale_and_override_are_null_and_draft_zero_is_allowed(): void
    {
        $p=$this->product();$batch=$this->load([$p]);$batch['rows'][0]['base_price']='0';$batch['rows'][0]['sale_price']='';$batch['rows'][0]['variants'][0]['price_override']='';$this->assertSame(1,$this->save($batch));$this->assertSame('0.00',$p->fresh()->base_price);$this->assertNull($p->fresh()->sale_price);$this->assertNull($p->variants()->first()->price_override);
    }
    public function test_stale_prices_and_option_membership_block_entire_batch(): void
    {
        $p=$this->product();$batch=$this->load([$p]);$p->update(['base_price'=>'101.00']);$this->rejected(fn()=>$this->save($batch));$batch=$this->load([$p]);$p->variants()->create(['sku'=>'new-option','stock_quantity'=>3]);$this->rejected(fn()=>$this->save($batch));$this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_checkout_stock_change_is_not_a_price_conflict_and_is_preserved(): void
    {
        $p=$this->product();$batch=$this->load([$p]);$v=$p->variants()->first();$v->update(['stock_quantity'=>5]);$batch['rows'][0]['base_price']='130.00';$this->assertSame(1,$this->save($batch));$this->assertSame(5,$v->fresh()->stock_quantity);
    }
    public function test_foreign_omitted_duplicated_options_and_batch_substitution_are_refused(): void
    {
        $a=$this->product();$b=$this->product();$batch=$this->load([$a]);$batch['rows'][0]['variants'][0]['id']=$b->variants()->first()->id;$this->rejected(fn()=>$this->save($batch));
        $batch=$this->load([$a]);$batch['rows'][0]['variants']=[];$this->rejected(fn()=>$this->save($batch));$batch=$this->load([$a]);$batch['rows'][0]['variants'][]=$batch['rows'][0]['variants'][0];$this->rejected(fn()=>$this->save($batch));
        $batch=$this->load([$a]);$batch['rows'][0]['id']=$b->id;$this->rejected(fn()=>$this->save($batch));
    }
    public function test_confirmation_actor_binding_tamper_expiry_and_limits_are_enforced(): void
    {
        $p=$this->product();$batch=$this->load([$p]);$this->rejected(fn()=>$this->save($batch,['reason'=>'Reviewed','confirmed'=>false]));$bad=$batch;$bad['snapshot'].='x';$this->rejected(fn()=>$this->save($bad));
        $other=User::factory()->create(['role'=>'manager','is_admin'=>true]);$this->rejected(fn()=>app(StaffBulkPricing::class)->save($other,$batch['rows'],$batch['snapshot'],['reason'=>'Reviewed','confirmed'=>true]));
        $this->rejected(fn()=>app(StaffBulkPricing::class)->load($this->actor,array_fill(0,11,$p->id)));$this->travel(31)->minutes();$this->rejected(fn()=>$this->save($batch));
    }
    public function test_cached_demoted_actor_cannot_save_prices(): void
    {
        $p=$this->product();$batch=$this->load([$p]);User::whereKey($this->actor->id)->update(['is_admin'=>false]);try { $this->save($batch);$this->fail('Expected forbidden'); } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) { $this->assertSame(403,$e->getStatusCode()); } $this->assertSame('100.00',$p->fresh()->base_price);
    }
    public function test_audit_failure_rolls_back_prices(): void
    {
        $p=$this->product();$batch=$this->load([$p]);$batch['rows'][0]['base_price']='123.00';UserActivityLog::creating(fn()=>throw new \RuntimeException('audit unavailable'));
        try { try { $this->save($batch);$this->fail('Expected audit failure'); } catch (\RuntimeException $e) { $this->assertSame('audit unavailable',$e->getMessage()); } } finally { UserActivityLog::flushEventListeners(); }
        $this->assertSame('100.00',$p->fresh()->base_price);$this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_old_dashboard_and_bulk_routes_handoff_without_price_replay(): void
    {
        $p=$this->product();$this->actingAs($this->actor)->get('/admin')->assertRedirect('/staff');$this->get('/admin/bulk-pricing')->assertRedirect('/staff/bulk-pricing');
        $this->withHeaders(['X-Inertia'=>'true','X-Inertia-Version'=>'old'])->get('/admin')->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff'));
        $this->get('/admin/bulk-pricing')->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/bulk-pricing'));
        $this->put('/admin/bulk-pricing',['products'=>[['id'=>$p->id,'base_price'=>1]]])->assertStatus(409);$this->assertSame('100.00',$p->fresh()->base_price);$this->assertDatabaseCount('user_activity_logs',0);
    }
    public function test_saved_batch_receipt_cannot_be_replayed_after_prices_return_to_old_values(): void
    {
        $p=$this->product();
        $batch=$this->load([$p]);
        $batch['rows'][0]['base_price']='130.00';
        $this->assertSame(1,$this->save($batch));
        $this->assertSame('130.00',$p->fresh()->base_price);
        // The service updated a DIFFERENT model instance. Refresh this instance
        // before resetting: otherwise its original 100.00 is not dirty and the
        // attempted reset can leave the database at 130.00.
        $p->refresh()->update(['base_price'=>'100.00']);
        $this->assertSame('100.00',$p->fresh()->base_price,'Reset fixture must be persisted before testing replay.');
        try {
            $this->save($batch);
            $this->fail('Expected the already-used batch receipt to be refused.');
        } catch (ValidationException $e) {
            $this->assertSame('This batch was already saved. Reload current prices before continuing.',$e->errors()['rows'][0] ?? null);
        }
        $this->assertSame('100.00',$p->fresh()->base_price);
        $this->assertSame(1,UserActivityLog::where('activity_type','bulk_prices_updated')->count());
    }
    public function test_livewire_batch_actions_refresh_snapshot_and_preserve_stale_edits(): void
    {
        $p=$this->product();$this->actingAs($this->actor);$page=Livewire::test(BulkPricing::class)->set('selected',[$p->id])->callAction('loadBatch')->assertHasNoErrors();$token=$page->get('snapshot');$this->assertNotSame('',$token);
        $page->set('rows.0.base_price','140.00')->callAction('saveBatch',data:['reason'=>'Reviewed UI prices','confirmed'=>true])->assertHasNoErrors();$this->assertSame('140.00',$p->fresh()->base_price);$this->assertNotSame($token,$page->get('snapshot'));
        $page->callAction('saveBatch',data:['reason'=>'Reviewed no changes','confirmed'=>true])->assertHasNoErrors();$this->assertSame(1,UserActivityLog::where('activity_type','bulk_prices_updated')->count());
        $p->update(['base_price'=>'145.00']);$page->set('rows.0.base_price','150.00')->callAction('saveBatch',data:['reason'=>'Stale UI attempt','confirmed'=>true])->assertHasErrors(['rows']);$this->assertSame('145.00',$p->fresh()->base_price);
    }
}
