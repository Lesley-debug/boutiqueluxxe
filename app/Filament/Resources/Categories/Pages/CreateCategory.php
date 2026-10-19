<?php
namespace App\Filament\Resources\Categories\Pages;
use App\Filament\Resources\Categories\CategoryResource;
use App\Services\StaffCatalogOrganizer;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
class CreateCategory extends CreateRecord
{
    protected static string $resource = CategoryResource::class;
    protected static bool $canCreateAnother = false;
    protected ?bool $hasDatabaseTransactions = false;
    protected function handleRecordCreation(array $data): Model { return app(StaffCatalogOrganizer::class)->category(auth('web')->user(), $data, prefix: 'data.'); }
    protected function getRedirectUrl(): string { return static::getResource()::getUrl('edit',['record'=>$this->record],panel:'staff'); }
}
