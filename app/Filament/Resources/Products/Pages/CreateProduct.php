<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Services\StaffProductEditor;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;
    protected static bool $canCreateAnother = false;
    protected ?bool $hasDatabaseTransactions = false;

    protected function handleRecordCreation(array $data): Model
    {
        return app(StaffProductEditor::class)->save(auth('web')->user(), $data, prefix: 'data.');
    }

    protected function getRedirectUrl(): string
    {
        return static::getResource()::getUrl('edit', ['record' => $this->record], panel: 'staff');
    }
}
