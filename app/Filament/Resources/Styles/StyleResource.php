<?php

namespace App\Filament\Resources\Styles;

use App\Filament\Resources\Styles\Pages\CreateStyle;
use App\Filament\Resources\Styles\Pages\EditStyle;
use App\Filament\Resources\Styles\Pages\ListStyles;
use App\Models\Style;
use App\Support\CatalogAccess;
use BackedEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

class StyleResource extends Resource
{
    protected static ?string $model = Style::class;
    protected static ?string $slug = 'styles';
    protected static ?string $recordTitleAttribute = 'name';
    protected static string | UnitEnum | null $navigationGroup = 'Catalog';
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-swatch';
    protected static ?int $navigationSort = 2;

    public static function getEloquentQuery(): Builder
    {
        abort_unless(CatalogAccess::allows(auth('web')->user()), 403);

        return parent::getEloquentQuery()->withCount('products');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Style name')->required()->maxLength(100)->helperText('For example: Tote Bags, Crossbody or Evening Bags.'),
            TextInput::make('slug')->label('URL identifier')->disabled()->dehydrated(false)->visible(fn (?Style $record): bool => $record?->exists ?? false)->helperText('Generated automatically when created. Renaming a style does not change its existing URL.'),
        ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Split::make([
                Stack::make([
                    TextColumn::make('name')->searchable()->weight('bold')->wrap(),
                    TextColumn::make('slug')->color('gray')->wrap(),
                ]),
                TextColumn::make('products_count')->label('Products')->suffix(' products'),
            ])->from('md'),
        ])->defaultSort('name')->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ListStyles::route('/'), 'create' => CreateStyle::route('/create'), 'edit' => EditStyle::route('/{record}/edit')];
    }
}
