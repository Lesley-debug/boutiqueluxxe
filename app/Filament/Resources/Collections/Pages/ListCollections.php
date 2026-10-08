<?php
namespace App\Filament\Resources\Collections\Pages;
use App\Filament\Resources\Collections\CollectionResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions\CreateAction;
class ListCollections extends ListRecords { protected static string $resource = CollectionResource::class; protected function getHeaderActions(): array { return [CreateAction::make()]; } }
