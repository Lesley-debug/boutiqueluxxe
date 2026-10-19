<?php
namespace App\Filament\Resources\Collections\Pages;
use App\Filament\Resources\Collections\CollectionResource;
use App\Services\StaffCatalogOrganizer;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;
class EditCollection extends EditRecord
{
    protected static string $resource = CollectionResource::class;
    protected ?bool $hasDatabaseTransactions = false;
    protected function mutateFormDataBeforeFill(array $data): array { $data['expected_snapshot'] = app(StaffCatalogOrganizer::class)->fingerprint($this->record); $data['product_ids'] = $this->record->products()->orderBy('products.id')->pluck('products.id')->all(); return $data; }
    protected function handleRecordUpdate(Model $record, array $data): Model { return app(StaffCatalogOrganizer::class)->collection(auth('web')->user(),$data,$record,'data.'); }
    protected function afterSave(): void { $this->record=$this->record->fresh(); $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray())); }
    protected function getHeaderActions(): array { return [\Filament\Actions\Action::make('viewHeroImage')->label('View current hero image')->visible(fn (): bool => (bool)$this->getRecord()->hero_image)->url(fn (): string => $this->getRecord()->hero_image_url ?? '#')->openUrlInNewTab()]; }
}
