<?php
namespace App\Filament\Pages;
use App\Models\Product;
use App\Services\StaffBulkPricing;
use App\Support\CatalogAccess;
use BackedEnum;
use UnitEnum;
use Filament\Pages\Page;
use Filament\Actions\Action;
use Filament\Forms\Components\{Textarea,Checkbox};
use Filament\Notifications\Notification;
use Illuminate\Validation\ValidationException;
use Livewire\WithPagination;
class BulkPricing extends Page
{
    use WithPagination;
    protected static ?string $slug='bulk-pricing';
    protected static ?string $navigationLabel='Bulk pricing';
    protected static ?string $title='Bulk pricing';
    protected static string | UnitEnum | null $navigationGroup='Catalog';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-currency-dollar';
    protected string $view='filament.pages.bulk-pricing';
    protected ?bool $hasDatabaseTransactions=false;
    public string $search='';
    public array $selected=[];
    public array $rows=[];
    public string $snapshot='';
    public static function canAccess(): bool { return CatalogAccess::allows(auth('web')->user()); }
    public function mount(): void { abort_unless(static::canAccess(),403); }
    public function hydrate(): void { abort_unless(static::canAccess(),403); }
    public function updatedSearch(): void { $this->resetPage('pricingProductsPage'); }
    protected function getHeaderActions(): array
    {
        return [
            Action::make('loadBatch')->label('Load selected products')->authorize(fn()=>static::canAccess())->disabled(fn()=>$this->selected===[])->requiresConfirmation()->modalDescription('Load up to 10 products and 100 options. This replaces the current editable batch and discards its unsaved price inputs.')->action(fn()=>$this->loadSelection()),
            Action::make('saveBatch')->label('Review & save prices')->authorize(fn()=>static::canAccess())->disabled(fn()=>! $this->rows || $this->snapshot==='')->requiresConfirmation()->modalHeading('Confirm these exact price changes')->modalDescription('Review the price inputs before confirming. This updates current catalog/cart pricing, not existing order snapshots. The whole batch saves together or not at all.')->schema([
                Textarea::make('reason')->label('Private audit reason')->required()->minLength(3)->maxLength(500),
                Checkbox::make('confirmed')->label('I reviewed the loaded batch and confirm these price changes.')->required()->accepted(),
            ])->action(fn(array $data)=>$this->persistBatch($data)),
        ];
    }
    protected function loadSelection(): void
    {
        abort_unless(static::canAccess(),403); $this->resetErrorBag();
        try { $batch=app(StaffBulkPricing::class)->load(auth('web')->user(),$this->selected); $this->rows=$batch['rows'];$this->snapshot=$batch['snapshot']; }
        catch (ValidationException $e) { $this->reportFailure($e); }
    }
    protected function reportFailure(ValidationException $e): void
    {
        $message=collect($e->errors())->flatten()->first() ?? 'Prices were not saved.';
        $this->addError('rows',$message); Notification::make()->danger()->title('Batch not saved')->body(e($message))->persistent()->send();
    }
    protected function persistBatch(array $data): void
    {
        abort_unless(static::canAccess(),403); $this->resetErrorBag();
        $service=app(StaffBulkPricing::class);
        try { $count=$service->save(auth('web')->user(),$this->rows,$this->snapshot,$data); }
        catch (ValidationException $e) { $this->reportFailure($e); return; }
        try { $batch=$service->load(auth('web')->user(),array_column($this->rows,'id')); $this->rows=$batch['rows'];$this->snapshot=$batch['snapshot']; }
        catch (ValidationException $e) { $this->rows=[];$this->snapshot=''; Notification::make()->warning()->title('Save completed; reload the selection before editing again')->send(); return; }
        Notification::make()->success()->title($count ? $count.' product price sets updated' : 'No price changes to save')->send();
    }

    protected function getViewData(): array
    {
        abort_unless(static::canAccess(),403); $q=Product::query()->select(['id','name','status','base_price','sale_price'])->withCount('variants');
        if ($this->search!=='') { $q->where('name','like','%'.mb_substr($this->search,0,120).'%'); }
        $products=$q->orderBy('name')->orderBy('id')->paginate(10,['*'],'pricingProductsPage');return compact('products');
    }
}
