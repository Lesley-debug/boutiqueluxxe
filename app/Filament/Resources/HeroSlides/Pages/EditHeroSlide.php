<?php
namespace App\Filament\Resources\HeroSlides\Pages;
use App\Filament\Resources\HeroSlides\HeroSlideResource;
use App\Services\StaffContentEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditHeroSlide extends EditRecord
{
    protected static string $resource=HeroSlideResource::class;
    protected ?bool $hasDatabaseTransactions=false;

    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot']=app(StaffContentEditor::class)->fingerprint($this->record);  return $data; }
    protected function handleRecordUpdate(Model $record,array $data): Model { return app(StaffContentEditor::class)->save(auth('web')->user(),\App\Models\HeroSlide::class,$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return [\Filament\Actions\Action::make('preview_image')->label('View current image')->visible(fn (): bool => (bool)$this->getRecord()->image)->url(fn (): string => $this->getRecord()->image_url ?? '#')->openUrlInNewTab()]; }
}
