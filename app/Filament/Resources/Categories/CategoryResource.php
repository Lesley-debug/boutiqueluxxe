<?php
namespace App\Filament\Resources\Categories;
use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\EditCategory;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Models\Category;
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
class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;
    protected static ?string $slug = 'categories';
    protected static ?string $recordTitleAttribute = 'name';
    protected static string | UnitEnum | null $navigationGroup = 'Catalog';
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-folder';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery()->with('parent')->withCount('products'); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'), TextInput::make('slug')->label('Existing URL identifier')->disabled()->dehydrated(false)->visible(fn (?Category $record): bool => $record?->exists ?? false), 
            TextInput::make('name')->required()->maxLength(255),
            Select::make('parent_id')->label('Parent category')->searchable()->options(fn (): array => Category::whereNull('parent_id')->orderBy('name')->pluck('name','id')->all())->helperText('Leave empty for a top-level category. Two levels only; categories with children cannot become children.'),
            Select::make('status')->required()->default('active')->options(['active'=>'Active','inactive'=>'Inactive / archived'])->helperText('An inactive parent hides its children publicly without deleting them or their products.'),
            TextInput::make('sort_order')->numeric()->required()->default(0)->minValue(0),
 ])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('name')->searchable()->weight('bold')->wrap(), TextColumn::make('parent.name')->label('Parent')->wrap(), TextColumn::make('status')->badge(), TextColumn::make('products_count')->suffix(' products')])])->from('md')])->defaultSort('id','desc')->recordActions([EditAction::make()]); }
    public static function getPages(): array { return ['index'=>ListCategories::route('/'),'create'=>CreateCategory::route('/create'),'edit'=>EditCategory::route('/{record}/edit')]; }
}
