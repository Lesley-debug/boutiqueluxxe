<?php
namespace App\Filament\Pages;
use App\Models\Order;
use App\Support\StaffWorkspaceAccess;
use BackedEnum;
use UnitEnum;
use Filament\Pages\Page;
use Livewire\WithPagination;
class Customers extends Page
{
    use WithPagination;
    protected static bool $shouldRegisterNavigation=false;
    protected static ?string $slug='customers';
    protected static string | UnitEnum | null $navigationGroup='Sales & support';
    protected static string | BackedEnum | null $navigationIcon='heroicon-o-users';
    protected string $view='filament.pages.customers';
    public string $search='';
    public ?string $selectedEmail=null;
    public static function canAccess(): bool { return StaffWorkspaceAccess::allows(auth('web')->user(),'customers.view'); }
    public function mount(): void { abort_unless(static::canAccess(),403); $email=request()->query('email'); if (is_string($email) && strlen($email)<=255) { $this->selectedEmail=strtolower(trim($email)); } }
    public function updatedSearch(): void { $this->resetPage('customersPage'); }
    public function selectEmail(string $encoded): void { abort_unless(static::canAccess(),403); $email=base64_decode($encoded,true); abort_unless(is_string($email) && strlen($email)<=255,422); $this->selectedEmail=strtolower(trim($email)); $this->resetPage('ordersPage'); }
    protected function getViewData(): array
    {
        abort_unless(static::canAccess(),403);
        $q=Order::query(); if ($this->search !== '') { $q->where(fn ($sub)=>$sub->where('customer_email','like','%'.mb_substr($this->search,0,120).'%')->orWhere('customer_name','like','%'.mb_substr($this->search,0,120).'%')); }
        $customers=$q->selectRaw("LOWER(TRIM(customer_email)) AS email_key, COUNT(*) AS orders_count, SUM(total) AS order_value, MAX(created_at) AS last_order_at")
            ->groupByRaw('LOWER(TRIM(customer_email))')->orderByDesc('last_order_at')->orderBy('email_key')->paginate(15,['*'],'customersPage');
        $profile=null; $orders=null; $summary=null;
        if ($this->selectedEmail !== null && strlen($this->selectedEmail)<=255) {
            $records=Order::whereRaw('LOWER(TRIM(customer_email)) = ?',[$this->selectedEmail]);
            $profile=(clone $records)->latest('id')->first();
            $summary=(clone $records)->selectRaw("COUNT(*) AS orders_count, SUM(total) AS order_value, SUM(CASE WHEN payment_status = 'paid' AND status <> 'cancelled' THEN total ELSE 0 END) AS marked_paid_value")->first();
            $orders=(clone $records)->latest('id')->paginate(15,['*'],'ordersPage');
        }
        return compact('customers','profile','orders','summary');
    }
}
