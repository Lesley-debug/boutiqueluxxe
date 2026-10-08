<?php
namespace App\Filament\Resources\Contacts;
use App\Filament\Resources\Contacts\Pages\{ListContacts, ViewContact};
use App\Models\ContactMessage;
use App\Support\StaffWorkspaceAccess;
use BackedEnum;
use UnitEnum;
use Filament\Actions\ViewAction;
use Filament\Resources\Resource;
use Filament\Tables\Columns\Layout\{Split,Stack};
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
class ContactResource extends Resource
{
    protected static ?string $model=ContactMessage::class;
    protected static ?string $slug='contacts';
    protected static ?string $recordTitleAttribute='subject';
    protected static ?string $navigationLabel='Contact messages';
    protected static string | UnitEnum | null $navigationGroup='Sales & support';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-envelope';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'contacts.manage'),403); return parent::getEloquentQuery(); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('subject')->searchable()->weight('bold')->wrap(),TextColumn::make('name')->searchable(),TextColumn::make('email')->searchable()->wrap()]),TextColumn::make('status')->badge(),TextColumn::make('created_at')->dateTime()])->from('md')])->filters([SelectFilter::make('status')->options(['open'=>'Open','resolved'=>'Resolved'])])->defaultSort('id','desc')->recordActions([ViewAction::make()]); }
    public static function getPages(): array { return ['index'=>ListContacts::route('/'),'view'=>ViewContact::route('/{record}')]; }
}
