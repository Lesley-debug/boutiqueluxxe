<?php
namespace App\Filament\Resources\Testimonials\Pages;
use App\Filament\Resources\Testimonials\TestimonialResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditTestimonial extends EditRecord
{
    protected static string $resource=TestimonialResource::class;
    protected ?bool $hasDatabaseTransactions=false;

    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot']=app(StaffContentEditor::class)->fingerprint($this->record);  return $data; }
    protected function handleRecordUpdate(Model $record,array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\Testimonial::class,$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return []; }
}
