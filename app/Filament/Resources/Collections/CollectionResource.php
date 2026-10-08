<?php
namespace App\Filament\Resources\Collections;
use App\Filament\Resources\Collections\Pages\CreateCollection;
use App\Filament\Resources\Collections\Pages\EditCollection;
use App\Filament\Resources\Collections\Pages\ListCollections;
use App\Models\Collection;
use App\Support\StaffWorkspaceAccess;
use BackedEnum;
use UnitEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\{TextInput, Textarea, Select, Toggle, Hidden, FileUpload, DateTimePicker};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\Layout\{Split, Stack};
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
class CollectionResource extends Resource
{
    protected static ?string $model = Collection::class;
    protected static ?string $slug = 'collections';
    protected static ?string $recordTitleAttribute = 'name';
    protected static string | UnitEnum | null $navigationGroup = 'Catalog';
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-folder';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery()->withCount('products'); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'), TextInput::make('slug')->label('Existing URL identifier')->disabled()->dehydrated(false)->visible(fn (?Collection $record): bool => $record?->exists ?? false), 
            TextInput::make('name')->required()->maxLength(255),
            Textarea::make('description')->maxLength(10000),
            Select::make('product_ids')->label('Products')->multiple()->searchable()->options(fn (): array => \App\Models\Product::orderBy('name')->pluck('name','id')->all())->helperText('Choose up to 500 products. Public pages still hide inactive products.'),
            FileUpload::make('new_image')->label('Add / replace hero image')->image()->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->helperText('Leave empty to keep the current image. Old files are retained for rollback.'),
            Toggle::make('active')->default(false)->helperText('Activate only after selecting at least one active product. Turn off to archive without deleting links or images.'),
            TextInput::make('sort_order')->numeric()->required()->default(0)->minValue(0),
 ])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('name')->searchable()->weight('bold')->wrap(), TextColumn::make('slug')->color('gray')->wrap(), TextColumn::make('active')->formatStateUsing(fn ($state): string => $state ? 'Active' : 'Archived')->badge(), TextColumn::make('products_count')->suffix(' products')])])->from('md')])->defaultSort('id','desc')->recordActions([EditAction::make()]); }
    public static function getPages(): array { return ['index'=>ListCollections::route('/'),'create'=>CreateCollection::route('/create'),'edit'=>EditCollection::route('/{record}/edit')]; }
}
