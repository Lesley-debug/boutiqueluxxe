<?php
namespace App\Filament\Resources\HeroSlides;
use App\Filament\Resources\HeroSlides\Pages\EditHeroSlide;
use App\Filament\Resources\HeroSlides\Pages\{ListHeroSlides,CreateHeroSlide};
use App\Models\HeroSlide;
use App\Support\StaffWorkspaceAccess;
use BackedEnum;
use UnitEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\{TextInput,Textarea,Select,Toggle,Hidden,FileUpload,RichEditor};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Tables\Columns\Layout\{Split,Stack};
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
class HeroSlideResource extends Resource
{
    protected static ?string $model=HeroSlide::class;
    protected static ?string $slug='hero-slides';
    protected static ?string $navigationLabel='Hero slides';
    protected static ?string $modelLabel='Hero slides';
    protected static ?string $pluralModelLabel='Hero slides';
    protected static ?string $recordTitleAttribute='title';
    protected static string | UnitEnum | null $navigationGroup='Content';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-document-text';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery(); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'),TextInput::make('eyebrow')->label('Eyebrow')->maxLength(100),TextInput::make('title')->label('Title')->maxLength(255)->required(),Textarea::make('subtitle')->label('Subtitle')->maxLength(500),TextInput::make('primary_cta_text')->label('Primary Cta Text')->maxLength(50),TextInput::make('primary_cta_url')->label('Primary Cta Url')->maxLength(255)->helperText('Root-relative public store URL, such as /shop.'),TextInput::make('secondary_cta_text')->label('Secondary Cta Text')->maxLength(50),TextInput::make('secondary_cta_url')->label('Secondary Cta Url')->maxLength(255),FileUpload::make('new_image')->label('Add / replace slide photo')->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->image()->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.'),Toggle::make('active')->default(false)->helperText('Active slides require a photo. Turn off to archive without deleting.'),TextInput::make('sort_order')->numeric()->required()->default(0)->minValue(0)->helperText('Lower values appear first.')])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('title')->searchable()->weight('bold')->wrap(), TextColumn::make('active')->formatStateUsing(fn ($state): string => $state ? 'Active' : 'Archived')->badge(),TextColumn::make('sort_order')])])->from('md')])->defaultSort('id','desc')->recordActions([EditAction::make()]); }
    public static function getPages(): array { return ['index'=>ListHeroSlides::route('/'),'create'=>CreateHeroSlide::route('/create'),'edit'=>EditHeroSlide::route('/{record}/edit')]; }
}
