<?php

namespace App\Filament\Resources\Products;

use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Models\Category;
use App\Models\Product;
use App\Models\Style;
use App\Services\StaffProductEditor;
use App\Services\StaffStyleEditor;
use App\Support\CatalogAccess;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Wizard;
use Filament\Schemas\Components\Wizard\Step;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\HtmlString;
use UnitEnum;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $slug = 'products';
    protected static ?string $recordTitleAttribute = 'name';
    protected static string | UnitEnum | null $navigationGroup = 'Catalog';
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): Builder
    {
        abort_unless(CatalogAccess::allows(auth('web')->user()), 403);

        return parent::getEloquentQuery()->with(['category', 'style', 'variants', 'images']);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Wizard::make([
                Step::make('Details & price')->schema([
                    TextInput::make('name')->required()->maxLength(255)->columnSpanFull(),
                    Select::make('category_id')->label('Category')->required()->searchable()->options(fn (): array => Category::with('parent')->orderBy('name')->get()->mapWithKeys(fn (Category $category) => [$category->id => ($category->parent ? $category->parent->name.' / ' : '').$category->name])->all()),
                    Select::make('style_id')->label('Style')->searchable()->options(fn (): array => Style::orderBy('name')->pluck('name', 'id')->all())
                        ->createOptionForm([TextInput::make('name')->label('New style name')->required()->maxLength(100)])
                        ->createOptionUsing(fn (array $data): int => (int) app(StaffStyleEditor::class)->save(auth('web')->user(), $data)->getKey()),
                    TextInput::make('brand')->maxLength(255),
                    TextInput::make('slug')->label('Product URL identifier')->disabled()->dehydrated(false)->helperText('Generated from the product name on creation. Existing URLs stay unchanged.')->visible(fn (?Model $record): bool => $record?->exists ?? false),
                    Textarea::make('description')->rows(5)->maxLength(20000)->columnSpanFull(),
                    TextInput::make('base_price')->label('Regular price')->prefix(config('commerce.currency', 'USD'))->numeric()->minValue(0)->step('0.01')->required(),
                    TextInput::make('sale_price')->label('Sale price (optional)')->prefix(config('commerce.currency', 'USD'))->numeric()->minValue(0)->step('0.01')->lt('base_price'),
                ])->columns(['default' => 1, 'md' => 2]),
                Step::make('Options & stock')->schema([
                    Repeater::make('variant_rows')->label('Product options')->minItems(1)->maxItems(100)->defaultItems(1)->addActionLabel('Add another option')->reorderable(false)
                        ->deleteAction(fn (Action $action): Action => $action->visible(fn (array $arguments, Repeater $component): bool => isset($arguments['item']) && blank($component->getRawItemState($arguments['item'])['id'] ?? null)))
                        ->helperText('SKU codes are automatic when left blank. Existing variants are preserved. To remove a product from sale, archive it; do not delete its order history.')
                        ->schema([
                            Hidden::make('id'),
                            Hidden::make('expected_stock'),
                            TextInput::make('color')->maxLength(100),
                            TextInput::make('size')->label('Size / dimensions')->maxLength(50),
                            TextInput::make('material')->maxLength(100),
                            TextInput::make('sku')->label('SKU (optional for a new option)')->maxLength(100)->disabled(fn (Get $get): bool => filled($get('id'))),
                            TextInput::make('initial_stock')->label('Initial stock')->integer()->minValue(0)->maxValue(1000000)->default(0)->visible(fn (Get $get): bool => blank($get('id'))),
                            TextInput::make('current_stock')->label('Current stock')->disabled()->dehydrated(false)->visible(fn (Get $get): bool => filled($get('id'))),
                            TextInput::make('stock_adjustment')->label('Stock adjustment (+ / − units)')->integer()->minValue(-1000000)->maxValue(1000000)->default(0)->helperText('0 leaves stock unchanged. Reload if checkout has changed the displayed stock.')->visible(fn (Get $get): bool => filled($get('id'))),
                            TextInput::make('price_override')->label('Option price (optional)')->numeric()->minValue(0)->step('0.01')->helperText('Leave blank to use the product price.'),
                        ])->columns(['default' => 1, 'md' => 2])->columnSpanFull(),
                ]),
                Step::make('Photos')->schema([
                    FileUpload::make('new_photos')->label('Add photos')->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->multiple()->reorderable()->maxFiles(8)->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->helperText('JPG, PNG or WebP, up to 4 MB each. Drag to arrange new photos. The first photo becomes the cover if no cover exists.')->columnSpanFull(),
                    Repeater::make('image_rows')->label('Saved photos')->addable(false)->deletable(true)->reorderableWithButtons()->defaultItems(0)->schema([
                        Hidden::make('id'),
                        Placeholder::make('preview')->content(function (Get $get, ?Model $record): HtmlString | string {
                            $image = $record instanceof Product ? $record->images->firstWhere('id', $get('id')) : null;

                            return $image ? new HtmlString('<img src="'.e($image->url).'" alt="" style="width:120px;max-width:100%;height:100px;object-fit:contain;border-radius:8px">') : 'Photo preview';
                        }),
                        TextInput::make('alt_text')->label('Photo description')->maxLength(255),
                    ])->columns(['default' => 1, 'md' => 2])->visible(fn (?Model $record): bool => $record instanceof Product && $record->images->isNotEmpty())->columnSpanFull(),
                    Select::make('cover_image_id')->label('Cover photo')->options(fn (?Model $record): array => $record instanceof Product ? $record->images->values()->mapWithKeys(fn ($image, $index) => [$image->id => 'Photo '.($index + 1).' — '.($image->alt_text ?: 'Product photo')])->all() : [])
                        ->visible(fn (?Model $record): bool => $record instanceof Product && $record->images->isNotEmpty())
                        ->helperText('New photos can be selected here after saving. Saved photos and order history are not deleted by this form.'),
                ]),
                Step::make('Save & publish')->schema([
                    Select::make('status')->options(['draft' => 'Draft — hidden from customers', 'active' => 'Published', 'archived' => 'Archived — removed from sale'])->required()->default('draft')
                        ->helperText('Publishing requires an active category, a positive price and at least one photo. A zero-stock product may remain published as sold out.'),
                    Toggle::make('featured')->label('Feature on the storefront')->default(false),
                    Toggle::make('new_arrival')->label('Mark as a new arrival')->default(false),
                    Placeholder::make('save_notice')->content('Save completes the product, options and photos together. Review each step before saving. Archiving preserves previous orders and media.'),
                ]),
            ])->skippable(fn (?Model $record): bool => $record?->exists ?? false)->columnSpanFull(),
        ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Split::make([
                ImageColumn::make('cover')->getStateUsing(fn (Product $record): ?string => ($record->images->firstWhere('is_primary', true) ?? $record->images->first())?->url)->square()->grow(false),
                Stack::make([
                    TextColumn::make('name')->searchable()->weight('bold')->wrap()->description(fn (Product $record): string => ($record->category?->name ?? 'No category').($record->style ? ' · '.$record->style->name : '')),
                    TextColumn::make('slug')->color('gray')->wrap(),
                ]),
                Stack::make([
                    TextColumn::make('display_price')->label('Price')->money(config('commerce.currency', 'USD')),
                    TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) { 'active' => 'success', 'archived' => 'gray', default => 'warning' }),
                    TextColumn::make('stock')->getStateUsing(fn (Product $record): string => $record->variants->sum('stock_quantity').' units in stock'),
                ]),
            ])->from('md'),
        ])->defaultSort('created_at', 'desc')
            ->filters([SelectFilter::make('status')->options(['draft' => 'Draft', 'active' => 'Published', 'archived' => 'Archived'])])
            ->recordActions([
                EditAction::make(),
                Action::make('archive')->label('Archive')->color('warning')->requiresConfirmation()
                    ->modalDescription('Remove this product from sale and active carts. Existing orders, variants and photos will be preserved.')
                    ->visible(fn (Product $record): bool => $record->status !== 'archived')
                    ->action(function (Product $record): void {
                        app(StaffProductEditor::class)->archive(auth('web')->user(), $record);
                        Notification::make()->title('Product archived')->success()->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => ListProducts::route('/'), 'create' => CreateProduct::route('/create'), 'edit' => EditProduct::route('/{record}/edit')];
    }
}
