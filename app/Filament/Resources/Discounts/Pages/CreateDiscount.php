<?php
namespace App\Filament\Resources\Discounts\Pages;
use App\Filament\Resources\Discounts\DiscountResource;
use App\Services\StaffCatalogOrganizer;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
class CreateDiscount extends CreateRecord
{
    protected static string $resource = DiscountResource::class;
    protected static bool $canCreateAnother = false;
    protected ?bool $hasDatabaseTransactions = false;
    protected function handleRecordCreation(array $data): Model { return app(StaffCatalogOrganizer::class)->discount(auth('web')->user(), $data, prefix: 'data.'); }
    protected function getRedirectUrl(): string { return static::getResource()::getUrl('edit',['record'=>$this->record],panel:'staff'); }
}
