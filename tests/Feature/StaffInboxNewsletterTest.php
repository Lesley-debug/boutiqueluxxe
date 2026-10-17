<?php
namespace Tests\Feature;
use App\Models\{User,NewsletterSubscriber};
use App\Services\StaffInbox;
use App\Filament\Pages\{StaffNotifications,StaffNewsletter};
use App\Filament\Widgets\StaffQuickLinks;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{DB,Mail};
use Illuminate\Support\Str;
use Livewire\Livewire;
use Tests\TestCase;
class StaffInboxNewsletterTest extends TestCase
{
    use RefreshDatabase;
    private User $staff;
    protected function setUp(): void { parent::setUp(); config(['auth_features.email_verification_required'=>true]); Mail::fake(); $this->staff=User::factory()->create(['is_admin'=>true,'role'=>'manager']); Filament::setCurrentPanel(Filament::getPanel('staff')); }
    private function notification(User $user,array $data=[],?string $type=null): string
    {
        $id=(string)Str::uuid(); DB::table('notifications')->insert(['id'=>$id,'type'=>'local-test','notifiable_type'=>$type ?? $user->getMorphClass(),'notifiable_id'=>$user->id,'data'=>json_encode(array_replace(['title'=>'Local alert','message'=>'Local message'],$data)),'read_at'=>null,'created_at'=>now(),'updated_at'=>now()]); return $id;
    }
    public function test_manager_pages_are_private_and_support_cannot_view_newsletter(): void
    {
        foreach (['notifications','newsletter'] as $slug) { $this->actingAs($this->staff)->get('/staff/'.$slug)->assertOk()->assertHeader('X-Robots-Tag','noindex, nofollow, noarchive'); }
        $support=User::factory()->create(['is_admin'=>true,'role'=>'support_staff']); $this->actingAs($support)->get('/staff/notifications')->assertOk(); $this->get('/staff/newsletter')->assertForbidden();
    }
    public function test_customer_and_demoted_staff_cannot_access_pages(): void
    {
        foreach (['notifications','newsletter'] as $slug) { $this->actingAs(User::factory()->create())->get('/staff/'.$slug)->assertForbidden(); }
        $this->staff->update(['is_admin'=>false]); foreach (['notifications','newsletter'] as $slug) { $this->actingAs($this->staff)->get('/staff/'.$slug)->assertForbidden(); }
    }
    public function test_notification_scope_excludes_other_recipients_and_morph_types(): void
    {
        $own=$this->notification($this->staff,['message'=>'Own private notification']); $this->notification(User::factory()->create(),['message'=>'OTHER PRIVATE RECIPIENT']); $this->notification($this->staff,['message'=>'OTHER MORPH TYPE'],'OtherModel');
        $this->actingAs($this->staff); Livewire::test(StaffNotifications::class)->assertSee('Own private notification')->assertDontSee('OTHER PRIVATE RECIPIENT')->assertDontSee('OTHER MORPH TYPE'); $this->assertSame([$own],app(StaffInbox::class)->query($this->staff)->pluck('id')->all());
    }
    public function test_mark_read_is_own_scoped_idempotent_and_sends_no_mail(): void
    {
        $id=$this->notification($this->staff); $this->actingAs($this->staff); Livewire::test(StaffNotifications::class)->call('markRead',$id)->assertHasNoErrors(); $stamp=DB::table('notifications')->where('id',$id)->value('read_at'); $this->assertNotNull($stamp);
        $this->assertFalse(app(StaffInbox::class)->markRead($this->staff,$id)); $this->assertSame($stamp,DB::table('notifications')->where('id',$id)->value('read_at')); $this->assertDatabaseCount('notifications',1); Mail::assertNothingSent();
    }
    public function test_forged_other_recipient_notification_id_is_not_found(): void
    {
        $id=$this->notification(User::factory()->create()); $this->actingAs($this->staff); try { app(StaffInbox::class)->markRead($this->staff,$id); $this->fail('Expected scoped not found'); } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) { $this->assertDatabaseHas('notifications',['id'=>$id,'read_at'=>null]); }
    }
    public function test_filters_escape_payload_and_ignore_unsafe_stored_link(): void
    {
        $id=$this->notification($this->staff,['title'=>'<script>alert(1)</script>','message'=>'<img src=x onerror=alert(1)>','url'=>'javascript:alert(1)']); $this->actingAs($this->staff);
        Livewire::test(StaffNotifications::class)->assertSee('&lt;script&gt;',false)->assertDontSee('<script>alert(1)</script>',false)->assertDontSee('javascript:alert(1)',false);
        $this->assertTrue(app(StaffInbox::class)->markRead($this->staff,$id)); Livewire::test(StaffNotifications::class)->assertDontSee('&lt;script&gt;',false)->set('status','read')->assertSee('&lt;script&gt;',false)->set('status','all')->assertSee('&lt;script&gt;',false);
    }
    public function test_missing_optional_payload_fields_are_safe_and_view_does_not_mark_read(): void
    {
        $id=$this->notification($this->staff,['title'=>['bad'],'message'=>['bad'],'url'=>'https://example.test/private']); $this->actingAs($this->staff); Livewire::test(StaffNotifications::class)->assertSee('No message text stored.')->assertDontSee('https://example.test/private',false); $this->assertDatabaseHas('notifications',['id'=>$id,'read_at'=>null]);
    }
    public function test_cached_demoted_actor_cannot_mark_read(): void
    {
        $id=$this->notification($this->staff); User::whereKey($this->staff->id)->update(['is_admin'=>false]); try { app(StaffInbox::class)->markRead($this->staff,$id); $this->fail('Expected forbidden'); } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) { $this->assertSame(403,$e->getStatusCode()); } $this->assertDatabaseHas('notifications',['id'=>$id,'read_at'=>null]);
    }
    public function test_newsletter_filters_search_and_optout_are_readonly(): void
    {
        $active=NewsletterSubscriber::create(['email'=>'active@example.test']); $out=NewsletterSubscriber::create(['email'=>'optout@example.test','unsubscribed_at'=>now()]); $before=$out->getRawOriginal(); $this->actingAs($this->staff);
        $page=Livewire::test(StaffNewsletter::class)->assertSee('active@example.test')->assertDontSee('optout@example.test')->set('status','unsubscribed')->assertSee('optout@example.test')->assertDontSee('active@example.test')->set('status','all')->set('search','active@')->assertSee('active@example.test')->assertDontSee('optout@example.test');
        $this->assertEquals($before,$out->fresh()->getRawOriginal()); $this->assertDatabaseCount('newsletter_subscribers',2); Mail::assertNothingSent();
    }
    public function test_notification_and_newsletter_pagination_is_bounded(): void
    {
        for ($i=1;$i<=22;$i++) { $this->notification($this->staff,['message'=>'Message '.$i]); NewsletterSubscriber::create(['email'=>'subscriber'.$i.'@example.test']); }
        $this->actingAs($this->staff); $inbox=Livewire::test(StaffNotifications::class); $subs=Livewire::test(StaffNewsletter::class);
        $inbox->assertViewHas('notifications',fn ($p): bool => $p->count()===15); $subs->assertViewHas('subscribers',fn ($p): bool => $p->count()===20); $subs->assertViewHas('subscribedCount',22);
    }
    public function test_legacy_handoff_handles_inertia_versions_without_replaying_mark_actions(): void
    {
        $id=$this->notification($this->staff); $this->actingAs($this->staff)->withHeaders(['X-Inertia'=>'true','X-Inertia-Version'=>'old']);
        $this->get('/admin/notifications')->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/notifications')); $this->get('/admin/newsletter')->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/newsletter'));
        $this->patch('/admin/notifications/'.$id.'/read')->assertStatus(409); $this->post('/admin/notifications/read-all')->assertStatus(409); $this->assertDatabaseHas('notifications',['id'=>$id,'read_at'=>null]);
    }
    public function test_plain_legacy_handoff_is_full_page_redirect(): void
    {
        $this->actingAs($this->staff)->get('/admin/notifications')->assertRedirect('/staff/notifications'); $this->get('/admin/newsletter')->assertRedirect('/staff/newsletter');
    }
    public function test_quicklinks_respect_role_and_customer_menu_stays_hidden(): void
    {
        $this->actingAs($this->staff); $paths=array_column(app(StaffQuickLinks::class)->links(),'path'); $this->assertContains('/staff/notifications',$paths); $this->assertContains('/staff/newsletter',$paths); $this->assertNotContains('/staff/customers',$paths);
        $support=User::factory()->create(['is_admin'=>true,'role'=>'support_staff']); $this->actingAs($support); $paths=array_column(app(StaffQuickLinks::class)->links(),'path'); $this->assertContains('/staff/notifications',$paths); $this->assertNotContains('/staff/newsletter',$paths);
    }
    public function test_schema_check_is_read_only(): void
    {
        $this->artisan('staff:check-inbox-schema')->assertExitCode(0); $this->assertDatabaseCount('newsletter_subscribers',0); $this->assertDatabaseCount('notifications',0);
    }
}
