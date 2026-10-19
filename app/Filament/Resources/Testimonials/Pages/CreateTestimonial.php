<?php
namespace App\Filament\Resources\Testimonials\Pages;
use App\Filament\Resources\Testimonials\TestimonialResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
class CreateTestimonial extends CreateRecord
{
    protected static string $resource=TestimonialResource::class;
    protected static bool $canCreateAnother=false;
    protected ?bool $hasDatabaseTransactions=false;
    protected function handleRecordCreation(array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\Testimonial::class,$data,prefix:'data.'); }
    protected function getRedirectUrl(): string { return static::getResource()::getUrl('edit',['record'=>$this->record],panel:'staff'); }
}
