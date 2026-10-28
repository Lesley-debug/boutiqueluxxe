<?php

namespace App\Filament\Resources\Reviews;

use App\Filament\Resources\Reviews\Pages\CreateReview;
use App\Filament\Resources\Reviews\Pages\EditReview;
use App\Filament\Resources\Reviews\Pages\ListReviews;
use App\Models\Product;
use App\Models\ProductReview;
use App\Support\CatalogAccess;
use BackedEnum;
use UnitEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProductReviewResource extends Resource
{
    protected static ?string $model = ProductReview::class;
    protected static ?string $slug = 'reviews';
    protected static ?string $navigationLabel = 'Reviews';
    protected static ?string $modelLabel = 'Review';
    protected static ?string $pluralModelLabel = 'Reviews';
    protected static ?string $recordTitleAttribute = 'customer_name';
    protected static string|UnitEnum|null $navigationGroup = 'Catalog';
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-star';
    protected static ?int $navigationSort = 5;

    public static function getEloquentQuery(): Builder
    {
        abort_unless(CatalogAccess::allows(auth('web')->user()), 403);
        return parent::getEloquentQuery()->with('product');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('product_id')
                ->label('Product')
                ->required()
                ->searchable()
                ->options(fn () => Product::active()->orderBy('name')->pluck('name', 'id')->all()),
            TextInput::make('customer_name')->required()->maxLength(255),
            Select::make('rating')->required()->options([
                1 => '1 star',
                2 => '2 stars',
                3 => '3 stars',
                4 => '4 stars',
                5 => '5 stars',
            ]),
            Textarea::make('quote')->required()->maxLength(1000)->columnSpanFull(),
            Toggle::make('active')
                ->label('Publish this review')
                ->helperText('Only published reviews count toward the product rating.')
                ->default(false),
        ])->columns(2);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('product.name')->label('Product')->searchable()->sortable()->limit(30),
            TextColumn::make('customer_name')->searchable()->sortable(),
            TextColumn::make('rating')->suffix(' ★')->sortable(),
            TextColumn::make('quote')->limit(60)->wrap(),
            TextColumn::make('active')
                ->formatStateUsing(fn ($state): string => $state ? 'Published' : 'Draft')
                ->badge()
                ->color(fn ($state): string => $state ? 'success' : 'warning'),
            TextColumn::make('created_at')->date()->sortable(),
        ])
        ->defaultSort('created_at', 'desc')
        ->filters([
            SelectFilter::make('active')->options([1 => 'Published', 0 => 'Draft']),
            SelectFilter::make('product_id')->label('Product')->options(fn () => Product::active()->orderBy('name')->pluck('name', 'id')->all()),
        ])
        ->recordActions([EditAction::make()]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListReviews::route('/'),
            'create' => CreateReview::route('/create'),
            'edit' => EditReview::route('/{record}/edit'),
        ];
    }
}
