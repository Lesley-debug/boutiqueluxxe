<?php
namespace App\Filament\Resources\Discounts;
use App\Filament\Resources\Discounts\Pages\CreateDiscount;
use App\Filament\Resources\Discounts\Pages\EditDiscount;
use App\Filament\Resources\Discounts\Pages\ListDiscounts;
use App\Models\Discount;
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
class DiscountResource extends Resource
{
    protected static ?string $model = Discount::class;
    protected static ?string $slug = 'discounts';
    protected static ?string $recordTitleAttribute = 'code';
    protected static string | UnitEnum | null $navigationGroup = 'Sales & support';
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-ticket';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'discounts.manage'),403); return parent::getEloquentQuery(); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'),
            TextInput::make('code')->required(fn (?Discount $record): bool => ! $record?->exists)->disabled(fn (?Discount $record): bool => $record?->exists ?? false)->dehydrated(fn (?Discount $record): bool => ! $record?->exists)->maxLength(50)->helperText('New codes use uppercase letters, numbers, hyphens or underscores. Existing codes stay unchanged to preserve order history.'),
            Select::make('type')->required()->default('percentage')->options(['percentage'=>'Percentage (up to 100%)','fixed'=>'Fixed amount in USD']),
            TextInput::make('value')->numeric()->required()->minValue(0.01)->label('Discount value'),
            TextInput::make('min_order_amount')->numeric()->minValue(0)->label('Minimum order amount (USD)'),
            TextInput::make('max_uses')->numeric()->minValue(1)->label('Total usage limit')->helperText('Empty means unlimited. Already recorded usage is never reset.'),
            DateTimePicker::make('starts_at')->label('Starts (application timezone)'),
            DateTimePicker::make('expires_at')->label('Expires (application timezone)'),
            Toggle::make('active')->default(false)->helperText('Dates and usage limits still apply. Turn off to retire a code; no deletion or usage reset.'),
 ])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('code')->searchable()->weight('bold'), TextColumn::make('type'), TextColumn::make('value'), TextColumn::make('uses_count')->suffix(' recorded uses'), TextColumn::make('active')->formatStateUsing(fn ($state): string => $state ? 'Enabled' : 'Disabled')->badge()])])->from('md')])->defaultSort('id','desc')->recordActions([EditAction::make()]); }
    public static function getPages(): array { return ['index'=>ListDiscounts::route('/'),'create'=>CreateDiscount::route('/create'),'edit'=>EditDiscount::route('/{record}/edit')]; }
}
