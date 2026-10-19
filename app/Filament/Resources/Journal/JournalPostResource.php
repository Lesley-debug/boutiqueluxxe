<?php
namespace App\Filament\Resources\Journal;
use App\Filament\Resources\Journal\Pages\EditJournalPost;
use App\Filament\Resources\Journal\Pages\{ListJournal,CreateJournalPost};
use App\Models\JournalPost;
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
class JournalPostResource extends Resource
{
    protected static ?string $model=JournalPost::class;
    protected static ?string $slug='journal';
    protected static ?string $navigationLabel='Journal';
    protected static ?string $modelLabel='Journal';
    protected static ?string $pluralModelLabel='Journal';
    protected static ?string $recordTitleAttribute='title';
    protected static string | UnitEnum | null $navigationGroup='Content';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-document-text';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery(); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'),TextInput::make('title')->label('Title')->maxLength(255)->required(),TextInput::make('slug')->label('Existing article URL identifier')->disabled()->dehydrated(false)->visible(fn (?JournalPost $record): bool => $record?->exists ?? false),Textarea::make('excerpt')->label('Excerpt')->maxLength(500),RichEditor::make('content')->required()->toolbarButtons(['bold','italic','link','h2','h3','bulletList','orderedList','blockquote','undo','redo'])->fileAttachments(false)->helperText('Text formatting only. Unsafe markup is removed on save; use the cover image field for media.'),FileUpload::make('new_cover_image')->label('Add / replace article cover')->acceptedFileTypes(['image/jpeg','image/png','image/webp'])->maxSize(4096)->disk('public')->preventFilePathTampering()->storeFiles(false)->image()->helperText('Leave empty to keep existing media. Old files stay on disk. Server upload limits may be lower.'),Select::make('status')->required()->default('draft')->options(['draft'=>'Draft / unpublished','published'=>'Publish now'])->helperText('Published posts appear publicly. Unpublishing retains the existing URL and original publication date.')])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('title')->searchable()->weight('bold')->wrap(), TextColumn::make('status')->badge()])])->from('md')])->defaultSort('id','desc')->recordActions([EditAction::make()]); }
    public static function getPages(): array { return ['index'=>ListJournal::route('/'),'create'=>CreateJournalPost::route('/create'),'edit'=>EditJournalPost::route('/{record}/edit')]; }
}
