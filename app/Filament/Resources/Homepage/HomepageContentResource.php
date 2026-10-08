<?php
namespace App\Filament\Resources\Homepage;
use App\Filament\Resources\Homepage\Pages\EditHomepageContent;
use App\Models\HomepageContent;
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
class HomepageContentResource extends Resource
{
    protected static ?string $model=HomepageContent::class;
    protected static ?string $slug='homepage';
    protected static ?string $navigationLabel='Homepage content';
    protected static ?string $modelLabel='Homepage content';
    protected static ?string $pluralModelLabel='Homepage content';
    protected static ?string $recordTitleAttribute='editorial_title';
    protected static string | UnitEnum | null $navigationGroup='Content';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-document-text';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery()->whereKey(1); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'),Section::make('Editorial campaign')->description('Saving updates the public homepage immediately. A stored video takes priority over its image.')->schema([TextInput::make('editorial_title')->label('Editorial Title')->maxLength(255),Textarea::make('editorial_subtitle')->label('Editorial Subtitle')->maxLength(1000),TextInput::make('editorial_cta_text')->label('Editorial Cta Text')->maxLength(100),TextInput::make('editorial_cta_url')->label('Editorial Cta Url')->maxLength(255)->helperText('Root-relative public link, for example /shop or /collections/bags.'),FileUpload::make('new_editorial_image')->label('Add / replace campaign image')->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->image()->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.'),FileUpload::make('new_editorial_video')->label('Add / replace campaign video (MP4/WebM, up to 10 MB)')->acceptedFileTypes(['video/mp4','video/webm'])->maxSize(10240)->disk('public')->preventFilePathTampering()->storeFiles(false)->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.'),Toggle::make('remove_editorial_video')->label('Use image instead of current video')->helperText('Unlinks the video; does not delete its file.')])->columns(1)->collapsible(),Section::make('Secondary campaign — mobile homepage')->schema([TextInput::make('watches_title')->label('Watches Title')->maxLength(255),Textarea::make('watches_subtitle')->label('Watches Subtitle')->maxLength(1000),TextInput::make('watches_cta_text')->label('Watches Cta Text')->maxLength(100),TextInput::make('watches_cta_url')->label('Watches Cta Url')->maxLength(255)->helperText('Root-relative public link, for example /shop or /collections/bags.'),FileUpload::make('new_watches_image')->label('Add / replace campaign image')->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->image()->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.'),FileUpload::make('new_watches_video')->label('Add / replace campaign video (MP4/WebM, up to 10 MB)')->acceptedFileTypes(['video/mp4','video/webm'])->maxSize(10240)->disk('public')->preventFilePathTampering()->storeFiles(false)->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.'),Toggle::make('remove_watches_video')->label('Use image instead of current video')->helperText('Unlinks the video; does not delete its file.')])->columns(1)->collapsible(),Section::make('Brand story')->schema([TextInput::make('story_title')->label('Story Title')->maxLength(255),Textarea::make('story_text')->label('Story Text')->maxLength(10000),TextInput::make('story_cta_text')->label('Story Cta Text')->maxLength(100)->helperText('The story button always opens /about.'),FileUpload::make('new_story_image')->label('Add / replace story image')->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->image()->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.')])->columns(1)->collapsible()])->columns(1); }

    public static function getPages(): array { return ['index'=>EditHomepageContent::route('/')]; }
}
