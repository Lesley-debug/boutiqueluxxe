<?php
namespace App\Filament\Resources\About;
use App\Filament\Resources\About\Pages\EditAboutPage;
use App\Models\AboutPage;
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
class AboutPageResource extends Resource
{
    protected static ?string $model=AboutPage::class;
    protected static ?string $slug='about';
    protected static ?string $navigationLabel='About page';
    protected static ?string $modelLabel='About page';
    protected static ?string $pluralModelLabel='About page';
    protected static ?string $recordTitleAttribute='hero_title';
    protected static string | UnitEnum | null $navigationGroup='Content';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-document-text';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery()->whereKey(1); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'),Section::make('About introduction')->description('Saving updates the public About page immediately.')->schema([TextInput::make('hero_title')->label('Hero Title')->maxLength(255)->required(),Textarea::make('hero_subtitle')->label('Hero Subtitle')->maxLength(10000),FileUpload::make('new_hero_image')->label('Add / replace About hero image')->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->image()->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.')])->columns(1)->collapsible(),Section::make('Philosophy')->schema([TextInput::make('philosophy_title')->label('Philosophy Title')->maxLength(255)->required(),Textarea::make('philosophy_text')->label('Philosophy Text')->maxLength(10000)])->columns(1)->collapsible(),Section::make('Approach')->schema([TextInput::make('approach_title')->label('Approach Title')->maxLength(255)->required(),Textarea::make('approach_text')->label('Approach Text')->maxLength(10000)])->columns(1)->collapsible(),Section::make('Contact invitation')->schema([TextInput::make('contact_title')->label('Contact Title')->maxLength(255)->required(),Textarea::make('contact_text')->label('Contact Text')->maxLength(10000)])->columns(1)->collapsible()])->columns(1); }

    public static function getPages(): array { return ['index'=>EditAboutPage::route('/')]; }
}
