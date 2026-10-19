<?php
namespace App\Filament\Resources\Discounts\Pages;
use App\Filament\Resources\Discounts\DiscountResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions\CreateAction;
class ListDiscounts extends ListRecords { protected static string $resource = DiscountResource::class; protected function getHeaderActions(): array { return [CreateAction::make()]; } }
