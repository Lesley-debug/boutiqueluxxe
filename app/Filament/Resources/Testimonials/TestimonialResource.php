<?php
namespace App\Filament\Resources\Testimonials;
use App\Filament\Resources\Testimonials\Pages\EditTestimonial;
use App\Filament\Resources\Testimonials\Pages\{ListTestimonials,CreateTestimonial};
use App\Models\Testimonial;
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
class TestimonialResource extends Resource
{
    protected static ?string $model=Testimonial::class;
    protected static ?string $slug='testimonials';
    protected static ?string $navigationLabel='Testimonials';
    protected static ?string $modelLabel='Testimonials';
    protected static ?string $pluralModelLabel='Testimonials';
    protected static ?string $recordTitleAttribute='customer_name';
    protected static string | UnitEnum | null $navigationGroup='Content';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-document-text';
    public static function getEloquentQuery(): Builder { abort_unless(StaffWorkspaceAccess::allows(auth('web')->user(),'products.manage'),403); return parent::getEloquentQuery(); }
    public static function form(Schema $schema): Schema { return $schema->components([Hidden::make('expected_snapshot'),TextInput::make('customer_name')->label('Customer display name')->maxLength(255)->required(),Textarea::make('quote')->label('Original customer feedback')->maxLength(1000)->required(),Select::make('rating')->label('Original customer rating')->required()->options([1=>'1 star',2=>'2 stars',3=>'3 stars',4=>'4 stars',5=>'5 stars']),Toggle::make('active')->default(false)->helperText('Turn off to withdraw feedback without deleting it.'),Toggle::make('confirm_authenticity')->label('I checked this is genuine feedback and approved for publication')->helperText('Required when activating or changing published feedback. This acknowledgement is not independent verification; never invent reviews.'),TextInput::make('sort_order')->numeric()->required()->default(0)->minValue(0)])->columns(1); }
    public static function table(Table $table): Table { return $table->columns([Split::make([Stack::make([TextColumn::make('customer_name')->searchable()->weight('bold')->wrap(), TextColumn::make('quote')->limit(100)->wrap(), TextColumn::make('rating')->suffix(' stars'), TextColumn::make('active')->formatStateUsing(fn ($state): string => $state ? 'Active' : 'Archived')->badge(),TextColumn::make('sort_order')])])->from('md')])->defaultSort('id','desc')->recordActions([EditAction::make()]); }
    public static function getPages(): array { return ['index'=>ListTestimonials::route('/'),'create'=>CreateTestimonial::route('/create'),'edit'=>EditTestimonial::route('/{record}/edit')]; }
}
