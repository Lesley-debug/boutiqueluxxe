<?php
namespace Tests\Feature;
use App\Models\{HomepageContent,HeroSlide,AboutPage,JournalPost,Testimonial,User};
use App\Services\{StaffContentEditor,ContentSafety,ContentUpload};
use App\Filament\Resources\Homepage\Pages\EditHomepageContent;
use App\Filament\Resources\About\Pages\EditAboutPage;
use App\Filament\Resources\HeroSlides\Pages\{CreateHeroSlide,EditHeroSlide};
use App\Filament\Resources\Journal\Pages\{CreateJournalPost,EditJournalPost};
use App\Filament\Resources\Testimonials\Pages\{CreateTestimonial,EditTestimonial};
use Filament\Facades\Filament;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\{Gate,Storage};
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;
class StaffContentBatchTest extends TestCase
{
    use RefreshDatabase;
    private User $staff;
    protected function setUp(): void
    {
        parent::setUp(); config(['auth_features.email_verification_required'=>true]); Storage::fake('public');
        $this->staff=User::factory()->create(['is_admin'=>true,'role'=>'manager']); Filament::setCurrentPanel(Filament::getPanel('staff'));
    }
    private function editor(): StaffContentEditor { return app(StaffContentEditor::class); }
    private function image(string $name='photo.png'): UploadedFile { return UploadedFile::fake()->createWithContent($name,base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGN4/fASAAVZAp+CZz2gAAAAAElFTkSuQmCC')); }
    private function data($r,array $extra=[]): array { return array_replace($r->attributesToArray(),['expected_snapshot'=>$this->editor()->fingerprint($r)],$extra); }
    private function slide(array $extra=[]): HeroSlide { return $this->editor()->save($this->staff,HeroSlide::class,array_replace(['title'=>'Test campaign','active'=>false,'sort_order'=>0],$extra)); }
    private function journal(array $extra=[]): JournalPost { return $this->editor()->save($this->staff,JournalPost::class,array_replace(['title'=>'Test article','content'=>'<p>Real article words.</p>','status'=>'draft'],$extra)); }
    private function invalid(callable $fn): void { try { $fn(); $this->fail('Expected validation refusal'); } catch (ValidationException $e) { $this->assertNotEmpty($e->errors()); } }
    public function test_manager_content_pages_render_and_support_is_denied(): void
    {
        foreach (['homepage','about','hero-slides','journal','testimonials'] as $slug) { $this->actingAs($this->staff)->get('/staff/'.$slug)->assertOk()->assertHeader('X-Robots-Tag','noindex, nofollow, noarchive'); }
        $support=User::factory()->create(['is_admin'=>true,'role'=>'support_staff']); foreach (['homepage','about','hero-slides','journal','testimonials'] as $slug) { $this->actingAs($support)->get('/staff/'.$slug)->assertForbidden(); }
    }
    public function test_customer_cannot_access_content_and_cached_demoted_actor_cannot_save(): void
    {
        $this->actingAs(User::factory()->create())->get('/staff/homepage')->assertForbidden(); User::whereKey($this->staff->id)->update(['is_admin'=>false]);
        $this->expectException(AuthorizationException::class); $this->slide();
    }
    public function test_schema_check_is_read_only_and_singleton_create_delete_are_disabled(): void
    {
        $this->artisan('content:check-schema')->assertExitCode(0); $this->assertDatabaseCount('homepage_content',0); $this->assertDatabaseCount('about_page',0);
        $r=AboutPage::current(); $this->assertFalse(Gate::forUser($this->staff)->allows('create',AboutPage::class)); $this->assertFalse(Gate::forUser($this->staff)->allows('delete',$r));
    }
    public function test_hero_activation_requires_image_and_safe_public_links(): void
    {
        $this->invalid(fn ()=>$this->slide(['active'=>true]));
        foreach (['javascript:alert(1)','//evil.example','https://evil.example','/staff','/%2fexample.com',"/shop\\evil"] as $bad) { $this->invalid(fn ()=>$this->slide(['primary_cta_url'=>$bad])); }
        $s=$this->slide(['active'=>true,'new_image'=>$this->image(),'primary_cta_url'=>'/shop?category=bags']); $this->assertTrue($s->active); Storage::disk('public')->assertExists($s->image);
    }
    public function test_media_replacement_preserves_old_file_and_deactivation_preserves_new_media(): void
    {
        $s=$this->slide(['active'=>true,'new_image'=>$this->image()]); $old=$s->image;
        $saved=$this->editor()->save($this->staff,HeroSlide::class,$this->data($s,['new_image'=>$this->image('new.png'),'image'=>'forged/path.png','active'=>false]),$s);
        $this->assertNotSame($old,$saved->image); Storage::disk('public')->assertExists($old); Storage::disk('public')->assertExists($saved->image); $this->assertFalse($saved->active);
    }
    public function test_upload_string_path_and_svg_are_rejected_without_new_rows(): void
    {
        $this->invalid(fn ()=>$this->slide(['new_image'=>'hero/other.png'])); $this->invalid(fn ()=>$this->slide(['new_image'=>UploadedFile::fake()->createWithContent('bad.svg','<svg xmlns="http://www.w3.org/2000/svg"><script>bad()</script></svg>')])); $this->assertDatabaseCount('hero_slides',0);
    }
    public function test_failed_publication_discards_only_new_media_and_rolls_back_row(): void
    {
        Storage::disk('public')->put('hero/keep.png','keep');
        $this->invalid(fn ()=>$this->editor()->save($this->staff,JournalPost::class,['title'=>'Bad','content'=>'<script>bad()</script>','status'=>'published','new_cover_image'=>$this->image()]));
        $this->assertDatabaseCount('journal_posts',0); $this->assertSame(['hero/keep.png'],Storage::disk('public')->allFiles());
    }
    public function test_homepage_keeps_existing_paths_and_can_unlink_video_without_deleting_file(): void
    {
        $r=HomepageContent::current(); $r->update(['editorial_video'=>'homepage/keep.mp4','editorial_image'=>'homepage/keep.png']); Storage::disk('public')->put('homepage/keep.mp4','existing'); $r=$r->fresh();
        $saved=$this->editor()->save($this->staff,HomepageContent::class,$this->data($r,['editorial_title'=>'New campaign','editorial_image'=>'forged.png','remove_editorial_video'=>true]),$r);
        $this->assertNull($saved->editorial_video); $this->assertSame('homepage/keep.png',$saved->editorial_image); Storage::disk('public')->assertExists('homepage/keep.mp4');
    }
    public function test_homepage_rejects_external_cta_and_about_titles_cannot_be_blank(): void
    {
        $r=HomepageContent::current(); $this->invalid(fn ()=>$this->editor()->save($this->staff,HomepageContent::class,$this->data($r,['editorial_cta_url'=>'https://outside.example']),$r));
        $about=AboutPage::current(); $this->invalid(fn ()=>$this->editor()->save($this->staff,AboutPage::class,$this->data($about,['hero_title'=>' ']),$about));
    }
    public function test_fingerprints_ignore_display_aliases_but_real_edits_reject_stale_snapshots(): void
    {
        $s=$this->slide(); $copy=clone $s; $copy->setRawAttributes(array_replace($s->getRawOriginal(),['display_count'=>10]),true); $this->assertSame($this->editor()->fingerprint($s),$this->editor()->fingerprint($copy));
        $data=$this->data($s,['title'=>'Old tab']); $s->update(['title'=>'Another staff member']); $this->invalid(fn ()=>$this->editor()->save($this->staff,HeroSlide::class,$data,$s)); $this->assertSame('Another staff member',$s->fresh()->title);
    }
    public function test_journal_generates_unique_urls_and_preserves_url_and_original_publication_date(): void
    {
        $a=$this->journal(['status'=>'published']); $b=$this->journal(); $this->assertNotSame($a->slug,$b->slug); $date=$a->published_at->toDateTimeString(); $slug=$a->slug;
        $a=$this->editor()->save($this->staff,JournalPost::class,$this->data($a,['title'=>'Renamed','slug'=>'forged','status'=>'draft']),$a);
        $a=$this->editor()->save($this->staff,JournalPost::class,$this->data($a,['status'=>'published','published_at'=>'2000-01-01']),$a);
        $this->assertSame($slug,$a->slug); $this->assertSame($date,$a->published_at->toDateTimeString());
    }
    public function test_journal_sanitizer_keeps_formatting_but_removes_active_markup_and_unsafe_links(): void
    {
        $html='<h2>Heading</h2><p onclick="bad()">Text <strong>bold</strong><a href="javascript:bad()">bad</a><a href="https://example.com">safe</a></p><script>secret-script</script><iframe src="https://evil.example"></iframe>';
        $safe=app(ContentSafety::class)->html($html); $this->assertStringContainsString('<h2>Heading</h2>',$safe); $this->assertStringContainsString('<strong>bold</strong>',$safe);
        foreach (['onclick','javascript:','<script','secret-script','<iframe'] as $bad) { $this->assertStringNotContainsString($bad,$safe); } $this->assertStringContainsString('https://example.com',$safe);
    }
    public function test_unpublished_article_is_not_public_or_in_sitemap(): void
    {
        $draft=$this->journal(); $live=$this->journal(['title'=>'Live article','status'=>'published']); $this->get('/journal/'.$draft->slug)->assertNotFound(); $this->get('/journal/'.$live->slug)->assertOk();
        $sitemap=$this->get('/sitemap.xml')->assertOk(); $sitemap->assertDontSee('/journal/'.$draft->slug,false)->assertSee('/journal/'.$live->slug,false);
    }
    public function test_testimonial_publication_requires_genuine_feedback_acknowledgement(): void
    {
        $data=['customer_name'=>'Test customer','quote'=>'Local test feedback only.','rating'=>5,'active'=>true,'sort_order'=>0];
        $this->invalid(fn ()=>$this->editor()->save($this->staff,Testimonial::class,$data));
        $r=$this->editor()->save($this->staff,Testimonial::class,array_replace($data,['confirm_authenticity'=>true])); $this->assertTrue($r->active);
        $this->invalid(fn ()=>$this->editor()->save($this->staff,Testimonial::class,$this->data($r,['quote'=>'Changed feedback']),$r));
        $r=$this->editor()->save($this->staff,Testimonial::class,$this->data($r,['active'=>false]),$r); $this->assertFalse($r->active); $this->assertFalse(Gate::forUser($this->staff)->allows('delete',$r));
    }
    public function test_rating_bounds_and_private_input_cannot_change_ids_or_publication_dates(): void
    {
        $this->invalid(fn ()=>$this->editor()->save($this->staff,Testimonial::class,['customer_name'=>'Test','quote'=>'Local test','rating'=>6,'active'=>false,'sort_order'=>0]));
        $s=$this->slide(['id'=>99999,'created_at'=>'2000-01-01']); $this->assertNotSame(99999,$s->id);
    }
    public function test_livewire_homepage_and_about_save_and_repeat_save_use_canonical_snapshots(): void
    {
        $this->actingAs($this->staff);
        $page=Livewire::test(EditHomepageContent::class); $page->fillForm(['editorial_title'=>'Local campaign'])->call('save',false)->assertHasNoFormErrors(); $page->fillForm(['editorial_title'=>'Second local campaign'])->call('save',false)->assertHasNoFormErrors(); $this->assertSame('Second local campaign',HomepageContent::current()->editorial_title);
        Livewire::test(EditAboutPage::class)->fillForm(['hero_title'=>'About our store'])->call('save',false)->assertHasNoFormErrors(); $this->assertSame('About our store',AboutPage::current()->hero_title);
    }
    public function test_livewire_hero_create_edit_and_real_stale_form_refusal(): void
    {
        $this->actingAs($this->staff); Livewire::test(CreateHeroSlide::class)->fillForm(['title'=>'Draft campaign','active'=>false,'sort_order'=>0])->call('create')->assertHasNoFormErrors(); $s=HeroSlide::firstOrFail();
        $page=Livewire::test(EditHeroSlide::class,['record'=>$s->id]); $s->update(['title'=>'Concurrent edit']); $page->fillForm(['title'=>'Old tab edit'])->call('save')->assertHasFormErrors(['title']); $this->assertSame('Concurrent edit',$s->fresh()->title);
    }
    public function test_livewire_journal_and_testimonial_editor_paths_work(): void
    {
        $this->actingAs($this->staff); Livewire::test(CreateJournalPost::class)->fillForm(['title'=>'Mobile article','content'=>'<p>Article text.</p>','status'=>'draft'])->call('create')->assertHasNoFormErrors();
        $post=JournalPost::firstOrFail(); Livewire::test(EditJournalPost::class,['record'=>$post->id])->fillForm(['title'=>'Mobile article renamed'])->call('save',false)->assertHasNoFormErrors(); $this->assertSame('Mobile article renamed',$post->fresh()->title);
        Livewire::test(CreateTestimonial::class)->fillForm(['customer_name'=>'Test only','quote'=>'Local feedback.','rating'=>4,'active'=>false,'sort_order'=>0])->call('create')->assertHasNoFormErrors(); $t=Testimonial::firstOrFail();
        Livewire::test(EditTestimonial::class,['record'=>$t->id])->fillForm(['quote'=>'Updated local feedback.'])->call('save',false)->assertHasNoFormErrors(); $this->assertSame('Updated local feedback.',$t->fresh()->quote);
    }
    public function test_legacy_content_handoff_survives_stale_inertia_versions_and_old_writes_are_not_replayed(): void
    {
        $this->actingAs($this->staff)->withHeaders(['X-Inertia'=>'true','X-Inertia-Version'=>'old']);
        foreach (['homepage'=>'homepage','about-page'=>'about','hero-slides'=>'hero-slides','journal'=>'journal','testimonials'=>'testimonials'] as $old=>$new) { $this->get('/admin/'.$old)->assertStatus(409)->assertHeader('X-Inertia-Location',url('/staff/'.$new)); }
        $r=HomepageContent::current(); $this->put('/admin/homepage',['editorial_title'=>'Should not replay'])->assertStatus(409); $this->assertNull($r->fresh()->editorial_title);
        $s=$this->slide(); $this->delete('/admin/hero-slides/'.$s->id)->assertStatus(409); $this->assertDatabaseHas('hero_slides',['id'=>$s->id]);
    }
    public function test_new_create_edit_routes_render_for_all_list_resources(): void
    {
        $s=$this->slide(); $p=$this->journal(); $t=$this->editor()->save($this->staff,Testimonial::class,['customer_name'=>'Test only','quote'=>'Local feedback.','rating'=>5,'active'=>false,'sort_order'=>0]);
        foreach (['/staff/hero-slides/create','/staff/hero-slides/'.$s->id.'/edit','/staff/journal/create','/staff/journal/'.$p->id.'/edit','/staff/testimonials/create','/staff/testimonials/'.$t->id.'/edit'] as $url) { $this->actingAs($this->staff)->get($url)->assertOk(); }
    }

    public function test_singleton_save_cannot_write_another_row_and_unauthorized_mount_does_not_create_data(): void
    {
        $other=new AboutPage; $other->id=2; $other->save();
        try { $this->editor()->save($this->staff,AboutPage::class,$this->data($other,['hero_title'=>'Wrong singleton']),$other); $this->fail('Expected singleton refusal'); }
        catch (AuthorizationException $e) { $this->assertTrue(true); }
        $this->actingAs($this->staff)->get('/staff/about')->assertOk(); $this->assertDatabaseHas('about_page',['id'=>1]); $this->assertDatabaseHas('about_page',['id'=>2]);
        $support=User::factory()->create(['is_admin'=>true,'role'=>'support_staff']); $this->actingAs($support)->get('/staff/homepage')->assertForbidden(); $this->assertDatabaseCount('homepage_content',0);
    }
    public function test_svg_and_entity_encoded_script_links_are_removed_and_blank_markup_rejected(): void
    {
        $safe=app(ContentSafety::class)->html('<svg><a href="javascript:bad()">bad svg</a></svg><p><a href="jav&#x61;script:bad()">Text</a></p>');
        $this->assertStringNotContainsString('<svg',$safe); $this->assertStringNotContainsString('javascript:',$safe);
        $this->invalid(fn ()=>$this->journal(['content'=>'<p>&nbsp;</p>']));
    }
    public function test_invalid_video_input_preserves_existing_video(): void
    {
        $r=HomepageContent::current(); $r->update(['editorial_video'=>'homepage/old.mp4']); $r=$r->fresh();
        $this->invalid(fn ()=>$this->editor()->save($this->staff,HomepageContent::class,$this->data($r,['new_editorial_video'=>UploadedFile::fake()->createWithContent('not-video.mp4','plain text')]),$r));
        $this->assertSame('homepage/old.mp4',$r->fresh()->editorial_video);
    }

    public function test_invalid_detected_video_mime_has_upload_field_error_and_retains_files(): void
    {
        $r=HomepageContent::current(); $r->update(['editorial_video'=>'homepage/keep.mp4']); $r=$r->fresh();
        Storage::disk('public')->put('homepage/keep.mp4','existing media');
        try {
            $this->editor()->save($this->staff,HomepageContent::class,$this->data($r,['new_editorial_video'=>UploadedFile::fake()->createWithContent('bad.mp4','plain text')]),$r,'data.');
            $this->fail('Expected upload validation error');
        } catch (ValidationException $e) { $this->assertArrayHasKey('data.new_editorial_video',$e->errors()); }
        $this->assertSame('homepage/keep.mp4',$r->fresh()->editorial_video);
        Storage::disk('public')->assertExists('homepage/keep.mp4');
        $this->assertSame(['homepage/keep.mp4'],Storage::disk('public')->allFiles());
    }
    public function test_bad_second_media_upload_does_not_store_first_valid_upload(): void
    {
        $r=HomepageContent::current();
        $this->invalid(fn ()=>$this->editor()->save($this->staff,HomepageContent::class,$this->data($r,['new_editorial_image'=>$this->image(),'new_editorial_video'=>UploadedFile::fake()->createWithContent('bad.mp4','plain text')]),$r));
        $this->assertSame([],Storage::disk('public')->allFiles());
        $this->assertNull($r->fresh()->editorial_image);
    }
    public function test_livewire_bad_video_is_a_field_error_not_a_server_exception(): void
    {
        $this->actingAs($this->staff);
        Livewire::test(EditHomepageContent::class)->fillForm(['new_editorial_video'=>UploadedFile::fake()->createWithContent('bad.mp4','plain text')])->call('save')->assertHasFormErrors(['new_editorial_video']);
        $this->assertNull(HomepageContent::current()->editorial_video);
        $this->assertSame([],Storage::disk('public')->allFiles());
    }
}
