<?php
namespace App\Filament\Resources\Categories\Pages;
use App\Filament\Resources\Categories\CategoryResource;
use App\Services\StaffCatalogOrganizer;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditCategory extends EditRecord
{
    protected static string $resource = CategoryResource::class;
    protected ?bool $hasDatabaseTransactions = false;
    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot'] = app(StaffCatalogOrganizer::class)->fingerprint($this->record);  return $data; }
    protected function handleRecordUpdate(Model $record, array $data): Model { return app(StaffCatalogOrganizer::class)->category(auth('web')->user(),$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return []; }
}
