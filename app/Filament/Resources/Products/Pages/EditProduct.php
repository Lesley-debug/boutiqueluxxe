<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Services\StaffProductEditor;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;
    protected ?bool $hasDatabaseTransactions = false;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        return app(StaffProductEditor::class)->formData($this->getRecord());
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        return app(StaffProductEditor::class)->save(auth('web')->user(), $data, $record, 'data.');
    }

    protected function afterSave(): void
    {
        // Clear uploaded files and stock deltas after a successful save.
        $this->record = $this->record->fresh();
        $this->form->fill($this->mutateFormDataBeforeFill($this->record->attributesToArray()));
    }

    protected function getHeaderActions(): array
    {
        return []; // No destructive delete actions.
    }
}
