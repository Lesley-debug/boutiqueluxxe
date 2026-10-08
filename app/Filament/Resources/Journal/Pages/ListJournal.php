<?php
namespace App\Filament\Resources\Journal\Pages;
use App\Filament\Resources\Journal\JournalPostResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Actions\CreateAction;
class ListJournal extends ListRecords { protected static string $resource=JournalPostResource::class; protected function getHeaderActions(): array { return [CreateAction::make()]; } }
