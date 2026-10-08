<?php
namespace Tests\Feature;
use App\Models\{Category, Collection, ContactMessage, ContactEvent, Discount, Order, Product, User};
use App\Services\{StaffCatalogOrganizer, ContactInbox, ContactDelivery};
use App\Mail\{ContactMessageMail, ContactReplyMail};
use App\Filament\Pages\Customers;
use App\Filament\Resources\Categories\Pages\{CreateCategory, EditCategory};
use App\Filament\Resources\Collections\Pages\EditCollection;
use App\Filament\Resources\Contacts\Pages\ViewContact;
use App\Filament\Resources\Discounts\Pages\CreateDiscount;
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Gate, Mail, Storage};
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;
class StaffWorkspaceBatchTest extends TestCase
{
    use RefreshDatabase;
    private User $staff;
    protected function setUp(): void
    {
        parent::setUp(); config(['contacts.auto_submit_updates'=>false,'mail.contact.address'=>'staff@example.test','auth_features.email_verification_required'=>true]); Mail::fake();
        $this->staff=User::factory()->create(['is_admin'=>true,'role'=>'manager']); Filament::setCurrentPanel(Filament::getPanel('staff'));
    }
    private function editor(): StaffCatalogOrganizer { return app(StaffCatalogOrganizer::class); }
    private function category(array $data=[]): Category { return $this->editor()->category($this->staff,array_replace(['name'=>'Bags','parent_id'=>null,'status'=>'active','sort_order'=>0],$data)); }
    private function product(): Product { $c=$this->category(); return Product::create(['category_id'=>$c->id,'name'=>'Bag','slug'=>'bag-'.uniqid(),'base_price'=>100,'status'=>'active']); }
    private function discount(array $data=[]): Discount { return $this->editor()->discount($this->staff,array_replace(['code'=>'SAVE10','type'=>'percentage','value'=>10,'active'=>true],$data)); }
    private function thread(): ContactMessage { return app(ContactInbox::class)->submit(['name'=>'Customer','email'=>'Customer@Example.test','subject'=>'Bag availability','message'=>'Is this bag available?']); }
    private function invalid(callable $call): void { try { $call(); $this->fail('Expected validation error'); } catch (ValidationException $e) { $this->assertNotEmpty($e->errors()); } }
    private function editData($record,array $extra=[]): array { return array_replace($record->attributesToArray(),['expected_snapshot'=>$this->editor()->fingerprint($record)],$extra); }
    public function test_manager_pages_render_private_and_support_permissions_are_separated(): void
    {
        foreach (['categories','collections','discounts','contacts','customers'] as $slug) { $this->actingAs($this->staff)->get('/staff/'.$slug)->assertOk()->assertHeader('X-Robots-Tag','noindex, nofollow, noarchive'); }
        $support=User::factory()->create(['is_admin'=>true,'role'=>'support_staff']);
        foreach (['contacts','customers'] as $slug) { $this->actingAs($support)->get('/staff/'.$slug)->assertOk(); }
        foreach (['categories','collections','discounts'] as $slug) { $this->actingAs($support)->get('/staff/'.$slug)->assertForbidden(); }
    }
    public function test_customer_and_demoted_staff_cannot_access_new_pages_or_service(): void
    {
        $customer=User::factory()->create(); foreach (['categories','collections','discounts','contacts','customers'] as $slug) { $this->actingAs($customer)->get('/staff/'.$slug)->assertForbidden(); }
        $this->staff->update(['is_admin'=>false]); $this->expectException(AuthorizationException::class); $this->category();
    }
    public function test_category_urls_and_associations_survive_rename_and_archive(): void
    {
        $c=$this->category(); $p=Product::create(['category_id'=>$c->id,'name'=>'Bag','slug'=>'bag','base_price'=>100,'status'=>'active']);
        $saved=$this->editor()->category($this->staff,$this->editData($c,['name'=>'Renamed','slug'=>'forged','status'=>'inactive']),$c);
        $this->assertSame($c->slug,$saved->slug); $this->assertSame('inactive',$saved->status); $this->assertSame($c->id,$p->fresh()->category_id); $this->assertFalse(Gate::forUser($this->staff)->allows('delete',$c));
    }
    public function test_category_tree_rejects_self_cycles_deeper_levels_and_inactive_parent_activation(): void
    {
        $root=$this->category(); $child=$this->category(['name'=>'Child','parent_id'=>$root->id]);
        $this->invalid(fn ()=>$this->category(['parent_id'=>$child->id]));
        $this->invalid(fn ()=>$this->editor()->category($this->staff,$this->editData($root,['parent_id'=>$child->id]),$root));
        $this->invalid(fn ()=>$this->editor()->category($this->staff,$this->editData($child,['parent_id'=>$child->id]),$child));
        $root->update(['status'=>'inactive']); $this->invalid(fn ()=>$this->category(['parent_id'=>$root->id]));
    }
    public function test_stale_category_form_does_not_overwrite_latest_change(): void
    {
        $c=$this->category(); $data=$this->editData($c,['name'=>'Stale']); $c->update(['name'=>'Latest']); $this->invalid(fn ()=>$this->editor()->category($this->staff,$data,$c)); $this->assertSame('Latest',$c->fresh()->name);
    }
    public function test_collection_creation_preserves_members_and_archive_preserves_media_and_url(): void
    {
        Storage::fake('public'); $p=$this->product(); $c=$this->editor()->collection($this->staff,['name'=>'Summer','active'=>true,'sort_order'=>0,'product_ids'=>[$p->id]]);
        $c->update(['hero_image'=>'collections/old.png']); Storage::disk('public')->put('collections/old.png','old'); $c=$c->fresh();
        $saved=$this->editor()->collection($this->staff,$this->editData($c,['name'=>'New name','active'=>false,'product_ids'=>[$p->id],'hero_image'=>'forged']),$c);
        $this->assertSame($c->slug,$saved->slug); $this->assertSame('collections/old.png',$saved->hero_image); $this->assertSame([$p->id],$saved->products()->pluck('products.id')->all()); Storage::disk('public')->assertExists('collections/old.png');
    }
    public function test_collection_rejects_missing_members_empty_publication_and_path_injection(): void
    {
        $data=['name'=>'Summer','active'=>true,'sort_order'=>0,'product_ids'=>[]]; $this->invalid(fn ()=>$this->editor()->collection($this->staff,$data));
        $this->invalid(fn ()=>$this->editor()->collection($this->staff,array_replace($data,['active'=>false,'product_ids'=>[999999]])));
        $this->invalid(fn ()=>$this->editor()->collection($this->staff,array_replace($data,['active'=>false,'new_image'=>'collections/someone.png'])));
        $this->assertDatabaseCount('collections',0);
    }
    public function test_stale_collection_membership_is_not_silently_overwritten(): void
    {
        $p=$this->product(); $c=$this->editor()->collection($this->staff,['name'=>'Summer','active'=>false,'sort_order'=>0,'product_ids'=>[$p->id]]); $data=$this->editData($c,['product_ids'=>[$p->id]]); $c->products()->detach();
        $this->invalid(fn ()=>$this->editor()->collection($this->staff,$data,$c)); $this->assertSame(0,$c->products()->count());
    }
    public function test_discount_normalizes_new_code_and_rejects_invalid_values_dates_and_duplicates(): void
    {
        $d=$this->discount(['code'=>' save10 ']); $this->assertSame('SAVE10',$d->code);
        foreach ([['value'=>101],['value'=>-1],['value'=>0.001],['code'=>'SAVE10'],['code'=>'BAD CODE'],['starts_at'=>'2026-10-10','expires_at'=>'2026-10-09']] as $bad) { $this->invalid(fn ()=>$this->discount($bad)); }
    }
    public function test_discount_edits_keep_checkout_usage_code_and_historical_order_snapshots(): void
    {
        $d=$this->discount(); $data=$this->editData($d,['value'=>15,'code'=>'FORGED','uses_count'=>0,'max_uses'=>10]);
        $d->increment('uses_count',3); $d->update(['updated_at'=>now()->addSeconds(2)]);
        $saved=$this->editor()->discount($this->staff,$data,$d); $this->assertSame(3,(int)$saved->uses_count); $this->assertSame('SAVE10',$saved->code); $this->assertSame('15.00',$saved->value);
        $this->invalid(fn ()=>$this->editor()->discount($this->staff,$this->editData($saved,['max_uses'=>2]),$saved));
        $this->assertFalse(Gate::forUser($this->staff)->allows('delete',$saved));
    }
    public function test_stale_discount_terms_cannot_overwrite_latest_terms(): void
    {
        $d=$this->discount(); $data=$this->editData($d); $d->update(['value'=>25]); $this->invalid(fn ()=>$this->editor()->discount($this->staff,$data,$d));
    }
    public function test_contact_form_persists_original_and_honeypot_still_blocks_spam(): void
    {
        $data=['name'=>'Customer','email'=>'customer@example.test','subject'=>'Question','message'=>'Please help me choose a bag.'];
        $this->from('/contact')->post('/contact',$data)->assertRedirect('/contact')->assertSessionHas('contact_submitted',true);
        $this->assertDatabaseHas('contact_messages',['message'=>$data['message'],'status'=>'open']);
        $this->from('/contact')->post('/contact',array_replace($data,['website'=>'spam']))->assertSessionHasErrors('website'); $this->assertDatabaseCount('contact_messages',1);
    }
    public function test_contact_private_actions_do_not_modify_original_or_send_customer_email(): void
    {
        $t=$this->thread(); $original=$t->only(['name','email','subject','message']);
        $svc=app(ContactInbox::class); $svc->act($this->staff,$t,'note','PRIVATE NOTE',0); $svc->act($this->staff,$t,'resolve','Handled by staff',1); $this->assertSame('resolved',$t->fresh()->status);
        $svc->act($this->staff,$t,'reopen','Customer follow-up',2); $this->assertSame('open',$t->fresh()->status); $this->assertSame($original,$t->fresh()->only(array_keys($original))); Mail::assertNothingSent();
    }
    public function test_contact_stale_action_and_reply_to_resolved_thread_are_rejected(): void
    {
        $t=$this->thread(); $svc=app(ContactInbox::class); $svc->act($this->staff,$t,'resolve','Resolved request',0);
        $this->invalid(fn ()=>$svc->act($this->staff,$t,'reply','Stale reply',0)); $this->invalid(fn ()=>$svc->act($this->staff,$t,'reply','Resolved reply',1)); $this->assertSame(2,$t->events()->count());
    }
    public function test_contact_receipt_submission_uses_configured_recipient_and_is_not_duplicated(): void
    {
        $t=$this->thread(); $e=$t->events()->first(); $delivery=app(ContactDelivery::class); $this->assertTrue($delivery->send($e->id)); $this->assertFalse($delivery->send($e->id));
        Mail::assertSent(ContactMessageMail::class,fn ($mail)=>$mail->hasTo('staff@example.test')); $this->assertSame('sent',$e->fresh()->email_status);
    }
    public function test_contact_reply_excludes_private_notes_and_escapes_html(): void
    {
        $t=$this->thread(); $delivery=app(ContactDelivery::class); $delivery->drain($t->id);
        app(ContactInbox::class)->act($this->staff,$t,'note','PRIVATE BANK NOTE',0);
        $e=app(ContactInbox::class)->act($this->staff,$t,'reply','Thank you <script>alert(1)</script>',1); $this->assertTrue($delivery->send($e->id));
        Mail::assertSent(ContactReplyMail::class,function ($mail): bool { $this->assertTrue($mail->hasTo('customer@example.test')); $html=$mail->render(); $this->assertStringNotContainsString('PRIVATE BANK NOTE',$html); $this->assertStringNotContainsString('<script>',$html); $this->assertStringContainsString('&lt;script&gt;',$html); return true; });
    }
    public function test_failed_contact_mail_preserves_message_and_audits_attempt_without_raw_error(): void
    {
        $t=$this->thread(); $e=$t->events()->first(); Mail::swap(new class { public function to($address): object { return new class { public function send($mail): never { throw new \RuntimeException('PRIVATE SMTP PASSWORD'); } }; } });
        $this->assertFalse(app(ContactDelivery::class)->send($e->id)); $this->assertSame('failed',$e->fresh()->email_status); $this->assertSame(1,$e->fresh()->email_attempts); $this->assertStringNotContainsString('PASSWORD',$e->fresh()->email_error); $this->assertDatabaseCount('contact_messages',1);
    }
    public function test_contact_retry_is_scoped_and_older_reply_cannot_follow_newer_sent_reply(): void
    {
        $t=$this->thread(); $other=$this->thread(); $delivery=app(ContactDelivery::class); $delivery->drain($t->id); $old=app(ContactInbox::class)->act($this->staff,$t,'reply','First reply',0); $old->update(['email_status'=>'failed']);
        $new=app(ContactInbox::class)->act($this->staff,$t,'reply','Second reply',1); $this->assertTrue($delivery->send($new->id)); $this->invalid(fn ()=>$delivery->retry($this->staff,$t,$old->id));
        try { $delivery->retry($this->staff,$other,$new->id); $this->fail('Expected scoped lookup failure'); } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) { $this->assertNotNull($e); }
    }
    public function test_contact_interrupted_attempt_needs_age_and_review_and_does_not_auto_resend(): void
    {
        $t=$this->thread(); $e=$t->events()->first(); $e->update(['email_status'=>'sending','email_claimed_at'=>now(),'email_attempts'=>1]); $d=app(ContactDelivery::class);
        $this->invalid(fn ()=>$d->recover($this->staff,$t,$e->id,'Checked server logs')); $e->update(['email_claimed_at'=>now()->subMinutes(11)]); $d->recover($this->staff,$t,$e->id,'No sender running');
        $this->assertSame('failed',$e->fresh()->email_status); $this->assertSame('No sender running',$e->fresh()->metadata['recovery'][0]['note']); Mail::assertNothingSent();
    }
    public function test_enabled_contact_submission_attempts_notice_after_commit(): void
    {
        config(['contacts.auto_submit_updates'=>true]); $t=$this->thread(); $this->assertSame('sent',$t->events()->first()->email_status); Mail::assertSent(ContactMessageMail::class,1);
    }
    public function test_livewire_category_create_and_rename_use_guarded_editor(): void
    {
        $this->actingAs($this->staff); Livewire::test(CreateCategory::class)->fillForm(['name'=>'Travel bags','parent_id'=>null,'status'=>'active','sort_order'=>0])->call('create')->assertHasNoFormErrors();
        $c=Category::where('name','Travel bags')->firstOrFail(); $slug=$c->slug; Livewire::test(EditCategory::class,['record'=>$c->id])->fillForm(['name'=>'Travel collection'])->call('save')->assertHasNoFormErrors(); $this->assertSame($slug,$c->fresh()->slug);
    }
    public function test_livewire_discount_and_collection_edits_preserve_counters_and_members(): void
    {
        $this->actingAs($this->staff); Livewire::test(CreateDiscount::class)->fillForm(['code'=>'MOBILE10','type'=>'percentage','value'=>10,'active'=>true])->call('create')->assertHasNoFormErrors();
        $p=$this->product(); $c=$this->editor()->collection($this->staff,['name'=>'Bags','active'=>false,'sort_order'=>0,'product_ids'=>[$p->id]]); Livewire::test(EditCollection::class,['record'=>$c->id])->fillForm(['name'=>'Renamed bags'])->call('save')->assertHasNoFormErrors(); $this->assertSame([$p->id],$c->products()->pluck('products.id')->all());
    }
    public function test_livewire_contact_note_and_reply_actions_use_private_workflow(): void
    {
        $t=$this->thread(); $this->actingAs($this->staff); Livewire::test(ViewContact::class,['record'=>$t->id])->callAction('note',['expected'=>0,'body'=>'PRIVATE STAFF NOTE'])->assertHasNoActionErrors();
        Livewire::test(ViewContact::class,['record'=>$t->id])->callAction('reply',['expected'=>1,'body'=>'We can help with your bag.'])->assertHasNoActionErrors(); $this->assertSame(2,$t->fresh()->workflow_version); Mail::assertNothingSent();
    }
    public function test_legacy_redirects_handle_stale_inertia_version_and_old_deletes_do_not_delete(): void
    {
        $c=$this->category(); $this->actingAs($this->staff)->withHeaders(['X-Inertia'=>'true','X-Inertia-Version'=>'stale'])->get('/admin/categories')->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/categories'));
        $this->delete('/admin/categories/'.$c->id)->assertStatus(409); $this->assertDatabaseHas('categories',['id'=>$c->id,'status'=>'active']);
        foreach (['collections','discounts','customers'] as $slug) { $this->get('/admin/'.$slug)->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/'.$slug)); }
    }
    public function test_read_only_customer_history_separates_order_values_from_marked_paid_values(): void
    {
        foreach ([['pending','pending',100],['delivered','paid',200],['cancelled','paid',300]] as [$status,$payment,$amount]) { Order::create(['status'=>$status,'payment_status'=>$payment,'customer_name'=>'Guest contact','customer_email'=>'guest@example.test','shipping_address'=>'Street','city'=>'Douala','subtotal'=>$amount,'shipping_cost'=>0,'total'=>$amount]); }
        $this->actingAs($this->staff); $page=Livewire::test(Customers::class)->call('selectEmail',base64_encode('guest@example.test'))->assertSee('600.00')->assertSee('200.00')->assertSee('not proof of a verified account identity')->assertSee('not revenue'); $this->assertDatabaseCount('orders',3);
    }
    public function test_contact_pending_command_does_not_retry_failed_attempts(): void
    {
        $a=$this->thread(); $b=$this->thread(); $b->events()->first()->update(['email_status'=>'failed']); $this->artisan('contacts:send-pending')->assertExitCode(0); $this->assertSame('sent',$a->events()->first()->email_status); $this->assertSame('failed',$b->events()->first()->email_status); Mail::assertSent(ContactMessageMail::class,1);
    }

    public function test_contact_rotated_emails_cannot_evade_ip_submission_limit(): void
    {
        for ($i=0; $i<20; $i++) { $this->from('/contact')->post('/contact',['name'=>'Visitor','email'=>'visitor'.$i.'@example.test','subject'=>'Question','message'=>'Please tell me about this bag.'])->assertRedirect('/contact'); }
        $this->post('/contact',['name'=>'Visitor','email'=>'another@example.test','subject'=>'Question','message'=>'Please tell me about this bag.'])->assertStatus(429);
        $this->assertDatabaseCount('contact_messages',20);
    }
    public function test_support_cannot_edit_discounts_and_customer_cannot_mutate_contact_threads(): void
    {
        $support=User::factory()->create(['is_admin'=>true,'role'=>'support_staff']); $this->assertFalse(Gate::forUser($support)->allows('create',Discount::class));
        $t=$this->thread(); $customer=User::factory()->create(); $this->expectException(AuthorizationException::class); app(ContactInbox::class)->act($customer,$t,'reply','Unapproved reply',0);
    }
    public function test_contact_header_line_injection_is_rejected_before_storage(): void
    {
        $this->invalid(fn ()=>app(ContactInbox::class)->submit(['name'=>'Visitor','email'=>'visitor@example.test','subject'=>"Question\r\nBcc: other@example.test",'message'=>'Please tell me about this bag.'])); $this->assertDatabaseCount('contact_messages',0);
    }
    public function test_create_and_edit_catalog_pages_render(): void
    {
        $c=$this->category(); $collection=$this->editor()->collection($this->staff,['name'=>'Draft collection','active'=>false,'sort_order'=>0,'product_ids'=>[]]); $d=$this->discount();
        foreach (['/staff/categories/create','/staff/categories/'.$c->id.'/edit','/staff/collections/create','/staff/collections/'.$collection->id.'/edit','/staff/discounts/create','/staff/discounts/'.$d->id.'/edit'] as $url) { $this->actingAs($this->staff)->get($url)->assertOk(); }
        $t=$this->thread(); $this->get('/staff/contacts/'.$t->id)->assertOk()->assertSee('Original customer message');
    }

    public function test_demoted_cached_actor_cannot_reply_and_customer_page_rechecks_permission(): void
    {
        $t=$this->thread(); $this->actingAs($this->staff); $page=Livewire::test(Customers::class); User::whereKey($this->staff->id)->update(['is_admin'=>false]);
        $page->set('search','guest')->assertForbidden();
        try { app(ContactInbox::class)->act($this->staff,$t,'reply','Cached actor reply',0); $this->fail('Expected authorization refusal'); } catch (AuthorizationException $e) { $this->assertNotNull($e); }
        $this->assertSame(1,$t->events()->count());
    }

    public function test_category_fingerprint_ignores_resource_count_aliases_not_persisted_changes(): void
    {
        $c=$this->category(); $loaded=Category::with('parent')->withCount('products')->findOrFail($c->id);
        $this->assertArrayHasKey('products_count',$loaded->getRawOriginal());
        $this->assertSame($this->editor()->fingerprint($c),$this->editor()->fingerprint($loaded));
        $data=$this->editData($loaded,['name'=>'Requested rename']); $c->update(['name'=>'Concurrent rename']);
        $this->invalid(fn ()=>$this->editor()->category($this->staff,$data,$loaded));
        $this->assertSame('Concurrent rename',$c->fresh()->name);
    }
    public function test_collection_fingerprint_ignores_count_aliases_but_preserves_member_guard(): void
    {
        $p=$this->product(); $c=$this->editor()->collection($this->staff,['name'=>'Collection','active'=>false,'sort_order'=>0,'product_ids'=>[$p->id]]);
        $loaded=Collection::withCount('products')->findOrFail($c->id);
        $this->assertArrayHasKey('products_count',$loaded->getRawOriginal());
        $this->assertSame($this->editor()->fingerprint($c),$this->editor()->fingerprint($loaded));
        $data=$this->editData($loaded,['product_ids'=>[$p->id]]); $c->products()->detach();
        $this->invalid(fn ()=>$this->editor()->collection($this->staff,$data,$loaded));
        $this->assertSame(0,$c->products()->count());
    }
    public function test_livewire_discount_edit_keeps_usage_and_refreshes_snapshot_for_repeat_save(): void
    {
        $this->actingAs($this->staff); $d=$this->discount();
        $page=Livewire::test(\App\Filament\Resources\Discounts\Pages\EditDiscount::class,['record'=>$d->id]);
        $d->increment('uses_count',2);
        $page->fillForm(['value'=>12])->call('save',false)->assertHasNoFormErrors();
        $page->fillForm(['value'=>14])->call('save',false)->assertHasNoFormErrors();
        $this->assertSame(2,(int)$d->fresh()->uses_count); $this->assertSame('14.00',$d->fresh()->value);
    }
    public function test_livewire_category_form_still_rejects_real_concurrent_edit(): void
    {
        $this->actingAs($this->staff); $c=$this->category(); $page=Livewire::test(EditCategory::class,['record'=>$c->id]);
        Category::whereKey($c->id)->update(['name'=>'Concurrent staff edit']);
        $page->fillForm(['name'=>'Old tab edit'])->call('save')->assertHasFormErrors(['name']);
        $this->assertSame('Concurrent staff edit',$c->fresh()->name);
    }
}
