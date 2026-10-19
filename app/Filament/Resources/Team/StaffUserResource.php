<?php
namespace App\Filament\Resources\Team;
use App\Filament\Resources\Team\Pages\{ListStaff,EditStaff};
use App\Models\User;
use App\Support\StaffTeamAccess;
use BackedEnum;
use UnitEnum;
use Filament\Actions\EditAction;
use Filament\Forms\Components\{Hidden,TextInput,Textarea,Select};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\Layout\{Split,Stack};
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Auth\Access\Response;
use Illuminate\Database\Eloquent\{Builder,Model};
class StaffUserResource extends Resource
{
    protected static ?string $model=User::class;
    protected static ?string $slug='team';
    protected static ?string $navigationLabel='Staff & Managers';
    protected static ?string $modelLabel='Staff access';
    protected static ?string $pluralModelLabel='Staff & Managers';
    protected static ?string $recordTitleAttribute='name';
    protected static string | UnitEnum | null $navigationGroup='Administration';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-user-group';
    // Resource-local authorization, deliberately NOT a global customer User policy.
    public static function getAuthorizationResponse(string | UnitEnum $action,?Model $record=null): Response
    {
        $key=$action instanceof BackedEnum ? $action->value : ($action instanceof UnitEnum ? $action->name : $action);
        $allowed=StaffTeamAccess::allows(auth('web')->user()) && match ($key) {
            'viewAny'=>true,
            'view'=>$record instanceof User && in_array($record->role,StaffTeamAccess::ROLES,true),
            'update'=>$record instanceof User && StaffTeamAccess::editable(auth('web')->user(),$record),
            default=>false,
        };
        return $allowed ? Response::allow() : Response::deny('Only the active, verified super admin may manage team access; owner accounts are protected.');
    }
    public static function getEloquentQuery(): Builder { StaffTeamAccess::authorize(auth('web')->user()); return parent::getEloquentQuery()->whereIn('role',StaffTeamAccess::ROLES); }
    public static function form(Schema $schema): Schema { return $schema->components([
        Hidden::make('expected_snapshot'),TextInput::make('name')->disabled()->dehydrated(false),TextInput::make('email')->disabled()->dehydrated(false),
        Select::make('role')->label('Staff role')->required()->options(['manager'=>'Manager','support_staff'=>'Support staff'])->helperText('Manager can manage catalog/content/discounts; support handles orders/contacts. Customer and super-admin promotion is not available here.'),
        Textarea::make('reason')->label('Private reason for this access change')->required()->minLength(3)->maxLength(500)->helperText('Saved to the super admin audit history; not emailed. Identity, password and verification are not edited here.'),
    ])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([
        TextColumn::make('name')->searchable()->weight('bold')->wrap(),TextColumn::make('email')->searchable()->wrap(),TextColumn::make('role')->formatStateUsing(fn (string $state): string => ['super_admin'=>'Super admin · protected','manager'=>'Manager','support_staff'=>'Support staff'][$state] ?? $state)->badge(),
        TextColumn::make('is_admin')->label('Staff access')->formatStateUsing(fn ($state): string => $state ? 'Active' : 'Inactive')->badge(),
    ])])->from('md')])->defaultSort('name')->recordActions([EditAction::make()->label('Manage access')])->recordUrl(fn (User $record): ?string => static::canEdit($record) ? static::getUrl('edit',['record'=>$record],panel:'staff') : null); }
    public static function getPages(): array { return ['index'=>ListStaff::route('/'),'edit'=>EditStaff::route('/{record}/edit')]; }
}
