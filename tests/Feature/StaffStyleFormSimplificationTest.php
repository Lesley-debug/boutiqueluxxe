<?php

namespace Tests\Feature;

use App\Filament\Resources\Styles\Pages\CreateStyle;
use App\Filament\Resources\Styles\Pages\EditStyle;
use App\Filament\Resources\Styles\Pages\ListStyles;
use App\Models\Style;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class StaffStyleFormSimplificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth_features.email_verification_required' => true]);
        Storage::fake('public');
        $this->actingAs(User::factory()->create(['is_admin' => true, 'role' => 'manager']));
        Filament::setCurrentPanel(Filament::getPanel('staff'));
    }

    public function test_style_creation_has_no_photo_controls_and_still_generates_a_url(): void
    {
        Livewire::test(CreateStyle::class)
            ->assertFormFieldExists('name')
            ->assertFormFieldDoesNotExist('new_image')
            ->assertFormFieldDoesNotExist('current_image')
            ->fillForm(['name' => 'Tote Bags'])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('styles', ['name' => 'Tote Bags', 'slug' => 'tote-bags', 'image' => null]);
    }

    public function test_style_edit_preserves_existing_url_image_value_and_file(): void
    {
        $style = Style::create(['name' => 'Tote Bags', 'slug' => 'tote-bags', 'image' => 'styles/legacy-photo.png']);
        Storage::disk('public')->put($style->image, 'existing photo bytes');

        Livewire::test(EditStyle::class, ['record' => $style->id])
            ->assertFormFieldExists('name')
            ->assertFormFieldExists('slug')
            ->assertFormFieldDoesNotExist('new_image')
            ->assertFormFieldDoesNotExist('current_image')
            ->fillForm(['name' => 'Everyday Totes'])
            ->call('save', false)
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('styles', ['id' => $style->id, 'name' => 'Everyday Totes', 'slug' => 'tote-bags', 'image' => 'styles/legacy-photo.png']);
        Storage::disk('public')->assertExists('styles/legacy-photo.png');
        $this->assertSame('existing photo bytes', Storage::disk('public')->get('styles/legacy-photo.png'));
    }

    public function test_style_list_has_names_urls_and_counts_but_no_thumbnail_column(): void
    {
        $component = Livewire::test(ListStyles::class);
        $columns = $component->instance()->getTable()->getColumns();
        $this->assertArrayHasKey('name', $columns);
        $this->assertArrayHasKey('slug', $columns);
        $this->assertArrayHasKey('products_count', $columns);
        $this->assertArrayNotHasKey('image_url', $columns);
    }
}
